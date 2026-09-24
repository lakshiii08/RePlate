'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRescue } from '@/context/RescueContext';
import RescueCountdown from '@/components/ui/RescueCountdown';
import {
  Building2,
  Utensils,
  Truck,
  CheckCircle2,
  Plus,
  Clock,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export default function ShelterDashboardPage() {
  const { donations } = useRescue();

  const [capacityMeals, setCapacityMeals] = useState(120);
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([
    'Cooked Meal',
    'Fresh Produce',
    'Dairy & Refrigerated',
  ]);

  const incomingRescues = donations.filter(
    (d) => d.status === 'MATCHED' || d.status === 'DRIVER_ASSIGNED' || d.status === 'IN_TRANSIT' || d.status === 'PICKUP_IN_PROGRESS'
  );

  const toggleNeed = (need: string) => {
    if (selectedNeeds.includes(need)) {
      setSelectedNeeds(selectedNeeds.filter((n) => n !== need));
    } else {
      setSelectedNeeds([...selectedNeeds, need]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Shelter Operations Workspace</h1>
          <p className="text-xs text-slate-500">
            Hope Community Shelter &bull; Real-time intake & dietary demand configuration
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Current Intake Capacity:</span>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-sm rounded-xl border border-emerald-300">
            {capacityMeals} Meals Available
          </span>
        </div>
      </div>

      {/* Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>INCOMING RESCUES</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{incomingRescues.length}</div>
          <div className="text-[11px] text-blue-600 font-medium">In transit or scheduled</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>MEALS RECEIVED</span>
            <Utensils className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">14,250</div>
          <div className="text-[11px] text-slate-500 font-medium">All-time intake</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>VERIFIED SAFETY</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">100%</div>
          <div className="text-[11px] text-slate-500 font-medium">Thermal audit passed</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>ACTIVE NEED CATEGORIES</span>
            <Building2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{selectedNeeds.length}</div>
          <div className="text-[11px] text-slate-500 font-medium">Auto-matched by engine</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* INCOMING RESCUES FEED */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" /> Incoming Food Rescues
            </h2>
            <span className="text-xs text-slate-400">{incomingRescues.length} Rescues Routing</span>
          </div>

          <div className="space-y-4">
            {incomingRescues.map((rescue) => (
              <div
                key={rescue.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">#{rescue.id}</span>
                    <h3 className="font-extrabold text-slate-900 text-base">{rescue.foodName}</h3>
                    <p className="text-xs text-slate-500">{rescue.quantity} &bull; {rescue.category}</p>
                  </div>
                  <RescueCountdown deadline={rescue.pickupDeadline} compact />
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[10px] block">DONOR</span>
                    <strong className="text-slate-800">{rescue.donorName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">DRIVER</span>
                    <strong className="text-amber-700">{rescue.assignedDriver?.name || 'Assigned'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">STATUS</span>
                    <strong className="text-blue-700 uppercase">{rescue.status.replace(/_/g, ' ')}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Safety Audit Verified ({rescue.storageMethod})</span>
                  </div>

                  <Link
                    href={`/rescue/${rescue.id}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1"
                  >
                    Track Live GPS <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DIETARY NEEDS & CAPACITY DECLARATION MANAGER */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" /> Dynamic Need Declarations
            </h2>

            <p className="text-xs text-slate-500">
              Select current meal gaps to prioritize matching engine routing to Hope Shelter.
            </p>

            <div className="space-y-2">
              {[
                'Cooked Meal',
                'Bakery & Bread',
                'Fresh Produce',
                'Packaged Goods',
                'Dairy & Refrigerated',
                'Catered Buffet',
              ].map((need) => {
                const active = selectedNeeds.includes(need);
                return (
                  <button
                    key={need}
                    onClick={() => toggleNeed(need)}
                    className={`w-full p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                      active
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <span>{need}</span>
                    {active && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="text-xs font-bold text-slate-700">Update Intake Capacity Limit</label>
              <input
                type="number"
                value={capacityMeals}
                onChange={(e) => setCapacityMeals(Number(e.target.value))}
                className="w-full p-2.5 border rounded-xl text-xs font-bold text-emerald-800"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
