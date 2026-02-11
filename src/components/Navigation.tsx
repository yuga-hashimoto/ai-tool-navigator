import { Link } from '@/i18n/routing';

export function Navigation() {
  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white hover:opacity-80 transition-opacity">
              AI Tool Navigator
            </Link>
            <div className="hidden md:flex gap-6">
              <Link href="/" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/deals" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                Deals
              </Link>
              <Link href="/blog" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                Blog
              </Link>
              <Link href="/submit" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-500 transition-colors shadow-sm ml-4">
                Submit Your Tool
              </Link>
            </div>
          </div>
          {/* Mobile menu button could go here, for now keeping it simple */}
           <div className="md:hidden flex gap-4">
              <Link href="/" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/deals" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                Deals
              </Link>
              <Link href="/blog" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                Blog
              </Link>
              <Link href="/submit" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-500 transition-colors shadow-sm">
                Submit Your Tool
              </Link>
           </div>
        </div>
      </div>
    </nav>
  );
}
