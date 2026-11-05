import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Intercepta todas as rotas exceto arquivos estáticos, imagens e APIs públicas internas:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt, manifest.json
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|robots.txt).*)',
  ],
};

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';

  // Determinar subdomínio do tenant
  // Exemplos:
  // - "salao-demo.konnexy.com.br" -> slug = "salao-demo"
  // - "salao-demo.localhost:3000" -> slug = "salao-demo"
  // - "localhost:3000" com header ou cookie "x-tenant-slug" -> para testes locais
  let tenantSlug: string | null = null;

  const hostname = host.split(':')[0].toLowerCase();
  const parts = hostname.split('.');

  // Caso 1: Subdomínio real em produção ou localhost (*.konnexy.com.br ou *.localhost)
  if (parts.length >= 3 && parts[0] !== 'www' && parts[0] !== 'app') {
    tenantSlug = parts[0];
  } else if (hostname.endsWith('.localhost')) {
    tenantSlug = hostname.replace('.localhost', '');
  }

  // Caso 2: Fallback para desenvolvimento via header ou cookie
  if (!tenantSlug) {
    tenantSlug = request.headers.get('x-tenant-slug') || request.cookies.get('tenant_slug')?.value || null;
  }

  const response = NextResponse.next();

  if (tenantSlug) {
    // Injeta cabeçalho para leitura simplificada nos Server Components e Server Actions
    response.headers.set('x-tenant-slug', tenantSlug);
  }

  response.headers.set('x-pathname', url.pathname);

  return response;
}
