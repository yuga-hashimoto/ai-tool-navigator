import { getVideoBySlug } from "@/lib/videos";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs, BreadcrumbItem } from "@/components/Breadcrumbs";
import { VideoPlayer } from "@/components/VideoPlayer";
import { generateVideoSchema } from "@/lib/schema";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string; locale: string }>
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const video = await getVideoBySlug(slug, locale);

  if (!video) {
    return {
      title: 'Video Not Found',
    };
  }

  return {
    title: `${video.metadata.title} - AI Tool Navigator`,
    description: video.metadata.description,
    openGraph: {
      title: video.metadata.title,
      description: video.metadata.description,
      type: 'video.movie',
      url: `https://ai-tool-navigator.vercel.app/videos/${slug}`,
      images: [
        {
          url: video.metadata.thumbnailUrl || '/og-image.png', // Fallback
          width: 1200,
          height: 630,
          alt: video.metadata.title,
        },
      ],
    },
  };
}

export default async function VideoPage({
  params
}: {
  params: Promise<{ slug: string; locale: string }>
}) {
  const { slug, locale } = await params;
  const video = await getVideoBySlug(slug, locale);

  if (!video) {
    notFound();
  }

  const t = await getTranslations("Navigation");

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: t('home'), href: '/' },
    { label: "Videos", href: '/videos' },
    { label: video.metadata.title },
  ];

  const jsonLd = generateVideoSchema(video.metadata);

  return (
    <div className="bg-white dark:bg-black min-h-screen py-12 transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50 mb-6">
              {video.metadata.title}
            </h1>

            <VideoPlayer
              videoUrl={video.metadata.videoUrl}
              title={video.metadata.title}
              poster={video.metadata.thumbnailUrl}
              transcripts={video.metadata.transcripts}
              monetization={video.metadata.monetization}
              className="mb-8"
            />

            <div className="prose dark:prose-invert max-w-none">
               <h3>Description</h3>
               <p>{video.metadata.description}</p>
               {/* Just displaying parsed content if any, or falling back to description */}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
             <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 sticky top-24">
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Video Details</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Published</span>
                    <span className="text-zinc-900 dark:text-zinc-200">
                      {new Date(video.metadata.uploadDate).toLocaleDateString()}
                    </span>
                  </div>
                  {video.metadata.duration && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Duration</span>
                      <span className="text-zinc-900 dark:text-zinc-200">
                        {video.metadata.duration.replace('PT', '').replace('M', ' min ').replace('S', ' sec')}
                      </span>
                    </div>
                  )}
                   <div className="flex justify-between">
                    <span className="text-zinc-500">Author</span>
                    <span className="text-zinc-900 dark:text-zinc-200">
                      {video.metadata.author || "AI Tool Navigator"}
                    </span>
                  </div>
                </div>

                {/* Ad Placeholder */}
                {video.metadata.monetization?.ads && (
                  <div className="mt-8 p-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg text-center text-xs text-zinc-500">
                    <p>Advertisement</p>
                    <div className="h-32 bg-zinc-300 dark:bg-zinc-700 w-full mt-2 rounded flex items-center justify-center">
                      Ad Space
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
