'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  LayoutDashboard, Car, MapPin, Ticket, Package,
  Tag, FileText, LogOut, Bell, Settings, Inbox, Users, Star, BookOpen, Mail,
  Calendar, Clock, RefreshCw, ChevronRight, Smartphone,
  DollarSign, Sliders, CreditCard, Gift, Award, BarChart2, UserCog, MessageSquare,
  Zap, Route, Navigation, Bot, Send, TrendingUp, Wand2,
} from 'lucide-react';
import type { NotificationGroup } from '@/app/api/admin/notifications/route';

/* ── Nav config ──────────────────────────────────────────────────────────── */
const NAV_SECTIONS = [
  {
    label: 'Main Menu',
    items: [
      { href: '/admin',                    icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/admin/today',              icon: Smartphone,      label: 'Today' },
      { href: '/admin/transfers',          icon: Car,             label: 'Transfers' },
      { href: '/admin/charter-bookings',   icon: Route,           label: 'Charter Bookings' },
      { href: '/admin/tour-bookings',      icon: BookOpen,        label: 'Tour Bookings' },
      { href: '/admin/attraction-tickets', icon: Ticket,          label: 'Attraction Tickets' },
      { href: '/admin/dispatch',           icon: Navigation,      label: 'Dispatch Board' },
      { href: '/admin/calendar',           icon: Calendar,        label: 'Calendar' },
    ],
  },
  {
    label: 'Management',
    items: [
      { href: '/admin/attractions',        icon: Package,    label: 'Manage Attractions' },
      { href: '/admin/tours',              icon: MapPin,     label: 'Manage Tours' },
      { href: '/admin/itinerary',          icon: Wand2,      label: 'Itinerary Builder' },
      { href: '/admin/blog',               icon: FileText,   label: 'Manage Blog' },
      { href: '/admin/drivers',            icon: Users,      label: 'Drivers' },
      { href: '/admin/inquiries',          icon: Inbox,      label: 'Inquiries' },
      { href: '/admin/discount-codes',     icon: Tag,        label: 'Discount' },
      { href: '/admin/reviews',            icon: Star,       label: 'Reviews' },
      { href: '/admin/pricing',            icon: DollarSign, label: 'Pricing Rules' },
      { href: '/admin/pricing/dynamic',    icon: TrendingUp, label: 'Dynamic Pricing' },
      { href: '/admin/addons',             icon: Sliders,    label: 'Add-ons' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/admin/payments',      icon: CreditCard, label: 'Payments' },
      { href: '/admin/gift-vouchers', icon: Gift,       label: 'Gift Vouchers' },
      { href: '/admin/loyalty',       icon: Award,      label: 'Loyalty' },
      { href: '/admin/reports',       icon: BarChart2,  label: 'Reports' },
    ],
  },
  {
    label: 'Users',
    items: [
      { href: '/admin/users', icon: UserCog, label: 'Users' },
    ],
  },
  {
    label: 'Marketing & Comms',
    items: [
      { href: '/admin/newsletter',            icon: Mail,           label: 'Newsletter' },
      { href: '/admin/tour-notify',           icon: Bell,           label: 'Tour Notify' },
      { href: '/admin/whatsapp-templates',    icon: MessageSquare,  label: 'WA Templates' },
      { href: '/admin/whatsapp-bot',          icon: Bot,            label: 'WA Bot Sessions' },
    ],
  },
];

/* ── Type label + destination link per booking type ─────────────────────── */
const TYPE_META = {
  transfer:   { label: 'Transfer',   href: '/admin/transfers',          color: 'bg-blue-100 text-blue-700'   },
  tour:       { label: 'Tour',       href: '/admin/tour-bookings',      color: 'bg-green-100 text-green-700' },
  attraction: { label: 'Ticket',     href: '/admin/attraction-tickets', color: 'bg-purple-100 text-purple-700' },
} as const;

const STATUS_DOT: Record<string, string> = {
  PENDING:          'bg-amber-400',
  DRIVER_CONFIRMED: 'bg-blue-400',
  DRIVER_STANDBY:   'bg-indigo-400',
  DRIVER_PICKED_UP: 'bg-violet-400',
  COMPLETED:        'bg-green-400',
  CONFIRMED:        'bg-blue-400',
  CANCELLED:        'bg-red-400',
};

const GROUP_COLOR: Record<string, string> = {
  'Today':     'text-red-600   bg-red-50   border-red-100',
  'Tomorrow':  'text-amber-600 bg-amber-50 border-amber-100',
  'In 3 Days': 'text-blue-600  bg-blue-50  border-blue-100',
};

/* ── AdminShell ──────────────────────────────────────────────────────────── */
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

  /* ── Notification state ── */
  const [groups,      setGroups]      = useState<NotificationGroup[]>([]);
  const [total,       setTotal]       = useState(0);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const res  = await fetch('/api/admin/notifications');
      const json = await res.json();
      if (json.success) {
        setGroups(json.data.groups);
        setTotal(json.data.total);
      }
    } catch { /* silent */ }
    finally { setNotifLoading(false); }
  }, []);

  // Fetch on mount + every 2 minutes
  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 2 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  // Close panel on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [notifOpen]);

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  return (
    <div className="flex h-screen bg-[#f1f5f9] overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="w-[220px] bg-white border-r border-gray-100 flex flex-col shrink-0">

        {/* Logo */}
        <div className="px-5 pt-4 pb-4 border-b border-gray-50">
          <Image
            src="/images/logo.png"
            alt="Werest"
            width={150}
            height={54}
            className="h-[54px] w-auto object-contain"
            priority
          />
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

            {/* ── Notification bell ── */}
            <div className="relative" ref={panelRef}>
              <button
                onClick={() => setNotifOpen(v => !v)}
                className={`relative w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
                  notifOpen
                    ? 'bg-brand-50 border-brand-200 text-brand-600'
                    : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
                }`}
              >
                <Bell className="w-4 h-4" />
                {total > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                    {total > 99 ? '99+' : total}
                  </span>
                )}
              </button>

              {/* ── Notification dropdown panel ── */}
              {notifOpen && (
                <div className="absolute right-0 top-11 w-[360px] bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.14)] border border-gray-100 z-[200] overflow-hidden">

                  {/* Panel header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-brand-600" />
                      <span className="text-[13px] font-bold text-gray-900">Upcoming Bookings</span>
                      {total > 0 && (
                        <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          {total}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={fetchNotifications}
                      disabled={notifLoading}
                      className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Refresh"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${notifLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {/* Groups */}
                  <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
                    {notifLoading && groups.length === 0 ? (
                      <div className="py-10 text-center text-xs text-gray-400">Loading…</div>
                    ) : groups.every(g => g.bookings.length === 0) ? (
                      <div className="py-10 text-center">
                        <Calendar className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                        <p className="text-xs text-gray-400 font-medium">No upcoming bookings</p>
                        <p className="text-[10px] text-gray-300 mt-0.5">Next 3 days are clear</p>
                      </div>
                    ) : (
                      groups.map((group) => (
                        <div key={group.label}>
                          {/* Group label */}
                          <div className="px-4 py-2 flex items-center justify-between sticky top-0 bg-white border-b border-gray-50">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${GROUP_COLOR[group.label]}`}>
                              {group.label}
                            </span>
                            <span className="text-[10px] text-gray-400">{group.date}</span>
                          </div>

                          {group.bookings.length === 0 ? (
                            <p className="px-4 py-3 text-[11px] text-gray-300 italic">No bookings</p>
                          ) : (
                            group.bookings.map((b) => {
                              const meta = TYPE_META[b.type];
                              return (
                                <Link
                                  key={`${b.type}-${b.id}`}
                                  href={meta.href}
                                  onClick={() => setNotifOpen(false)}
                                  className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
                                >
                                  {/* Status dot */}
                                  <div className="mt-1 shrink-0">
                                    <span className={`block w-2 h-2 rounded-full ${STATUS_DOT[b.status] ?? 'bg-gray-300'}`} />
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${meta.color}`}>
                                        {meta.label}
                                      </span>
                                      <span className="text-[10px] font-mono text-gray-400 truncate">{b.ref}</span>
                                    </div>
                                    <p className="text-[12px] font-semibold text-gray-900 truncate">{b.customerName}</p>
                                    <p className="text-[11px] text-gray-500 truncate">{b.service}</p>
                                    {b.time && (
                                      <p className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                                        <Clock className="w-3 h-3" />
                                        {b.time}
                                      </p>
                                    )}
                                  </div>

                                  {/* Arrow */}
                                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 shrink-0 mt-1 transition-colors" />
                                </Link>
                              );
                            })
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Panel footer */}
                  <div className="border-t border-gray-100 px-4 py-2.5 flex items-center justify-between">
                    <p className="text-[10px] text-gray-400">Auto-refreshes every 2 min</p>
                    <Link
                      href="/admin/transfers"
                      onClick={() => setNotifOpen(false)}
                      className="text-[11px] font-semibold text-brand-600 hover:text-brand-800"
                    >
                      View all bookings →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <button className="w-9 h-9 rounded-xl border border-gray-100 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
              <Settings className="w-4 h-4 text-gray-400" />
            </button>

            {/* Avatar */}
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
