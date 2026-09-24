'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRescue } from '@/context/RescueContext';
import RescueCountdown from '@/components/ui/RescueCountdown';
import { Donation } from '@/types';
import {
  Package,
  Eye,
  UserCheck,
  RefreshCw,
  XCircle,
  Clock,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Building2,
  Truck,
  Utensils,
} from 'lucide-react';

export default function RescueManagementView() {
  const { donations, updateDonation } = useRescue();
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [activeModal, setActiveModal] = useState<'VIEW' | 'ASSIGN' | 'TIMELINE' | null>(null);

  const handleReassignDriver = (donationId: string) => {
    updateDonation(donationId, {
      assignedDriver: {
        id: 'driver-2',
        name: 'Elena Rostova',
        phone: '+1 (555) 444-5566',
        vehicleType: 'EV Cargo Car',
        coords: [37.772, -122.422],
        status: 'AVAILABLE',
        rating: 4.8,
        etaToDonorMinutes: 9,
        deliveriesCompleted: 98,
      },
      status: 'DRIVER_ASSIGNED',
    });
    alert('Driver successfully reassigned to Elena Rostova (EV Cargo)');
  };

  const handleCancelRescue = (donationId: string) => {
    if (confirm('Are you sure you want to cancel this rescue operation?')) {
      updateDonation(donationId, { status: 'CANCELLED' });
    }
  };

  // Section 10 Timestamped timeline events
  const timelineEvents = [
    { time: '10:20 AM', title: 'Donation Posted', desc: 'Donor declared 50 Paneer Rice meals via AI fast-parser.' },
    { time: '10:21 AM', title: 'Safety Verified', desc: '100% Deterministic Safety Gate criteria passed.' },
    { time: '10:22 AM', title: 'Shelter Matched', desc: 'Hope Community Shelter matched (Feasibility 94%).' },
    { time: '10:23 AM', title: 'Driver Assigned', desc: 'Volunteer courier Aarav Patel accepted dispatch.' },
    { time: '10:31 AM', title: 'Pickup Confirmed', desc: 'Thermal audit verified at 65.5°C.' },
    { time: '10:48 AM', title: 'Delivered', desc: 'Recipient signed handover certificate.' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">📦 Rescue Management</h1>
          <p className="text-xs text-slate-500">
            Comprehensive table of all active & past rescue operations with admin controls & audit timeline
          </p>
        </div>

        <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200">
          {donations.length} Total Rescue Records
        </span>
      </div>

      {/* SECTION 3 REQUIRED RESCUE DATA TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 font-bold text-slate-500 border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Food</th>
                <th className="p-4">Donor</th>
                <th className="p-4">Shelter</th>
                <th className="p-4">Driver</th>
                <th className="p-4">ETA</th>
                <th className="p-4">Time Left</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {donations.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-bold text-slate-900">
                    <div>{item.foodName}</div>
                    <div className="text-[10px] text-slate-400 font-normal">#{item.id} &bull; {item.quantity}</div>
                  </td>
                  <td className="p-4 font-medium text-slate-800">{item.donorName}</td>
                  <td className="p-4 font-bold text-blue-700">{item.matchedShelter?.name || 'Unmatched'}</td>
                  <td className="p-4 font-bold text-amber-700">{item.assignedDriver?.name || 'Unassigned'}</td>
                  <td className="p-4 font-mono font-bold">
                    {item.assignedDriver ? `${item.assignedDriver.etaToDonorMinutes} mins` : 'N/A'}
                  </td>
                  <td className="p-4 font-mono">
                    <RescueCountdown deadline={item.pickupDeadline} compact />
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        item.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'POSTED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {item.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1.5">
                    <button
                      onClick={() => {
                        setSelectedDonation(item);
                        setActiveModal('TIMELINE');
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px]"
                    >
                      📜 Timeline
                    </button>
                    <button
                      onClick={() => handleReassignDriver(item.id)}
                      className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-lg text-[11px]"
                    >
                      Reassign
                    </button>
                    <button
                      onClick={() => handleCancelRescue(item.id)}
                      className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-lg text-[11px]"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 10 RESCUE TIMELINE MODAL */}
      {activeModal === 'TIMELINE' && selectedDonation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400">RESCUE OPERATIONAL LOG</span>
                <h3 className="font-extrabold text-slate-900 text-base">
                  📜 Timeline — Rescue #{selectedDonation.id}
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <strong>Food Item:</strong> {selectedDonation.foodName} ({selectedDonation.quantity})
              </div>

              {/* SECTION 10 REQUIRED TIMESTAMPED TIMELINE */}
              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-500">
                {timelineEvents.map((evt, idx) => (
                  <div key={idx} className="flex items-start gap-3 relative z-10 text-xs">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                      ✓
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-800">{evt.time}</span>
                        <span className="font-extrabold text-slate-900">{evt.title}</span>
                      </div>
                      <p className="text-slate-500 leading-normal">{evt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl"
            >
              Close Audit Log
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
