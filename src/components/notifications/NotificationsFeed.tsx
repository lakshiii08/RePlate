'use client';

import React from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { Bell, CheckCircle2, Truck, Clock, PackageCheck, ExternalLink, CheckCheck } from 'lucide-react';
import Link from 'next/link';

interface NotificationsFeedProps {
  limit?: number;
  compact?: boolean;
}

export default function NotificationsFeed({ limit = 5, compact = false }: NotificationsFeedProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'DONATION_MATCHED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'DRIVER_ASSIGNED':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'PICKUP_REMINDER':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'DONATION_DELIVERED':
        return <PackageCheck className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return new Date(isoString).toLocaleDateString();
    } catch {
      return '';
    }
  };

  const displayedList = limit ? notifications.slice(0, limit) : notifications;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Rescue Alerts & Notifications</h3>
            <p className="text-xs text-slate-500">Live operational events (matches, couriers, handovers)</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      <div className="divide-y divide-slate-100">
        {displayedList.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No active notifications at this time.
          </div>
        ) : (
          displayedList.map((n) => (
            <div
              key={n.id}
              className={`p-4 transition-colors flex items-start gap-3.5 hover:bg-slate-50 ${
                !n.read ? 'bg-emerald-50/20' : ''
              }`}
            >
              <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-extrabold ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">{formatTime(n.timestamp)}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                {n.metadata?.otp && (
                  <div className="mt-1.5 inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-950 font-mono text-xs font-bold">
                    <span>Handover OTP:</span>
                    <strong className="tracking-widest bg-white px-2 py-0.5 rounded shadow-2xs text-emerald-800">
                      {n.metadata.otp}
                    </strong>
                  </div>
                )}
                {n.actionUrl && (
                  <div className="pt-1.5">
                    <Link
                      href={n.actionUrl}
                      onClick={() => markAsRead(n.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                    >
                      Track & View <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
              {!n.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
