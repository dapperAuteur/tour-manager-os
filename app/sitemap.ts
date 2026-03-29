import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tour.witus.online'

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    // Landing pages per user type (added as they are built)
    // { url: `${baseUrl}/for/tour-managers`, ... },
    // { url: `${baseUrl}/for/musicians`, ... },
    // { url: `${baseUrl}/for/crew`, ... },
    // { url: `${baseUrl}/for/venues`, ... },
    // { url: `${baseUrl}/for/fans`, ... },

    // Module feature pages (added as they are built)
    // { url: `${baseUrl}/features/advance-sheets`, ... },
    // { url: `${baseUrl}/features/finances`, ... },
  ]
}
