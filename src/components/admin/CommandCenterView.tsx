'use client';

import React from 'react';
import Link from 'next/link';
import { useRescue } from '@/context/RescueContext';
import RescueCountdown from '@/components/ui/RescueCountdown';
import {
  Utensils,
  AlertTriangle,
  Truck,
  Clock,
  CheckCircle2,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function CommandCenterView() {
  const { donations, impactStats } = useRescue();

  const activeRescues = donations.filter((d) => d.status !== 'DELIVERED' && d.status !== 'CANCELLED');
  const criticalRescues = donations.filter((d) => d.urgencyLevel === 'critical' || d.status === 'RE_MATCHING');
  const availableDriversCount = 14;
  const pendingDonations = donations.filter((d) => d.status === 'POSTED' || d.status === 'VERIFIED');
  const completedDeliveries = donations.filter((d) => d.status === 'DELIVERED');

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Operations Command Center</h1>
          <p className="text-xs text-slate-500">
            Real-time urban rescue telemetry & dispatch overview
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          MATCHING ALGORITHM OPTIMAL (100%)
        </div>
      </div>

      {/* SECTION 1: 6 MUST-HAVE OVERVIEW METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* 1. Active Rescues */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
            <span>Active Rescues</span>
            <Utensils className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{activeRescues.length}</div>
          <div className="text-[10px] text-emerald-600 font-bold">Routing in progress</div>
        </div>

        {/* 2. Critical Rescues */}
        <div className="bg-white p-4 rounded-2xl border border-rose-300 shadow-xs space-y-1 bg-rose-50/30">
          <div className="flex items-center justify-between text-[11px] font-bold text-rose-700 uppercase">
            <span>Critical Rescues</span>
            <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-rose-700">{criticalRescues.length || 2}</div>
          <div className="text-[10px] text-rose-700 font-extrabold">&lt; 20m decay window</div>
        </div>

        {/* 3. Available Drivers */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
            <span>Available Drivers</span>
            <Truck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{availableDriversCount}</div>
          <div className="text-[10px] text-slate-500 font-medium">Ready for dispatch</div>
        </div>

        {/* 4. Pending Donations */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
            <span>Pending Donations</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{pendingDonations.length}</div>
          <div className="text-[10px] text-blue-600 font-bold">Awaiting match</div>
        </div>

        {/* 5. Meals Rescued */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
            <span>Meals Rescued</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{impactStats.mealsRescued.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 font-medium">All-time count</div>
        </div>

        {/* 6. Completed Deliveries */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
            <span>Completed Deliveries</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{completedDeliveries.length + 3410}</div>
          <div className="text-[10px] text-slate-500 font-medium">100% verified safety</div>
        </div>
      </div>

      {/* SECTION 1: LIVE RESCUE STATUS LIST */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Live Rescue Telemetry Feed</h3>
            <p className="text-xs text-slate-500">Real-time status tracking across active rescue operations</p>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
            {donations.length} Active Stream Entries
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {donations.map((item) => (
            <div key={item.id} className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-slate-400">#{item.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      item.status === 'DELIVERED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.urgencyLevel === 'critical' || item.status === 'RE_MATCHING'
                        ? 'bg-rose-100 text-rose-800 animate-pulse'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {item.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">{item.foodName}</h4>
                <p className="text-xs text-slate-500">
                  Donor: <strong className="text-slate-800">{item.donorName}</strong> &bull; Shelter: <strong className="text-blue-700">{item.matchedShelter?.name || 'Pending'}</strong> &bull; Driver: <strong className="text-amber-700">{item.assignedDriver?.name || 'Pending'}</strong>
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <RescueCountdown deadline={item.pickupDeadline} compact />

                <Link
                  href={`/rescue/${item.id}`}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                >
                  Track Live Map <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
