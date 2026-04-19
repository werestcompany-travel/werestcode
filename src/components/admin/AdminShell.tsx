'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Car, MapPin, Ticket, Package,
  Tag, FileText, LogOut, Search, Bell, Settings,
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    label: 'Main Menu',
    items: [
      { href: '/admin',                  icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/admin/transfers',        icon: Car,             label: 'Transfers' },
      { href: '/admin/tours',            icon: MapPin,          label: 'Tours' },
      { href: '/admin/attraction-tickets', icon: Ticket,        label: 'Attraction Tickets' },
    ],
  },
  {
    label: 'Management',
    items: [
      { href: '/admin/attractions',      icon: Package,  label: 'Manage Attractions' },
      { href: '/admin/discount-codes',   icon: Tag,      label: 'Discount Codes' },
      { href: '/admin/blog',             icon: FileText, label: 'Blog' },
    ],
  },
];

export default function AdminShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  const pathname = usePathname();
  const router   = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  return (
    <div className="flex h-screen bg-[#f1f5f9] overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="w-[220px] bg-white border-r border-gray-100 flex flex-col shrink-0">

        {/* Logo */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-extrabold text-sm">W</span>
            </div>
            <div>
              <p className="font-extrabold text-gray-900 text-[13px] leading-none">Werest</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-xs text-gray-400 flex-1">Search</span>
            <kbd className="text-[9px] text-gray-300 bg-white border border-gray-200 rounded px-1 py-0.5">⌘K</kbd>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.12em] px-3 mb-1.5">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== '/admin' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center gap-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                        active
                          ? 'bg-brand-50 text-brand-700 border-l-[3px] border-brand-600 pl-[9px] pr-3 py-2.5'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 px-3 py-2.5'
                      }`}
                    >
                      <item.icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          active ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-600'
                        }`}
                      />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Profile */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-white font-bold text-[11px]">WA</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-gray-900 truncate">Werest Admin</p>
              <p className="text-[10px] text-gray-400 truncate">Workspace</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 leading-none">{title}</h1>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-xl border border-gray-100 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
              <Bell className="w-4 h-4 text-gray-400" />
            </button>
            <button className="w-9 h-9 rounded-xl border border-gray-100 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
              <Settings className="w-4 h-4 text-gray-400" />
            </button>
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center shadow-sm ml-1">
              <span className="text-white font-bold text-[11px]">WA</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
