import React from 'react';
import { Metadata } from 'next';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Advertise - AI Tool Navigator",
    description: "Sponsor AI Tools Navigator and reach thousands of developers.",
    alternates: {
      canonical: `/${locale}/advertise`,
    }
  };
}

export default function AdvertisePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Sponsor AI Tools Navigator
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Get your AI tool in front of thousands of developers and enthusiasts.
          </p>
        </div>

        <div className="mt-16 bg-white pb-12 lg:mt-20 lg:pb-20">
          <div className="relative z-0 bg-white lg:grid lg:grid-cols-2 lg:gap-8 border rounded-lg shadow-sm">
            
            {/* Basic Listing */}
            <div className="p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-gray-200">
              <h3 className="text-2xl font-semibold text-gray-900">Basic Listing</h3>
              <p className="mt-4 text-gray-500">Get listed in our directory and be discoverable by search.</p>
              <div className="mt-8 flex items-baseline">
                <span className="text-5xl font-extrabold text-gray-900">$29</span>
                <span className="ml-2 text-xl font-medium text-gray-500">/mo</span>
              </div>
              <ul className="mt-6 space-y-4 text-gray-500">
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 text-green-500">✓</span>
                  <span className="ml-3">Permanent listing in directory</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 text-green-500">✓</span>
                  <span className="ml-3">Standard search visibility</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 text-green-500">✓</span>
                  <span className="ml-3">Direct link to your site</span>
                </li>
              </ul>
              <div className="mt-8">
                <a href="#" className="block w-full bg-blue-600 border border-transparent rounded-md py-3 px-6 text-center text-white font-medium hover:bg-blue-700">
                  Select Basic
                </a>
              </div>
            </div>

            {/* Featured Spot */}
            <div className="p-8 lg:p-12 bg-gray-50">
              <h3 className="text-2xl font-semibold text-gray-900">Featured Spot</h3>
              <p className="mt-4 text-gray-500">Highlight your tool on the homepage and top of search results.</p>
              <div className="mt-8 flex items-baseline">
                <span className="text-5xl font-extrabold text-gray-900">$99</span>
                <span className="ml-2 text-xl font-medium text-gray-500">/mo</span>
              </div>
              <ul className="mt-6 space-y-4 text-gray-500">
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 text-green-500">✓</span>
                  <span className="ml-3">Homepage &quot;Featured Tool&quot; placement</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 text-green-500">✓</span>
                  <span className="ml-3">Top of search results</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 text-green-500">✓</span>
                  <span className="ml-3">&quot;Featured&quot; badge on listing</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 text-green-500">✓</span>
                  <span className="ml-3">Priority support</span>
                </li>
              </ul>
              <div className="mt-8">
                <a href="#" className="block w-full bg-indigo-600 border border-transparent rounded-md py-3 px-6 text-center text-white font-medium hover:bg-indigo-700 shadow-lg transform transition hover:-translate-y-0.5">
                  Select Featured
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
