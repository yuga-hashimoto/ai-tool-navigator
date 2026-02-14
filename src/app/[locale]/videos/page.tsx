import { getAllVideos } from '@/lib/videos';
import { Link } from '@/i18n/routing';
import Image from 'next/image';

export default function VideosPage() {
  const videos = getAllVideos();

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Video Library</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {videos.map((video) => (
          <Link key={video.slug} href={`/videos/${video.slug}`} className="group block">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 group-hover:-translate-y-1 border border-gray-200">
              <div className="relative aspect-video bg-gray-200">
                {video.thumbnailUrl ? (
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Thumbnail
                  </div>
                )}
                {/* Duration Badge */}
                {video.duration && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {Math.floor(video.duration / 60)}:{String(Math.floor(video.duration % 60)).padStart(2, '0')}
                  </div>
                )}
                {/* Premium Badge */}
                {video.monetization?.enabled && video.monetization.type === 'premium' && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                    PREMIUM
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                  {video.description}
                </p>
                <div className="mt-4 flex items-center text-xs text-gray-400">
                  <span>{new Date(video.uploadDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
