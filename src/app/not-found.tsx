import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: '404 - Page Not Found',
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground antialiased">
      <div className="container px-4 text-center">
        <div className="mb-4 text-9xl font-bold tracking-tighter text-muted-foreground/30">
          404
        </div>
        <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Page Not Found
        </h1>
        <p className="mx-auto mb-8 max-w-md text-muted-foreground">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
