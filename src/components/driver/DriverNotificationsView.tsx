'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Check,
  Plus,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useRescue } from '@/context/RescueContext';

export interface DriverNotification {
  id: string;
  category: 'ASSIGNMENT' | 'UPDATE' | 'DELAY' | 'COMPLETED';
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  rescueId?: string;
}

const INITIAL_NOTIFICATIONS: DriverNotification[] = [
  {
    id: 'notif-1',
    category: 'ASSIGNMENT',
    title: '⚡ New Urgent Assignment Available',
    message: 'Bella Vista Trattoria has 30 kg hot pasta & entrees ready for immediate pickup. Pickup deadline in 35 minutes.',
    time: '2 mins ago',
    read: false,
    actionUrl: '/driver/deliveries',
    actionLabel: 'View & Accept',
    rescueId: 'RP-4102',
  },
  {
    id: 'notif-2',
    category: 'DELAY',
    title: '⚠️ Traffic Advisory: Bay Bridge Inbound',
    message: 'Heavy traffic reported near Fremont St exit. Expected 14-minute transit delay. Please notify recipient shelter if ETA shifts.',
    time: '12 mins ago',
    read: false,
    actionUrl: '/driver/route',
    actionLabel: 'Check Alternate Route',
  },
  {
    id: 'notif-3',
    category: 'UPDATE',
    title: '📦 Loading Dock Update: Grand Hyatt',
    message: 'Donor kitchen reports food is packed in thermal Cambro boxes waiting at Service Bay #3.',
    time: '25 mins ago',
    read: true,
    actionUrl: '/driver/route',
    actionLabel: 'View Dock Instructions',
  },
  {
    id: 'notif-4',
    category: 'COMPLETED',
    title: '✅ Intake Signed: Hope Community Kitchen',
    message: 'Sister Mary confirmed safe intake of 25 kg hot entrees for Rescue #RP-1002. Thermal audit: 63.5°C verified.',
    time: '1 hour ago',
    read: true,
    actionUrl: '/driver/history',
    actionLabel: 'View Intake Slip',
  },
];

export default function DriverNotificationsView() {
  const { donations } = useRescue();
  const [notifications, setNotifications] = useState<DriverNotification[]>(INITIAL_NOTIFICATIONS);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'ASSIGNMENT' | 'DELAY' | 'UPDATE'>('ALL');
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    triggerToast('All notifications marked as read');
  };

  const handleSimulateAssignment = () => {
    const newNotif: DriverNotification = {
      id: `notif-${Date.now()}`,
      category: 'ASSIGNMENT',
      title: '⚡ Flash Assignment: Grand Hyatt Banquet Surplus',
      message: '35 kg fresh entrees & baked loaves packaged and waiting at loading dock for immediate rescue.',
      time: 'Just now',
      read: false,
      actionUrl: '/driver/deliveries',
      actionLabel: 'Claim Run',
      rescueId: 'RP-9021',
    };
    setNotifications((prev) => [newNotif, ...prev]);
    triggerToast('New dispatch alert received!');
  };

  const filtered = notifications.filter((n) => {
    if (categoryFilter === 'ALL') return true;
    return n.category === categoryFilter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Courier Dispatch Notifications</h1>
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                unreadCount > 0 ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {unreadCount} NEW UPDATES
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry flagging new rescue assignments, traffic rerouting, donor dock alerts, and completion sign-offs.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSimulateAssignment}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Simulate Assignment</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Filter Tabs (Lakshita MVP spec: New assignments, updates, delays) */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 w-fit text-xs font-bold flex-wrap">
        {[
          { key: 'ALL', label: `All Alerts (${notifications.length})` },
          { key: 'ASSIGNMENT', label: 'New Assignments' },
          { key: 'DELAY', label: 'Route Delays' },
          { key: 'UPDATE', label: 'Dock Updates' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setCategoryFilter(tab.key as any)}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              categoryFilter === tab.key
                ? 'bg-white text-slate-900 shadow-2xs font-black'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications Feed */}
      <div className="space-y-3.5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-3xl border p-5 shadow-2xs space-y-3 transition-all ${
              !item.read
                ? 'border-amber-300 ring-2 ring-amber-100/50'
                : 'border-slate-200 opacity-90'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      item.category === 'ASSIGNMENT'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.category === 'DELAY'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {item.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{item.time}</span>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-amber-500" title="Unread" />
                  )}
                </div>

                <h3 className="font-black text-slate-900 text-sm mt-1">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{item.message}</p>
              </div>

              {item.actionUrl && (
                <Link
                  href={item.actionUrl}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto shrink-0 shadow-xs"
                >
                  <span>{item.actionLabel || 'View Action'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-400 text-xs">
            No notifications found under this filter.
          </div>
        )}
      </div>
    </div>
  );
}
