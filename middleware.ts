import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|robots.txt|sitemap.xml).*)'],
};

export function middleware(request: NextRequest) {
  const hostname = request.nextUrl.hostname.toLowerCase();
  const domain = (process.env.NEXT_PUBLIC_APP_DOMAIN || 'konnexy.com.br').toLowerCase();
  const reserved = new Set(['www', 'app', 'agenda']);
  let tenantSlug: string | null = null;
  if (hostname.endsWith(`.${domain}`)) {
    const subdomain = hostname.slice(0, -(domain.length + 1));
    if (!subdomain.includes('.') && !reserved.has(subdomain)) tenantSlug = subdomain;
  } else if (process.env.NODE_ENV !== 'production' && hostname.endsWith('.localhost')) {
    tenantSlug = hostname.slice(0, -'.localhost'.length);
  }
  const headers = new Headers(request.headers);
  // Never trust a caller-supplied tenant header or treat Vercel preview names as tenants.
  headers.delete('x-tenant-slug');
  if (tenantSlug) headers.set('x-tenant-slug', tenantSlug);
  headers.set('x-pathname', request.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}
