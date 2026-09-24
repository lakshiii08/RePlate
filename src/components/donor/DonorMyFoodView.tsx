'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  UtensilsCrossed,
  Clock,
  MapPin,
  Edit3,
  XCircle,
  AlertTriangle,
  Plus,
  Check,
} from 'lucide-react';
import { useRescue } from '@/context/RescueContext';
import { Donation } from '@/types';

export default function DonorMyFoodView() {
  const { donations, cancelDonation, editDonation } = useRescue();

  const [foodFilter, setFoodFilter] = useState<'ALL' | 'ACTIVE' | 'PICKED_UP' | 'EXPIRED'>('ALL');

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<Donation | null>(null);
  const [editFoodName, setEditFoodName] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editBestBefore, setEditBestBefore] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Cancel Confirmation Modal State
  const [cancelingItem, setCancelingItem] = useState<Donation | null>(null);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const openEditModal = (item: Donation) => {
    setEditingItem(item);
    setEditFoodName(item.foodName);
    setEditQuantity(item.quantity);
    setEditBestBefore(item.bestBefore || item.pickupDeadline || '');
    setEditNotes(item.specialNotes || item.description || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setEditSubmitting(true);
    try {
      await editDonation(editingItem.id, {
        foodName: editFoodName.trim(),
        quantity: editQuantity.trim(),
        specialNotes: editNotes.trim(),
        bestBefore: editBestBefore.trim(),
      });
      setEditingItem(null);
      triggerToast('Listing updated successfully');
    } catch (err) {
      console.error('Failed to update listing', err);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelingItem) return;
    setCancelSubmitting(true);
    try {
      await cancelDonation(cancelingItem.id);
      setCancelingItem(null);
      triggerToast('Listing cancelled');
    } catch (err) {
      console.error('Failed to cancel listing', err);
    } finally {
      setCancelSubmitting(false);
    }
  };

  const filteredFoodListings = useMemo(() => {
    return donations.filter((item) => {
      if (foodFilter === 'ACTIVE') {
        return item.status !== 'DELIVERED' && item.status !== 'CANCELLED';
      }
      if (foodFilter === 'PICKED_UP') {
        return item.status === 'PICKED_UP' || item.status === 'IN_TRANSIT' || item.status === 'DELIVERED';
      }
      if (foodFilter === 'EXPIRED') {
        return item.status === 'CANCELLED' || item.urgencyLevel === 'expired';
      }
      return true;
    });
  }, [donations, foodFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">My Food Listings</h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {donations.length} ITEMS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your surplus food inventory, view quantities and expiry, or edit and cancel listings.
          </p>
        </div>

        <Link
          href="/donor/donations/new"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Food
        </Link>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Sub-filter chips (Lakshita MVP spec: Active listings, Picked-up food, Expired food) */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200/80 w-fit text-xs font-bold">
        {[
          { key: 'ALL', label: 'All Listings' },
          { key: 'ACTIVE', label: 'Active Listings' },
          { key: 'PICKED_UP', label: 'Picked-up Food' },
          { key: 'EXPIRED', label: 'Expired / Cancelled' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFoodFilter(f.key as any)}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              foodFilter === f.key
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Food Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFoodListings.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Photo or Banner */}
              <div className="relative h-40 bg-slate-100 overflow-hidden">
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
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold shadow-xs uppercase ${
                      item.status === 'DELIVERED'
                        ? 'bg-emerald-500 text-white'
                        : item.status === 'CANCELLED'
                        ? 'bg-rose-500 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {item.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="font-black text-slate-900 text-base">{item.foodName}</h3>
                  <div className="text-xs text-slate-500 font-semibold mt-0.5">
                    Quantity: <span className="text-emerald-700 font-bold">{item.quantity}</span> ({item.mealCount} meals)
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Best Before: </span>
                    <span className="font-bold text-slate-800">
                      {item.bestBefore || new Date(item.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{item.donorAddress}</span>
                  </div>
                  {item.specialNotes && (
                    <div className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-xl border border-slate-100">
                      &ldquo;{item.specialNotes}&rdquo;
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions: Edit / Cancel (Lakshita MVP spec) */}
            <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {item.status !== 'DELIVERED' && item.status !== 'CANCELLED' && (
                  <>
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3 text-slate-500" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setCancelingItem(item)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-3 h-3 text-rose-500" /> Cancel
                    </button>
                  </>
                )}
              </div>

              <Link
                href={`/rescue/${item.id}`}
                className="text-xs font-extrabold text-emerald-700 hover:underline flex items-center gap-1"
              >
                View Status &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredFoodListings.length === 0 && (
        <div className="bg-slate-50 rounded-3xl border border-dashed border-slate-300 p-8 text-center text-slate-500 text-xs">
          No food listings found for this category.
        </div>
      )}

      {/* EDIT LISTING MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">Edit Food Listing</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold uppercase text-slate-700">Food Name</label>
                <input
                  type="text"
                  required
                  value={editFoodName}
                  onChange={(e) => setEditFoodName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold uppercase text-slate-700">Quantity</label>
                  <input
                    type="text"
                    required
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold uppercase text-slate-700">Best Before</label>
                  <input
                    type="text"
                    value={editBestBefore}
                    onChange={(e) => setEditBestBefore(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold uppercase text-slate-700">Special Notes</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {cancelingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-black text-slate-900 text-base">Cancel Listing #{cancelingItem.id}?</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to cancel <strong className="text-slate-800">{cancelingItem.foodName}</strong>?
              This will notify assigned volunteers or shelters that the item is no longer available.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelingItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Keep Listing
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelSubmitting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
              >
                {cancelSubmitting ? 'Canceling...' : 'Yes, Cancel Listing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
