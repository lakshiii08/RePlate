'use client';

import React, { useState } from 'react';
import { adminService, CriticalRescueAlert } from '@/services/adminService';
import RescueCountdown from '@/components/ui/RescueCountdown';
import {
  AlertTriangle,
  RefreshCw,
  Search,
  Truck,
  Building2,
  Utensils,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';

export default function CriticalRescuesView() {
  const [criticals, setCriticals] = useState<CriticalRescueAlert[]>([
    {
      id: 'RP-1026',
      foodName: 'Grilled Chicken & Quinoa Bowls',
      mealCount: 80,
      remainingMinutes: 18,
      driverEtaMinutes: 28,
      donorName: 'Corporate Tech Campus Cafeteria',
      donorAddress: '100 Silicon Way, Soma',
      reason: 'Driver ETA (28 min) exceeds remaining rescue window (18 min). Rescue at risk of expiration.',
    },
    {
      id: 'RP-1028',
      foodName: 'Artisanal Bakery Trays',
      mealCount: 45,
      remainingMinutes: 24,
      driverEtaMinutes: 31,
      donorName: 'Mission Delicatessen',
      donorAddress: '512 Valencia Street',
      reason: 'Primary corridor gridlock delayed assigned courier.',
    },
  ]);

  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const [recalculatingId, setRecalculatingId] = useState<string | null>(null);

  const handleRecalculate = async (id: string) => {
    setRecalculatingId(id);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setResolvedIds((prev) => [...prev, id]);
    setRecalculatingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold mb-1">
            <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />
            AUTOMATED FEASIBILITY ANOMALY MONITOR
          </div>
          <h1 className="text-2xl font-black text-slate-900">🚨 Critical Rescue Panel</h1>
          <p className="text-xs text-slate-500">
            Automatically surfaces rescues where driver ETA or traffic delays exceed the food decay window
          </p>
        </div>

        <span className="text-xs font-extrabold px-3 py-1 bg-rose-600 text-white rounded-full">
          {criticals.length - resolvedIds.length} At-Risk Rescues Active
        </span>
      </div>

      {/* CRITICAL RESCUE CARDS */}
      <div className="space-y-6">
        {criticals.map((item) => {
          const isResolved = resolvedIds.includes(item.id);
          const isRecalculating = recalculatingId === item.id;

          if (isResolved) {
            return (
              <div key={item.id} className="bg-emerald-50 p-6 rounded-2xl border border-emerald-300 space-y-2 text-xs shadow-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  RESCUE PLAN RESOLVED (#{item.id})
                </div>
                <p className="text-emerald-700 font-semibold">
                  Dynamic matching engine successfully assigned backup courier Elena Rostova (8 min ETA). Feasibility restored to 94%.
                </p>
              </div>
            );
          }

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border-2 border-rose-400 p-6 shadow-lg space-y-5 relative overflow-hidden"
            >
              {/* Top Red Status Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
                    <span className="text-xs font-black uppercase text-rose-700 tracking-wider">
                      🔴 RESCUE AT RISK OF DECAY EXPIRED (#{item.id})
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1">{item.foodName}</h3>
                  <p className="text-xs text-slate-500">Donor: {item.donorName} &bull; {item.mealCount} meals</p>
                </div>

                <div className="shrink-0 bg-rose-100/80 p-3 rounded-xl border border-rose-300 text-center font-mono">
                  <div className="text-xs font-bold text-rose-900">RESCUE WINDOW</div>
                  <div className="text-2xl font-black text-rose-700">{item.remainingMinutes} min remaining</div>
                </div>
              </div>

              {/* Feasibility Anomaly Callout Box */}
              <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-xs text-rose-950 space-y-1">
                <div className="font-extrabold uppercase text-[10px] text-rose-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" /> INFEASIBILITY ANOMALY DETECTED:
                </div>
                <p className="font-semibold leading-relaxed">{item.reason}</p>
                <div className="grid grid-cols-2 gap-4 pt-2 text-[11px] font-mono">
                  <div>Remaining Decay Window: <strong className="text-rose-700">{item.remainingMinutes} mins</strong></div>
                  <div>Assigned Driver ETA: <strong className="text-rose-700">{item.driverEtaMinutes} mins</strong></div>
                </div>
              </div>

              {/* SECTION 4 REQUIRED ACTION BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => handleRecalculate(item.id)}
                  disabled={isRecalculating}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 border border-slate-300"
                >
                  <Search className="w-4 h-4 text-slate-600" />
                  Find Alternative Shelter / Driver
                </button>

                <button
                  onClick={() => handleRecalculate(item.id)}
                  disabled={isRecalculating}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isRecalculating ? 'animate-spin' : ''}`} />
                  {isRecalculating ? 'Recalculating Route...' : 'Recalculate Rescue Plan NOW'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
