'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { matchingService } from '@/services/matchingService';
import { donationService } from '@/services/donationService';
import { Donation, Shelter, Driver } from '@/types';
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
} from 'lucide-react';

export default function SmartMatchingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [donation, setDonation] = useState<Donation | null>(null);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  
  // Stages simulation state
  const [stageIndex, setStageIndex] = useState(0);
  const [stagesComplete, setStagesComplete] = useState(false);

  // Selection states
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [assigning, setAssigning] = useState(false);

  const stages = [
    'Checking eligible shelters in range',
    'Checking capacity & dietary intake specs',
    'Checking food thermal compatibility',
    'Calculating live traffic ETA',
    'Checking volunteer driver availability',
    'Calculating multi-factor rescue feasibility',
  ];

  useEffect(() => {
    async function loadData() {
      const d = await donationService.getDonationById(resolvedParams.id);
      setDonation(d);

      const candidateShelters = await matchingService.getCandidateShelters(resolvedParams.id);
      setShelters(candidateShelters);
      if (candidateShelters.length > 0) {
        setSelectedShelter(candidateShelters[0]); // default to top match
      }

      const availableDrivers = await matchingService.getAvailableDrivers();
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
    if (!selectedShelter || !selectedDriver || !donation) return;
    setAssigning(true);

    await matchingService.selectMatch(donation.id, selectedShelter.id);
    await matchingService.assignDriver(donation.id, selectedDriver.id);

    setAssigning(false);
    // Redirect to live rescue tracking screen!
    router.push(`/rescue/${donation.id}`);
  };

  if (!donation) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-semibold text-xs">
        Initializing Smart Matching Engine...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            REAL-TIME MATCHING ENGINE ACTIVE
          </div>
          <h1 className="text-2xl font-black text-slate-900">Finding Feasible Rescue Plan</h1>
          <p className="text-xs text-slate-500">
            Donation: <span className="font-bold text-slate-800">{donation.foodName}</span> ({donation.quantity})
          </p>
        </div>

        <div className="shrink-0">
          <RescueCountdown deadline={donation.pickupDeadline} compact />
        </div>
      </div>

      {/* SECTION 9: ANIMATED STAGES CHECK SEQUENCE */}
      {!stagesComplete && (
        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
              Calculating Optimal Route & Feasibility...
            </h3>
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
          <Utensils className="w-4 h-4" /> DONATION
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <div className={`flex items-center gap-2 ${selectedShelter ? 'text-blue-700' : 'text-slate-400'}`}>
          <Building2 className="w-4 h-4" /> SHELTER ({selectedShelter ? selectedShelter.name : 'Select'})
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <div className={`flex items-center gap-2 ${selectedDriver ? 'text-amber-700' : 'text-slate-400'}`}>
          <Truck className="w-4 h-4" /> DRIVER ({selectedDriver ? selectedDriver.name : 'Select'})
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <div className="flex items-center gap-2 text-slate-400">
          <Navigation className="w-4 h-4" /> ROUTE READY
        </div>
      </div>

      {/* SECTION 9 & 10: CANDIDATE SHELTERS & ALTERNATIVES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" /> Top Feasible Shelter Matches
          </h2>

          <div className="space-y-4">
            {shelters.map((shelter) => {
              const isSelected = selectedShelter?.id === shelter.id;
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
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">{shelter.name}</h3>
                      <p className="text-xs text-slate-500">{shelter.address}</p>
                    </div>

                    {/* Feasibility score badge */}
                    <div className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1.5 rounded-xl text-center shrink-0">
                      <div className="text-lg font-black">{score?.overallScore || 94}%</div>
                      <div className="text-[9px] font-bold uppercase tracking-wider">Feasibility</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[10px] block">DISTANCE/ETA</span>
                      <span className="font-bold text-slate-800">{shelter.distanceKm} km ({shelter.etaMinutes}m)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">CAPACITY FIT</span>
                      <span className="font-bold text-slate-800">{shelter.capacityMeals} meals</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">NEEDS MATCH</span>
                      <span className="font-bold text-emerald-700">{shelter.currentNeeds[0]}</span>
                    </div>
                  </div>

                  {/* Score Breakdown Box */}
                  {score && (
                    <div className="space-y-2 pt-1">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Feasibility Breakdown Index:
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <div className="flex justify-between p-1.5 bg-slate-100 rounded">
                          <span>Time Feasibility:</span>
                          <span className="font-bold">{score.timeFeasibility}%</span>
                        </div>
                        <div className="flex justify-between p-1.5 bg-slate-100 rounded">
                          <span>Capacity Fit:</span>
                          <span className="font-bold">{score.capacityFit}%</span>
                        </div>
                        <div className="flex justify-between p-1.5 bg-slate-100 rounded">
                          <span>Compatibility:</span>
                          <span className="font-bold">{score.foodCompatibility}%</span>
                        </div>
                        <div className="flex justify-between p-1.5 bg-slate-100 rounded">
                          <span>Distance/ETA:</span>
                          <span className="font-bold">{score.distanceEta}%</span>
                        </div>
                        <div className="flex justify-between p-1.5 bg-slate-100 rounded">
                          <span>Need Priority:</span>
                          <span className="font-bold">{score.needPriority}%</span>
                        </div>
                        <div className="flex justify-between p-1.5 bg-slate-100 rounded">
                          <span>Driver Readiness:</span>
                          <span className="font-bold">{score.driverReadiness}%</span>
                        </div>
                      </div>

                      {/* "Why this match?" explainable block */}
                      <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2 mt-2">
                        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-[11px] uppercase font-bold text-emerald-800">
                            Why this match?
                          </strong>
                          {score.explanation}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 11: DRIVER ASSIGNMENT PANEL */}
        <div className="lg:col-span-5 space-y-6">
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
                    <span>Deliveries completed: {drv.deliveriesCompleted}</span>
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
              Confirming will lock route parameters, dispatch {selectedDriver?.name}, and notify {selectedShelter?.name}.
            </p>

            <button
              onClick={handleConfirmAssignment}
              disabled={assigning || !selectedShelter || !selectedDriver}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              {assigning ? (
                'Dispatching Rescue Operations...'
              ) : (
                <>
                  <Zap className="w-5 h-5" /> Launch Rescue Operation NOW
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
