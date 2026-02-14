import { getAllVideos } from "@/lib/videos";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs, BreadcrumbItem } from "@/components/Breadcrumbs";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { Play } from "lucide-react";

export const metadata: Metadata = {
  title: "Videos - AI Tool Navigator",
  description: "Watch the latest AI tool reviews, tutorials, and comparisons.",
};

export default async function VideosPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations("Navigation");
  const videos = await getAllVideos(locale);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: t('home'), href: '/' },
    { label: "Videos" }, // Hardcoded for now until we add translation
  ];

  return (
    <div className="bg-white dark:bg-black min-h-screen py-12 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            AI Videos & Tutorials
          </h1>
          <p className="mt-2 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Watch deep dives, reviews, and tutorials on the latest AI tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video) => (
            <Link key={video.slug} href={`/videos/${video.slug}`} className="group block">
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-zinc-200 dark:border-zinc-800">
                {/* Thumbnail */}
                <div className="relative aspect-video w-full bg-zinc-200 dark:bg-zinc-800">
                  {video.thumbnailUrl ? (
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : video.videoUrl.includes("youtube") ? (
                    <Image
                      src={`https://img.youtube.com/vi/${video.videoUrl.split('v=')[1]?.split('&')[0] || video.videoUrl.split('/').pop()}/maxresdefault.jpg`}
                      alt={video.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-400">
                      <Play className="w-12 h-12" />
                    </div>
                  )}

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="bg-white/90 dark:bg-black/90 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                      <Play className="w-6 h-6 text-zinc-900 dark:text-white fill-current" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {video.duration.replace('PT', '').replace('M', ':').replace('S', '')}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-semibold text-lg text-zinc-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-2 mb-4">
                    {video.description}
                  </p>
                  <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-500">
                    <time>{new Date(video.uploadDate).toLocaleDateString()}</time>
                    {video.monetization?.isPremium && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="text-amber-600 dark:text-amber-500 font-medium">Premium</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {videos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-500">No videos found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
