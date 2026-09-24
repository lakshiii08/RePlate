'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  Package,
  Search,
  Truck,
  MapPin,
  Clock,
  Building2,
  CheckCircle2,
  Navigation,
  KeyRound,
  FileSpreadsheet,
  Check,
  ShieldCheck,
  Phone,
  Thermometer,
  X,
  ExternalLink,
} from 'lucide-react';
import { useRescue } from '@/context/RescueContext';
import { Donation } from '@/types';
import RescueCountdown from '@/components/ui/RescueCountdown';

export default function DriverDeliveriesView() {
  const { donations, updateDonation } = useRescue();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  
  // Handover & Complete Delivery Modal State
  const [completingItem, setCompletingItem] = useState<Donation | null>(null);
  const [deliveryTemp, setDeliveryTemp] = useState('4.2');
  const [signatureName, setSignatureName] = useState('Sister Mary / Hope Intake');
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Driver deliveries (assigned, in transit, delivered)
  const allDeliveries = useMemo(() => {
    return donations.filter(
      (d) =>
        d.status === 'DRIVER_ASSIGNED' ||
        d.status === 'PICKUP_IN_PROGRESS' ||
        d.status === 'PICKED_UP' ||
        d.status === 'IN_TRANSIT' ||
        d.status === 'DELIVERED'
    );
  }, [donations]);

  const filteredDeliveries = useMemo(() => {
    return allDeliveries.filter((d) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        d.id.toLowerCase().includes(q) ||
        d.foodName.toLowerCase().includes(q) ||
        d.donorName.toLowerCase().includes(q) ||
        (d.matchedShelter?.name && d.matchedShelter.name.toLowerCase().includes(q));

      if (statusFilter === 'ACTIVE') {
        return matchesSearch && d.status !== 'DELIVERED' && d.status !== 'CANCELLED';
      }
      if (statusFilter === 'COMPLETED') {
        return matchesSearch && d.status === 'DELIVERED';
      }
      return matchesSearch;
    });
  }, [allDeliveries, searchQuery, statusFilter]);

  // Start run or advance workflow
  const handleAdvanceStatus = (item: Donation) => {
    let nextStatus = item.status;
    if (item.status === 'DRIVER_ASSIGNED') {
      nextStatus = 'PICKUP_IN_PROGRESS';
      triggerToast(`En route to ${item.donorName} for pickup!`);
    } else if (item.status === 'PICKUP_IN_PROGRESS') {
      nextStatus = 'IN_TRANSIT';
      triggerToast(`Food loaded! In transit to ${item.matchedShelter?.name || 'Shelter'}.`);
    }
    updateDonation(item.id, { status: nextStatus as any });
  };

  // Confirm complete delivery
  const handleConfirmDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingItem) return;

    updateDonation(completingItem.id, {
      status: 'DELIVERED',
    });

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.log('Confetti', e);
    }

    triggerToast(`Rescue #${completingItem.id} successfully completed and verified!`);
    setCompletingItem(null);
  };

  // Export Deliveries CSV
  const handleExportCSV = () => {
    const headers = ['Rescue ID', 'Food Name', 'Quantity', 'Category', 'Donor Facility', 'Dropoff Shelter', 'Status', 'Handover OTP', 'Scheduled Date'];
    const rows = filteredDeliveries.map((d) => [
      d.id,
      `"${d.foodName.replace(/"/g, '""')}"`,
      `"${d.quantity}"`,
      d.category,
      `"${d.donorName.replace(/"/g, '""')}"`,
      `"${(d.matchedShelter?.name || 'Shelter').replace(/"/g, '""')}"`,
      d.status,
      d.pickupOtp || '4829',
      new Date(d.createdAt).toISOString().split('T')[0],
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RePlate_Courier_Runs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Courier runs exported to CSV');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">My Assigned Pickups & Deliveries</h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {allDeliveries.length} RUNS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your daily food rescue itineraries, execute donor kitchen pickups, and complete shelter dropoffs.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
          <span>Export Manifest (CSV)</span>
        </button>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deliveries by food item, donor, shelter, or ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0 text-xs font-bold">
            {[
              { id: 'ALL', label: 'All Runs' },
              { id: 'ACTIVE', label: 'Active Missions' },
              { id: 'COMPLETED', label: 'Delivered' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  statusFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Deliveries Grid */}
      <div className="space-y-4">
        {filteredDeliveries.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400">Run #{item.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      item.status === 'DELIVERED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'IN_TRANSIT'
                        ? 'bg-indigo-100 text-indigo-800 animate-pulse'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {item.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 mt-0.5">{item.foodName}</h3>
                <p className="text-xs text-slate-500 font-semibold">{item.quantity} &bull; {item.category}</p>
              </div>

              <div className="flex items-center gap-2">
                <RescueCountdown deadline={item.pickupDeadline} compact />
                <Link
                  href="/driver/route"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Route HUD</span>
                </Link>
              </div>
            </div>

            {/* Waypoints Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Pickup Waypoint */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" /> Pickup Kitchen
                  </span>
                  <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    OTP: {item.pickupOtp || '4829'}
                  </span>
                </div>
                <div className="font-extrabold text-slate-900">{item.donorName}</div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{item.donorAddress}</span>
                </div>
              </div>

              {/* Dropoff Waypoint */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" /> Dropoff Shelter
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    Buzzer #2
                  </span>
                </div>
                <div className="font-extrabold text-slate-900">
                  {item.matchedShelter?.name || 'Hope Community Shelter'}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{item.matchedShelter?.address || '452 Elm Street, Downtown, SF'}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <a
                  href="tel:+15552345678"
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                >
                  <Phone className="w-3 h-3 text-slate-500" /> Donor
                </a>

                <a
                  href="tel:+14158904432"
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                >
                  <Phone className="w-3 h-3 text-slate-500" /> Shelter
                </a>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center gap-2">
                {item.status !== 'DELIVERED' && (
                  <>
                    {item.status === 'DRIVER_ASSIGNED' && (
                      <button
                        onClick={() => handleAdvanceStatus(item)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Start Pickup Run</span>
                      </button>
                    )}

                    {item.status === 'PICKUP_IN_PROGRESS' && (
                      <button
                        onClick={() => handleAdvanceStatus(item)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm Food Loaded (Start Transit)</span>
                      </button>
                    )}

                    {(item.status === 'IN_TRANSIT' || item.status === 'PICKED_UP') && (
                      <button
                        onClick={() => setCompletingItem(item)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verify & Complete Delivery</span>
                      </button>
                    )}
                  </>
                )}

                <Link
                  href={`/driver/rescue/${item.id}`}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <span>Mobile HUD</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        ))}

        {filteredDeliveries.length === 0 && (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-400 text-xs space-y-2">
            <Package className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-600">No deliveries found matching this filter.</p>
            <p className="text-slate-400">Head over to the Dashboard to claim available pickup runs.</p>
          </div>
        )}
      </div>

      {/* Verify & Complete Delivery Modal */}
      {completingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-base">Complete Shelter Handover</h3>
              </div>
              <button
                onClick={() => setCompletingItem(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmDelivery} className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="font-black text-slate-900 text-sm">
                  #{completingItem.id} &bull; {completingItem.foodName}
                </div>
                <div className="text-slate-500">
                  Delivered to: {completingItem.matchedShelter?.name || 'Hope Community Shelter'}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase">
                  Arrival Handover Temperature (°C) *
                </label>
                <div className="relative">
                  <Thermometer className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={deliveryTemp}
                    onChange={(e) => setDeliveryTemp(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Cold threshold &lt; 5°C, Hot threshold &gt; 60°C.</p>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase">
                  Shelter Staff Sign-Off Name *
                </label>
                <input
                  type="text"
                  required
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompletingItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Handover & Finish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
