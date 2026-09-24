'use client';

import React from 'react';
import { useRescue } from '@/context/RescueContext';
import { BarChart3, TrendingUp, Utensils, Clock, CheckCircle2, Award } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export default function ImpactDashboardView() {
  const { impactStats } = useRescue();

  const chartData = [
    { day: 'Mon', meals: 1200 },
    { day: 'Tue', meals: 1850 },
    { day: 'Wed', meals: 2400 },
    { day: 'Thu', meals: 3100 },
    { day: 'Fri', meals: 4200 },
    { day: 'Sat', meals: 5600 },
    { day: 'Sun', meals: 6800 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">📊 Mini Impact Dashboard</h1>
          <p className="text-xs text-slate-500">
            Core environmental & operational success metrics
          </p>
        </div>
      </div>

      {/* SECTION 9 REQUIRED 5 METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Meals Rescued</div>
          <div className="text-2xl font-black text-emerald-600">{impactStats.mealsRescued.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500">Servings delivered</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Food Rescued</div>
          <div className="text-2xl font-black text-slate-900">{(impactStats.foodSavedKg / 1000).toFixed(1)}k kg</div>
          <div className="text-[10px] text-slate-500">Weight saved</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Successful Rescues</div>
          <div className="text-2xl font-black text-blue-600">{impactStats.deliveriesCompleted.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500">Handover certified</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Avg Rescue Time</div>
          <div className="text-2xl font-black text-amber-600">22.5 mins</div>
          <div className="text-[10px] text-slate-500">Sub-minute routing</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Rescue Success Rate</div>
          <div className="text-2xl font-black text-emerald-700">98.4%</div>
          <div className="text-[10px] text-slate-500">Zero decay target</div>
        </div>
      </div>

      {/* RECHARTS SIMPLE IMPACT CHART */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-600" /> Weekly Meals Rescued Growth Trend
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorMealsImpact" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="meals" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorMealsImpact)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
