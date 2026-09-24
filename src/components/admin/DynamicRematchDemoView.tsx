'use client';

import React, { useState } from 'react';
import { useRescue } from '@/context/RescueContext';
import { MOCK_DRIVERS, MOCK_SHELTERS } from '@/services/mockData';
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Truck,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Building2,
  Utensils,
} from 'lucide-react';

export default function DynamicRematchDemoView() {
  const { donations } = useRescue();
  const sample = donations[0];

  // Demo sequence steps: 0 = INITIAL, 1 = DRIVER_ASSIGNED, 2 = DRIVER_CANCELLED, 3 = RESCUE_AT_RISK, 4 = NEW_DRIVER_FOUND, 5 = CONFIRMED
  const [demoStep, setDemoStep] = useState(0);

  const resetDemo = () => setDemoStep(0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-1">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            HACKATHON DEMO MOMENT: DYNAMIC RE-MATCHING
          </div>
          <h1 className="text-2xl font-black text-slate-900">🔄 Dynamic Re-Matching Engine</h1>
          <p className="text-xs text-slate-500">
            Interactive step-by-step demonstration of sub-minute dynamic rerouting when driver cancels or encounters traffic
          </p>
        </div>

        <button
          onClick={resetDemo}
          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1 border border-slate-300"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset Demo Sequence
        </button>
      </div>

      {/* DEMO STEP SEQUENCE FLOW DISPLAY */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
        <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center justify-between">
          <span>SECTION 5 WOW FEATURE STEP SEQUENCE</span>
          <span>Step {demoStep} of 5</span>
        </div>

        <div className="grid grid-cols-5 gap-2 text-center text-[11px] font-mono font-bold">
          <div className={`p-2.5 rounded-xl border ${demoStep >= 1 ? 'bg-emerald-950 border-emerald-500 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
            1. Driver Assigned
          </div>
          <div className={`p-2.5 rounded-xl border ${demoStep >= 2 ? 'bg-rose-950 border-rose-500 text-rose-300' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
            2. Driver Cancels
          </div>
          <div className={`p-2.5 rounded-xl border ${demoStep >= 3 ? 'bg-amber-950 border-amber-500 text-amber-300 animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
            3. ⚠ RESCUE AT RISK
          </div>
          <div className={`p-2.5 rounded-xl border ${demoStep >= 4 ? 'bg-blue-950 border-blue-500 text-blue-300' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
            4. Check ETA & Find Driver
          </div>
          <div className={`p-2.5 rounded-xl border ${demoStep >= 5 ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
            5. Admin Confirms
          </div>
        </div>

        {/* DEMO STAGE SIMULATOR CANVAS */}
        <div className="bg-slate-800/90 p-6 rounded-xl border border-slate-700 space-y-4">
          {demoStep === 0 && (
            <div className="text-center py-6 space-y-3">
              <Truck className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-extrabold text-white">Dynamic Re-Routing Simulation</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Test how RePlate recovers automatically within seconds if an assigned driver cancels or experiences a breakdown.
              </p>
              <button
                onClick={() => setDemoStep(1)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg flex items-center gap-2 mx-auto"
              >
                Start Demo Simulation <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {demoStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-bold uppercase">STATE: Driver Assigned</span>
                <span className="text-slate-400">Courier: Aarav Patel (Refrigerated Van)</span>
              </div>
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 space-y-1 text-xs font-mono">
                <div>Donation: {sample?.foodName} ({sample?.quantity})</div>
                <div>Status: DRIVER_ASSIGNED &bull; ETA to Donor: 8 mins</div>
              </div>
              <button
                onClick={() => setDemoStep(2)}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" /> Simulate Sudden Driver Cancellation Event
              </button>
            </div>
          )}

          {demoStep === 2 && (
            <div className="space-y-4 animate-bounce-slow">
              <div className="p-4 bg-rose-950 rounded-xl border border-rose-600 text-rose-200 text-xs space-y-1 font-mono">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" /> EVENT TRIGGERED: Courier Aarav Patel cancelled dispatch.
                </div>
                <div>Reason: Vehicle tire puncture on Mission Street.</div>
              </div>
              <button
                onClick={() => setDemoStep(3)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                Trigger System Alert: ⚠ RESCUE AT RISK <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {demoStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-950 rounded-xl border border-amber-600 text-amber-200 text-xs space-y-2 font-mono">
                <div className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  ⚠ RESCUE AT RISK — INITIATING AUTOMATED RE-MATCH
                </div>
                <p>Searching eligible volunteer couriers within 3 km radius...</p>
              </div>
              <button
                onClick={() => setDemoStep(4)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                Find Feasible Backup Driver <Zap className="w-4 h-4" />
              </button>
            </div>
          )}

          {demoStep === 4 && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-950 rounded-xl border border-blue-600 text-blue-200 text-xs space-y-2 font-mono">
                <div className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" /> NEW FEASIBLE DRIVER IDENTIFIED
                </div>
                <div>Candidate Courier: <strong>Elena Rostova (EV Cargo Car)</strong></div>
                <div>ETA to Donor: <strong>9 minutes</strong> (Leaves 33 min safety margin before decay)</div>
                <div>Feasibility Score: <strong>94%</strong></div>
              </div>
              <button
                onClick={() => setDemoStep(5)}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                Admin Confirm New Rescue Plan <ShieldCheck className="w-4 h-4" />
              </button>
            </div>
          )}

          {demoStep === 5 && (
            <div className="p-6 bg-emerald-950 rounded-xl border border-emerald-500 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="font-extrabold text-white text-base">DYNAMIC RE-MATCH COMPLETED SUCCESSFULLY!</h3>
              <p className="text-xs text-emerald-200">
                Rescue #{sample?.id} reassigned to Elena Rostova. Zero food lost, 100% feasibility maintained.
              </p>
              <button
                onClick={resetDemo}
                className="px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500"
              >
                Run Demo Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
