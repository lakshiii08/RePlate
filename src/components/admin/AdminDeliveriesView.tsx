'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Package,
  Search,
  Truck,
  MapPin,
  Clock,
  Building2,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  Filter,
  Check,
  FileSpreadsheet,
  RefreshCw,
  AlertTriangle,
  X,
  Send,
} from 'lucide-react';
import { useRescue } from '@/context/RescueContext';
import { Donation } from '@/types';
import RescueCountdown from '@/components/ui/RescueCountdown';
import { MOCK_DRIVERS } from '@/services/mockData';

export default function AdminDeliveriesView() {
  const { donations, updateDonation } = useRescue();

  const [searchQuery, setSearchQuery] = useState('');
  const [tabFilter, setTabFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ALL');
  
  // Fast action state
  const [deliveringItem, setDeliveringItem] = useState<Donation | null>(null);
  const [reassigningItem, setReassigningItem] = useState<Donation | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>(MOCK_DRIVERS[0]?.id || '');
  
  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Metrics
  const activeCount = donations.filter((d) => d.status !== 'DELIVERED' && d.status !== 'CANCELLED').length;
  const completedCount = donations.filter((d) => d.status === 'DELIVERED').length;

  const filteredDeliveries = useMemo(() => {
    return donations.filter((d) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        d.id.toLowerCase().includes(q) ||
        d.foodName.toLowerCase().includes(q) ||
        d.donorName.toLowerCase().includes(q) ||
        (d.matchedShelter?.name && d.matchedShelter.name.toLowerCase().includes(q)) ||
        (d.assignedDriver?.name && d.assignedDriver.name.toLowerCase().includes(q));

      if (tabFilter === 'ACTIVE') {
        return matchesSearch && d.status !== 'DELIVERED' && d.status !== 'CANCELLED';
      }
      if (tabFilter === 'COMPLETED') {
        return matchesSearch && d.status === 'DELIVERED';
      }
      if (tabFilter === 'CANCELLED') {
        return matchesSearch && d.status === 'CANCELLED';
      }
      return matchesSearch;
    });
  }, [donations, searchQuery, tabFilter]);

  // Export Deliveries CSV
  const handleExportCSV = () => {
    const headers = ['Rescue ID', 'Food Name', 'Category', 'Quantity', 'Donor Facility', 'Pickup Address', 'Recipient Shelter', 'Assigned Courier', 'Status', 'Handover OTP', 'Created Date'];
    const rows = filteredDeliveries.map((d) => [
      d.id,
      `"${d.foodName.replace(/"/g, '""')}"`,
      d.category,
      `"${d.quantity}"`,
      `"${d.donorName.replace(/"/g, '""')}"`,
      `"${d.donorAddress.replace(/"/g, '""')}"`,
      `"${(d.matchedShelter?.name || 'Unassigned').replace(/"/g, '""')}"`,
      d.deliveryMode === 'SELF_DRIVE' ? 'Self-Drive' : d.assignedDriver?.name || 'Unassigned',
      d.status,
      d.pickupOtp || '4829',
      new Date(d.createdAt).toISOString().split('T')[0],
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RePlate_Deliveries_Manifest_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Deliveries manifest exported to CSV');
  };

  // Confirm manual completion of delivery
  const handleConfirmManualDelivery = () => {
    if (!deliveringItem) return;
    updateDonation(deliveringItem.id, {
      status: 'DELIVERED',
    });
    triggerToast(`Delivery #${deliveringItem.id} marked as DELIVERED successfully`);
    setDeliveringItem(null);
  };

  // Confirm driver reassignment
  const handleConfirmReassign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassigningItem) return;
    const targetDriver = MOCK_DRIVERS.find((d) => d.id === selectedDriverId);
    if (!targetDriver) return;

    updateDonation(reassigningItem.id, {
      status: 'DRIVER_ASSIGNED',
      assignedDriver: targetDriver,
    });
    triggerToast(`Rescue #${reassigningItem.id} reassigned to ${targetDriver.name}`);
    setReassigningItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Deliveries Command Center</h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {donations.length} TOTAL DELIVERIES
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time pickup & drop-off manifests, assigned drivers, and delivery completion audits.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export Manifest (CSV)</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Filter & Search */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by rescue ID, food item, donor, shelter, or courier..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Tab Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/80 shrink-0 text-xs font-bold">
            {[
              { id: 'ALL', label: 'All Deliveries' },
              { id: 'ACTIVE', label: `Active (${activeCount})` },
              { id: 'COMPLETED', label: `Completed (${completedCount})` },
              { id: 'CANCELLED', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTabFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  tabFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Deliveries List / Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 font-bold text-slate-500 border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Delivery & Food Item</th>
                <th className="p-4">Pickup Location</th>
                <th className="p-4">Drop Location (Shelter)</th>
                <th className="p-4">Assigned Driver</th>
                <th className="p-4">Delivery Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDeliveries.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Delivery & Food Item */}
                  <td className="p-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-400">#{item.id}</span>
                      {item.foodType && (
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold ${
                            item.foodType === 'Veg' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.foodType}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-black text-slate-900 mt-0.5">{item.foodName}</div>
                    <div className="text-[11px] text-slate-500 font-normal">
                      {item.quantity} &bull; {item.category}
                    </div>
                  </td>

                  {/* Pickup Location */}
                  <td className="p-4">
                    <div className="font-semibold text-slate-900 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{item.donorName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs">{item.donorAddress}</div>
                    {item.pickupOtp && (
                      <div className="text-[10px] text-emerald-800 font-mono mt-0.5">
                        Handover OTP: {item.pickupOtp}
                      </div>
                    )}
                  </td>

                  {/* Drop Location */}
                  <td className="p-4">
                    <div className="font-semibold text-slate-900 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-blue-600 shrink-0" />
                      <span>{item.matchedShelter?.name || 'Pending Shelter Match'}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs">
                      {item.matchedShelter?.address || 'San Francisco Region'}
                    </div>
                  </td>

                  {/* Driver Assigned */}
                  <td className="p-4">
                    {item.deliveryMode === 'SELF_DRIVE' ? (
                      <div>
                        <span className="font-bold text-slate-800">Self-Drive Drop-off</span>
                        <div className="text-[10px] text-slate-400">Donor Delivering Direct</div>
                      </div>
                    ) : item.assignedDriver ? (
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          <Truck className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>{item.assignedDriver.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {item.assignedDriver.vehicleType} &bull;{' '}
                          <a href={`tel:${item.assignedDriver.phone}`} className="text-emerald-700 hover:underline">
                            {item.assignedDriver.phone}
                          </a>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        Unassigned Courier
                      </span>
                    )}
                  </td>

                  {/* Delivery Status */}
                  <td className="p-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        item.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'POSTED'
                          ? 'bg-amber-100 text-amber-800'
                          : item.status === 'CANCELLED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {item.status.replace(/_/g, ' ')}
                    </span>
                    {item.status !== 'DELIVERED' && item.status !== 'CANCELLED' && (
                      <div className="mt-1">
                        <RescueCountdown deadline={item.pickupDeadline} compact />
                      </div>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {item.status !== 'DELIVERED' && item.status !== 'CANCELLED' && (
                        <>
                          <button
                            onClick={() => setDeliveringItem(item)}
                            className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] transition-colors border border-emerald-200"
                            title="Mark as delivered"
                          >
                            Mark Delivered
                          </button>

                          <button
                            onClick={() => {
                              setReassigningItem(item);
                              setSelectedDriverId(MOCK_DRIVERS[0]?.id || '');
                            }}
                            className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                            title="Reassign driver"
                          >
                            Reassign
                          </button>
                        </>
                      )}

                      <Link
                        href={`/rescue/${item.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition-colors"
                      >
                        <span>Track</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredDeliveries.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No deliveries found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Manual Delivered Modal */}
      {deliveringItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-base">Confirm Food Delivery</h3>
              </div>
              <button
                onClick={() => setDeliveringItem(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to mark Rescue <span className="font-bold text-slate-900">#{deliveringItem.id}</span> ({deliveringItem.foodName}) as <span className="font-bold text-emerald-700">DELIVERED</span>? This updates inventory metrics and sends confirmation to both donor and shelter.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeliveringItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmManualDelivery}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark Delivered</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reassign Driver Modal */}
      {reassigningItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-slate-900 text-base">Reassign Courier</h3>
              </div>
              <button
                onClick={() => setReassigningItem(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReassign} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase">Select Available Courier</label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                >
                  {MOCK_DRIVERS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} &bull; {d.vehicleType} ({d.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReassigningItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Update Courier</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
