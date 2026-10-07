'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  DashboardIcon,
  AlertTriangle,
  FileText,
  Users,
  MapIcon,
  AnalyticsIcon,
  SettingsIcon,
  LogOut,
  Bell,
  ChevronDown,
  Search,
  Sprout
} from '../../components/Icons';
import NotificationPanel from '../../components/NotificationPanel';
import { getUnreadCount } from '../../lib/api';

function NavigationMenu() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: DashboardIcon },
    { name: 'Incidents', href: '/admin/incidents', icon: AlertTriangle },
    { name: 'Reports', href: '/admin/reports', icon: FileText, badge: '3' },
    { name: 'Analytics', href: '/admin/analytics', icon: AnalyticsIcon },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Map View', href: '/admin/map', icon: MapIcon },
    { name: 'Settings', href: '/admin/settings', icon: SettingsIcon },
  ];

  return (
    <nav className="space-y-1.5 px-3 py-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.href === '/admin'
          ? pathname === '/admin'
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              isActive
                ? 'bg-[#0d7a68] text-white shadow-sm font-semibold'
                : 'text-slate-300/80 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </div>
            {item.badge && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [currentDateTime, setCurrentDateTime] = useState('Oct 7, 2026 08:07 PM');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count on mount and periodically
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const count = await getUnreadCount();
        setUnreadCount(count);
      } catch (err) {
        console.error('Failed to fetch unread count:', err);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const month = now.toLocaleDateString('en-US', { month: 'short' });
      const day = now.getDate();
      const year = now.getFullYear();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const strHours = String(hours).padStart(2, '0');
      setCurrentDateTime(`${month} ${day}, ${year} ${strHours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] text-slate-800 flex flex-col md:flex-row antialiased font-sans">
      {/* Dark Forest / Slate Sidebar matching screenshot */}
      <aside className="w-full md:w-60 bg-[#0d1f27] text-white flex flex-col justify-between shrink-0 shadow-xl border-r border-[#162e39] z-20">
        <div>
          {/* Logo / Brand Header */}
          <div className="h-18 px-4 flex items-center gap-3 border-b border-white/5">
            <div className="w-8 h-8 rounded-xl bg-[#0d9488] flex items-center justify-center text-white font-black text-sm shadow-sm ring-1 ring-white/20">
              A
            </div>
            <div>
              <div className="font-bold text-base text-white tracking-tight leading-tight">
                RouteGuard
              </div>
              <div className="text-[10px] text-slate-400 font-normal">
                Road Safety Intelligence
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <Suspense fallback={<div className="p-4 text-xs text-slate-500">Loading menu...</div>}>
            <NavigationMenu />
          </Suspense>
        </div>

        {/* Bottom Banner matching screenshot: "Safer Roads for a Better Tomorrow" */}
        <div className="p-3 m-3 rounded-2xl bg-gradient-to-b from-[#142d38] to-[#0c181f] border border-white/10 relative overflow-hidden shadow-inner">
          {/* Highway Graphic Backdrop */}
          <div
            className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400&auto=format&fit=crop&q=60')`
            }}
          />
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#0d9488]/30 border border-[#14b8a6]/40 flex items-center justify-center text-[#2dd4bf] shrink-0">
              <Sprout className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-white/90 leading-tight">
              Safer Roads<br />
              <span className="text-[10px] text-slate-400 font-normal">for a Better Tomorrow</span>
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f4f7f6] overflow-y-auto">
        {/* Top Header matching screenshot */}
        <header className="px-6 lg:px-8 py-3 bg-white border-b border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 z-30 shadow-2xs">
          {/* Search Bar */}
          <div className="relative w-full sm:w-80 lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Incidents, locations, or reports..."
              className="w-full bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-full pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0d7a68] focus:bg-white transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">
              ⌕
            </span>
          </div>

          {/* Right Header Status, Date, Notification, Admin Profile */}
          <div className="flex items-center gap-3 sm:gap-4 self-end sm:self-auto">
            {/* System Online badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Online</span>
            </div>

            {/* Date time */}
            <div className="text-xs font-medium text-slate-500 hidden md:block">
              {currentDateTime}
            </div>

            {/* Notification Bell with red badge */}
            <div className="relative">
              <button
                onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
                className="relative p-1.5 text-slate-600 hover:text-slate-900 cursor-pointer rounded-full hover:bg-slate-100 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Admin Avatar Pill with dropdown */}
            <div className="relative">
              <div
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer select-none"
              >
                <div className="w-7 h-7 rounded-full bg-[#0d9488] flex items-center justify-center text-white font-bold text-xs shadow-xs">
                  A
                </div>
                <span className="text-xs font-bold text-slate-800 hidden sm:inline-block">Admin</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-800">Admin User</p>
                    <p className="text-[10px] text-slate-400">admin@routeguard.io</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-5 lg:p-7 space-y-5">
          <Suspense fallback={<div className="p-12 text-center text-slate-400 text-sm">Loading dashboard telemetry...</div>}>
            {children}
          </Suspense>
        </main>

        {/* Notification Panel */}
        <NotificationPanel 
          isOpen={notificationPanelOpen}
          onClose={() => setNotificationPanelOpen(false)}
          onUnreadCountChange={(count) => setUnreadCount(count)}
        />
      </div>
    </div>
  );
}
