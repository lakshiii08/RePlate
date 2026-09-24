'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  ClipboardList,
  Truck,
  History,
  BarChart3,
  User,
  Building2,
  Sparkles,
} from 'lucide-react';
import { useRescue } from '@/context/RescueContext';

export default function RecipientSidebar() {
  const pathname = usePathname();
  const { donations } = useRescue();

  // Dynamic non-hardcoded counts from live context
  const availableFoodCount = donations.filter(
    (d) => d.status === 'POSTED' || d.status === 'VERIFIED'
  ).length;

  const activeRequestsCount = donations.filter(
    (d) => d.status === 'MATCHING' || d.status === 'RE_MATCHING' || (d.status === 'MATCHED' && !d.assignedDriver)
  ).length;

  const upcomingDeliveriesCount = donations.filter(
    (d) =>
      d.status === 'DRIVER_ASSIGNED' ||
      d.status === 'PICKUP_IN_PROGRESS' ||
      d.status === 'PICKED_UP' ||
      d.status === 'IN_TRANSIT'
  ).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/recipient/dashboard',
      badge: null,
    },
    {
      id: 'browse',
      label: 'Browse Food',
      icon: Search,
      href: '/recipient/browse',
      badge: availableFoodCount > 0 ? `${availableFoodCount} New` : null,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'requests',
      label: 'Requests',
      icon: ClipboardList,
      href: '/recipient/requests',
      badge: activeRequestsCount > 0 ? activeRequestsCount : null,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'deliveries',
      label: 'Deliveries',
      icon: Truck,
      href: '/recipient/deliveries',
      badge: upcomingDeliveriesCount > 0 ? upcomingDeliveriesCount : null,
      badgeColor: 'bg-blue-100 text-blue-800 animate-pulse',
    },
    {
      id: 'history',
      label: 'History',
      icon: History,
      href: '/recipient/history',
      badge: null,
    },
    {
      id: 'impact',
      label: 'Impact',
      icon: BarChart3,
      href: '/recipient/impact',
      badge: null,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      href: '/recipient/profile',
      badge: null,
    },
  ];

  const isItemActive = (href: string) => {
    if (href === '/recipient/dashboard' && (pathname === '/recipient' || pathname === '/recipient/dashboard')) {
      return true;
    }
    return pathname === href;
  };

  return (
    <aside className="flex min-h-[calc(100vh-4rem)] w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-4 space-y-6">
      <div>
        <div className="border-b border-slate-200 px-2 pb-4">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            RePlate Distribution
          </p>
          <h2 className="mt-0.5 text-base font-black text-slate-950 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-emerald-600" />
            Recipient Portal
          </h2>
        </div>

        <div className="mt-4">
          <p className="px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
            Intake Operations
          </p>
          <nav className="space-y-1" aria-label="Recipient Navigation">
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

      {/* Main Flow Visual Guide */}
      <div className="mt-auto p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2">
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 uppercase">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Intake Lifecyle
        </div>
        <div className="text-[11px] text-slate-500 font-medium leading-relaxed">
          <span className="font-bold text-slate-800">Browse</span> &rarr; <span className="font-bold text-slate-800">Request</span> &rarr; <span className="font-bold text-slate-800">Delivery</span> &rarr; <span className="font-bold text-emerald-700">Received</span> &rarr; <span className="font-bold text-indigo-700">Impact</span>
        </div>
      </div>
    </aside>
  );
}
