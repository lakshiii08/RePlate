'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRescue } from '@/context/RescueContext';
import {
  MOCK_CITY_STATE_METRICS,
  MOCK_COMPLAINT_TICKETS,
  MOCK_CONNECTED_PARTNERS,
  MOCK_CONNECTED_NGOS,
} from '@/services/adminData';
import RescueCountdown from '@/components/ui/RescueCountdown';
import {
  Store,
  HeartHandshake,
  Utensils,
  Scale,
  AlertOctagon,
  TrendingUp,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Truck,
  Building2,
  Clock,
  BarChart3,
} from 'lucide-react';
import { AdminTab } from './AdminSidebar';

interface CommandCenterViewProps {
  onNavigateTab?: (tab: AdminTab) => void;
}

export default function CommandCenterView({ onNavigateTab }: CommandCenterViewProps) {
  const { donations, impactStats } = useRescue();
  const [selectedState, setSelectedState] = useState<string>('ALL');

  const activeRescues = donations.filter((d) => d.status !== 'DELIVERED' && d.status !== 'CANCELLED');
  const criticalRescues = donations.filter((d) => d.urgencyLevel === 'critical' || d.status === 'RE_MATCHING');

  // Aggregated real totals
  const totalRestaurants = 142;
  const totalGroceries = 68;
  const totalCommercialDonors = totalRestaurants + totalGroceries + 54; // 264
  const totalConnectedNGOs = 86;
  const currentMonthFoodSavedKg = 31200;
  const openComplaintsCount = MOCK_COMPLAINT_TICKETS.filter((t) => t.status !== 'RESOLVED').length;

  const states = Array.from(new Set(MOCK_CITY_STATE_METRICS.map((m) => m.state)));
  const filteredMetrics = MOCK_CITY_STATE_METRICS.filter(
    (m) => selectedState === 'ALL' || m.state === selectedState
  );

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            REGIONAL FOOD RESCUE COMMAND CONSOLE
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            National Operations Command Center
          </h1>
          <p className="text-xs text-slate-500">
            Real-time urban logistics dispatch, donor networks, NGO intake capacity, and incident oversight
          </p>
        </div>

        {/* State Filter */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs shadow-xs">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-600">Scope:</span>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All States (Pan-Regional)</option>
            {states.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CORE STATS BAR (REQUIRED BY USER) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* 1. Restaurants & Groceries */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('connected_partners')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-400 transition-colors cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
            <span>Restaurants & Groceries</span>
            <Store className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalCommercialDonors}</div>
          <div className="text-[10px] text-emerald-700 font-semibold">
            {totalRestaurants} rest. &bull; {totalGroceries} grocers
          </div>
        </div>

        {/* 2. Connected NGOs */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('connected_ngos')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-400 transition-colors cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
            <span>Connected NGOs</span>
            <HeartHandshake className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalConnectedNGOs}</div>
          <div className="text-[10px] text-purple-700 font-semibold">Shelters & food banks</div>
        </div>

        {/* 3. Monthly Food Saved */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('food_saved_analytics')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 transition-colors cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
            <span>Food Saved (Sep)</span>
            <Scale className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{(currentMonthFoodSavedKg / 1000).toFixed(1)}k kg</div>
          <div className="text-[10px] text-blue-700 font-semibold">+9.8% vs last month</div>
        </div>

        {/* 4. Active Rescues */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
            <span>Active Rescues</span>
            <Truck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{activeRescues.length}</div>
          <div className="text-[10px] text-emerald-700 font-semibold">In transit / matching</div>
        </div>

        {/* 5. Critical Rescues */}
        <div className="bg-white p-4 rounded-2xl border border-rose-300 bg-rose-50/40 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-rose-700 uppercase">
            <span>Critical Rescues</span>
            <Clock className="w-4 h-4 text-rose-600 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-rose-700">{criticalRescues.length}</div>
          <div className="text-[10px] text-rose-800 font-bold">&lt; 20m window</div>
        </div>

        {/* 6. Open Complaints */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('complaints_desk')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-400 transition-colors cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
            <span>Grievances / Tickets</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600">{openComplaintsCount}</div>
          <div className="text-[10px] text-slate-500 font-medium">In resolution workflow</div>
        </div>
      </div>

      {/* QUICK ACCESS OPERATIONAL MODULES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          onClick={() => onNavigateTab && onNavigateTab('food_saved_analytics')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center justify-between">
            <span>Monthly Food Saved Graph</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Interactive multi-month bar chart breakdown of kilograms saved, meal counts, and landfill emission offsets by city.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab && onNavigateTab('city_state_matrix')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors flex items-center justify-between">
            <span>State & City-Wise Matrix</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Metropolitan cross-comparison of connected partners, active NGOs, courier coverage, and regional success rates.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab && onNavigateTab('complaints_desk')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 group-hover:text-rose-700 transition-colors flex items-center justify-between">
            <span>Complaints & Grievance Desk</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Review logged reports on temperature deviations, packaging unclasps, courier delay incidents, and assign resolutions.
          </p>
        </div>
      </div>

      {/* ACTIVE RESCUES OPERATIONAL QUEUE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Live Dispatched Rescue Queue</h2>
            <p className="text-xs text-slate-500">Active perishable shipments monitored by GPS and thermal holding</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-200">
            {activeRescues.length} Active Movements
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {activeRescues.slice(0, 5).map((r) => (
            <div key={r.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      r.urgencyLevel === 'critical'
                        ? 'bg-rose-100 text-rose-800 animate-pulse'
                        : r.urgencyLevel === 'attention'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {r.urgencyLevel}
                  </span>
                  <span className="text-xs font-extrabold text-blue-700 uppercase">
                    {r.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-sm">{r.foodName}</h3>
                <div className="text-xs text-slate-500 flex items-center gap-4 flex-wrap">
                  <span>From: <strong>{r.donorName}</strong></span>
                  <span>To: <strong>{r.matchedShelter?.name || 'Pending Shelter Match'}</strong></span>
                  <span>Courier: <strong>{r.assignedDriver?.name || 'Assigning...'}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <RescueCountdown deadline={r.pickupDeadline} compact />
                <Link
                  href={`/rescue/${r.id}`}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  Inspect <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* METRO PERFORMANCE SNAPSHOT */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">Metropolitan Hub Snapshot</h3>
          </div>
          <span className="text-xs text-slate-400">{filteredMetrics.length} Regional Centers</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredMetrics.map((cityData, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-extrabold text-slate-900 text-sm">{cityData.city}</div>
                <div className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  {cityData.rescueSuccessRate}% Success
                </div>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                {cityData.connectedRestaurants} Restaurants &bull; {cityData.connectedGroceries} Grocers
              </div>

              <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-slate-200">
                <span className="text-slate-500">Food Saved:</span>
                <strong className="text-emerald-700 font-bold">{cityData.foodSavedThisMonthKg.toLocaleString()} kg</strong>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">NGOs / Pantries:</span>
                <strong className="text-blue-700 font-bold">{cityData.connectedNGOs} orgs</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
