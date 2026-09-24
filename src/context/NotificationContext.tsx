'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppNotification, UserRole } from '@/types';
import { notificationService } from '@/services/notificationService';
import { useAuth } from './AuthContext';
import { CheckCircle2, Truck, Bell, AlertTriangle, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  activeToast: AppNotification | null;
  dismissToast: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  const refreshNotifications = useCallback(async () => {
    const list = await notificationService.getNotifications(user?.role, user?.id);
    setNotifications(list);
  }, [user?.id, user?.role]);

  useEffect(() => {
    refreshNotifications();

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<AppNotification>;
      if (customEvent.detail) {
        setNotifications((prev) => [customEvent.detail, ...prev]);
        // Trigger toast alert for the active user if it matches their role
        if (!user || customEvent.detail.userRole === user.role || user.role === 'ADMIN') {
          setActiveToast(customEvent.detail);
        }
      }
    };

    window.addEventListener('replate_notification_added', handleCustomEvent);
    return () => {
      window.removeEventListener('replate_notification_added', handleCustomEvent);
    };
  }, [refreshNotifications, user]);

  // Auto-dismiss toast after 6 seconds
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  const markAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    await notificationService.markAllAsRead(user?.role);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismissToast = () => setActiveToast(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
        activeToast,
        dismissToast,
      }}
    >
      {children}

      {/* FLOATING ACTIONABLE TOAST NOTIFICATION */}
      {activeToast && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 animate-in slide-in-from-top-5 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                {activeToast.type === 'DONATION_MATCHED' && <CheckCircle2 className="w-5 h-5" />}
                {activeToast.type === 'DRIVER_ASSIGNED' && <Truck className="w-5 h-5" />}
                {activeToast.type === 'PICKUP_REMINDER' && <Bell className="w-5 h-5 text-amber-400" />}
                {activeToast.type === 'DONATION_DELIVERED' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black tracking-tight text-white">{activeToast.title}</p>
                <p className="text-[11px] text-slate-300 leading-relaxed">{activeToast.message}</p>
                {activeToast.actionUrl && (
                  <Link
                    href={activeToast.actionUrl}
                    onClick={() => {
                      markAsRead(activeToast.id);
                      dismissToast();
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 pt-1"
                  >
                    View Details <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
            <button
              onClick={dismissToast}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
