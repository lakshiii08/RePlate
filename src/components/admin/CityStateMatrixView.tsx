'use client';

import React, { useState } from 'react';
import {
  MOCK_CITY_STATE_METRICS,
  CityStateMetric,
} from '@/services/adminData';
import {
  MapPin,
  Building2,
  Store,
  HeartHandshake,
  Utensils,
  Scale,
  CheckCircle2,
  AlertOctagon,
  TrendingUp,
  Filter,
} from 'lucide-react';

export default function CityStateMatrixView() {
  const [selectedState, setSelectedState] = useState<string>('ALL');

  const states = Array.from(new Set(MOCK_CITY_STATE_METRICS.map((m) => m.state)));

  const filteredMetrics = MOCK_CITY_STATE_METRICS.filter(
    (m) => selectedState === 'ALL' || m.state === selectedState
  );

  // Totals
  const totalRestaurants = filteredMetrics.reduce((acc, m) => acc + m.connectedRestaurants, 0);
  const totalGroceries = filteredMetrics.reduce((acc, m) => acc + m.connectedGroceries, 0);
  const totalNGOs = filteredMetrics.reduce((acc, m) => acc + m.connectedNGOs, 0);
  const totalFoodSavedKg = filteredMetrics.reduce((acc, m) => acc + m.foodSavedThisMonthKg, 0);
  const totalMeals = filteredMetrics.reduce((acc, m) => acc + m.mealsRescuedThisMonth, 0);
  const totalComplaints = filteredMetrics.reduce((acc, m) => acc + m.openComplaints, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            REGIONAL JURISDICTION ANALYSIS
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            State & City-Wise Operations Matrix
          </h1>
          <p className="text-xs text-slate-500">
            Comparative performance, partner density, and operational risk metrics across metropolitan corridors
          </p>
        </div>

        {/* State filter */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs shadow-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-600">Filter by State:</span>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All States (Nationwide)</option>
            {states.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Aggregate Totals Across Filtered Scope */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Restaurants</div>
          <div className="text-xl font-black text-slate-900">{totalRestaurants}</div>
          <div className="text-[10px] text-emerald-600 font-semibold">Commercial Donors</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Groceries</div>
          <div className="text-xl font-black text-slate-900">{totalGroceries}</div>
          <div className="text-[10px] text-blue-600 font-semibold">Supermarkets</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Connected NGOs</div>
          <div className="text-xl font-black text-slate-900">{totalNGOs}</div>
          <div className="text-[10px] text-purple-600 font-semibold">Verified Intakes</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Food Saved (kg)</div>
          <div className="text-xl font-black text-emerald-700">
            {(totalFoodSavedKg / 1000).toFixed(1)}k kg
          </div>
          <div className="text-[10px] text-slate-500 font-medium">This Month</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Meals Rescued</div>
          <div className="text-xl font-black text-blue-700">
            {(totalMeals / 1000).toFixed(1)}k
          </div>
          <div className="text-[10px] text-slate-500 font-medium">Portions Delivered</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Open Grievances</div>
          <div className="text-xl font-black text-rose-600">{totalComplaints}</div>
          <div className="text-[10px] text-rose-700 font-semibold">Active Inquiries</div>
        </div>
      </div>

      {/* State & City Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm">
            Regional Breakdown ({filteredMetrics.length} Metropolitan Clusters)
          </h3>
          <span className="text-xs text-slate-400">Audited Cross-Metro Performance</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 font-bold text-slate-500 border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">City & State</th>
                <th className="p-3.5">Restaurants</th>
                <th className="p-3.5">Groceries</th>
                <th className="p-3.5">Connected NGOs</th>
                <th className="p-3.5">Monthly Food Saved (kg)</th>
                <th className="p-3.5">Meals Rescued</th>
                <th className="p-3.5">Active Couriers</th>
                <th className="p-3.5">Success Rate</th>
                <th className="p-3.5">Open Complaints</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredMetrics.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-sans">
                    <div className="font-bold text-slate-900 text-sm">{row.city}</div>
                    <div className="text-[11px] text-slate-400 font-semibold">{row.state}</div>
                  </td>
                  <td className="p-3.5 font-bold text-slate-800">{row.connectedRestaurants}</td>
                  <td className="p-3.5 font-bold text-slate-800">{row.connectedGroceries}</td>
                  <td className="p-3.5 font-bold text-emerald-800">{row.connectedNGOs}</td>
                  <td className="p-3.5 font-bold text-emerald-700">
                    {row.foodSavedThisMonthKg.toLocaleString()} kg
                  </td>
                  <td className="p-3.5 font-bold text-blue-700">
                    {row.mealsRescuedThisMonth.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-slate-700">{row.activeCouriers}</td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {row.rescueSuccessRate}%
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.openComplaints === 0
                          ? 'bg-slate-100 text-slate-600'
                          : row.openComplaints <= 1
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800 font-black'
                      }`}
                    >
                      {row.openComplaints} Open
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
