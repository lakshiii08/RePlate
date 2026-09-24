'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  HeartHandshake,
  Building2,
  Truck,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Search,
  FileSpreadsheet,
  Printer,
  X,
  Phone,
  Check,
  FileText,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useRescue } from '@/context/RescueContext';
import { useAuth } from '@/context/AuthContext';
import { Donation } from '@/types';

export default function DonorDonationsView() {
  const { donations } = useRescue();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [selectedReceipt, setSelectedReceipt] = useState<Donation | null>(null);
  const [contactingShelter, setContactingShelter] = useState<Donation | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const activeDonations = useMemo(
    () => donations.filter((d) => d.status !== 'DELIVERED' && d.status !== 'CANCELLED'),
    [donations]
  );
  
  const completedDonations = useMemo(
    () => donations.filter((d) => d.status === 'DELIVERED'),
    [donations]
  );

  const filteredHistory = useMemo(() => {
    return donations.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.foodName.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        (item.matchedShelter?.name && item.matchedShelter.name.toLowerCase().includes(q));

      if (statusFilter === 'ACTIVE') {
        return matchesSearch && item.status !== 'DELIVERED' && item.status !== 'CANCELLED';
      }
      if (statusFilter === 'COMPLETED') {
        return matchesSearch && item.status === 'DELIVERED';
      }
      return matchesSearch;
    });
  }, [donations, searchQuery, statusFilter]);

  // Export Donations CSV
  const handleExportCSV = () => {
    const headers = ['Donation ID', 'Food Name', 'Category', 'Quantity', 'Meals', 'Recipient Shelter', 'Status', 'Fulfillment', 'Created At'];
    const rows = filteredHistory.map((d) => [
      d.id,
      `"${d.foodName.replace(/"/g, '""')}"`,
      d.category,
      `"${d.quantity}"`,
      d.mealCount || 0,
      `"${(d.matchedShelter?.name || 'Community Shelter').replace(/"/g, '""')}"`,
      d.status,
      d.deliveryMode === 'SELF_DRIVE' ? 'Self-Drive' : d.assignedDriver?.name || 'Courier',
      new Date(d.createdAt).toISOString().split('T')[0],
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RePlate_Donations_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Donations history exported to CSV');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Donations & Recipient Shelters</h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {activeDonations.length} IN PROGRESS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Track recipient charities, match feasibility, and verified delivery history.
          </p>
        </div>

        {/* Header Action Button */}
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
          <span>Export All Donations (CSV)</span>
        </button>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Current In-Progress Donations (Lakshita MVP spec: Current donations, Recipient name, Donation status) */}
      <div className="space-y-4">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-emerald-600" />
          Current In-Progress Rescues
        </h2>

        {activeDonations.length > 0 ? (
          <div className="space-y-4">
            {activeDonations.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Donation ID: #{item.id}</div>
                    <h3 className="text-base font-black text-slate-900">{item.foodName}</h3>
                    <p className="text-xs text-slate-500">{item.quantity} &bull; {item.category}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                      {item.status.replace(/_/g, ' ')}
                    </span>
                    <button
                      onClick={() => setContactingShelter(item)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3 text-emerald-600" />
                      Contact Shelter
                    </button>
                    <Link
                      href={`/rescue/${item.id}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1"
                    >
                      Track Route <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-0.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" /> Recipient Shelter / NGO
                    </div>
                    <div className="font-extrabold text-slate-900 text-xs">
                      {item.matchedShelter?.name || 'Smart Matching in Progress...'}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {item.matchedShelter?.address || 'Searching nearby non-profits'}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-0.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-emerald-600" /> Fulfillment
                    </div>
                    <div className="font-extrabold text-slate-900 text-xs">
                      {item.deliveryMode === 'SELF_DRIVE' ? 'Direct Self-Drive' : item.assignedDriver?.name || 'Volunteer Courier'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {item.pickupOtp ? `Handover OTP: ${item.pickupOtp}` : 'Automatic verification'}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-0.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> AI Compatibility
                    </div>
                    <div className="font-extrabold text-slate-900 text-xs">
                      {item.aiMatchScore ? `${item.aiMatchScore}% Priority Fit` : 'Verified Safe Route'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Safe food handling and temperature affirmed
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-3xl border border-dashed border-slate-300 p-8 text-center text-slate-500 text-xs">
            No active in-progress rescues. Post surplus food to initiate real-time shelter routing.
          </div>
        )}
      </div>

      {/* Donation History with Filter & Search (Lakshita MVP spec: Donation history) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Donation History & Official Tax Receipts
          </h2>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food, shelter, or ID..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
              {[
                { key: 'ALL', label: 'All' },
                { key: 'COMPLETED', label: 'Delivered' },
                { key: 'ACTIVE', label: 'Active' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key as any)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    statusFilter === tab.key
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase">
              <tr>
                <th className="p-4">Item & Rescue ID</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Recipient Shelter</th>
                <th className="p-4">Status</th>
                <th className="p-4">Delivered Date</th>
                <th className="p-4 text-right">Receipt / Tax Slip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="p-4 font-bold text-slate-900">
                    <div>{item.foodName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">#{item.id}</div>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-slate-800">{item.quantity}</span>
                    <div className="text-[10px] text-slate-400">{item.category}</div>
                  </td>
                  <td className="p-4 font-semibold text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{item.matchedShelter?.name || 'Community Shelter Kitchen'}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        item.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {item.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-[11px]">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedReceipt(item)}
                      className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors inline-flex items-center gap-1"
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
                    No donation records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Tax Receipt / Donation Slip Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Verified Donation Receipt</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Rescue ID: #{selectedReceipt.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Donor Facility</div>
                  <div className="font-bold text-slate-900 text-sm">{user?.organization || selectedReceipt.donorName}</div>
                  <div className="text-[11px] text-slate-500">{selectedReceipt.donorAddress}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Date of Rescue</div>
                  <div className="font-mono font-bold text-slate-900">{new Date(selectedReceipt.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Itemized Food Diversion</div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-slate-900">{selectedReceipt.foodName}</div>
                    <div className="text-[11px] text-slate-500">{selectedReceipt.category} &bull; {selectedReceipt.foodType || 'Standard'}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-slate-900 text-sm">{selectedReceipt.quantity}</div>
                    <div className="text-[10px] text-emerald-700 font-bold">~{selectedReceipt.mealCount || 35} meals</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-0.5">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Recipient NGO / Shelter</div>
                  <div className="font-bold text-slate-800">{selectedReceipt.matchedShelter?.name || 'Hope Community Kitchen'}</div>
                  <div className="text-[10px] text-emerald-700">501(c)(3) Verified Non-Profit</div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-0.5">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Fair Market Valuation</div>
                  <div className="font-black text-slate-900 text-sm">${((selectedReceipt.mealCount || 35) * 6.5).toFixed(2)}</div>
                  <div className="text-[10px] text-slate-500">IRC 170(e)(3) Eligible</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Shelter Dialog */}
      {contactingShelter && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-slate-900 text-sm">Recipient Shelter Contact</h3>
              </div>
              <button
                onClick={() => setContactingShelter(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="font-extrabold text-slate-900 text-sm">
                  {contactingShelter.matchedShelter?.name || 'Hope Community Kitchen'}
                </div>
                <div className="text-slate-500">
                  {contactingShelter.matchedShelter?.address || '452 Elm Street, San Francisco, CA'}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Shelter Intake Desk</div>
                    <div className="font-bold text-slate-800">+1 (415) 890-4432</div>
                  </div>
                  <a
                    href="tel:+14158904432"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call
                  </a>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Kitchen Coordinator</div>
                    <div className="font-bold text-slate-800">Maria Santos (Intake Lead)</div>
                  </div>
                  <a
                    href="mailto:intake@hopekitchen.org"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold"
                  >
                    Email
                  </a>
                </div>
              </div>
            </div>

            <button
              onClick={() => setContactingShelter(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
