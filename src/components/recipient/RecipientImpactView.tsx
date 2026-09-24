'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Package,
  Utensils,
  Leaf,
  Sparkles,
  TreeDeciduous,
  Car,
  Droplets,
  Share2,
  Printer,
  FileSpreadsheet,
  Check,
  Award,
  Users,
} from 'lucide-react';
import { useRescue } from '@/context/RescueContext';
import { useAuth } from '@/context/AuthContext';

export default function RecipientImpactView() {
  const { donations } = useRescue();
  const { user } = useAuth();

  const [timeFilter, setTimeFilter] = useState<'ALL' | 'MONTH' | 'QUARTER' | 'YEAR'>('ALL');
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Filter completed intakes based on timeFilter
  const filteredCompleted = useMemo(() => {
    const now = new Date();
    return donations.filter((d) => {
      if (d.status !== 'DELIVERED') return false;
      const created = new Date(d.createdAt);
      if (timeFilter === 'MONTH') {
        return (
          created.getMonth() === now.getMonth() &&
          created.getFullYear() === now.getFullYear()
        );
      }
      if (timeFilter === 'QUARTER') {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        return created >= threeMonthsAgo;
      }
      if (timeFilter === 'YEAR') {
        return created.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [donations, timeFilter]);

  // Dynamic calculations from live context
  const totalMealsRescued = useMemo(
    () => filteredCompleted.reduce((acc, d) => acc + (d.mealCount || 0), 0),
    [filteredCompleted]
  );
  
  const totalWeightKg = Math.round(totalMealsRescued * 0.45);
  const totalCo2SavedKg = Math.round(totalWeightKg * 2.5);
  const familiesSupported = Math.round(totalMealsRescued / 4.2);
  const waterSavedLitres = totalWeightKg * 160;
  const treesEquivalent = Math.round(totalWeightKg / 8);

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Rescue ID', 'Food Item', 'Category', 'Quantity', 'Meals Served', 'Weight (kg)', 'CO2 Reduced (kg)', 'Date Received', 'Donor Facility'];
    const rows = filteredCompleted.map((d) => [
      d.id,
      `"${d.foodName.replace(/"/g, '""')}"`,
      d.category,
      `"${d.quantity}"`,
      d.mealCount || 0,
      Math.round((d.mealCount || 0) * 0.45),
      Math.round((d.mealCount || 0) * 0.45 * 2.5),
      new Date(d.createdAt).toISOString().split('T')[0],
      `"${d.donorName.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RePlate_Community_Impact_${timeFilter}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Community impact report exported to CSV');
  };

  // Share Impact
  const handleShare = () => {
    const shareText = `With RePlate, ${user?.organization || 'our shelter'} has received ${totalWeightKg.toLocaleString()} kg of surplus food and served ${totalMealsRescued.toLocaleString()} meals to our community! #FoodRescue #ZeroHunger #Sustainability`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      triggerToast('Impact summary copied to clipboard! Ready to share with donors and board members.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Community Nourishment & Impact</h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              VERIFIED INTAKES
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent metrics tracking food received, meals served to community members, and environmental waste prevented.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Impact Report</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleShare}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Time Period Filter Pills */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
          {[
            { key: 'ALL', label: 'All Time' },
            { key: 'MONTH', label: 'This Month' },
            { key: 'QUARTER', label: 'Past 90 Days' },
            { key: 'YEAR', label: 'This Year' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setTimeFilter(tab.key as any)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                timeFilter === tab.key
                  ? 'bg-white text-slate-900 shadow-2xs font-black'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Reporting for <span className="font-bold text-slate-800">{filteredCompleted.length} verified intakes</span>
        </div>
      </div>

      {/* 3 Core Impact Metrics (Lakshita MVP spec: Food received, meals served, waste reduced) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* 1. Food Received */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Food Received</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{totalWeightKg.toLocaleString()} kg</div>
          <div className="text-xs text-emerald-700 font-semibold">Total nutritious edible food intake</div>
        </div>

        {/* 2. Meals Served */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Meals Served</span>
            <Utensils className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-indigo-600">{totalMealsRescued.toLocaleString()}</div>
          <div className="text-xs text-indigo-700 font-semibold">Nourishing local community members</div>
        </div>

        {/* 3. Waste Reduced */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Waste Reduced (CO2 Offset)</span>
            <Leaf className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-black text-teal-700">{totalCo2SavedKg.toLocaleString()} kg</div>
          <div className="text-xs text-teal-700 font-semibold">Greenhouse methane emissions avoided</div>
        </div>
      </div>

      {/* Narrative Impact Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Community Nourishment Impact
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            “Your pantry has safely distributed {totalMealsRescued.toLocaleString()} meals, sustaining approximately {familiesSupported.toLocaleString()} local families.”
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm max-w-2xl leading-relaxed">
            By connecting daily surplus from local banquet kitchens, supermarkets, and restaurants directly to your intake dock, RePlate eliminates food waste while feeding those in need.
          </p>
        </div>

        {/* Equivalencies */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <div className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-600" /> Families Nourished
            </div>
            <div className="text-xl font-black text-slate-900">~{familiesSupported.toLocaleString()} Families</div>
            <p className="text-[11px] text-slate-500">Based on standard 4-person meal allocation.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <div className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1">
              <TreeDeciduous className="w-3.5 h-3.5 text-emerald-600" /> Carbon Offset Equivalent
            </div>
            <div className="text-xl font-black text-slate-900">{treesEquivalent.toLocaleString()} Trees Planted</div>
            <p className="text-[11px] text-slate-500">Annual CO2 sequestration equivalent.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <div className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-blue-600" /> Agricultural Water Conserved
            </div>
            <div className="text-xl font-black text-slate-900">{(waterSavedLitres).toLocaleString()} Litres</div>
            <p className="text-[11px] text-slate-500">Embedded freshwater saved from wasted crops.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
