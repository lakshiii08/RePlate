'use client';

import React from 'react';
import Link from 'next/link';
import { useRescue } from '@/context/RescueContext';
import RescueCountdown from '@/components/ui/RescueCountdown';
import {
  Utensils,
  Plus,
  Clock,
  Truck,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export default function DonorDashboardPage() {
  const { donations } = useRescue();

  const activeDonations = donations.filter((d) => d.status !== 'DELIVERED' && d.status !== 'CANCELLED');
  const completedDonations = donations.filter((d) => d.status === 'DELIVERED');
  const activeRescue = activeDonations[0]; // Primary highlighted rescue card

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Donor Rescue Operations</h1>
          <p className="text-xs text-slate-500">
            Grand Hyatt Catering &bull; Real-time surplus rescue monitoring
          </p>
        </div>

        <Link
          href="/donor/donations/new"
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Post New Surplus Food
        </Link>
      </div>

      {/* 1. OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>ACTIVE DONATIONS</span>
            <Utensils className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{activeDonations.length}</div>
          <div className="text-[11px] text-emerald-600 font-medium">In active rescue queue</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>MEALS RESCUED</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">1,850</div>
          <div className="text-[11px] text-slate-500 font-medium">This month alone</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>COMPLETED RESCUES</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{completedDonations.length + 42}</div>
          <div className="text-[11px] text-slate-500 font-medium">100% verified safety</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>FOOD SAVED</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">820 kg</div>
          <div className="text-[11px] text-slate-500 font-medium">CO2 offset: ~2,050 kg</div>
        </div>
      </div>

      {/* 2. ACTIVE RESCUE HIGHLIGHT SECTION */}
      {activeRescue ? (
        <div className="bg-white rounded-2xl border border-emerald-300 shadow-md p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-extrabold uppercase text-emerald-700 tracking-wider">
                  ACTIVE RESCUE IN PROGRESS (#{activeRescue.id})
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">{activeRescue.foodName}</h2>
              <p className="text-xs text-slate-500">{activeRescue.quantity} &bull; {activeRescue.category}</p>
            </div>

            <div className="shrink-0">
              <RescueCountdown deadline={activeRescue.pickupDeadline} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <div className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Pickup Location
              </div>
              <div className="font-bold text-slate-800">{activeRescue.donorAddress}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <div className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-600" /> Destination Shelter
              </div>
              <div className="font-bold text-slate-800">{activeRescue.matchedShelter?.name || 'Finding Shelter...'}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <div className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-amber-600" /> Assigned Driver
              </div>
              <div className="font-bold text-slate-800">{activeRescue.assignedDriver?.name || 'Dispatching...'}</div>
              {activeRescue.assignedDriver && (
                <div className="text-[10px] text-slate-500">ETA: {activeRescue.assignedDriver.etaToDonorMinutes} mins</div>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 flex flex-col justify-between">
              <div className="text-slate-400 font-bold uppercase text-[10px]">Rescue Status</div>
              <div className="font-black text-emerald-600">{activeRescue.status.replace(/_/g, ' ')}</div>
              <Link
                href={`/rescue/${activeRescue.id}`}
                className="mt-2 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-center rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                Track Live Map <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
          <Utensils className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700">No active rescues right now</h3>
          <p className="text-xs text-slate-500">Post surplus food to trigger sub-minute rescue matching.</p>
          <Link
            href="/donor/donations/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700"
          >
            <Plus className="w-3.5 h-3.5" /> Post Surplus Food
          </Link>
        </div>
      )}

      {/* 3. RECENT DONATIONS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-base">Donation History & Queue</h3>
          <span className="text-xs text-slate-400">{donations.length} total entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 font-bold text-slate-500 border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Donation</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Status</th>
                <th className="p-4">Matched Shelter</th>
                <th className="p-4">Driver</th>
                <th className="p-4">Deadline</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {donations.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-bold text-slate-900">
                    <div>{item.foodName}</div>
                    <div className="text-[10px] text-slate-400 font-normal">#{item.id}</div>
                  </td>
                  <td className="p-4">{item.quantity}</td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
                  <td className="p-4">{item.matchedShelter?.name || 'Pending Match'}</td>
                  <td className="p-4">{item.assignedDriver?.name || 'Unassigned'}</td>
                  <td className="p-4 font-mono">
                    <RescueCountdown deadline={item.pickupDeadline} compact />
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Link
                      href={`/rescue/matching/${item.id}`}
                      className="text-emerald-600 font-bold hover:underline"
                    >
                      Matching Engine
                    </Link>
                    <span className="text-slate-300">&bull;</span>
                    <Link
                      href={`/rescue/${item.id}`}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Track
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
