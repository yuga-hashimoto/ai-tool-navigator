import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: '404 - Page Not Found',
};

export default function NotFound() {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-black px-4 text-center font-sans">
            <div className="space-y-4 max-w-md w-full">
                <h1 className="text-6xl font-extrabold text-gray-900 dark:text-white">404</h1>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                Page Not Found
                </h2>
                <p className="text-base text-gray-500 dark:text-gray-400">
                Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
                </p>

                <div className="pt-6">
                <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-md bg-blue-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
                >
                    Return Home
                </Link>
                </div>
            </div>
        </div>
      </body>
    </html>
  );
}
