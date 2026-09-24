'use client';

import React from 'react';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

import NotificationBell from '@/components/notifications/NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();

  const getDashboardPath = (role?: UserRole) => {
    switch (role) {
      case 'DONOR':
        return '/donor/dashboard';
      case 'SHELTER':
        return '/recipient/dashboard';
      case 'DRIVER':
        return '/driver/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/donor/dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-sm group-hover:scale-105 transition-transform">
            R
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              RePlate
              <span className="text-[10px] px-1.5 py-0.2 font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded">
                REALTIME
              </span>
            </span>
          </div>
        </Link>

        {/* Middle Contextual Navigation */}
        <div className="hidden md:flex items-center gap-1 text-xs font-bold text-slate-600">
          {user?.role === 'DONOR' && (
            <>
              <Link href="/donor/dashboard" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
                Dashboard
              </Link>
              <Link href="/donor/my-food" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
                My Food
              </Link>
              <Link href="/donor/dashboard?tab=donations" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
                Donations
              </Link>
              <Link href="/donor/pickups" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
                Pickups
              </Link>
              <Link href="/donor/impact" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
                Impact
              </Link>
              <Link href="/donor/profile" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
                Profile
              </Link>
            </>
          )}

          {user?.role === 'SHELTER' && (
            <>
              <Link href="/recipient/dashboard" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
                Dashboard
              </Link>
              <Link href="/recipient/browse" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
                Browse Food
              </Link>
              <Link href="/recipient/requests" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
                Requests
              </Link>
              <Link href="/recipient/deliveries" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
                Deliveries
              </Link>
              <Link href="/recipient/history" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
                History
              </Link>
              <Link href="/recipient/impact" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
                Impact
              </Link>
              <Link href="/recipient/profile" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
                Profile
              </Link>
            </>
          )}

          {user?.role === 'DRIVER' && (
            <>
              <Link href="/driver/dashboard" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
                Dashboard
              </Link>
              <Link href="/driver/deliveries" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
                My Deliveries
              </Link>
              <Link href="/driver/route" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
                Route
              </Link>
              <Link href="/driver/notifications" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
                Notifications
              </Link>
              <Link href="/driver/history" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
                History
              </Link>
              <Link href="/driver/profile" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
                Profile
              </Link>
            </>
          )}

          {user?.role === 'ADMIN' && (
            <>
              <Link href="/admin/dashboard" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors">
                Overview
              </Link>
              <span className="text-slate-300">&bull;</span>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Admin Console
              </span>
            </>
          )}
        </div>

        {/* Right Session Links: Login & Register & Notifications */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Link
                href={getDashboardPath(user.role)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-sm flex items-center gap-1.5"
              >
                Dashboard
              </Link>
              <button
                onClick={() => logout()}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-extrabold text-slate-700 hover:text-emerald-600 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
