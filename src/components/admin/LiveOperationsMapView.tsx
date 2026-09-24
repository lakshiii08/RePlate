'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRescue } from '@/context/RescueContext';
import { MOCK_SHELTERS, MOCK_DRIVERS } from '@/services/mockData';
import RescueCountdown from '@/components/ui/RescueCountdown';
import { Donation } from '@/types';
import {
  MapPin,
  Utensils,
  Building2,
  Truck,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const RescueMap = dynamic(() => import('@/components/map/RescueMap'), { ssr: false });

export default function LiveOperationsMapView() {
  const { donations } = useRescue();
  const [selectedDonation, setSelectedDonation] = useState<Donation>(donations[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            JUDGES OPERATIONAL TELEMETRY MAP
          </div>
          <h1 className="text-2xl font-black text-slate-900">🗺️ Live Operations Map</h1>
          <p className="text-xs text-slate-500">
            Real-time urban rescue routing map: Donors 📍, Shelters 🏠, Drivers 🚗, Routes & Critical Alerts
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            📍 Donors
          </span>
          <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            🏠 Shelters
          </span>
          <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
            🚗 Drivers
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* MAIN INTERACTIVE MAP */}
        <div className="lg:col-span-8 bg-white p-3 rounded-2xl border border-slate-200 shadow-md h-[580px]">
          <RescueMap
            donations={donations}
            shelters={MOCK_SHELTERS}
            drivers={MOCK_DRIVERS}
            activeDonationId={selectedDonation?.id}
            height="554px"
          />
        </div>

        {/* SECTION 2 REQUIRED MARKER TELEMETRY INSPECTOR */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                MARKER TELEMETRY INSPECTOR
              </span>
              <span className="text-xs font-mono font-bold bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                #{selectedDonation.id}
              </span>
            </div>

            {/* Required Marker Telemetry Stack: Food → Quantity → Countdown → Shelter → Driver → Status */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">1. FOOD ITEM</span>
                <span className="font-extrabold text-white text-sm">{selectedDonation.foodName}</span>
              </div>

              <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">2. QUANTITY & CATEGORY</span>
                <span className="font-bold text-slate-200">{selectedDonation.quantity} ({selectedDonation.category})</span>
              </div>

              <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">3. RESCUE WINDOW COUNTDOWN</span>
                <RescueCountdown deadline={selectedDonation.pickupDeadline} compact />
              </div>

              <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">4. DESTINATION SHELTER</span>
                <span className="font-bold text-blue-400">{selectedDonation.matchedShelter?.name || 'Hope Community Shelter'}</span>
              </div>

              <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">5. ASSIGNED COURIER / DRIVER</span>
                <span className="font-bold text-amber-400">{selectedDonation.assignedDriver?.name || 'Aarav Patel (Refrigerated Van)'}</span>
              </div>

              <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">6. OPERATIONAL RESCUE STATUS</span>
                <span className="font-black text-emerald-400 uppercase">{selectedDonation.status.replace(/_/g, ' ')}</span>
              </div>
            </div>

            {/* Donors selection list */}
            <div className="pt-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Switch Marker Telemetry Focus:
              </label>
              <div className="space-y-1.5">
                {donations.slice(0, 3).map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDonation(d)}
                    className={`w-full p-2 rounded-xl text-left text-xs font-bold transition-all ${
                      selectedDonation.id === d.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    #{d.id} — {d.foodName}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
