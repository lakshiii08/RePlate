'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Utensils,
  Search,
  ClipboardList,
  Truck,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Phone,
  RefreshCw,
  Package,
  ArrowRight,
  Check,
  ShieldCheck,
  MapPin,
  X,
} from 'lucide-react';
import { useRescue } from '@/context/RescueContext';
import { useAuth } from '@/context/AuthContext';
import RescueCountdown from '@/components/ui/RescueCountdown';
import { Donation } from '@/types';

export default function RecipientDashboardView() {
  const { donations, refreshDonations, updateDonation } = useRescue();
  const { user } = useAuth();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [receivingItem, setReceivingItem] = useState<Donation | null>(null);
  const [intakeTemp, setIntakeTemp] = useState('4.2');
  const [intakeCondition, setIntakeCondition] = useState('Good Condition - Containers Sealed');
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshDonations();
    setTimeout(() => {
      setIsRefreshing(false);
      triggerToast('Intake dashboard refreshed');
    }, 400);
  };

  // 1. Food Available (Unclaimed surplus food)
  const availableFood = useMemo(
    () => donations.filter((d) => d.status === 'POSTED' || d.status === 'VERIFIED'),
    [donations]
  );

  // 2. Active Requests (Claimed or awaiting dispatch)
  const activeRequests = useMemo(
    () =>
      donations.filter(
        (d) =>
          d.status === 'MATCHING' ||
          d.status === 'RE_MATCHING' ||
          (d.status === 'MATCHED' && !d.assignedDriver)
      ),
    [donations]
  );

  // 3. Upcoming Deliveries (Driver assigned or in transit)
  const upcomingDeliveries = useMemo(
    () =>
      donations.filter(
        (d) =>
          d.status === 'DRIVER_ASSIGNED' ||
          d.status === 'PICKUP_IN_PROGRESS' ||
          d.status === 'PICKED_UP' ||
          d.status === 'IN_TRANSIT'
      ),
    [donations]
  );

  // 4. Completed / History
  const completedIntakes = useMemo(
    () => donations.filter((d) => d.status === 'DELIVERED'),
    [donations]
  );

  const totalMealsReceived = completedIntakes.reduce((acc, d) => acc + (d.mealCount || 0), 0);
  const totalWeightKg = Math.round(totalMealsReceived * 0.45);

  // Next arriving delivery spotlight
  const nextDelivery = upcomingDeliveries[0];

  // Confirm Intake reception
  const handleConfirmReceived = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivingItem) return;

    updateDonation(receivingItem.id, {
      status: 'DELIVERED',
    });

    triggerToast(`Intake confirmed for #${receivingItem.id} (${receivingItem.foodName}). Impact metrics updated!`);
    setReceivingItem(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Recipient Operations Dashboard</h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              COMMUNITY INTAKE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {user?.organization || 'Hope Community Shelter & Kitchen'} &bull; Managed by {user?.name || 'Maria Santos (Intake Lead)'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
            title="Refresh intake feed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          <Link
            href="/recipient/browse"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Browse Available Food</span>
          </Link>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Flow Visual Guide Stepper (Lakshita MVP Flow: Browse Food -> Request -> Approved -> Delivery -> Received -> Impact) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Recipient Food Rescue Lifecycle
          </span>
          <span className="text-[11px] text-slate-400">Click any stage to navigate</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {[
            { step: '1', title: 'Browse Food', sub: `${availableFood.length} batches nearby`, href: '/recipient/browse', color: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
            { step: '2', title: 'Request', sub: `${activeRequests.length} in review`, href: '/recipient/requests', color: 'bg-amber-50 border-amber-200 text-amber-900' },
            { step: '3', title: 'Approved', sub: 'Instant matching', href: '/recipient/requests?filter=APPROVED', color: 'bg-blue-50 border-blue-200 text-blue-900' },
            { step: '4', title: 'Delivery', sub: `${upcomingDeliveries.length} in transit`, href: '/recipient/deliveries', color: 'bg-indigo-50 border-indigo-200 text-indigo-900' },
            { step: '5', title: 'Received', sub: 'Dock verification', href: '/recipient/deliveries', color: 'bg-teal-50 border-teal-200 text-teal-900' },
            { step: '6', title: 'Impact', sub: `${totalMealsReceived} meals served`, href: '/recipient/impact', color: 'bg-purple-50 border-purple-200 text-purple-900' },
          ].map((item) => (
            <Link
              key={item.step}
              href={item.href}
              className={`p-3 rounded-2xl border transition-all hover:scale-102 flex flex-col justify-between ${item.color}`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono font-bold opacity-60">
                <span>STEP {item.step}</span>
                <ChevronRight className="w-3 h-3" />
              </div>
              <div className="mt-2">
                <div className="font-black text-xs">{item.title}</div>
                <div className="text-[10px] opacity-80 mt-0.5">{item.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 3 CORE METRICS from Lakshita MVP spec: Food available, active requests, upcoming deliveries */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Food Available */}
        <Link
          href="/recipient/browse"
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all space-y-1 group"
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Food Available</span>
            <Search className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-slate-900">{availableFood.length}</div>
          <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <span>Surplus food ready to claim</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </Link>

        {/* 2. Active Requests */}
        <Link
          href="/recipient/requests"
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs hover:border-amber-300 transition-all space-y-1 group"
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Active Requests</span>
            <ClipboardList className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-amber-600">{activeRequests.length}</div>
          <div className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
            <span>Pending or auto-matching</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </Link>

        {/* 3. Upcoming Deliveries */}
        <Link
          href="/recipient/deliveries"
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all space-y-1 group"
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Upcoming Deliveries</span>
            <Truck className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-blue-600">{upcomingDeliveries.length}</div>
          <div className="text-[11px] text-blue-700 font-semibold flex items-center gap-1">
            <span>En route to kitchen dock</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </Link>

        {/* 4. Total Meals Received */}
        <Link
          href="/recipient/history"
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-all space-y-1 group"
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Meals Received</span>
            <Utensils className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-slate-900">{totalMealsReceived.toLocaleString()}</div>
          <div className="text-[11px] text-indigo-700 font-semibold">
            {totalWeightKg.toLocaleString()} kg total diverted
          </div>
        </Link>
      </div>

      {/* UPCOMING DELIVERY SPOTLIGHT CARD */}
      {nextDelivery ? (
        <div className="bg-gradient-to-br from-white to-blue-50/40 rounded-3xl border border-blue-200 shadow-2xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                <span className="text-[11px] font-extrabold uppercase text-blue-900 tracking-wider">
                  Approaching Courier &bull; #{nextDelivery.id}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                {nextDelivery.foodName}
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {nextDelivery.quantity}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Originating from: <span className="font-semibold text-slate-800">{nextDelivery.donorName}</span> ({nextDelivery.donorAddress})
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <RescueCountdown deadline={nextDelivery.pickupDeadline} />
              <button
                onClick={() => setReceivingItem(nextDelivery)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-colors shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Food Received</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-white rounded-2xl border border-blue-100 shadow-2xs space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Assigned Courier</div>
              <div className="font-black text-slate-900 text-sm">
                {nextDelivery.deliveryMode === 'SELF_DRIVE' ? 'Donor Self-Delivery' : nextDelivery.assignedDriver?.name || 'Volunteer Courier'}
              </div>
              {nextDelivery.assignedDriver && (
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                  <span>{nextDelivery.assignedDriver.vehicleType}</span>
                  <a
                    href={`tel:${nextDelivery.assignedDriver.phone}`}
                    className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" /> Call
                  </a>
                </div>
              )}
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-blue-100 shadow-2xs space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Dietary & Safety</div>
              <div className="font-black text-slate-900 text-sm">{nextDelivery.category} &bull; {nextDelivery.foodType || 'Standard'}</div>
              <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Thermal probe compliant
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-blue-100 shadow-2xs space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Handover Verification</div>
              <div className="font-mono font-black text-slate-900 text-sm">OTP: {nextDelivery.pickupOtp || '4829'}</div>
              <Link
                href={`/rescue/${nextDelivery.id}`}
                className="text-[11px] text-blue-700 font-bold hover:underline flex items-center gap-1 pt-1"
              >
                Track Live GPS Map <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {/* PREVIEW: Nearby Available Food Ready to Claim */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" />
              Available Surplus Food Near You
            </h2>
            <p className="text-xs text-slate-500">
              Fresh surplus food posted by local restaurants and hotels waiting for community claim.
            </p>
          </div>

          <Link
            href="/recipient/browse"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
          >
            <span>View All ({availableFood.length})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {availableFood.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between hover:shadow-xs transition-shadow"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400">#{item.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                      item.foodType === 'Veg' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.foodType || 'Standard'}
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-slate-900 text-sm">{item.foodName}</h3>
                  <div className="text-xs text-slate-500">{item.quantity} &bull; {item.category}</div>
                </div>

                <div className="text-xs text-slate-600 flex items-center gap-1 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{item.donorName}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-amber-700 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Ready for intake</span>
                </div>

                <Link
                  href="/recipient/browse"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-colors shadow-2xs"
                >
                  Claim Food
                </Link>
              </div>
            </div>
          ))}

          {availableFood.length === 0 && (
            <div className="col-span-3 bg-slate-50 rounded-3xl border border-dashed border-slate-200 p-8 text-center text-slate-400 text-xs">
              No surplus food currently listed for immediate claim. Check back soon or configure auto-match alert preferences.
            </div>
          )}
        </div>
      </div>

      {/* Confirm Food Received Modal */}
      {receivingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-base">Confirm Food Intake</h3>
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
                <div className="font-extrabold text-slate-900 text-sm">
                  #{receivingItem.id} &bull; {receivingItem.foodName}
                </div>
                <div className="text-slate-500">
                  {receivingItem.quantity} from {receivingItem.donorName}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase">
                  Arrival Temperature Reading (°C) *
                </label>
                <input
                  type="text"
                  required
                  value={intakeTemp}
                  onChange={(e) => setIntakeTemp(e.target.value)}
                  placeholder="e.g. 4.0 for chilled, 63.5 for hot-held"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900"
                />
                <p className="text-[10px] text-slate-400">Standard: Chilled &lt; 5°C, Hot-held &gt; 60°C.</p>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase">
                  Packaging & Seal Verification
                </label>
                <select
                  value={intakeCondition}
                  onChange={(e) => setIntakeCondition(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                >
                  <option value="Good Condition - Containers Sealed">Good Condition &bull; Containers Intact & Sealed</option>
                  <option value="Acceptable - Minor Outer Box Wear">Acceptable &bull; Clean Packaging Verified</option>
                  <option value="Direct Kitchen Hot Trays Verified">Direct Kitchen Hot Trays Verified</option>
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
                  <span>Confirm Safe Intake</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
