'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRescue } from '@/context/RescueContext';
import RescueCountdown from '@/components/ui/RescueCountdown';
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
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export default function DriverDashboardPage() {
  const { donations } = useRescue();
  const [isOnline, setIsOnline] = useState(true);

  const availableJobs = donations.filter((d) => d.status === 'POSTED' || d.status === 'VERIFIED');
  const activeJob = donations.find(
    (d) => d.status === 'DRIVER_ASSIGNED' || d.status === 'PICKUP_IN_PROGRESS' || d.status === 'IN_TRANSIT'
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Driver Status Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Volunteer Driver Portal</h1>
            <span className="text-xs bg-slate-100 font-mono text-slate-600 px-2 py-0.5 rounded font-bold">
              Driver: Aarav Patel
            </span>
          </div>
          <p className="text-xs text-slate-500">Refrigerated Van &bull; 142 Deliveries Completed</p>
        </div>

        {/* Online / Offline Toggle Button */}
        <button
          onClick={() => setIsOnline(!isOnline)}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm ${
            isOnline
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          <Power className="w-4 h-4" />
          STATUS: {isOnline ? 'ONLINE (READY FOR RESCUE)' : 'OFFLINE'}
        </button>
      </div>

      {/* Driver Telemetry Bar */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
          <div className="text-2xl font-black text-slate-900">142</div>
          <div className="text-[11px] font-semibold text-slate-500">Deliveries Completed</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
          <div className="text-2xl font-black text-emerald-600">4,250</div>
          <div className="text-[11px] font-semibold text-slate-500">Meals Transported</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
          <div className="text-2xl font-black text-amber-600">4.9 ★</div>
          <div className="text-[11px] font-semibold text-slate-500">Safety Rating</div>
        </div>
      </div>

      {/* ACTIVE RESCUE CARD */}
      {activeJob ? (
        <div className="bg-white rounded-2xl border-2 border-emerald-500 shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-black uppercase text-emerald-700 tracking-wider">
                YOUR ACTIVE RESCUE TASK (#{activeJob.id})
              </span>
            </div>
            <RescueCountdown deadline={activeJob.pickupDeadline} compact />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-slate-900">{activeJob.foodName}</h3>
            <p className="text-xs text-slate-600">{activeJob.quantity} &bull; {activeJob.category}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">1. PICKUP FROM:</span>
              <strong className="text-slate-800">{activeJob.donorName}</strong>
              <div className="text-slate-500">{activeJob.donorAddress}</div>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">2. DELIVER TO:</span>
              <strong className="text-blue-700">{activeJob.matchedShelter?.name || 'Hope Shelter'}</strong>
              <div className="text-slate-500">{activeJob.matchedShelter?.address}</div>
            </div>
          </div>

          <Link
            href={`/driver/rescue/${activeJob.id}`}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Navigation className="w-4 h-4" /> Open Mobile Rescue Navigation Interface <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : null}

      {/* AVAILABLE JOBS FEED */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-emerald-600" /> Available Rescue Jobs Nearby
          </h2>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            {availableJobs.length} Jobs Available
          </span>
        </div>

        {availableJobs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No unassigned rescue jobs available nearby right now.
          </div>
        ) : (
          <div className="space-y-4">
            {availableJobs.map((job) => (
              <div
                key={job.id}
                className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 transition-all space-y-3 bg-slate-50/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">#{job.id}</span>
                    <h3 className="font-extrabold text-slate-900 text-base">{job.foodName}</h3>
                    <p className="text-xs text-slate-600">{job.quantity} &bull; {job.category}</p>
                  </div>
                  <RescueCountdown deadline={job.pickupDeadline} compact />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-white p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[10px] block">DISTANCE TO PICKUP</span>
                    <span className="font-bold text-slate-800">1.8 km away (8 mins)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">DESTINATION</span>
                    <span className="font-bold text-blue-700">Hope Shelter</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-1">
                  <Link
                    href={`/rescue/matching/${job.id}`}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
                  >
                    View Details & Route
                  </Link>
                  <Link
                    href={`/driver/rescue/${job.id}`}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" /> Accept Rescue Task
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
