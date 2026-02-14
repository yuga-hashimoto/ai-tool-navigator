"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadVideoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slug: '',
    videoType: 'youtube', // 'youtube' | 'local'
    videoUrl: '',
    thumbnailUrl: '',
    monetization: {
      enabled: false,
      type: 'ad', // 'ad' | 'premium'
    },
    transcript: ''
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    setLoading(true);
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await fetch('/api/videos/upload', {
        method: 'POST',
        body: uploadData,
      });
      const data = await res.json();
      if (data.url) {
        setFormData(prev => ({ ...prev, videoUrl: data.url }));
      } else {
        alert('Upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          metadata: {
            ...formData,
            slug,
            uploadDate: new Date().toISOString(),
          },
          content: formData.transcript // Using content for transcript or show notes
        }),
      });

      if (res.ok) {
        router.push('/admin/videos');
      } else {
        alert('Failed to save video');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Upload Video</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Slug (optional)</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
            value={formData.slug}
            onChange={e => setFormData({...formData, slug: e.target.value})}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        {/* Video Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Video Source</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
            value={formData.videoType}
            onChange={e => setFormData({...formData, videoType: e.target.value as 'youtube' | 'local'})}
          >
            <option value="youtube">YouTube Embed</option>
            <option value="local">Local Upload</option>
          </select>
        </div>

        {/* Video URL / Upload */}
        {formData.videoType === 'youtube' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700">YouTube Video ID</label>
            <input
              type="text"
              placeholder="e.g. dQw4w9WgXcQ"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              value={formData.videoUrl}
              onChange={e => setFormData({...formData, videoUrl: e.target.value})}
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Video File</label>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {loading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
            {formData.videoUrl && <p className="text-sm text-green-600 mt-2">File uploaded: {formData.videoUrl}</p>}
          </div>
        )}

        {/* Thumbnail */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Thumbnail URL</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
            value={formData.thumbnailUrl}
            onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})}
          />
        </div>

        {/* Monetization */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Monetization</h3>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="monetization-enabled"
              checked={formData.monetization.enabled}
              onChange={e => setFormData({
                ...formData,
                monetization: { ...formData.monetization, enabled: e.target.checked }
              })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="monetization-enabled" className="ml-2 block text-sm text-gray-900">
              Enable Monetization
            </label>
          </div>

          {formData.monetization.enabled && (
            <div>
               <label className="block text-sm font-medium text-gray-700">Type</label>
               <select
                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                 value={formData.monetization.type}
                 onChange={e => setFormData({
                   ...formData,
                   monetization: { ...formData.monetization, type: e.target.value as 'ad' | 'premium' }
                 })}
               >
                 <option value="ad">Ad Supported</option>
                 <option value="premium">Premium (Subscription)</option>
               </select>
            </div>
          )}
        </div>

        {/* Transcript */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Transcript</label>
          <textarea
            rows={5}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
            value={formData.transcript}
            onChange={e => setFormData({...formData, transcript: e.target.value})}
            placeholder="Paste transcript here..."
          />
          <button
            type="button"
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
            onClick={() => setFormData(prev => ({...prev, transcript: "This is an auto-generated transcript placeholder. In a real application, this would be populated by an AI service."}))}
          >
            Generate Auto-Transcript (Simulated)
          </button>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {loading ? 'Saving...' : 'Save Video'}
          </button>
        </div>
      </form>
    </div>
  );
}
