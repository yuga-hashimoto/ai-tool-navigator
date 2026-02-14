import { getAllVideos } from '@/lib/videos';
import Link from 'next/link';

export default function AdminVideosPage() {
  const videos = getAllVideos();

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Video Management</h1>
        <Link
          href="/admin/videos/upload"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Upload New Video
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title / Slug
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monetization
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {videos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No videos found. Upload your first video!
                  </td>
                </tr>
              ) : (
                videos.map((video) => (
                  <tr key={video.slug}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{video.title}</div>
                      <div className="text-sm text-gray-500">{video.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        video.videoType === 'youtube' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {video.videoType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(video.uploadDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {video.monetization?.enabled ? (
                        <span className="text-green-600 font-bold">
                          {video.monetization.type.toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-gray-400">Disabled</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/videos/${video.slug}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
