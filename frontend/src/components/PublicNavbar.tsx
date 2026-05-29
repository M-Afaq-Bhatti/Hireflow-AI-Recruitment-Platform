'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PublicNavbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-hire-surface border-b border-hire-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-hire-text-main">HireFlow</div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/public/jobs"
              className={`transition-colors font-medium ${
                pathname === '/public/jobs'
                  ? 'text-hire-primary'
                  : 'text-hire-text-muted hover:text-hire-text-main'
              }`}
            >
              Browse Jobs
            </Link>

            <div className="flex gap-3">
              {/* HR Sign In */}
              <Link
                href="/login"
                className="px-4 py-2 text-hire-text-muted hover:text-hire-text-main transition-colors"
              >
                HR Sign In
              </Link>

              {/* Apply CTA */}
              <Link
                href="/public/jobs"
                className="px-4 py-2 bg-hire-primary hover:bg-hire-primary-hover text-white rounded-lg font-medium transition-colors"
              >
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
