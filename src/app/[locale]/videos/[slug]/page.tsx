import { getVideoBySlug } from '@/lib/videos';
import { generateVideoObjectSchema } from '@/lib/schema';
import { VideoPlayer } from '@/components/VideoPlayer';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

export default async function VideoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const video = getVideoBySlug(slug);

  if (!video) {
    notFound();
  }

  const videoSchema = generateVideoObjectSchema({
    title: video.metadata.title,
    description: video.metadata.description,
    thumbnailUrl: video.metadata.thumbnailUrl,
    uploadDate: video.metadata.uploadDate,
    duration: video.metadata.duration,
    contentUrl: video.metadata.videoType === 'local' ? video.metadata.videoUrl : undefined,
    embedUrl: video.metadata.videoType === 'youtube' ? `https://www.youtube.com/embed/${video.metadata.videoUrl}` : undefined,
    transcript: video.content,
  });

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
      />
      <div className="max-w-4xl mx-auto">
        <VideoPlayer
          src={video.metadata.videoUrl}
          type={video.metadata.videoType}
          title={video.metadata.title}
          poster={video.metadata.thumbnailUrl}
          captions={video.metadata.captionsUrl}
          monetization={video.metadata.monetization}
        />

        <div className="mt-8">
          <h1 className="text-3xl font-bold text-gray-900">{video.metadata.title}</h1>
          <div className="mt-2 text-sm text-gray-500">
            Published on {new Date(video.metadata.uploadDate).toLocaleDateString()}
          </div>

          <div className="mt-6 prose prose-indigo max-w-none">
            <p>{video.metadata.description}</p>
          </div>

          {video.content && (
             <div className="mt-12 border-t pt-8">
               <h2 className="text-2xl font-bold mb-4">Transcript</h2>
               <div className="prose prose-sm max-w-none bg-gray-50 p-6 rounded-lg">
                 <ReactMarkdown>{video.content}</ReactMarkdown>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
