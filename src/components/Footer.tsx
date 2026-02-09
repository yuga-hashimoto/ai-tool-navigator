import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <Link href="/sponsor" className="text-zinc-500 hover:text-zinc-400">
            Sponsorship
          </Link>
          <Link href="/privacy" className="text-zinc-500 hover:text-zinc-400">
            Privacy
          </Link>
          <Link href="/terms" className="text-zinc-500 hover:text-zinc-400">
            Terms
          </Link>
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-center text-xs leading-5 text-zinc-500">
            &copy; {new Date().getFullYear()} AI Tool Navigator. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
