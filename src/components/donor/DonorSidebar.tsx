'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  UtensilsCrossed,
  HeartHandshake,
  Truck,
  BarChart3,
  User,
} from 'lucide-react';
import { useRescue } from '@/context/RescueContext';

export default function DonorSidebar() {
  const pathname = usePathname();
  const { donations } = useRescue();

  const activeDonationsCount = donations.filter(
    (d) => d.status !== 'DELIVERED' && d.status !== 'CANCELLED'
  ).length;

  const pendingPickupsCount = donations.filter(
    (d) =>
      d.status === 'POSTED' ||
      d.status === 'VERIFIED' ||
      d.status === 'MATCHED' ||
      d.status === 'DRIVER_ASSIGNED' ||
      d.status === 'PICKUP_IN_PROGRESS'
  ).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/donor/dashboard',
      badge: null,
    },
    {
      id: 'add-food',
      label: 'Add Food',
      icon: PlusCircle,
      href: '/donor/donations/new',
      badge: 'NEW',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'my-food',
      label: 'My Food',
      icon: UtensilsCrossed,
      href: '/donor/my-food',
      badge: donations.length || null,
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'donations',
      label: 'Donations',
      icon: HeartHandshake,
      href: '/donor/donations',
      badge: activeDonationsCount || null,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'pickups',
      label: 'Pickups',
      icon: Truck,
      href: '/donor/pickups',
      badge: pendingPickupsCount || null,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'impact',
      label: 'Impact',
      icon: BarChart3,
      href: '/donor/impact',
      badge: null,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      href: '/donor/profile',
      badge: null,
    },
  ];

  const isItemActive = (href: string) => {
    if (href === '/donor/dashboard' && (pathname === '/donor' || pathname === '/donor/dashboard')) {
      return true;
    }
    if (href === '/donor/donations/new' && (pathname === '/donor/donations/new' || pathname === '/donor/add-food')) {
      return true;
    }
    return pathname === href;
  };

  return (
    <aside className="flex min-h-[calc(100vh-4rem)] w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-4 space-y-6">
      <div>
        <div className="border-b border-slate-200 px-2 pb-4">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            RePlate Operations
          </p>
          <h2 className="mt-0.5 text-base font-black text-slate-950">
            Donor Workspace
          </h2>
        </div>

        <div className="mt-4">
          <p className="px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
            Donor Navigation
          </p>
          <nav className="space-y-1" aria-label="Donor Navigation">
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

      <div className="mt-auto border-t border-slate-200 px-2 pt-4 text-[11px] leading-relaxed text-slate-400">
        Certified Food Recovery &bull; Zero food waste mission.
      </div>
    </aside>
  );
}
