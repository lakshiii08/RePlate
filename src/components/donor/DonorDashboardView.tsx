'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Utensils,
  Plus,
  Clock,
  Truck,
  Building2,
  CheckCircle2,
  TrendingUp,
  ExternalLink,
  KeyRound,
  Package,
  Sparkles,
  ChevronRight,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { useRescue } from '@/context/RescueContext';
import { useAuth } from '@/context/AuthContext';
import RescueCountdown from '@/components/ui/RescueCountdown';
import NotificationsFeed from '@/components/notifications/NotificationsFeed';

export default function DonorDashboardView() {
  const { donations, refreshDonations } = useRescue();
  const { user } = useAuth();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);
  const handleCopyOtp = (otp: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(otp);
    setTimeout(() => setCopiedOtp(null), 2000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshDonations();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  // 5 Core Metrics (Lakshita MVP spec)
  const foodListedCount = donations.length;
  const activeDonations = donations.filter((d) => d.status !== 'DELIVERED' && d.status !== 'CANCELLED');
  const pendingPickups = donations.filter(
    (d) =>
      d.status === 'POSTED' ||
      d.status === 'VERIFIED' ||
      d.status === 'MATCHED' ||
      d.status === 'DRIVER_ASSIGNED' ||
      d.status === 'PICKUP_IN_PROGRESS'
  );
  const completedDonations = donations.filter((d) => d.status === 'DELIVERED');
  const totalMealsRescued = donations.reduce((acc, d) => acc + (d.mealCount || 0), 0);
  const totalWeightKg = Math.round(totalMealsRescued * 0.45);
  const totalCo2SavedKg = Math.round(totalWeightKg * 2.5);

  // Spotlight upcoming pickup
  const upcomingPickup = useMemo(() => {
    return (
      donations.find(
        (d) =>
          d.status === 'DRIVER_ASSIGNED' ||
          d.status === 'PICKUP_IN_PROGRESS' ||
          d.status === 'MATCHED'
      ) || activeDonations[0]
    );
  }, [donations, activeDonations]);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Donor Operations Dashboard</h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              REAL-TIME
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {user?.organization || 'Grand Hyatt Hotel Catering'} &bull; Managed by{' '}
            {user?.ownerName || user?.name || 'Sarah Jenkins'}
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          {/* Quick Action: + Add Food (Lakshita MVP spec) */}
          <Link
            href="/donor/donations/new"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            + Add Food
          </Link>
        </div>
      </div>

      {/* 5 METRICS BAR as specified by Lakshita */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* 1. Food Listed */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Food Listed</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{foodListedCount}</div>
          <div className="text-[11px] text-slate-500 font-medium">Total registered items</div>
        </div>

        {/* 2. Active Donations */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Active Donations</span>
            <Utensils className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600">{activeDonations.length}</div>
          <div className="text-[11px] text-blue-600 font-medium">In active rescue queue</div>
        </div>

        {/* 3. Pending Pickups */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Pending Pickups</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">{pendingPickups.length}</div>
          <div className="text-[11px] text-amber-600 font-medium">Awaiting driver arrival</div>
        </div>

        {/* 4. Completed Donations */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{completedDonations.length}</div>
          <div className="text-[11px] text-emerald-600 font-medium">Successfully delivered</div>
        </div>

        {/* 5. Food Distributed */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Food Distributed</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-black text-slate-900 tracking-tight">
            {totalWeightKg} kg
          </div>
          <div className="text-[11px] text-indigo-600 font-medium">
            {totalMealsRescued.toLocaleString()} meals
          </div>
        </div>
      </div>

      {/* UPCOMING PICKUP SPOTLIGHT CARD (Lakshita MVP Requirement) */}
      {upcomingPickup ? (
        <div className="bg-gradient-to-br from-white to-emerald-50/40 rounded-3xl border border-emerald-300 shadow-2xs p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[11px] font-extrabold uppercase text-emerald-800 tracking-wider">
                  Upcoming Pickup &bull; #{upcomingPickup.id}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                {upcomingPickup.foodName}
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {upcomingPickup.quantity}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Pickup Location: <span className="font-semibold text-slate-700">{upcomingPickup.donorAddress}</span>
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <RescueCountdown deadline={upcomingPickup.pickupDeadline} />
              <Link
                href={`/rescue/${upcomingPickup.id}`}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
              >
                Track Live Map <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {/* Driver Name & Contact */}
            <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-2xs space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                Assigned Driver
              </div>
              <div className="font-extrabold text-slate-900 text-sm">
                {upcomingPickup.deliveryMode === 'SELF_DRIVE'
                  ? 'Self-Drive (You)'
                  : upcomingPickup.assignedDriver?.name || 'Assigning Courier...'}
              </div>
              {upcomingPickup.assignedDriver && (
                <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-0.5">
                  <span>{upcomingPickup.assignedDriver.vehicleType}</span>
                  <span>&bull;</span>
                  <a
                    href={`tel:${upcomingPickup.assignedDriver.phone}`}
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    {upcomingPickup.assignedDriver.phone}
                  </a>
                </div>
              )}
            </div>

            {/* Destination Recipient */}
            <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-2xs space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                Destination Recipient
              </div>
              <div className="font-extrabold text-slate-900 text-sm">
                {upcomingPickup.matchedShelter?.name || 'Matching Verified Shelter...'}
              </div>
              <div className="text-[11px] text-slate-500">
                {upcomingPickup.matchedShelter?.address || 'San Francisco Region'}
              </div>
            </div>

            {/* Handover OTP Card */}
            <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 shadow-2xs space-y-1">
              <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                Pickup Handover OTP
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-xl text-emerald-900 tracking-widest">
                  {upcomingPickup.pickupOtp || '4829'}
                </span>
                <button
                  onClick={() => handleCopyOtp(upcomingPickup.pickupOtp || '4829')}
                  className="p-1 rounded-lg hover:bg-emerald-200/50 text-emerald-800 transition-colors"
                  title="Copy OTP"
                >
                  {copiedOtp === (upcomingPickup.pickupOtp || '4829') ? (
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <div className="text-[10px] text-emerald-700 font-medium">
                Share with courier upon doorstep arrival
              </div>
            </div>

            {/* Pickup Status */}
            <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-2xs space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Pickup Status
              </div>
              <div className="font-black text-emerald-700 text-sm">
                {upcomingPickup.status.replace(/_/g, ' ')}
              </div>
              <div className="text-[11px] text-slate-500">
                {upcomingPickup.urgencyLevel === 'critical' ? '⚡ High Priority' : 'Normal Dispatch'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-3xl border border-dashed border-slate-300 p-8 text-center space-y-3">
          <Utensils className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-extrabold text-slate-800">No active pickups scheduled</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Have surplus food today? List it in under 60 seconds to notify verified local shelters and couriers.
          </p>
          <Link
            href="/donor/donations/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-extrabold text-xs rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Food Now
          </Link>
        </div>
      )}

      {/* SIMPLE IMPACT CARD (Lakshita MVP Requirement) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-2xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Verified Social Impact
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              “You helped distribute {totalMealsRescued.toLocaleString()} meals”
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm max-w-xl">
              Through verified donations, your organization has rescued {totalWeightKg} kg of edible food,
              preventing ~{totalCo2SavedKg} kg of greenhouse gas emissions.
            </p>
          </div>

          <Link
            href="/donor/impact"
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-xs shrink-0 flex items-center gap-2"
          >
            <span>View Full Impact Report</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* RECENT NOTIFICATIONS & RECENT ACTIVITY (Lakshita MVP Requirement) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">System & Rescue Alerts</h3>
          <NotificationsFeed limit={3} />
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 text-sm">Recent Activity</h3>
              <p className="text-[11px] text-slate-400">Latest listings, pickups & deliveries</p>
            </div>
            <Link
              href="/donor/my-food"
              className="text-xs font-bold text-emerald-600 hover:underline"
            >
              View All Listings &rarr;
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {donations.slice(0, 5).map((item) => (
              <div key={item.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold shrink-0">
                    {item.photos && item.photos[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.photos[0]} alt={item.foodName} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <Utensils className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      {item.foodName}
                      <span className="text-[10px] text-slate-400">({item.quantity})</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {item.matchedShelter?.name ? `Matched with ${item.matchedShelter.name}` : 'Searching nearby shelter'}
                      {item.assignedDriver ? ` &bull; Driver: ${item.assignedDriver.name}` : ''}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      item.status === 'DELIVERED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'POSTED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {item.status.replace(/_/g, ' ')}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    <Link href={`/rescue/${item.id}`} className="text-emerald-700 font-bold hover:underline">
                      View details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
