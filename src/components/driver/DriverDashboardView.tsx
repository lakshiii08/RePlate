'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Truck,
  CheckCircle2,
  Navigation,
  Clock,
  ShieldCheck,
  MapPin,
  Building2,
  Power,
  Utensils,
  ExternalLink,
  Phone,
  RefreshCw,
  Plus,
  ArrowRight,
  Check,
  Star,
  Gauge,
  KeyRound,
  Package,
} from 'lucide-react';
import { useRescue } from '@/context/RescueContext';
import { useAuth } from '@/context/AuthContext';
import RescueCountdown from '@/components/ui/RescueCountdown';
import { Donation } from '@/types';

export default function DriverDashboardView() {
  const { donations, refreshDonations, updateDonation } = useRescue();
  const { user, updateUserProfile } = useAuth();

  const [isOnline, setIsOnline] = useState(user?.isOnline ?? true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleToggleOnline = async () => {
    const next = !isOnline;
    setIsOnline(next);
    try {
      await updateUserProfile({ isOnline: next });
      triggerToast(next ? 'You are now ONLINE & ready for rescue dispatches' : 'You are now OFFLINE');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshDonations();
    setTimeout(() => {
      setIsRefreshing(false);
      triggerToast('Dispatch board updated');
    }, 400);
  };

  // 1. Current Delivery (Active ongoing rescue)
  const currentDelivery = useMemo(() => {
    return donations.find(
      (d) =>
        d.status === 'DRIVER_ASSIGNED' ||
        d.status === 'PICKUP_IN_PROGRESS' ||
        d.status === 'PICKED_UP' ||
        d.status === 'IN_TRANSIT'
    );
  }, [donations]);

  // 2. Available pickups nearby waiting for driver
  const availablePickups = useMemo(() => {
    return donations.filter(
      (d) =>
        (d.status === 'POSTED' || d.status === 'VERIFIED' || d.status === 'MATCHED') &&
        !d.assignedDriver &&
        d.deliveryMode !== 'SELF_DRIVE'
    );
  }, [donations]);

  // 3. Completed deliveries
  const completedJobs = useMemo(
    () => donations.filter((d) => d.status === 'DELIVERED'),
    [donations]
  );

  const completedCount = completedJobs.length + 18;
  const transportedMeals = completedJobs.reduce((acc, d) => acc + (d.mealCount || 0), 0) + 720;
  const totalWeightKg = Math.round(transportedMeals * 0.45);

  // Accept a new mission
  const handleClaimPickup = (item: Donation) => {
    updateDonation(item.id, {
      status: 'DRIVER_ASSIGNED',
      assignedDriver: {
        id: user?.id || 'drv-curr-1',
        name: user?.name || 'Aarav Patel (You)',
        phone: user?.phone || '+1 (555) 777-8899',
        vehicleType: (user?.vehicleType as any) || 'Refrigerated Van',
        status: 'ON_RESCUE',
        rating: 4.95,
        etaToDonorMinutes: 8,
        deliveriesCompleted: completedCount,
        coords: [37.7749, -122.4194],
      },
    });
    triggerToast(`Mission claimed! Pickup #${item.id} assigned to you.`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Courier Operations Dashboard</h1>
            <span
              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {isOnline ? 'ONLINE & DISPATCHABLE' : 'OFFLINE'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Courier: <span className="font-bold text-slate-800">{user?.name || 'Aarav Patel'}</span> &bull; {user?.vehicleType || 'Refrigerated Van'} &bull; Base: San Francisco Fleet Hub
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
            title="Refresh active missions"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          <button
            onClick={handleToggleOnline}
            className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all shadow-xs ${
              isOnline
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isOnline ? 'GO OFFLINE' : 'GO ONLINE'}</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* DAILY SUMMARY TELEMETRY (Lakshita MVP spec: Daily summary) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Completed Rescues</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{completedCount}</div>
          <div className="text-[11px] text-emerald-700 font-semibold">100% on-time fulfillment</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Meals Transported</span>
            <Utensils className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-indigo-600">{transportedMeals.toLocaleString()}</div>
          <div className="text-[11px] text-indigo-700 font-semibold">{totalWeightKg.toLocaleString()} kg total payload</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Courier Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">4.95 ★</div>
          <div className="text-[11px] text-amber-700 font-semibold">Top Tier Fleet Certified</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Active Shift</span>
            <Gauge className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-blue-600">{isOnline ? 'Online' : 'Standby'}</div>
          <div className="text-[11px] text-blue-700 font-semibold">15 km radius active</div>
        </div>
      </div>

      {/* CURRENT DELIVERY & PICKUP SPOTLIGHT CARD (Lakshita MVP spec: Current delivery, pickup) */}
      {currentDelivery ? (
        <div className="bg-gradient-to-br from-white to-emerald-50/50 rounded-3xl border-2 border-emerald-500 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-black uppercase text-emerald-800 tracking-wider">
                  ACTIVE ONGOING RESCUE MISSION (#{currentDelivery.id})
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 uppercase">
                  {currentDelivery.status.replace(/_/g, ' ')}
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">{currentDelivery.foodName}</h2>
              <p className="text-xs text-slate-600 font-semibold">
                {currentDelivery.quantity} &bull; {currentDelivery.category} &bull; Storage: {currentDelivery.storageMethod.replace('_', ' ')}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <RescueCountdown deadline={currentDelivery.pickupDeadline} />
              <Link
                href="/driver/route"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs transition-all shadow-xs flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                <span>Open Turn-by-Turn Route</span>
              </Link>
            </div>
          </div>

          {/* Sequential Waypoint Cards: Pickup -> Transit -> Dropoff */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* 1. PICKUP INFO */}
            <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  1. Pickup Location (Donor Kitchen)
                </div>
                <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                  <KeyRound className="w-3 h-3" />
                  OTP: {currentDelivery.pickupOtp || '4829'}
                </div>
              </div>

              <div>
                <div className="font-black text-slate-900 text-sm">{currentDelivery.donorName}</div>
                <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{currentDelivery.donorAddress}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-[11px] text-slate-500">Dock verification on arrival</span>
                <a
                  href={`tel:+15552345678`}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                >
                  <Phone className="w-3 h-3 text-emerald-700" /> Call Kitchen
                </a>
              </div>
            </div>

            {/* 2. DROPOFF INFO */}
            <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  2. Dropoff Destination (Shelter Intake)
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  Thermal Intake Ready
                </span>
              </div>

              <div>
                <div className="font-black text-slate-900 text-sm">
                  {currentDelivery.matchedShelter?.name || 'Hope Community Shelter'}
                </div>
                <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{currentDelivery.matchedShelter?.address || '452 Elm Street, Tenderloin, SF'}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-[11px] text-slate-500">Loading dock buzzer #2</span>
                <a
                  href={`tel:+14158904432`}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                >
                  <Phone className="w-3 h-3 text-blue-700" /> Call Shelter
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3 shadow-2xs">
          <Truck className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-lg font-black text-slate-900">No Active Mission Assigned</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You are online and ready. Review available surplus food below and claim a nearby mission to begin delivery.
          </p>
        </div>
      )}

      {/* AVAILABLE PICKUP RUNS NEARBY */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" />
              Available Pickup Runs in Your Zone
            </h2>
            <p className="text-xs text-slate-500">
              Surplus food waiting for courier transport. Claim a run to initiate immediate dispatch.
            </p>
          </div>

          <Link
            href="/driver/deliveries"
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>View All Runs ({availablePickups.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {availablePickups.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4 flex flex-col justify-between hover:shadow-xs transition-shadow"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400">#{item.id}</span>
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                    READY FOR PICKUP
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-slate-900 text-sm leading-snug">{item.foodName}</h3>
                  <div className="text-xs text-slate-500 font-semibold">{item.quantity} &bull; {item.category}</div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Donor Facility</div>
                  <div className="font-bold text-slate-800 truncate">{item.donorName}</div>
                  <div className="text-[11px] text-slate-500 truncate">{item.donorAddress}</div>
                </div>
              </div>

              <button
                onClick={() => handleClaimPickup(item)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Accept & Claim Run</span>
              </button>
            </div>
          ))}

          {availablePickups.length === 0 && (
            <div className="col-span-3 bg-slate-50 rounded-3xl border border-dashed border-slate-200 p-8 text-center text-slate-400 text-xs">
              No unclaimed runs available in your immediate service zone right now.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
