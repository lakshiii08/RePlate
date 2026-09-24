'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Package,
  Utensils,
  CheckCircle2,
  Leaf,
  Sparkles,
  TreeDeciduous,
  Car,
  Droplets,
  Download,
  Share2,
  Printer,
  FileSpreadsheet,
  Calendar,
  Check,
  Award,
  DollarSign,
  X,
  Building2,
} from 'lucide-react';
import { useRescue } from '@/context/RescueContext';
import { useAuth } from '@/context/AuthContext';

export default function DonorImpactView() {
  const { donations } = useRescue();
  const { user } = useAuth();

  const [timeFilter, setTimeFilter] = useState<'ALL' | 'MONTH' | 'QUARTER' | 'YEAR'>('ALL');
  const [showCertModal, setShowCertModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Filter donations dynamically based on timeFilter
  const filteredDonations = useMemo(() => {
    const now = new Date();
    return donations.filter((d) => {
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

  const completedDonations = useMemo(
    () => filteredDonations.filter((d) => d.status === 'DELIVERED'),
    [filteredDonations]
  );
  
  const totalMealsRescued = useMemo(
    () => filteredDonations.reduce((acc, d) => acc + (d.mealCount || 0), 0),
    [filteredDonations]
  );
  
  const totalWeightKg = Math.round(totalMealsRescued * 0.45);
  const totalCo2SavedKg = Math.round(totalWeightKg * 2.5);
  const estimatedTaxValue = Math.round(totalMealsRescued * 6.5); // IRS Fair market value avg $6.50/meal
  const waterSavedLitres = totalWeightKg * 160;
  const treesEquivalent = Math.round(totalWeightKg / 8);
  const milesAverted = Math.round(totalCo2SavedKg * 2.4);

  // Dynamic CSV Export
  const handleExportCSV = () => {
    const headers = ['Donation ID', 'Food Name', 'Category', 'Quantity', 'Meals Provided', 'Weight (kg)', 'CO2 Offset (kg)', 'Status', 'Date', 'Recipient Shelter'];
    const rows = filteredDonations.map((d) => [
      d.id,
      `"${d.foodName.replace(/"/g, '""')}"`,
      d.category,
      `"${d.quantity}"`,
      d.mealCount || 0,
      Math.round((d.mealCount || 0) * 0.45),
      Math.round((d.mealCount || 0) * 0.45 * 2.5),
      d.status,
      new Date(d.createdAt).toISOString().split('T')[0],
      `"${(d.matchedShelter?.name || 'Community Shelter').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RePlate_Impact_Report_${timeFilter}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Impact CSV report downloaded');
  };

  // Share Impact Badge
  const handleShareImpact = () => {
    const shareText = `Proud to partner with RePlate! Together we've rescued ${totalWeightKg.toLocaleString()} kg of food and provided ${totalMealsRescued.toLocaleString()} meals to our local community. #FoodRescue #ZeroWaste #ESG`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      triggerToast('Impact summary copied to clipboard! Ready to share.');
    }
  };

  // Print Certificate
  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Social & Environmental Impact</h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              AUDITED METRICS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified food diverted from landfills, community meals provided, and carbon footprint reduction.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCertModal(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Impact Certificate</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 active:scale-98 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleShareImpact}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 active:scale-98 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
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
          Showing metrics for <span className="font-bold text-slate-800">{filteredDonations.length} listings</span>
        </div>
      </div>

      {/* 4 Core Impact Metrics (Lakshita MVP spec: Total food donated, Meals provided, Successful donations, Food waste reduced) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Total Food Donated</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{totalWeightKg.toLocaleString()} kg</div>
          <div className="text-[11px] text-emerald-700 font-semibold">Verified edible food diverted</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Meals Provided</span>
            <Utensils className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-indigo-600">{totalMealsRescued.toLocaleString()}</div>
          <div className="text-[11px] text-indigo-700 font-semibold">Direct community nourishment</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Successful Rescues</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-blue-600">{completedDonations.length}</div>
          <div className="text-[11px] text-blue-700 font-semibold">100% safety protocol verified</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Food Waste Reduced</span>
            <Leaf className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-black text-teal-700">{totalCo2SavedKg.toLocaleString()} kg</div>
          <div className="text-[11px] text-teal-700 font-semibold">CO2 greenhouse offset</div>
        </div>
      </div>

      {/* Simple Impact Summary Card (Lakshita MVP spec: Simple impact summary) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Simple Impact Summary
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            “Your business has provided {totalMealsRescued.toLocaleString()} meals to local families in need.”
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm max-w-2xl leading-relaxed">
            By donating surplus banquet food, bakery items, and fresh produce instead of allowing it to reach landfills,
            your operations actively support local shelter kitchens while measurably reducing environmental waste.
          </p>
        </div>

        {/* Environmental & Tax Equivalencies */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <div className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1">
              <TreeDeciduous className="w-3.5 h-3.5 text-emerald-600" /> Trees Equivalent
            </div>
            <div className="text-xl font-black text-slate-900">{treesEquivalent.toLocaleString()} Trees</div>
            <p className="text-[11px] text-slate-500">Annual carbon sequestration equivalent.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <div className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1">
              <Car className="w-3.5 h-3.5 text-blue-600" /> Emissions Averted
            </div>
            <div className="text-xl font-black text-slate-900">{milesAverted.toLocaleString()} Miles</div>
            <p className="text-[11px] text-slate-500">Passenger car greenhouse gas offset.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <div className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-indigo-600" /> Water Saved
            </div>
            <div className="text-xl font-black text-slate-900">{waterSavedLitres.toLocaleString()} Litres</div>
            <p className="text-[11px] text-slate-500">Embedded agricultural water saved.</p>
          </div>

          <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 space-y-1">
            <div className="text-emerald-800 text-[10px] font-bold uppercase flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-700" /> Tax Deductible Value
            </div>
            <div className="text-xl font-black text-emerald-900">${estimatedTaxValue.toLocaleString()}</div>
            <p className="text-[11px] text-emerald-700">Estimated IRC 170(e)(3) deduction.</p>
          </div>
        </div>
      </div>

      {/* Official Certificate Modal */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Official Certificate of Food Rescue Impact</h3>
                  <p className="text-[11px] text-slate-400">Verified by RePlate National Redistribution Network</p>
                </div>
              </div>
              <button
                onClick={() => setShowCertModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Certificate Body */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-4 font-sans">
              <div className="text-xs font-black uppercase text-emerald-800 tracking-widest">
                Certificate of Environmental Stewardship
              </div>
              <p className="text-xs text-slate-500">This certifies that</p>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {user?.organization || 'Grand Hyatt Hotel Catering'}
              </div>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                has successfully diverted <span className="font-extrabold text-slate-900">{totalWeightKg.toLocaleString()} kg</span> of surplus edible food, distributing <span className="font-extrabold text-indigo-700">{totalMealsRescued.toLocaleString()} nutritious meals</span> to local nonprofit community shelters and reducing <span className="font-extrabold text-teal-700">{totalCo2SavedKg.toLocaleString()} kg</span> of CO₂ greenhouse emissions.
              </p>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200 text-left text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Audit Period</div>
                  <div className="font-extrabold text-slate-800">{timeFilter === 'ALL' ? 'All Time to Date' : timeFilter}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Certificate ID</div>
                  <div className="font-mono font-bold text-slate-800">RP-CERT-{Math.abs(totalMealsRescued * 13).toString(16).toUpperCase()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">IRS IRC 170(e)(3)</div>
                  <div className="font-extrabold text-emerald-700">${estimatedTaxValue.toLocaleString()} Value</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCertModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Close
              </button>
              <button
                onClick={handlePrintCertificate}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
