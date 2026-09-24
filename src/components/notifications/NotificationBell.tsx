'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { Bell, CheckCheck, CheckCircle2, Truck, Clock, PackageCheck, ExternalLink, X } from 'lucide-react';
import Link from 'next/link';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="View notifications"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-2xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2 opacity-50" />
                No notifications yet. You will receive updates on matches, driver assignments, and delivery completions here.
              </div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n.id}
                  className={`p-4 transition-colors flex items-start gap-3 hover:bg-slate-50 ${
                    !n.read ? 'bg-emerald-50/30' : ''
                  }`}
                  onClick={() => markAsRead(n.id)}
                >
                  <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-bold ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-slate-400">{formatTime(n.timestamp)}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{n.message}</p>
                    {n.metadata?.otp && (
                      <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-900 font-mono text-[11px] font-bold">
                        <span>Pickup OTP:</span>
                        <strong className="tracking-widest">{n.metadata.otp}</strong>
                      </div>
                    )}
                    {n.actionUrl && (
                      <div className="pt-1">
                        <Link
                          href={n.actionUrl}
                          onClick={() => {
                            markAsRead(n.id);
                            setIsOpen(false);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
                        >
                          View Action <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-500 font-medium">
              Real-time rescue lifecycle events
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
