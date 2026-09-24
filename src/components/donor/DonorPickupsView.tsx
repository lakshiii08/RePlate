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
  Copy,
  Check,
  AlertTriangle,
  FileSpreadsheet,
  RefreshCw,
  Share2,
  X,
  MessageSquareWarning,
} from 'lucide-react';
import { useRescue } from '@/context/RescueContext';
import { Donation } from '@/types';

export default function DonorPickupsView() {
  const { donations } = useRescue();
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'ALL' | 'ASSIGNED' | 'UNASSIGNED'>('ALL');
  const [reportingDelayItem, setReportingDelayItem] = useState<Donation | null>(null);
  const [delayReason, setDelayReason] = useState('Driver has not arrived after scheduled window');
  const [delayNotes, setDelayNotes] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const pendingPickups = useMemo(() => {
    return donations.filter(
      (d) =>
        d.status === 'POSTED' ||
        d.status === 'VERIFIED' ||
        d.status === 'MATCHED' ||
        d.status === 'DRIVER_ASSIGNED' ||
        d.status === 'PICKUP_IN_PROGRESS'
    );
  }, [donations]);

  const filteredPickups = useMemo(() => {
    return pendingPickups.filter((item) => {
      if (filterMode === 'ASSIGNED') return !!item.assignedDriver;
      if (filterMode === 'UNASSIGNED') return !item.assignedDriver && item.deliveryMode !== 'SELF_DRIVE';
      return true;
    });
  }, [pendingPickups, filterMode]);

  const handleCopyOtp = (otp: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(otp);
      setCopiedOtp(otp);
      setTimeout(() => setCopiedOtp(null), 2000);
      triggerToast(`OTP ${otp} copied to clipboard`);
    }
  };

  const handleCopyHandoverInstructions = (item: Donation) => {
    const text = `RePlate Pickup Handover Details:\nRescue ID: #${item.id}\nFood Item: ${item.foodName} (${item.quantity})\nPickup Address: ${item.donorAddress}\nHandover OTP: ${item.pickupOtp || '4829'}\nCourier: ${item.assignedDriver?.name || 'Assigned Courier'}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      triggerToast('Handover instructions copied for loading dock staff');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Rescue ID', 'Food Name', 'Quantity', 'Pickup Location', 'Assigned Driver', 'Driver Phone', 'Pickup Deadline', 'Handover OTP', 'Status'];
    const rows = pendingPickups.map((p) => [
      p.id,
      `"${p.foodName.replace(/"/g, '""')}"`,
      `"${p.quantity}"`,
      `"${p.donorAddress.replace(/"/g, '""')}"`,
      p.deliveryMode === 'SELF_DRIVE' ? 'Self-Drive' : p.assignedDriver?.name || 'Unassigned',
      p.assignedDriver?.phone || 'N/A',
      p.pickupDeadline || 'Scheduled',
      p.pickupOtp || '4829',
      p.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RePlate_Pickups_Manifest_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Pickup manifest exported to CSV');
  };

  const handleSubmitDelayReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingDelayItem) return;
    triggerToast(`Incident logged with Dispatch Admin for Rescue #${reportingDelayItem.id}. Support is rerouting.`);
    setReportingDelayItem(null);
    setDelayNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Pickup Requests & Driver Fleet</h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {pendingPickups.length} PENDING PICKUPS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor approaching couriers, scheduled pickup windows, vehicle details, and handover OTP codes.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200/80 w-fit text-xs font-bold">
        {[
          { key: 'ALL', label: `All Pickups (${pendingPickups.length})` },
          { key: 'ASSIGNED', label: 'Driver Assigned' },
          { key: 'UNASSIGNED', label: 'Awaiting Driver' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterMode(tab.key as any)}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterMode === tab.key
                ? 'bg-white text-slate-900 shadow-2xs font-black'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Pending Pickups (Lakshita MVP spec: Driver name & contact, Pickup time, status, location) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPickups.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Donation #{item.id}</span>
                  <h3 className="font-black text-slate-900 text-base">{item.foodName}</h3>
                  <p className="text-xs text-slate-500">{item.quantity} &bull; {item.category}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                  {item.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Driver Details */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-600" /> Driver Details
                </div>
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-slate-900 text-sm">
                    {item.deliveryMode === 'SELF_DRIVE'
                      ? 'Self-Drive (You)'
                      : item.assignedDriver?.name || 'Assigning volunteer driver...'}
                  </div>
                  {item.assignedDriver && (
                    <a
                      href={`tel:${item.assignedDriver.phone}`}
                      className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                      title="Call driver"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                {item.assignedDriver && (
                  <div className="text-[11px] text-slate-500">
                    {item.assignedDriver.vehicleType} &bull; Phone: {item.assignedDriver.phone}
                  </div>
                )}
              </div>

              {/* Pickup Time & Handover OTP */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" /> Pickup Time
                  </div>
                  <div className="font-bold text-slate-800">
                    {new Date(item.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-1">
                  <div className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-700" /> Handover OTP
                  </div>
                  <div className="flex items-center gap-1.5 font-mono font-black text-sm text-emerald-900">
                    <span>{item.pickupOtp || '4829'}</span>
                    <button
                      onClick={() => handleCopyOtp(item.pickupOtp || '4829')}
                      className="p-1 rounded text-emerald-700 hover:bg-emerald-100 transition-colors"
                      title="Copy OTP"
                    >
                      {copiedOtp === (item.pickupOtp || '4829') ? (
                        <Check className="w-3 h-3 text-emerald-800" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Pickup Location */}
              <div className="text-xs text-slate-600 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{item.donorAddress}</span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyHandoverInstructions(item)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 flex items-center gap-1 transition-colors"
                  title="Copy dock instructions"
                >
                  <Copy className="w-3 h-3 text-slate-500" /> Dock Slip
                </button>

                <button
                  onClick={() => setReportingDelayItem(item)}
                  className="px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-[11px] font-bold text-rose-700 flex items-center gap-1 transition-colors"
                >
                  <AlertTriangle className="w-3 h-3" /> Report Delay
                </button>
              </div>

              <Link
                href={`/rescue/${item.id}`}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                Track Live Map <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredPickups.length === 0 && (
        <div className="bg-slate-50 rounded-3xl border border-dashed border-slate-300 p-8 text-center text-slate-500 text-xs">
          No pending pickups scheduled under this filter.
        </div>
      )}

      {/* Report Delay / Incident Modal */}
      {reportingDelayItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquareWarning className="w-5 h-5 text-rose-600" />
                <h3 className="font-black text-slate-900 text-sm">Report Pickup Issue to Dispatch</h3>
              </div>
              <button
                onClick={() => setReportingDelayItem(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitDelayReport} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
                <span className="font-bold text-slate-900">Rescue #{reportingDelayItem.id}:</span> {reportingDelayItem.foodName}
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase">Reason for Alert</label>
                <select
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-900"
                >
                  <option value="Driver has not arrived after scheduled window">Driver late / not arrived</option>
                  <option value="Food is packed & waiting at kitchen dock">Food ready & urgent cold chain risk</option>
                  <option value="Gate code or access instructions changed">Access gate / kitchen entry issue</option>
                  <option value="Need to reschedule pickup window">Request alternate pickup time</option>
                  <option value="Other dock issue">Other kitchen dock concern</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase">Additional Notes for Courier</label>
                <textarea
                  rows={3}
                  value={delayNotes}
                  onChange={(e) => setDelayNotes(e.target.value)}
                  placeholder="e.g. Ring back door buzzer #4, food is packed in thermal totes..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportingDelayItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold flex items-center gap-1.5 shadow-xs"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Notify Dispatch Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
