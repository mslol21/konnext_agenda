import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://agenda.konnexy.com.br';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/recepcao', '/profissional', '/cliente', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
