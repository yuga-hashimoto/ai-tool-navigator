import { MetadataRoute } from 'next'
import { getAllTools } from '@/lib/tools'
import { getAllPosts } from '@/lib/posts'
import { CATEGORY_MAPPINGS } from '@/lib/categories'
import { routing } from '@/i18n/routing'
import fs from 'fs'
import path from 'path'
import { filterPostList, filterToolList, isNoIndexStaticRoute } from '@/lib/editorial'
import { COMPARE_PRESETS } from '@/lib/compare-pages'

function safeDate(value: string | Date | undefined): Date {
  if (!value) {
    return new Date()
  }

  const parsed = value instanceof Date ? value : new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

function getStaticPages(dir: string, basePath: string = ''): string[] {
  const pages: string[] = []

  if (!fs.existsSync(dir)) return pages

  const items = fs.readdirSync(dir)

  for (const item of items) {
    if (item.startsWith('[') || item.startsWith('_') || item.startsWith('.')) continue

    const fullPath = path.join(dir, item)
    if (fs.statSync(fullPath).isDirectory()) {
      const isRouteGroup = item.startsWith('(') && item.endsWith(')')
      const pagePath = path.join(fullPath, 'page.tsx')

      const currentPath = isRouteGroup
        ? basePath
        : (basePath ? `${basePath}/${item}` : item)

      if (fs.existsSync(pagePath)) {
        if (currentPath !== '') {
          pages.push(currentPath)
        }
      }

      // Recurse
      pages.push(...getStaticPages(fullPath, currentPath))
    }
  }

  return pages
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-tools-nav.com').replace(/\/$/, '')
  const locales = routing.locales

  // Discover static pages dynamically
  const appDir = path.join(process.cwd(), 'src/app/[locale]')
  const discoveredPages = getStaticPages(appDir)

  // Ensure root page is included and remove duplicates
  const staticPages = Array.from(new Set(['', ...discoveredPages])).filter((page) => !isNoIndexStaticRoute(page))

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
  const toolEntries = (await Promise.all(locales.map(async (locale) => {
    const tools = filterToolList(await getAllTools(locale))
    return tools.map((tool) => ({
      url: `${baseUrl}/${locale}/tools/${tool.slug}`,
      lastModified: safeDate(tool.last_updated),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))
  }))).flat()

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
  const postEntries = (await Promise.all(locales.map(async (locale) => {
    const posts = filterPostList(await getAllPosts(locale))
    return posts.map((post) => ({
      url: `${baseUrl}/${locale}/blog/${post.slug}`,
      lastModified: safeDate(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  }))).flat()

  // 5. Comparison Presets
  const compareEntries = locales.flatMap((locale) =>
    COMPARE_PRESETS.map((preset) => ({
      url: `${baseUrl}/${locale}/compare/${preset.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    }))
  )

  return [
    ...staticEntries,
    ...toolEntries,
    ...categoryEntries,
    ...postEntries,
    ...compareEntries,
  ]
}
