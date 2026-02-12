import React from 'react';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  return {
    title: "Sponsorship - AI Tool Navigator",
    description: "Promote your AI tool to our audience of developers and enthusiasts.",
    alternates: {
      canonical: `/${locale}/sponsor`,
    },
  };
}

export default async function SponsorshipPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  await params;
  return (
    <div className="bg-white dark:bg-black min-h-screen text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      <div className="mx-auto max-w-4xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            Partner with AI Tool Navigator
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Reach thousands of developers and AI enthusiasts by showcasing your tool on our platform.
            Fill out the form below to get started.
          </p>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-8 sm:p-12 shadow-xl border border-zinc-200 dark:border-zinc-800">
          <form className="space-y-6" action="#" method="POST">
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="company-name" className="block text-sm font-semibold leading-6">
                  Company Name
                </label>
                <div className="mt-2.5">
                  <input
                    type="text"
                    name="company-name"
                    id="company-name"
                    autoComplete="organization"
                    className="block w-full rounded-md border-0 px-3.5 py-2 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 dark:focus:ring-indigo-500"
                    placeholder="Acme AI Inc."
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="email" className="block text-sm font-semibold leading-6">
                  Contact Email
                </label>
                <div className="mt-2.5">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    autoComplete="email"
                    className="block w-full rounded-md border-0 px-3.5 py-2 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 dark:focus:ring-indigo-500"
                    placeholder="you@company.com"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="website-url" className="block text-sm font-semibold leading-6">
                  Website URL
                </label>
                <div className="mt-2.5">
                  <input
                    type="url"
                    name="website-url"
                    id="website-url"
                    className="block w-full rounded-md border-0 px-3.5 py-2 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 dark:focus:ring-indigo-500"
                    placeholder="https://example.com"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="message" className="block text-sm font-semibold leading-6">
                  Message
                </label>
                <div className="mt-2.5">
                  <textarea
                    name="message"
                    id="message"
                    rows={4}
                    className="block w-full rounded-md border-0 px-3.5 py-2 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 dark:focus:ring-indigo-500"
                    placeholder="Tell us about your campaign goals..."
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mt-10">
              <button
                type="submit"
                className="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors duration-200"
              >
                Send Request
              </button>
            </div>
            
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 text-center">
              We typically respond within 24-48 hours.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
