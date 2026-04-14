'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BriefcaseIcon, LayoutDashboardIcon, UsersIcon, SparklesIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
  { href: '/jobs', label: 'Jobs', icon: BriefcaseIcon },
  { href: '/jobs/new', label: 'Post a Job', icon: UsersIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col min-h-screen fixed top-0 left-0 z-20">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-100">
        <div className="bg-blue-600 text-white rounded-lg p-1.5">
          <SparklesIcon size={18} />
        </div>
        <div>
          <p className="font-bold text-sm text-gray-900 leading-none">Digital HR-Room</p>
          <p className="text-xs text-gray-400 mt-0.5">AI Recruitment</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">Powered by Gemini AI</p>
      </div>
    </aside>
  );
}
