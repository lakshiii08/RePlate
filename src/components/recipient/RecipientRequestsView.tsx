'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  Building2,
  Phone,
  ExternalLink,
  Check,
  X,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useRescue } from '@/context/RescueContext';
import { Donation } from '@/types';

export default function RecipientRequestsView() {
  const { donations, updateDonation } = useRescue();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'COMPLETED'>('ALL');
  const [cancelingItem, setCancelingItem] = useState<Donation | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Recipient's requests are items that are in MATCHING, RE_MATCHING, MATCHED, DRIVER_ASSIGNED, etc.
  const myRequests = useMemo(() => {
    return donations.filter(
      (d) =>
        d.status !== 'POSTED' &&
        d.status !== 'VERIFIED'
    );
  }, [donations]);

  const filteredRequests = useMemo(() => {
    return myRequests.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.foodName.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.donorName.toLowerCase().includes(q);

      if (statusFilter === 'PENDING') {
        return matchesSearch && (item.status === 'MATCHING' || item.status === 'RE_MATCHING');
      }
      if (statusFilter === 'APPROVED') {
        return (
          matchesSearch &&
          (item.status === 'MATCHED' ||
            item.status === 'DRIVER_ASSIGNED' ||
            item.status === 'PICKUP_IN_PROGRESS' ||
            item.status === 'IN_TRANSIT')
        );
      }
      if (statusFilter === 'COMPLETED') {
        return matchesSearch && item.status === 'DELIVERED';
      }
      return matchesSearch;
    });
  }, [myRequests, searchQuery, statusFilter]);

  const handleConfirmCancel = () => {
    if (!cancelingItem) return;
    // Release donation back to pool
    updateDonation(cancelingItem.id, {
      status: 'POSTED',
      matchedShelter: undefined,
    });
    triggerToast(`Request for #${cancelingItem.id} cancelled and released back to available food`);
    setCancelingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Food Intake Requests</h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {myRequests.length} ACTIVE & PAST REQUESTS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Track requested surplus batches, monitor approval status, and manage courier routing.
          </p>
        </div>

        <Link
          href="/recipient/browse"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
        >
          <Search className="w-3.5 h-3.5" />
          <span>+ Request New Food</span>
        </Link>
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
              placeholder="Search request by food name, donor, or ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0 text-xs font-bold">
            {[
              { id: 'ALL', label: 'All Requests' },
              { id: 'APPROVED', label: 'Approved / Active' },
              { id: 'PENDING', label: 'Pending Review' },
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

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400">Request #{item.id}</span>
                  {item.foodType && (
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                        item.foodType === 'Veg' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.foodType}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-black text-slate-900 mt-0.5">{item.foodName}</h3>
                <p className="text-xs text-slate-500 font-semibold">{item.quantity} &bull; {item.category}</p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.status === 'DELIVERED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.status === 'MATCHED' || item.status === 'DRIVER_ASSIGNED'
                      ? 'bg-blue-100 text-blue-800'
                      : item.status === 'IN_TRANSIT'
                      ? 'bg-indigo-100 text-indigo-800 animate-pulse'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {item.status === 'MATCHED' ? 'APPROVED' : item.status.replace(/_/g, ' ')}
                </span>

                {item.status !== 'DELIVERED' && (
                  <button
                    onClick={() => setCancelingItem(item)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Cancel request"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" /> Donor Kitchen
                </div>
                <div className="font-extrabold text-slate-900">{item.donorName}</div>
                <div className="text-[11px] text-slate-500 truncate">{item.donorAddress}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" /> Fulfillment Status
                </div>
                <div className="font-extrabold text-slate-900">
                  {item.deliveryMode === 'SELF_DRIVE'
                    ? 'Donor Self-Delivery'
                    : item.assignedDriver?.name || 'Assigning Volunteer Courier'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {item.assignedDriver ? item.assignedDriver.vehicleType : 'Standard route matching'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> Delivery Target
                </div>
                <div className="font-extrabold text-slate-900">
                  {new Date(item.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold">
                  Handover OTP: {item.pickupOtp || '4829'}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Created: {new Date(item.createdAt).toLocaleDateString()}
              </span>

              <div className="flex items-center gap-2">
                <Link
                  href="/recipient/deliveries"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Track Delivery</span>
                </Link>

                <Link
                  href={`/rescue/${item.id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Live Map</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        ))}

        {filteredRequests.length === 0 && (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-400 text-xs space-y-2">
            <ClipboardList className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-600">No requests found under this filter.</p>
            <p className="text-slate-400">Browse nearby surplus food to request incoming donations.</p>
            <Link
              href="/recipient/browse"
              className="inline-block mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
            >
              Browse Food
            </Link>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <h3 className="font-black text-slate-900 text-base">Cancel Food Request</h3>
              </div>
              <button
                onClick={() => setCancelingItem(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel your request for <span className="font-bold text-slate-900">{cancelingItem.foodName}</span>? The food will be released back to the community pool for other shelters to claim.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelingItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Keep Request
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-xs"
              >
                Yes, Cancel Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
