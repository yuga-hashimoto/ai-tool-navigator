import { MetadataRoute } from 'next'
import { getAllTools } from '@/lib/tools'
import { getAllPosts } from '@/lib/posts'
import { CATEGORY_MAPPINGS } from '@/lib/categories'
import { routing } from '@/i18n/routing'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-tool-navigator.vercel.app'
  const locales = routing.locales
  
  // Static pages that exist for each locale
  const staticPages = ['', 'deals', 'compare', 'privacy', 'terms', 'submit', 'advertise', 'sponsor', 'blog']

  // 1. Static Pages
  const staticEntries = locales.flatMap((locale) =>
    staticPages.map((page) => ({
      url: `${baseUrl}/${locale}${page ? `/${page}` : ''}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: page === '' ? 1 : 0.8,
    }))
  )

  // 2. Tools
  const toolEntries = locales.flatMap((locale) => {
    const tools = getAllTools(locale)
    return tools.map((tool) => ({
      url: `${baseUrl}/${locale}/tools/${tool.slug}`,
      lastModified: tool.last_updated ? new Date(tool.last_updated) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))
  })

  // 3. Categories
  const categoryEntries = locales.flatMap((locale) =>
    Object.keys(CATEGORY_MAPPINGS).map((slug) => ({
      url: `${baseUrl}/${locale}/category/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }))
  )

  // 4. Blog Posts
  const postEntries = locales.flatMap((locale) => {
    const posts = getAllPosts(locale)
    return posts.map((post) => ({
      url: `${baseUrl}/${locale}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  })

  return [
    ...staticEntries,
    ...toolEntries,
    ...categoryEntries,
    ...postEntries,
  ]
}
