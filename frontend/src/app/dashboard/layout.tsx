'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { token, user, companyName, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !token) {
      router.push('/login');
    }
  }, [token, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen bg-hire-bg items-center justify-center">
        <div className="text-hire-text-muted">Loading...</div>
      </div>
    );
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '⬛' },
    { href: '/jobs', label: 'Jobs', icon: '💼' },
    { href: '/candidates', label: 'Candidates', icon: '👥' },
  ];

  return (
    <div className="flex h-screen bg-hire-bg overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-hire-surface border-r border-hire-border flex flex-col">
        <div className="p-5 border-b border-hire-border">
          <div className="text-lg font-bold text-hire-text-main">HireFlow</div>
          <div className="text-xs text-hire-text-muted mt-0.5 truncate">{companyName}</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === item.href ? 'bg-hire-primary text-white' : 'text-hire-text-muted hover:text-hire-text-main hover:bg-hire-surface-hover'
              }`}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-hire-border">
          <div className="px-3 py-2 text-sm text-hire-text-muted truncate">{user?.name}</div>
          <button onClick={logout} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-hire-surface-hover rounded-lg transition-colors">
            Sign Out
          </button>
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
