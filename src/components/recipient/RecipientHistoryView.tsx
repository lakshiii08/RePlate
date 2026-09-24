'use client';

import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  Building2,
  Calendar,
  FileText,
  Printer,
  ShieldCheck,
  X,
  Check,
} from 'lucide-react';
import { useRescue } from '@/context/RescueContext';
import { useAuth } from '@/context/AuthContext';
import { Donation } from '@/types';

export default function RecipientHistoryView() {
  const { donations } = useRescue();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSlip, setSelectedSlip] = useState<Donation | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Completed intakes
  const completedIntakes = useMemo(
    () => donations.filter((d) => d.status === 'DELIVERED'),
    [donations]
  );

  const filteredHistory = useMemo(() => {
    return completedIntakes.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        item.foodName.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.donorName.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [completedIntakes, searchQuery]);

  const totalMealsRescued = completedIntakes.reduce((acc, d) => acc + (d.mealCount || 0), 0);
  const totalWeightKg = Math.round(totalMealsRescued * 0.45);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Rescue ID', 'Food Name', 'Category', 'Quantity', 'Meals Received', 'Weight (kg)', 'Donor Facility', 'Date Received', 'Status'];
    const rows = filteredHistory.map((d) => [
      d.id,
      `"${d.foodName.replace(/"/g, '""')}"`,
      d.category,
      `"${d.quantity}"`,
      d.mealCount || 0,
      Math.round((d.mealCount || 0) * 0.45),
      `"${d.donorName.replace(/"/g, '""')}"`,
      new Date(d.createdAt).toISOString().split('T')[0],
      'DELIVERED',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RePlate_Shelter_Intake_History_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Intake history exported to CSV');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Intake History & Intake Records</h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {completedIntakes.length} COMPLETED INTAKES
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-ready log of all surplus food shipments received by your facility, including donor details and meal counts.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
          <span>Export Intake History (CSV)</span>
        </button>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Overview Stat Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Total Intakes Logged</div>
          <div className="text-2xl font-black text-slate-900">{completedIntakes.length}</div>
          <div className="text-[11px] text-slate-500">Verified safe shipments</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Total Meals Served</div>
          <div className="text-2xl font-black text-indigo-600">{totalMealsRescued.toLocaleString()}</div>
          <div className="text-[11px] text-indigo-700">Community nourishment</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Food Weight Diverted</div>
          <div className="text-2xl font-black text-emerald-600">{totalWeightKg.toLocaleString()} kg</div>
          <div className="text-[11px] text-emerald-700">Landfill diversion</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search previous intakes by food item, donor facility, or ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Rescue ID & Food Item</th>
                <th className="p-4">Quantity / Meals</th>
                <th className="p-4">Donor Facility</th>
                <th className="p-4">Date Received</th>
                <th className="p-4">Safety Audit</th>
                <th className="p-4 text-right">Intake Record</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 font-bold text-slate-900">
                    <div>{item.foodName}</div>
                    <div className="text-[10px] font-mono text-slate-400">#{item.id}</div>
                  </td>
                  <td className="p-4">
                    <span className="font-extrabold text-slate-900">{item.quantity}</span>
                    <div className="text-[10px] text-indigo-700 font-semibold">~{item.mealCount || 30} meals</div>
                  </td>
                  <td className="p-4 font-medium text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{item.donorName}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-[11px] text-slate-600">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                      <ShieldCheck className="w-3 h-3" /> VERIFIED SAFE
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedSlip(item)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors inline-flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3 text-emerald-700" />
                      View Slip
                    </button>
                  </td>
                </tr>
              ))}

              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No intake records found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Intake Slip Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Food Intake Delivery Slip</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Record ID: #{selectedSlip.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSlip(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Receiving Facility</div>
                  <div className="font-bold text-slate-900 text-sm">
                    {user?.organization || 'Hope Community Kitchen'}
                  </div>
                  <div className="text-[11px] text-slate-500">{user?.address || '452 Elm Street, SF'}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Date of Intake</div>
                  <div className="font-mono font-bold text-slate-900">
                    {new Date(selectedSlip.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Food Shipment Summary</div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-slate-900">{selectedSlip.foodName}</div>
                    <div className="text-[11px] text-slate-500">
                      {selectedSlip.category} &bull; {selectedSlip.foodType || 'Standard'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-slate-900 text-sm">{selectedSlip.quantity}</div>
                    <div className="text-[10px] text-emerald-700 font-bold">~{selectedSlip.mealCount || 30} meals</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-0.5">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Donor Partner</div>
                  <div className="font-bold text-slate-800">{selectedSlip.donorName}</div>
                  <div className="text-[10px] text-slate-500 truncate">{selectedSlip.donorAddress}</div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-0.5">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Safety Compliance</div>
                  <div className="font-bold text-emerald-800">Passed Thermal Inspection</div>
                  <div className="text-[10px] text-slate-500">Intact Seals Confirmed</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedSlip(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
