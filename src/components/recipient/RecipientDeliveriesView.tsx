'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Truck,
  User,
  Phone,
  Clock,
  KeyRound,
  MapPin,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Check,
  X,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react';
import { useRescue } from '@/context/RescueContext';
import { Donation } from '@/types';
import RescueCountdown from '@/components/ui/RescueCountdown';

export default function RecipientDeliveriesView() {
  const { donations, updateDonation } = useRescue();

  const [receivingItem, setReceivingItem] = useState<Donation | null>(null);
  const [intakeTemp, setIntakeTemp] = useState('4.0');
  const [intakeCondition, setIntakeCondition] = useState('Sealed Food-Grade Containers Intact');
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Deliveries in progress (status DRIVER_ASSIGNED, PICKUP_IN_PROGRESS, PICKED_UP, IN_TRANSIT, or MATCHED)
  const incomingDeliveries = useMemo(() => {
    return donations.filter(
      (d) =>
        d.status === 'DRIVER_ASSIGNED' ||
        d.status === 'PICKUP_IN_PROGRESS' ||
        d.status === 'PICKED_UP' ||
        d.status === 'IN_TRANSIT' ||
        (d.status === 'MATCHED' && d.deliveryMode === 'SELF_DRIVE')
    );
  }, [donations]);

  // Export Deliveries CSV
  const handleExportCSV = () => {
    const headers = ['Rescue ID', 'Food Name', 'Quantity', 'Donor Facility', 'Pickup Address', 'Driver Name', 'Driver Phone', 'Vehicle', 'ETA Deadline', 'Handover OTP'];
    const rows = incomingDeliveries.map((d) => [
      d.id,
      `"${d.foodName.replace(/"/g, '""')}"`,
      `"${d.quantity}"`,
      `"${d.donorName.replace(/"/g, '""')}"`,
      `"${d.donorAddress.replace(/"/g, '""')}"`,
      d.deliveryMode === 'SELF_DRIVE' ? 'Donor Self-Delivery' : d.assignedDriver?.name || 'Assigned Courier',
      d.assignedDriver?.phone || 'N/A',
      d.assignedDriver?.vehicleType || 'Courier',
      d.pickupDeadline || 'Scheduled',
      d.pickupOtp || '4829',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RePlate_Incoming_Deliveries_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Deliveries manifest exported to CSV');
  };

  // Confirm Reception
  const handleConfirmReceived = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivingItem) return;

    updateDonation(receivingItem.id, {
      status: 'DELIVERED',
    });

    triggerToast(`Food batch #${receivingItem.id} safely received and logged into pantry records!`);
    setReceivingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Incoming Deliveries & Courier Fleet</h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {incomingDeliveries.length} IN TRANSIT
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor approaching couriers in real time, view vehicle manifests, and verify food intake temperatures upon arrival.
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

      {/* Grid of Incoming Deliveries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {incomingDeliveries.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4 flex flex-col justify-between hover:border-blue-300 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">Rescue ID: #{item.id}</span>
                  <h3 className="font-black text-slate-900 text-base">{item.foodName}</h3>
                  <p className="text-xs text-slate-500 font-semibold">{item.quantity} &bull; {item.category}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200 animate-pulse">
                  {item.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Driver Details */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-600" /> Driver & Vehicle
                </div>
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-slate-900 text-sm">
                    {item.deliveryMode === 'SELF_DRIVE' ? 'Donor Direct Delivery' : item.assignedDriver?.name || 'Assigning volunteer driver...'}
                  </div>
                  {item.assignedDriver && (
                    <a
                      href={`tel:${item.assignedDriver.phone}`}
                      className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors text-xs font-bold flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" /> Call
                    </a>
                  )}
                </div>
                {item.assignedDriver && (
                  <div className="text-[11px] text-slate-500">
                    {item.assignedDriver.vehicleType} &bull; Phone: {item.assignedDriver.phone}
                  </div>
                )}
              </div>

              {/* Timing & Handover Code */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" /> Target ETA
                  </div>
                  <div className="font-black text-slate-900">
                    {new Date(item.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <RescueCountdown deadline={item.pickupDeadline} compact />
                </div>

                <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-1">
                  <div className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-700" /> Handover OTP
                  </div>
                  <div className="font-mono font-black text-sm text-emerald-900">
                    {item.pickupOtp || '4829'}
                  </div>
                  <div className="text-[10px] text-emerald-700">Driver presents on arrival</div>
                </div>
              </div>

              {/* Location Route */}
              <div className="space-y-1 text-xs text-slate-600 bg-slate-50/60 p-3 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-[10px] font-bold text-slate-400 uppercase w-12">Pickup:</span>
                  <span className="font-semibold truncate">{item.donorName}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-[10px] font-bold text-slate-400 uppercase w-12">Drop:</span>
                  <span className="font-semibold text-emerald-800 truncate">Your Kitchen Intake Dock</span>
                </div>
              </div>
            </div>

            {/* Actions Bar (Flow step 4 -> step 5) */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <Link
                href={`/rescue/${item.id}`}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1"
              >
                <span>Live GPS Map</span>
                <ExternalLink className="w-3 h-3" />
              </Link>

              {/* Action Button: Confirm Food Received */}
              <button
                onClick={() => setReceivingItem(item)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs transition-colors shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Food Received</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {incomingDeliveries.length === 0 && (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-400 text-xs space-y-2">
          <Truck className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-600">No incoming food deliveries currently in transit.</p>
          <p className="text-slate-400">Request available surplus food from the Browse Food tab to initiate dispatches.</p>
          <Link
            href="/recipient/browse"
            className="inline-block mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
          >
            Browse Available Food
          </Link>
        </div>
      )}

      {/* Reception Verification Modal (Main flow: Delivery -> Received) */}
      {receivingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-base">Intake Delivery Verification</h3>
              </div>
              <button
                onClick={() => setReceivingItem(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReceived} className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="font-black text-slate-900 text-sm">
                  #{receivingItem.id} &bull; {receivingItem.foodName}
                </div>
                <div className="text-slate-600">
                  {receivingItem.quantity} from {receivingItem.donorName}
                </div>
                <div className="text-[11px] text-slate-500">
                  Delivered by: {receivingItem.assignedDriver?.name || 'Volunteer Courier'}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase">
                  Dock Temperature Probe Reading (°C) *
                </label>
                <input
                  type="text"
                  required
                  value={intakeTemp}
                  onChange={(e) => setIntakeTemp(e.target.value)}
                  placeholder="e.g. 4.2"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900"
                />
                <p className="text-[10px] text-slate-400">Cold chain threshold: &lt; 5°C. Hot-held threshold: &gt; 60°C.</p>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase">
                  Packaging Condition & Integrity
                </label>
                <select
                  value={intakeCondition}
                  onChange={(e) => setIntakeCondition(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                >
                  <option value="Sealed Food-Grade Containers Intact">Sealed Food-Grade Containers Intact</option>
                  <option value="Covered Sheet Trays Verified Clean">Covered Sheet Trays Verified Clean</option>
                  <option value="Individual Meal Boxes Undamaged">Individual Meal Boxes Undamaged</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReceivingItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Reception & Sign Off</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
