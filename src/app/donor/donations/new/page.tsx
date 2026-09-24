'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRescue } from '@/context/RescueContext';
import { useAuth } from '@/context/AuthContext';
import { donationService } from '@/services/donationService';
import { FoodCategory, FoodType, DeliveryMode, PackagingType, StorageMethod } from '@/types';
import {
  ArrowLeft,
  Utensils,
  Clock,
  MapPin,
  Camera,
  Trash2,
  Truck,
  Navigation,
  CheckCircle2,
  Sparkles,
  Info,
  Calendar,
  AlertCircle,
} from 'lucide-react';

const SAMPLE_PHOTOS = [
  { label: '🍛 Veg Biryani', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80' },
  { label: '🥖 Bakery Bread', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80' },
  { label: '🥗 Fresh Salads', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80' },
  { label: '🍎 Fresh Fruits', url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80' },
  { label: '🍝 Pasta Trays', url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80' },
];

const PRESETS = [
  { name: 'Veg Biryani', category: 'Meal' as FoodCategory, type: 'Veg' as FoodType, qty: '25', unit: 'meals', notes: 'Packed in food-grade insulated trays. Mild spice, keeps hot.' },
  { name: 'Artisan Sourdough & Croissants', category: 'Bakery' as FoodCategory, type: 'Veg' as FoodType, qty: '30', unit: 'packets', notes: 'Freshly baked today at morning shift. Dry ambient packaging.' },
  { name: 'Seasonal Fruit Crates', category: 'Fruits' as FoodCategory, type: 'Veg' as FoodType, qty: '20', unit: 'kg', notes: 'Apples, oranges, and bananas. Clean crates ready for immediate consumption.' },
  { name: 'Grilled Chicken & Rice Bowls', category: 'Meal' as FoodCategory, type: 'Non-Veg' as FoodType, qty: '40', unit: 'meals', notes: 'Individually boxed with compostable cutlery. Refrigerated at 4°C.' },
];

export default function AddFoodDonationPage() {
  const router = useRouter();
  const { addDonation } = useRescue();
  const { user } = useAuth();

  // Form Fields as per Lakshita's MVP Spec
  const [foodName, setFoodName] = useState('');
  const [foodCategory, setFoodCategory] = useState<FoodCategory>('Meal');
  const [quantityValue, setQuantityValue] = useState('25');
  const [quantityUnit, setQuantityUnit] = useState<'kg' | 'packets' | 'meals'>('meals');
  const [foodType, setFoodType] = useState<FoodType>('Veg');
  
  // Timing
  const [preparedTime, setPreparedTime] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - 30);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  const [bestBeforeTime, setBestBeforeTime] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 3);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  // Pickup Location
  const [pickupLocation, setPickupLocation] = useState(
    user?.address ||
    (user?.organization ? `${user.organization}, 345 Embarcadero Plaza, SF` : '345 Embarcadero Plaza, Financial District, SF')
  );

  // Fulfillment preference
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('VOLUNTEER');

  // Food Photo
  const [photos, setPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
  ]);

  // Special Notes
  const [specialNotes, setSpecialNotes] = useState('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setFoodName(preset.name);
    setFoodCategory(preset.category);
    setFoodType(preset.type);
    setQuantityValue(preset.qty);
    setQuantityUnit(preset.unit as 'kg' | 'packets' | 'meals');
    setSpecialNotes(preset.notes);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        if (loadEvent.target?.result) {
          setPhotos((prev) => [...prev, loadEvent.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) {
      setErrorMsg('Please enter the food name.');
      return;
    }
    if (!quantityValue || parseFloat(quantityValue) <= 0) {
      setErrorMsg('Please specify a valid quantity.');
      return;
    }
    if (!pickupLocation.trim()) {
      setErrorMsg('Please provide a pickup location.');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);

    try {
      const qtyNumber = parseFloat(quantityValue) || 10;
      let calculatedMeals = qtyNumber;
      if (quantityUnit === 'kg') {
        calculatedMeals = Math.round(qtyNumber * 2.5);
      } else if (quantityUnit === 'packets') {
        calculatedMeals = Math.round(qtyNumber);
      }

      // Compute deadline 3 hours from now
      const deadlineDate = new Date();
      deadlineDate.setHours(deadlineDate.getHours() + 3);

      const storageMethod: StorageMethod =
        foodCategory === 'Meal' ? 'hot_held' : foodCategory === 'Bakery' ? 'ambient' : 'refrigerated';
      const packagingType: PackagingType = 'sealed';

      const newDonation = await donationService.createDonation({
        donorId: user?.id || 'donor-default',
        donorName: user?.organization || user?.name || 'Grand Hyatt Hotel Catering',
        donorAddress: pickupLocation,
        donorCoords: [37.794, -122.396],
        foodName: foodName.trim(),
        foodType,
        category: foodCategory,
        quantity: `${quantityValue} ${quantityUnit}`,
        mealCount: calculatedMeals,
        description: specialNotes.trim() || `${foodType} ${foodCategory} surplus donation.`,
        specialNotes: specialNotes.trim(),
        prepTime: preparedTime,
        bestBefore: bestBeforeTime,
        availableFrom: 'Immediately (Ready for Pickup)',
        pickupDeadline: deadlineDate.toISOString(),
        rescueWindowMinutes: 180,
        storageMethod,
        packagingType,
        allergens: [],
        declarations: {
          safeStorage: true,
          cleanContainers: true,
          noContamination: true,
          donorVerified: true,
        },
        eligibilityStatus: 'ELIGIBLE',
        deliveryMode,
        photos,
      });

      addDonation(newDonation);
      router.push(`/rescue/matching/${newDonation.id}`);
    } catch (err: unknown) {
      console.error('Failed to list food:', err);
      setErrorMsg('An unexpected error occurred while listing food. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/donor/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
          🌱 Donor MVP Listing
        </span>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Utensils className="w-7 h-7 text-emerald-600" />
          Add Food for Donation
        </h1>
        <p className="text-sm text-slate-500">
          List your surplus food in under a minute. Our AI matching engine will immediately connect with the best nearby NGO or shelter.
        </p>
      </div>

      {/* Quick Autofill Presets */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Quick Autofill Examples
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="text-xs font-medium px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <span>{p.name}</span>
              <span className="text-[10px] text-slate-400">({p.qty} {p.unit})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. Food Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Food Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            placeholder="e.g., Veg Biryani, Artisanal Loaves, Vegetable Curry"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* 2. Food Category & Food Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Food Category <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'Meal' as FoodCategory, label: '🍱 Meal', sub: 'Hot/Cooked' },
                { id: 'Bakery' as FoodCategory, label: '🥖 Bakery', sub: 'Bread/Pastry' },
                { id: 'Fruits' as FoodCategory, label: '🍎 Fruits', sub: 'Produce' },
                { id: 'Other' as FoodCategory, label: '📦 Other', sub: 'Packaged' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFoodCategory(cat.id)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    foodCategory === cat.id
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">{cat.label}</div>
                  <div className="text-[10px] text-slate-400">{cat.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Food Type: Veg / Non-Veg */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Food Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3 h-[74px]">
              <button
                type="button"
                onClick={() => setFoodType('Veg')}
                className={`p-3 rounded-xl border flex flex-col justify-center items-start transition-all ${
                  foodType === 'Veg'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border border-emerald-600 flex items-center justify-center p-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  </span>
                  <span className="text-xs font-bold text-slate-900">Veg</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-medium ml-5.5">100% Vegetarian</span>
              </button>

              <button
                type="button"
                onClick={() => setFoodType('Non-Veg')}
                className={`p-3 rounded-xl border flex flex-col justify-center items-start transition-all ${
                  foodType === 'Non-Veg'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 ring-1 ring-amber-600'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border border-amber-600 flex items-center justify-center p-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  </span>
                  <span className="text-xs font-bold text-slate-900">Non-Veg</span>
                </div>
                <span className="text-[10px] text-amber-700 font-medium ml-5.5">Meat / Poultry</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Quantity */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Quantity <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              step="any"
              required
              value={quantityValue}
              onChange={(e) => setQuantityValue(e.target.value)}
              placeholder="e.g. 25"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              {(['kg', 'packets', 'meals'] as const).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => setQuantityUnit(unit)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all uppercase ${
                    quantityUnit === unit
                      ? 'bg-white text-emerald-800 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Estimated impact:{' '}
            <span className="font-bold text-slate-700">
              {quantityUnit === 'kg'
                ? `~${Math.round((parseFloat(quantityValue) || 0) * 2.5)} meals`
                : `${quantityValue || 0} meals`}
            </span>
          </p>
        </div>

        {/* 4. Prepared Time & Best Before / Expiry Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Prepared Time
            </label>
            <input
              type="text"
              value={preparedTime}
              onChange={(e) => setPreparedTime(e.target.value)}
              placeholder="e.g., 12:30 PM or Today, 1:00 PM"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Best Before / Expiry Time <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={bestBeforeTime}
              onChange={(e) => setBestBeforeTime(e.target.value)}
              placeholder="e.g., 04:30 PM or 3 hours from now"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* 5. Pickup Location */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            Pickup Location <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            placeholder="Complete street address or pickup gate"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>

        {/* 6. Fulfillment / Delivery Preference */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Fulfillment Preference
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDeliveryMode('VOLUNTEER')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                deliveryMode === 'VOLUNTEER'
                  ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900">Request Volunteer / Driver Pickup</span>
              </div>
              <p className="text-[11px] text-slate-500">
                A nearby volunteer arrives at your pickup location. You will receive an arrival Handover OTP.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setDeliveryMode('SELF_DRIVE')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                deliveryMode === 'SELF_DRIVE'
                  ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Navigation className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900">I will Self-Drive to NGO / Shelter</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Direct drop-off. You will get live GPS turn-by-turn directions to the verified recipient shelter.
              </p>
            </button>
          </div>
        </div>

        {/* 7. Food Photo (Optional) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-slate-400" />
              Food Photo (Optional)
            </label>
            <span className="text-[11px] text-slate-400">Helps volunteers identify packages</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {photos.map((url, idx) => (
              <div key={idx} className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 group shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(idx)}
                  className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors bg-slate-50/50">
              <Camera className="w-5 h-5 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-500">Upload</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>

          {/* Quick Sample Photo Selector */}
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-slate-400">Or pick a sample photo:</span>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {SAMPLE_PHOTOS.map((sp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPhotos([sp.url])}
                  className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 8. Special Notes */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Special Notes <span className="text-slate-400 font-normal">(packaging, storage, allergen info)</span>
          </label>
          <textarea
            rows={3}
            value={specialNotes}
            onChange={(e) => setSpecialNotes(e.target.value)}
            placeholder="e.g., Sealed in foil containers. Keep hot at 60°C. Contains nuts. Ring back kitchen door bell."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-400 resize-none"
          />
        </div>

        {/* Safety Affirmation Badge */}
        <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Surplus prepared under safe food handling protocols and verified clean packaging.</span>
        </div>

        {/* 9. Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Publishing & Matching Nearby Rescuers...</span>
              </>
            ) : (
              <>
                <Utensils className="w-4 h-4" />
                <span>List Food for Donation</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
