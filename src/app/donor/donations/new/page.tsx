'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRescue } from '@/context/RescueContext';
import { aiService, ParsedDonationResult } from '@/services/aiService';
import { donationService } from '@/services/donationService';
import { FoodCategory, StorageMethod, PackagingType, EligibilityStatus } from '@/types';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Utensils,
  Clock,
  Package,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  XCircle,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';

export default function CreateDonationPage() {
  const router = useRouter();
  const { addDonation } = useRescue();

  const [currentStep, setCurrentStep] = useState(1);

  // AI Prompt Parser state
  const [aiInputText, setAiInputText] = useState(
    'We have around 50 packed meals of paneer rice prepared at 7 PM and ready for pickup now.'
  );
  const [parsingAi, setParsingAi] = useState(false);
  const [aiResult, setAiResult] = useState<ParsedDonationResult | null>(null);

  // Form State
  const [foodName, setFoodName] = useState('Paneer Rice & Fresh Curry');
  const [category, setCategory] = useState<FoodCategory>('Cooked Meal');
  const [quantity, setQuantity] = useState('50 packed meals');
  const [mealCount, setMealCount] = useState(50);
  const [description, setDescription] = useState('Warm paneer rice and fresh curry in insulated food trays.');

  // Step 2 Timing
  const [prepTime, setPrepTime] = useState('7:00 PM');
  const [availableFrom, setAvailableFrom] = useState('7:30 PM');
  const [rescueWindowMinutes, setRescueWindowMinutes] = useState(90);

  // Step 3 Storage & Packaging
  const [storageMethod, setStorageMethod] = useState<StorageMethod>('hot_held');
  const [packagingType, setPackagingType] = useState<PackagingType>('sealed');

  // Step 4 Food Safety
  const [allergens, setAllergens] = useState<string[]>(['Dairy']);
  const [safeStorage, setSafeStorage] = useState(true);
  const [cleanContainers, setCleanContainers] = useState(true);
  const [noContamination, setNoContamination] = useState(true);
  const [donorVerified, setDonorVerified] = useState(true);

  // Step 5 Location
  const [pickupAddress, setPickupAddress] = useState('345 Embarcadero Plaza, Financial District');
  const [latitude, setLatitude] = useState(37.794);
  const [longitude, setLongitude] = useState(-122.396);
  const [pickupInstructions, setPickupInstructions] = useState('Loading bay B behind main lobby. Call +1 (555) 234-5678 on arrival.');

  // Safety Gate Result
  const [eligibility, setEligibility] = useState<{ status: EligibilityStatus; reason: string } | null>(null);

  // AI Parsing handler
  const handleAiExtract = async () => {
    if (!aiInputText.trim()) return;
    setParsingAi(true);
    try {
      const parsed = await aiService.parseSurplusText(aiInputText);
      setAiResult(parsed);
      // Populate fields automatically
      setFoodName(parsed.foodName);
      setCategory(parsed.category);
      setQuantity(parsed.quantity);
      setMealCount(parsed.mealCount);
      setPrepTime(parsed.prepTime);
      setStorageMethod(parsed.storageMethod);
      setPackagingType(parsed.packagingType);
      if (parsed.allergens.length > 0) {
        setAllergens(parsed.allergens);
      }
    } finally {
      setParsingAi(false);
    }
  };

  const handleEvaluateSafetyGate = () => {
    const res = donationService.evaluateEligibility({
      storageMethod,
      packagingType,
      rescueWindowMinutes,
      declarations: {
        safeStorage,
        cleanContainers,
        noContamination,
        donorVerified,
      },
    });
    setEligibility(res);
    setCurrentStep(6); // Step 6 is Safety Eligibility Gate review
  };

  const handleFinalSubmit = async () => {
    const pickupDeadlineIso = new Date(Date.now() + rescueWindowMinutes * 60 * 1000).toISOString();
    
    const created = await donationService.createDonation({
      donorId: 'donor-1',
      donorName: 'Grand Hyatt Hotel Catering',
      donorAddress: pickupAddress,
      donorCoords: [latitude, longitude],
      foodName,
      category,
      quantity,
      mealCount,
      description,
      prepTime,
      availableFrom,
      pickupDeadline: pickupDeadlineIso,
      rescueWindowMinutes,
      storageMethod,
      packagingType,
      allergens,
      declarations: {
        safeStorage,
        cleanContainers,
        noContamination,
        donorVerified,
      },
      eligibilityStatus: eligibility?.status || 'ELIGIBLE',
      eligibilityReason: eligibility?.reason,
    });

    addDonation(created);
    // Redirect to smart matching screen immediately!
    router.push(`/rescue/matching/${created.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Post Surplus Food</h1>
          <p className="text-xs text-slate-500">Multi-step AI-assisted food rescue declaration wizard</p>
        </div>
        <button
          onClick={() => router.push('/donor/dashboard')}
          className="text-xs text-slate-500 hover:text-slate-900 font-semibold"
        >
          Cancel
        </button>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-6 gap-2 text-center text-xs font-bold">
        {[
          { num: 1, label: 'Food' },
          { num: 2, label: 'Timing' },
          { num: 3, label: 'Storage' },
          { num: 4, label: 'Safety' },
          { num: 5, label: 'Location' },
          { num: 6, label: 'Eligibility Gate' },
        ].map((s) => (
          <div
            key={s.num}
            className={`py-2 rounded-xl border transition-all ${
              currentStep === s.num
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : currentStep > s.num
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}
          >
            Step {s.num}: {s.label}
          </div>
        ))}
      </div>

      {/* SECTION 6: AI DONATION PARSER */}
      {currentStep === 1 && (
        <div className="bg-emerald-950 text-white p-6 rounded-2xl border border-emerald-800 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="font-extrabold text-base">AI Surplus Fast-Parser</h3>
            </div>
            {aiResult && (
              <span className="text-xs bg-emerald-800 text-emerald-200 px-2.5 py-1 rounded-full font-bold">
                Confidence: {(aiResult.confidenceScore * 100).toFixed(0)}%
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300">Describe your surplus food in your own words below:</p>

          <div className="space-y-3">
            <textarea
              rows={3}
              value={aiInputText}
              onChange={(e) => setAiInputText(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 text-white border border-emerald-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder='e.g. "We have around 50 packed meals of paneer rice prepared at 7 PM and ready for pickup now."'
            />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAiExtract}
                disabled={parsingAi}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                {parsingAi ? 'Extracting Parameters...' : '✨ Extract with AI'}
              </button>

              {aiResult && (
                <button
                  type="button"
                  onClick={() => {
                    setAiResult(null);
                    setAiInputText('');
                  }}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {aiResult && (
              <div className="bg-slate-900/90 p-4 rounded-xl border border-emerald-700/50 space-y-2 text-xs">
                <div className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                  Extracted Fields Preview:
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-slate-200 font-mono">
                  <div>
                    <span className="text-slate-400">Food:</span> {aiResult.foodName}
                  </div>
                  <div>
                    <span className="text-slate-400">Quantity:</span> {aiResult.quantity}
                  </div>
                  <div>
                    <span className="text-slate-400">Category:</span> {aiResult.category}
                  </div>
                  <div>
                    <span className="text-slate-400">Prep At:</span> {aiResult.prepTime}
                  </div>
                  <div>
                    <span className="text-slate-400">Packaging:</span> {aiResult.packagingType}
                  </div>
                  <div>
                    <span className="text-slate-400">Storage:</span> {aiResult.storageMethod}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FORM STEPS CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        {/* STEP 1: FOOD DETAILS */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-emerald-600" /> Step 1: Food Item Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Food Name</label>
                <input
                  type="text"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className="w-full p-2.5 border rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FoodCategory)}
                  className="w-full p-2.5 border rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Cooked Meal">Cooked Meal</option>
                  <option value="Bakery & Bread">Bakery & Bread</option>
                  <option value="Fresh Produce">Fresh Produce</option>
                  <option value="Packaged Goods">Packaged Goods</option>
                  <option value="Dairy & Refrigerated">Dairy & Refrigerated</option>
                  <option value="Catered Buffet">Catered Buffet</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Quantity Description</label>
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full p-2.5 border rounded-xl text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Estimated Meal Count</label>
                <input
                  type="number"
                  value={mealCount}
                  onChange={(e) => setMealCount(Number(e.target.value))}
                  className="w-full p-2.5 border rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Detailed Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-xs font-medium"
              />
            </div>
          </div>
        )}

        {/* STEP 2: TIMING */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" /> Step 2: Rescue Window & Timing
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Preparation Time</label>
                <input
                  type="text"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  className="w-full p-2.5 border rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Available From</label>
                <input
                  type="text"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                  className="w-full p-2.5 border rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Rescue Window (Minutes)</label>
                <input
                  type="number"
                  value={rescueWindowMinutes}
                  onChange={(e) => setRescueWindowMinutes(Number(e.target.value))}
                  className="w-full p-2.5 border rounded-xl text-xs font-bold text-emerald-700"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: STORAGE & PACKAGING */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" /> Step 3: Storage & Packaging Method
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Storage Temperature Method</label>
                {(['hot_held', 'refrigerated', 'ambient', 'frozen'] as StorageMethod[]).map((m) => (
                  <label
                    key={m}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer ${
                      storageMethod === m ? 'bg-emerald-50 border-emerald-500 font-bold' : 'bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="storage"
                      checked={storageMethod === m}
                      onChange={() => setStorageMethod(m)}
                    />
                    <span className="uppercase">{m.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Packaging Type</label>
                {(['sealed', 'covered', 'individual_containers', 'bulk_boxes'] as PackagingType[]).map((p) => (
                  <label
                    key={p}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer ${
                      packagingType === p ? 'bg-emerald-50 border-emerald-500 font-bold' : 'bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="packaging"
                      checked={packagingType === p}
                      onChange={() => setPackagingType(p)}
                    />
                    <span className="uppercase">{p.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: FOOD SAFETY INFORMATION */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> Step 4: Food Safety Verification
            </h2>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs font-bold text-slate-700">Allergen Declarations:</div>
              <div className="flex flex-wrap gap-2 text-xs">
                {['Dairy', 'Gluten', 'Nuts', 'Soy', 'Eggs', 'Shellfish', 'None'].map((allg) => (
                  <button
                    key={allg}
                    type="button"
                    onClick={() => {
                      if (allergens.includes(allg)) {
                        setAllergens(allergens.filter((a) => a !== allg));
                      } else {
                        setAllergens([...allergens, allg]);
                      }
                    }}
                    className={`px-3 py-1 rounded-full border ${
                      allergens.includes(allg)
                        ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    {allg}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 p-3 rounded-xl border bg-slate-50 text-xs">
                <input
                  type="checkbox"
                  checked={safeStorage}
                  onChange={(e) => setSafeStorage(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  <strong>Safe Temperature affirmed:</strong> Hot food maintained &gt;60°C or refrigerated &lt;4°C prior to pickup.
                </span>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border bg-slate-50 text-xs">
                <input
                  type="checkbox"
                  checked={cleanContainers}
                  onChange={(e) => setCleanContainers(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  <strong>Clean Food Packaging:</strong> Food is packed in food-grade, sanitized containers.
                </span>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border bg-slate-50 text-xs">
                <input
                  type="checkbox"
                  checked={noContamination}
                  onChange={(e) => setNoContamination(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  <strong>No Cross-Contamination:</strong> Handled in accordance with food handler safety protocols.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* STEP 5: LOCATION */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" /> Step 5: Pickup Location & Instructions
            </h2>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Pickup Address</label>
                <input
                  type="text"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full p-2.5 border rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Pickup Instructions for Driver</label>
                <textarea
                  rows={3}
                  value={pickupInstructions}
                  onChange={(e) => setPickupInstructions(e.target.value)}
                  className="w-full p-2.5 border rounded-xl text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: SECTION 7 DEDICATED FOOD SAFETY ELIGIBILITY GATE */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-black text-slate-900">Food Rescue Eligibility Audit</h2>
              <p className="text-xs text-slate-500">
                Deterministic safety evaluation before matching algorithm activation
              </p>
            </div>

            {/* Status Card */}
            {eligibility && (
              <div
                className={`p-6 rounded-2xl border ${
                  eligibility.status === 'ELIGIBLE'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : eligibility.status === 'REVIEW_REQUIRED'
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  {eligibility.status === 'ELIGIBLE' && (
                    <div className="px-3 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> 🟢 ELIGIBLE FOR IMMEDIATE ROUTING
                    </div>
                  )}
                  {eligibility.status === 'REVIEW_REQUIRED' && (
                    <div className="px-3 py-1 rounded-full bg-amber-600 text-white font-extrabold text-xs flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> 🟡 MANUAL REVIEW REQUIRED
                    </div>
                  )}
                  {eligibility.status === 'DO_NOT_ROUTE' && (
                    <div className="px-3 py-1 rounded-full bg-rose-600 text-white font-extrabold text-xs flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" /> 🔴 DO NOT ROUTE (SAFETY REJECTED)
                    </div>
                  )}
                </div>

                <p className="text-xs font-semibold leading-relaxed">{eligibility.reason}</p>
              </div>
            )}

            {/* Audit Summary Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">PREP TIME</span>
                <span className="font-bold text-slate-800">{prepTime}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">STORAGE</span>
                <span className="font-bold text-slate-800 uppercase">{storageMethod}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">PACKAGING</span>
                <span className="font-bold text-slate-800 uppercase">{packagingType}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">RESCUE WINDOW</span>
                <span className="font-bold text-slate-800">{rescueWindowMinutes} mins</span>
              </div>
            </div>

            {/* Section 7 explicit disclaimer */}
            <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Deterministic Rule Engine:</strong> This status is computed strictly using configured food safety parameters and donor declarations, independent of AI models.
              </span>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : <div />}

          {currentStep < 5 && (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 flex items-center gap-1 shadow-sm"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {currentStep === 5 && (
            <button
              type="button"
              onClick={handleEvaluateSafetyGate}
              className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 flex items-center gap-1 shadow-md"
            >
              Run Food Safety Gate Audit <ShieldCheck className="w-4 h-4" />
            </button>
          )}

          {currentStep === 6 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={eligibility?.status === 'DO_NOT_ROUTE'}
                className="px-6 py-3 bg-emerald-600 text-white font-extrabold text-xs rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 shadow-lg"
              >
                Continue to Smart Matching Engine <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
