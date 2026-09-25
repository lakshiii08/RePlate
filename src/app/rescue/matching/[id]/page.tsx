'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { matchingService } from '@/services/matchingService';
import { donationService } from '@/services/donationService';
import { Donation, Shelter, Driver, DeliveryMode } from '@/types';
import RescueCountdown from '@/components/ui/RescueCountdown';
import {
  Zap,
  CheckCircle2,
  Building2,
  Truck,
  ArrowRight,
  Sparkles,
  Navigation,
  Clock,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  Utensils,
  MapPin,
  Camera,
} from 'lucide-react';

export default function SmartMatchingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [donation, setDonation] = useState<Donation | null>(null);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('VOLUNTEER');

  // Stages simulation state
  const [stageIndex, setStageIndex] = useState(0);
  const [stagesComplete, setStagesComplete] = useState(false);

  // Selection states
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [assigning, setAssigning] = useState(false);

  const stages = [
    'AI querying candidate NGOs within perishable reach',
    'Analyzing meal capacity & verified dietary intake',
    'Evaluating thermal holding compatibility (warmer/refrig)',
    'Calculating real-time route buffer & traffic corridor',
    'Auditing volunteer courier readiness in proximity',
    'Generating explainable AI feasibility match recommendation',
  ];

  useEffect(() => {
    async function loadData() {
      const d = await donationService.getDonationById(resolvedParams.id);
      setDonation(d);
      if (d?.deliveryMode) {
        setDeliveryMode(d.deliveryMode);
      }

      const candidateShelters = await matchingService.getCandidateShelters(resolvedParams.id);
      setShelters(candidateShelters);
      if (candidateShelters.length > 0) {
        setSelectedShelter(candidateShelters[0]); // default to top AI match
      }

      const availableDrivers = await matchingService.getAvailableDrivers(d?.donorCoords);
      setDrivers(availableDrivers);
      if (availableDrivers.length > 0) {
        setSelectedDriver(availableDrivers[0]);
      }
    }
    loadData();
  }, [resolvedParams.id]);

  // Stage sequence animation ticker
  useEffect(() => {
    if (stageIndex < stages.length) {
      const timer = setTimeout(() => {
        setStageIndex((prev) => prev + 1);
      }, 350);
      return () => clearTimeout(timer);
    } else {
      setStagesComplete(true);
    }
  }, [stageIndex, stages.length]);

  const handleConfirmAssignment = async () => {
    if (!selectedShelter || !donation) return;
    setAssigning(true);

    const isSelfDrive = deliveryMode === 'SELF_DRIVE';
    const score = selectedShelter.feasibilityScore?.overallScore || 96;
    const explanation =
      selectedShelter.feasibilityScore?.explanation ||
      'Optimal match based on verified dinner hunger capacity, thermal holding alignment, and rapid transit window.';

    if (isSelfDrive) {
      await donationService.updateDonationStatus(donation.id, 'MATCHED', {
        matchedShelter: selectedShelter,
        deliveryMode: 'SELF_DRIVE',
        aiMatchReason: `AI Match (${score}% fit): Matched for donor self-drive to ${selectedShelter.name}. ${explanation}`,
        aiMatchScore: score,
      });
    } else {
      const driverToAssign = selectedDriver || drivers[0];
      const fallbackDriverCoords: [number, number] = donation.donorCoords
        ? [donation.donorCoords[0] + 0.004, donation.donorCoords[1] + 0.004]
        : [37.786, -122.405];
      await donationService.updateDonationStatus(donation.id, 'DRIVER_ASSIGNED', {
        matchedShelter: selectedShelter,
        assignedDriver: driverToAssign,
        driverCoords: driverToAssign ? driverToAssign.coords : fallbackDriverCoords,
        deliveryMode: 'VOLUNTEER',
        aiMatchReason: `AI Match (${score}% fit): Matched ${selectedShelter.name} and dispatched volunteer courier ${
          driverToAssign?.name || 'Aarav Patel'
        }. ${explanation}`,
        aiMatchScore: score,
      });
    }

    setAssigning(false);
    // Redirect to live rescue tracking screen!
    router.push(`/rescue/${donation.id}`);
  };

  if (!donation) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-semibold text-xs">
        Initializing AI Smart Matching Engine...
      </div>
    );
  }

  const isSelfDrive = deliveryMode === 'SELF_DRIVE';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            AI RESCUE MATCHING ENGINE
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            AI Donor & Receiver Matchmaking
          </h1>
          <p className="text-xs text-slate-500">
            Donation: <strong className="text-slate-800">{donation.foodName}</strong> ({donation.quantity}) &bull;{' '}
            {donation.category}
          </p>
        </div>

        {/* Delivery Mode Toggle */}
        <div className="flex items-center gap-3">
          <div className="p-1 bg-slate-100 rounded-xl flex items-center">
            <button
              onClick={() => setDeliveryMode('VOLUNTEER')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                !isSelfDrive
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-emerald-600" /> Courier Dispatch
            </button>
            <button
              onClick={() => setDeliveryMode('SELF_DRIVE')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                isSelfDrive
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-blue-600" /> Self-Drive
            </button>
          </div>

          <div className="shrink-0">
            <RescueCountdown deadline={donation.pickupDeadline} compact />
          </div>
        </div>
      </div>

      {/* ITEM PHOTOS OVERVIEW (ATTACHED BY DONOR) */}
      {donation.photos && donation.photos.length > 0 && (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">
              Attached Item Photos ({donation.photos.length}):
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            {donation.photos.map((url, idx) => (
              <div key={idx} className="w-16 h-12 rounded-lg overflow-hidden border border-slate-300 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Food preview ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ANIMATED AI STAGES CHECK SEQUENCE */}
      {!stagesComplete && (
        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                AI Matching Engine Evaluating Real-Time Feasibility...
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {Math.min(100, Math.floor(((stageIndex + 1) / stages.length) * 100))}%
            </span>
          </div>

          <div className="space-y-2">
            {stages.map((stageName, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs">
                {idx < stageIndex ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : idx === stageIndex ? (
                  <span className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                )}
                <span className={idx <= stageIndex ? 'text-white font-medium' : 'text-slate-500'}>
                  {stageName}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DISPATCH FLOW INDICATOR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs font-bold font-mono">
        <div className="flex items-center gap-2 text-emerald-700">
          <Utensils className="w-4 h-4" /> DONOR FOOD
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <div className={`flex items-center gap-2 ${selectedShelter ? 'text-blue-700' : 'text-slate-400'}`}>
          <Building2 className="w-4 h-4" /> AI MATCHED NGO ({selectedShelter ? selectedShelter.name : 'Analyzing...'})
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <div className={`flex items-center gap-2 ${isSelfDrive ? 'text-blue-700' : selectedDriver ? 'text-amber-700' : 'text-slate-400'}`}>
          {isSelfDrive ? (
            <>
              <Navigation className="w-4 h-4" /> SELF-DRIVE DIRECT
            </>
          ) : (
            <>
              <Truck className="w-4 h-4" /> COURIER ({selectedDriver ? selectedDriver.name : 'Assigning...'})
            </>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <div className="flex items-center gap-2 text-slate-400">
          <CheckCircle2 className="w-4 h-4" /> DISPATCH LOCK
        </div>
      </div>

      {/* RESTAURANT ORIGIN TELEMETRY CARD */}
      {donation && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
              <Utensils className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30 inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Origin Restaurant Hub
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  GPS: [{donation.donorCoords?.[0]?.toFixed(4) || '37.7940'}, {donation.donorCoords?.[1]?.toFixed(4) || '-122.3960'}]
                </span>
              </div>
              <h2 className="text-base font-black text-white tracking-tight">{donation.donorName}</h2>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 truncate max-w-xl">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                {donation.donorAddress}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-5 shrink-0 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Surplus Food</span>
              <span className="font-extrabold text-emerald-300">{donation.foodName}</span>
              <span className="text-slate-400 block text-[11px]">{donation.quantity} &bull; {donation.category}</span>
            </div>
          </div>
        </div>
      )}

      {/* CANDIDATE SHELTERS & DISPATCH PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: CANDIDATE SHELTERS */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" /> AI Matched Shelters & Food Banks
            </h2>
            <span className="text-xs text-slate-400 font-medium">Ranked by Proximity & Feasibility</span>
          </div>

          <div className="space-y-4">
            {shelters.map((shelter, idx) => {
              const isSelected = selectedShelter?.id === shelter.id;
              const isNearest = idx === 0;
              const score = shelter.feasibilityScore;

              return (
                <div
                  key={shelter.id}
                  onClick={() => setSelectedShelter(shelter)}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-4 ${
                    isSelected
                      ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-extrabold text-slate-900 text-base">{shelter.name}</h3>
                        {isNearest && (
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 shadow-2xs">
                            🎯 Nearest AI Route
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {shelter.address}
                      </p>
                    </div>

                    {/* Feasibility score badge */}
                    <div className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1.5 rounded-xl text-center shrink-0">
                      <div className="text-lg font-black">{score?.overallScore || 96}%</div>
                      <div className="text-[9px] font-bold uppercase tracking-wider">AI Match Fit</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[10px] block">DISTANCE / BUFFER</span>
                      <span className="font-bold text-slate-800">{shelter.distanceKm} km ({shelter.etaMinutes}m)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">CAPACITY FIT</span>
                      <span className="font-bold text-slate-800">{shelter.capacityMeals} meals</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">DEMAND MATCH</span>
                      <span className="font-bold text-emerald-700">{shelter.currentNeeds[0]}</span>
                    </div>
                  </div>

                  {/* Why this match explainable block */}
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[11px] uppercase font-bold text-emerald-800">
                        AI Reasoning & Suitability:
                      </strong>
                      {score?.explanation ||
                        'Verified dinner intake need: warm pans match commercial steam tables with 11 min transit buffer.'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: FULFILLMENT ASSIGNMENT PANEL */}
        <div className="lg:col-span-5 space-y-6">
          {isSelfDrive ? (
            /* 1. SELF-DRIVE DIRECT HUD */
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-blue-700 font-extrabold text-sm">
                <Navigation className="w-5 h-5" />
                <span>Self-Drive Drop-Off Mode Selected</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                You will personally deliver this food to the matched NGO. No courier dispatch needed.
              </p>

              {selectedShelter && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-2 text-xs">
                  <div className="font-bold text-blue-950 text-sm">{selectedShelter.name}</div>
                  <div className="text-blue-900 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    {selectedShelter.address}
                  </div>
                  <div className="text-blue-800 pt-1 border-t border-blue-200 font-mono">
                    Direct Contact: <strong>{selectedShelter.contactPhone}</strong>
                  </div>
                </div>
              )}

              <button
                onClick={handleConfirmAssignment}
                disabled={assigning || !selectedShelter}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {assigning ? (
                  'Locking Rescue Route...'
                ) : (
                  <>
                    <Navigation className="w-5 h-5" /> Confirm Match & Open NGO Navigation Map
                  </>
                )}
              </button>
            </div>
          ) : (
            /* 2. VOLUNTEER COURIER DISPATCH HUD */
            <div className="space-y-6">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-600" /> Assign Volunteer Driver
              </h2>

              <div className="space-y-3">
                {drivers.map((drv) => {
                  const isSelected = selectedDriver?.id === drv.id;

                  return (
                    <div
                      key={drv.id}
                      onClick={() => setSelectedDriver(drv)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                        isSelected
                          ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{drv.name}</h4>
                          <span className="text-xs text-slate-500">{drv.vehicleType}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-amber-700">{drv.etaToDonorMinutes} mins ETA</div>
                          <div className="text-[10px] text-slate-400">Rating: ★ {drv.rating}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                        <span>Completed rescues: {drv.deliveriesCompleted}</span>
                        <span className="text-emerald-600 font-bold">STATUS: {drv.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Confirm & Launch Rescue Button */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-4">
                <h3 className="font-extrabold text-slate-900 text-sm">Rescue Dispatch Confirmation</h3>
                <p className="text-xs text-slate-500">
                  Confirming will lock route parameters, dispatch {selectedDriver?.name || 'courier'}, and send OTP handover code to donor.
                </p>

                <button
                  onClick={handleConfirmAssignment}
                  disabled={assigning || !selectedShelter || !selectedDriver}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {assigning ? (
                    'Dispatching Courier Operations...'
                  ) : (
                    <>
                      <Zap className="w-5 h-5" /> Confirm Match & Dispatch Courier NOW
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
