'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Navigation,
  Bell,
  History,
  User,
  Truck,
  Power,
  Sparkles,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { useRescue } from '@/context/RescueContext';
import { useAuth } from '@/context/AuthContext';

export default function DriverSidebar() {
  const pathname = usePathname();
  const { donations } = useRescue();
  const { user, updateUserProfile } = useAuth();

  const [isOnline, setIsOnline] = useState(user?.isOnline ?? true);

  const activeDeliveriesCount = donations.filter(
    (d) =>
      d.status === 'DRIVER_ASSIGNED' ||
      d.status === 'PICKUP_IN_PROGRESS' ||
      d.status === 'PICKED_UP' ||
      d.status === 'IN_TRANSIT'
  ).length;

  const toggleOnline = async () => {
    const next = !isOnline;
    setIsOnline(next);
    try {
      await updateUserProfile({ isOnline: next });
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/driver/dashboard',
      badge: null,
    },
    {
      id: 'deliveries',
      label: 'My Deliveries',
      icon: Package,
      href: '/driver/deliveries',
      badge: activeDeliveriesCount > 0 ? activeDeliveriesCount : null,
      badgeColor: 'bg-emerald-100 text-emerald-800 animate-pulse',
    },
    {
      id: 'route',
      label: 'Route',
      icon: Navigation,
      href: '/driver/route',
      badge: activeDeliveriesCount > 0 ? 'LIVE' : null,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'validate-otp',
      label: 'Validate OTP',
      icon: KeyRound,
      href: '/driver/validate-otp',
      badge: 'PORTAL',
      badgeColor: 'bg-emerald-100 text-emerald-800 font-black',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      href: '/driver/notifications',
      badge: '3',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'history',
      label: 'History',
      icon: History,
      href: '/driver/history',
      badge: null,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      href: '/driver/profile',
      badge: null,
    },
  ];

  const isItemActive = (href: string) => {
    if (href === '/driver/dashboard' && (pathname === '/driver' || pathname === '/driver/dashboard')) {
      return true;
    }
    return pathname === href;
  };

  return (
    <aside className="flex min-h-[calc(100vh-4rem)] w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-4 space-y-6">
      <div>
        <div className="border-b border-slate-200 px-2 pb-4">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            RePlate Logistics
          </p>
          <h2 className="mt-0.5 text-base font-black text-slate-950 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-emerald-600" />
            Courier Workspace
          </h2>
        </div>

        {/* Online / Offline Quick Toggle */}
        <div className="mt-4 px-2">
          <button
            onClick={toggleOnline}
            className={`w-full py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-between transition-all border ${
              isOnline
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
              <span>{isOnline ? 'ONLINE & READY' : 'OFFLINE'}</span>
            </span>
            <Power className="w-3.5 h-3.5 opacity-70" />
          </button>
        </div>

        <div className="mt-4">
          <p className="px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
            Courier Navigation
          </p>
          <nav className="space-y-1" aria-label="Driver Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={
                    active
                      ? 'flex w-full items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-left text-xs font-bold text-emerald-900 border border-emerald-200/60 shadow-2xs'
                      : 'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950'
                  }
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                    {item.label}
                  </span>
                  {item.badge ? (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        item.badgeColor || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Vehicle Info Tile in Sidebar */}
      <div className="mt-auto p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
        <div className="text-[10px] font-bold text-slate-400 uppercase">Assigned Transport</div>
        <div className="font-extrabold text-slate-900 text-xs">
          {user?.vehicleType || 'Refrigerated Cargo Van'}
        </div>
        <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Thermal Probe Verified
        </div>
      </div>
    </aside>
  );
}
