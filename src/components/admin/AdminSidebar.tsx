'use client';

import React from 'react';
import {
  Home,
  Map,
  AlertTriangle,
  Package,
  ShieldCheck,
  Bot,
  Users,
  BarChart3,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export type AdminTab =
  | 'command_center'
  | 'live_operations'
  | 'critical_rescues'
  | 'all_rescues'
  | 'safety_review'
  | 'rescue_copilot'
  | 'users'
  | 'impact';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  criticalCount?: number;
}

export default function AdminSidebar({
  activeTab,
  onSelectTab,
  criticalCount = 2,
}: AdminSidebarProps) {
  const navItems: { id: AdminTab; label: string; icon: any; badge?: string | number; badgeColor?: string }[] = [
    { id: 'command_center', label: 'Command Center', icon: Home },
    { id: 'live_operations', label: 'Live Operations', icon: Map },
    {
      id: 'critical_rescues',
      label: 'Critical Rescues',
      icon: AlertTriangle,
      badge: criticalCount,
      badgeColor: 'bg-rose-600 text-white animate-pulse',
    },
    { id: 'all_rescues', label: 'All Rescues', icon: Package },
    { id: 'safety_review', label: 'Safety Review', icon: ShieldCheck, badge: '2', badgeColor: 'bg-amber-500 text-white' },
    { id: 'rescue_copilot', label: 'Rescue Copilot', icon: Bot, badge: 'AI', badgeColor: 'bg-emerald-600 text-white' },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'impact', label: 'Impact', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between border-r border-slate-800 shrink-0">
      <div className="space-y-6">
        {/* Sidebar Header */}
        <div className="px-3 pt-2">
          <div className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-emerald-400 mb-1">
            LOGISTICS ENGINE
          </div>
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            REPLATE ADMIN
          </h2>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  active
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Telemetry Status */}
      <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-2 text-xs">
        <div className="flex items-center gap-2 font-bold text-emerald-400 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          SYSTEM ONLINE (100%)
        </div>
        <p className="text-[10px] text-slate-400 font-mono leading-tight">
          Sub-Minute Rescue Routing & Deterministic Safety Active
        </p>
      </div>
    </aside>
  );
}
