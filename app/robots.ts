import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/for/', '/features/', '/academy/'],
        disallow: ['/dashboard', '/tours/', '/settings', '/admin/', '/advance/', '/api/'],
      },
    ],
    sitemap: 'https://tour.witus.online/sitemap.xml',
  }
}
