'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Building2,
  Globe2,
  LayoutDashboard,
  MessageSquareWarning,
  ShieldCheck,
  Store,
  Truck,
  Package,
  Bell,
  FileSpreadsheet,
  Settings,
  Bot,
} from 'lucide-react';

export type AdminTab =
  | 'overview'
  | 'providers'
  | 'drivers'
  | 'deliveries'
  | 'alerts'
  | 'reports'
  | 'settings'
  | 'food_saved_analytics'
  | 'city_state_matrix'
  | 'connected_partners'
  | 'connected_ngos'
  | 'complaints_desk'
  | 'safety_audit';

interface AdminSidebarProps {
  activeTab?: AdminTab;
  onSelectTab?: (tab: AdminTab) => void;
  openComplaintsCount?: number;
  activeAlertsCount?: number;
}

export default function AdminSidebar({
  activeTab,
  onSelectTab,
  openComplaintsCount = 4,
  activeAlertsCount = 5,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const coreOperations: {
    id: AdminTab;
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
  }[] = [
    { id: 'overview', label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { id: 'copilot' as any, label: 'AI Operations Copilot', href: '/admin/copilot', icon: Bot, badgeColor: 'bg-emerald-100 text-emerald-800' },
    { id: 'providers', label: 'Providers', href: '/admin/providers', icon: Store },
    { id: 'drivers', label: 'Drivers', href: '/admin/drivers', icon: Truck },
    { id: 'deliveries', label: 'Deliveries', href: '/admin/deliveries', icon: Package },
    { id: 'alerts', label: 'Alerts', href: '/admin/alerts', icon: Bell, badge: activeAlertsCount, badgeColor: 'bg-rose-100 text-rose-800' },
    { id: 'reports', label: 'Reports', href: '/admin/reports', icon: FileSpreadsheet },
  ];

  const analyticsNetwork: {
    id: AdminTab;
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
  }[] = [
    { id: 'food_saved_analytics', label: 'Monthly Recovered', href: '/admin/monthly-recovered', icon: BarChart3 },
    { id: 'city_state_matrix', label: 'City & State Matrix', href: '/admin/city-state-matrix', icon: Globe2 },
    { id: 'connected_ngos', label: 'NGO Network', href: '/admin/ngo-network', icon: Building2 },
    { id: 'complaints_desk', label: 'Complaints', href: '/admin/complaints', icon: MessageSquareWarning, badge: openComplaintsCount, badgeColor: 'bg-amber-100 text-amber-800' },
  ];

  const configuration: {
    id: AdminTab;
    label: string;
    href: string;
    icon: React.ElementType;
  }[] = [
    { id: 'settings', label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const isItemActive = (item: { id: AdminTab; href: string }) => {
    if (activeTab) {
      return activeTab === item.id;
    }
    if (pathname === item.href) return true;
    if (item.id === 'overview' && (pathname === '/admin' || pathname === '/admin/dashboard')) return true;
    if (item.id === 'connected_ngos' && pathname === '/admin/ngos') return true;
    return false;
  };

  return (
    <aside className="flex min-h-[calc(100vh-4rem)] w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-4 space-y-6">
      <div>
        <div className="border-b border-slate-200 px-2 pb-4">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">RePlate Operations</p>
          <h2 className="mt-0.5 text-base font-black text-slate-950">
            Admin Workspace
          </h2>
        </div>

        {/* Section 1: Operations Dispatch */}
        <div className="mt-4">
          <p className="px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
            Operations Dispatch
          </p>
          <nav className="space-y-1" aria-label="Operations Dispatch">
            {coreOperations.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => onSelectTab && onSelectTab(item.id)}
                  className={
                    active
                      ? 'flex w-full items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-left text-xs font-bold text-emerald-900 border border-emerald-200/60 shadow-2xs'
                      : 'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950'
                  }
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {item.label}
                  </span>
                  {item.badge ? (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${item.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Section 2: Regional Network & Data */}
        <div className="mt-5">
          <p className="px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
            Regional Network & Data
          </p>
          <nav className="space-y-1" aria-label="Regional Network">
            {analyticsNetwork.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => onSelectTab && onSelectTab(item.id)}
                  className={
                    active
                      ? 'flex w-full items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-left text-xs font-bold text-emerald-900 border border-emerald-200/60 shadow-2xs'
                      : 'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950'
                  }
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {item.label}
                  </span>
                  {item.badge ? (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${item.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Section 3: Configuration */}
        <div className="mt-5">
          <p className="px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
            Configuration
          </p>
          <nav className="space-y-1" aria-label="Configuration">
            {configuration.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => onSelectTab && onSelectTab(item.id)}
                  className={
                    active
                      ? 'flex w-full items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-left text-xs font-bold text-emerald-900 border border-emerald-200/60 shadow-2xs'
                      : 'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950'
                  }
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="mt-auto border-t border-slate-200 px-2 pt-4 text-[11px] leading-relaxed text-slate-400">
        RePlate National Rescue Operations &bull; Certified real-time logistics.
      </div>
    </aside>
  );
}
