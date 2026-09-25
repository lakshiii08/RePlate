'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  UtensilsCrossed,
  Clock,
  MapPin,
  Building2,
  Sparkles,
  CheckCircle2,
  Plus,
  Check,
  X,
  Filter,
  ArrowRight,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { useRescue } from '@/context/RescueContext';
import { useAuth } from '@/context/AuthContext';
import { rescueService } from '@/services/rescueService';
import { Donation, FoodCategory } from '@/types';
import RescueCountdown from '@/components/ui/RescueCountdown';

export default function RecipientBrowseFoodView() {
  const { donations, updateDonation } = useRescue();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'Veg' | 'Non-Veg'>('ALL');

  // Request / Claim Modal State
  const [requestingItem, setRequestingItem] = useState<Donation | null>(null);
  const [intakeNotes, setIntakeNotes] = useState('');
  const [intakePortion, setIntakePortion] = useState('FULL');
  const [customMeals, setCustomMeals] = useState('30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Available surplus food (status POSTED or VERIFIED or unassigned)
  const availableFood = useMemo(() => {
    return donations.filter((d) => d.status === 'POSTED' || d.status === 'VERIFIED');
  }, [donations]);

  const filteredFood = useMemo(() => {
    return availableFood.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.foodName.toLowerCase().includes(q) ||
        item.donorName.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.specialNotes && item.specialNotes.toLowerCase().includes(q));

      const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
      const matchesType = typeFilter === 'ALL' || item.foodType === typeFilter;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [availableFood, searchQuery, categoryFilter, typeFilter]);

  // Handle Submit Claim/Request
  const handleConfirmRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestingItem) return;

    setIsSubmitting(true);
    try {
      // Transition from Browse Food -> Request/Matched
      const recipientOrgName = user?.organization || 'Hope Community Kitchen';
      const recipientAddress = user?.address || '452 Elm Street, Tenderloin, San Francisco, CA';

      // Create live rescue mission in MongoDB & calculate Mapbox route
      let createdRescue = null;
      try {
        const res = await rescueService.createRescue(requestingItem.id, user?.id || 'shelter-1');
        if (res && res.rescue) {
          createdRescue = res.rescue;
        }
      } catch (apiErr) {
        console.warn('Backend rescue sync warning (fallback active):', apiErr);
      }

      updateDonation(requestingItem.id, {
        status: 'MATCHED',
        pickupOtp: createdRescue?.pickupOtp || requestingItem.pickupOtp,
        deliveryOtp: createdRescue?.deliveryOtp || requestingItem.deliveryOtp,
        matchedShelter: {
          id: user?.id || 'sh-hope-1',
          name: recipientOrgName,
          address: recipientAddress,
          coords: [37.7749, -122.4194],
          capacityMeals: user?.intakeCapacity || 140,
          currentNeeds: ['Cooked Meal', 'Bakery', 'Fresh Produce'],
          distanceKm: createdRescue?.route?.distanceKm || 2.1,
          etaMinutes: createdRescue?.route?.durationMinutes || 12,
          contactPhone: user?.phone || '+1 (415) 890-4432',
        },
        specialNotes: intakeNotes.trim()
          ? `${requestingItem.specialNotes || ''} | Shelter Note: ${intakeNotes.trim()}`
          : requestingItem.specialNotes,
      });

      triggerToast(`Request submitted for ${requestingItem.foodName}! Routed to dispatch courier.`);
      setRequestingItem(null);
      setIntakeNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Browse Nearby Surplus Food</h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {availableFood.length} PACKAGES AVAILABLE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover verified surplus batches from restaurants, hotel banquets, bakeries, and grocers ready for community claim.
          </p>
        </div>

        <Link
          href="/recipient/requests"
          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
        >
          <span>View My Active Requests</span>
          <ArrowRight className="w-3.5 h-3.5" />
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
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by food name, donor restaurant, ingredients, or location..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:bg-white"
            >
              <option value="ALL">All Categories</option>
              <option value="Meal">Meals & Entrees</option>
              <option value="Bakery">Bakery & Breads</option>
              <option value="Fruits">Produce & Fruits</option>
              <option value="Other">Other / Groceries</option>
            </select>

            {/* Food Type */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:bg-white"
            >
              <option value="ALL">All Food Types</option>
              <option value="Veg">Vegetarian Only</option>
              <option value="Non-Veg">Non-Vegetarian</option>
            </select>
          </div>
        </div>
      </div>

      {/* Food Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFood.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Photo or Image banner */}
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                {item.photos && item.photos[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.photos[0]} alt={item.foodName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                    <UtensilsCrossed className="w-10 h-10" />
                  </div>
                )}

                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-white/95 backdrop-blur-md text-slate-800 shadow-xs">
                    {item.category}
                  </span>
                  {item.foodType && (
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold shadow-xs ${
                        item.foodType === 'Veg' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                      }`}
                    >
                      {item.foodType}
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-600 text-white shadow-xs">
                    AVAILABLE
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3">
                <div>
                  <div className="text-[10px] font-mono text-slate-400">ID: #{item.id}</div>
                  <h3 className="font-black text-slate-900 text-base leading-snug mt-0.5">{item.foodName}</h3>
                  <div className="text-xs font-bold text-emerald-700 mt-1">
                    {item.quantity} &bull; ~{item.mealCount || 30} meals
                  </div>
                </div>

                {/* Donor details */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" /> Donor Facility
                  </div>
                  <div className="font-bold text-slate-900 truncate">{item.donorName}</div>
                  <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{item.donorAddress}</span>
                  </div>
                </div>

                {/* Expiry / Prepared Time */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Prepared</div>
                    <div className="font-semibold text-slate-800">{item.prepTime || 'Today, 11:30 AM'}</div>
                  </div>

                  <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200">
                    <div className="text-[10px] text-amber-800 font-bold uppercase">Pickup By</div>
                    <div className="font-bold text-amber-900">
                      {new Date(item.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {item.specialNotes && (
                  <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    &ldquo;{item.specialNotes}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Claim Action Button (Step 1 -> Step 2 in flow) */}
            <div className="p-5 pt-0">
              <button
                onClick={() => setRequestingItem(item)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Request & Claim Food</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredFood.length === 0 && (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-400 text-xs space-y-2">
          <UtensilsCrossed className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-600">No surplus food currently matches your search filters.</p>
          <p className="text-slate-400">Try widening your category filters or check back in a few minutes.</p>
        </div>
      )}

      {/* Request Food Modal (Browse Food -> Request in main flow) */}
      {requestingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Request Surplus Food Batch</h3>
                  <p className="text-[11px] text-slate-400">Step 2: Reserve food and initiate dispatch</p>
                </div>
              </div>
              <button
                onClick={() => setRequestingItem(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmRequest} className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="font-black text-slate-900 text-sm">{requestingItem.foodName}</div>
                <div className="text-slate-600">
                  Total Quantity: <span className="font-bold text-slate-900">{requestingItem.quantity}</span> &bull; {requestingItem.category}
                </div>
                <div className="text-[11px] text-slate-500">
                  Provided by: {requestingItem.donorName} ({requestingItem.donorAddress})
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 uppercase">Intake Portion Needed</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIntakePortion('FULL')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      intakePortion === 'FULL'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Entire Batch ({requestingItem.quantity})
                  </button>
                  <button
                    type="button"
                    onClick={() => setIntakePortion('PARTIAL')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      intakePortion === 'PARTIAL'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Custom Portion
                  </button>
                </div>
              </div>

              {intakePortion === 'PARTIAL' && (
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase">Specify Meals Needed</label>
                  <input
                    type="number"
                    value={customMeals}
                    onChange={(e) => setCustomMeals(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase">
                  Kitchen Intake Notes for Courier / Donor (Optional)
                </label>
                <textarea
                  rows={2}
                  value={intakeNotes}
                  onChange={(e) => setIntakeNotes(e.target.value)}
                  placeholder="e.g. Please deliver to Side Kitchen Dock #2, ring buzzer for intake manager..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                />
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>By requesting, you confirm your facility can safely receive and refrigerate/serve this food.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRequestingItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Request Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
