'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { donationService } from '@/services/donationService';
import { matchingService } from '@/services/matchingService';
import { realtimeEngine } from '@/services/realtime';
import { Donation, Driver, Shelter } from '@/types';
import dynamic from 'next/dynamic';
import RescueCountdown from '@/components/ui/RescueCountdown';
import { MOCK_SHELTERS, MOCK_DRIVERS } from '@/services/mockData';

const RescueMap = dynamic(() => import('@/components/map/RescueMap'), { ssr: false });
import {
  ShieldCheck,
  AlertTriangle,
  Truck,
  Building2,
  Utensils,
  Navigation,
  Clock,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  PhoneCall,
  Sparkles,
  KeyRound,
  MapPin,
  Camera,
  Check,
  Mail,
  Play,
  Pause,
} from 'lucide-react';

export default function LiveRescueTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [donation, setDonation] = useState<Donation | null>(null);

  // Real-time GPS Telemetry stream state
  const [isTelemetryStreaming, setIsTelemetryStreaming] = useState(false);
  const [liveDriverInfo, setLiveDriverInfo] = useState<any>(null);

  // Dynamic Rematch simulation state
  const [riskAlert, setRiskAlert] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [backupOptions, setBackupOptions] = useState<{ drivers: Driver[]; shelters: Shelter[] } | null>(null);
  const [selfDriveDelivered, setSelfDriveDelivered] = useState(false);

  useEffect(() => {
    async function loadData() {
      const d = await donationService.getDonationById(resolvedParams.id);
      setDonation(d);
    }
    loadData();

    // Subscribe to live status transitions across all network nodes
    const unsubStatus = realtimeEngine.subscribe('DONATION_STATUS_UPDATE', (evt) => {
      const p = evt.payload;
      if (p && (p.donationId === resolvedParams.id || p.donation?.id === resolvedParams.id)) {
        setDonation((prev) =>
          prev
            ? {
                ...prev,
                ...(p.donation || {}),
                status: p.status || prev.status,
                ...(p.pickupVerification ? { pickupVerification: p.pickupVerification } : {}),
                ...(p.deliveryVerification ? { deliveryVerification: p.deliveryVerification } : {}),
              }
            : null
        );
      }
    });

    // Subscribe to live driver movement & speedometer updates
    const unsubLoc = realtimeEngine.subscribe('DRIVER_LOCATION_UPDATE', (evt) => {
      const p = evt.payload;
      if (p && (p.activeDonationId === resolvedParams.id || !p.activeDonationId)) {
        setLiveDriverInfo(p);
        if (p.status) {
          setDonation((prev) => (prev ? { ...prev, status: p.status } : null));
        }
      }
    });

    // Background sync polling interval
    const interval = setInterval(loadData, 6000);

    return () => {
      unsubStatus();
      unsubLoc();
      clearInterval(interval);
    };
  }, [resolvedParams.id]);

  const handleToggleTelemetry = async () => {
    if (!donation) return;
    try {
      const { apiClient } = await import('@/services/apiClient');
      if (!isTelemetryStreaming) {
        setIsTelemetryStreaming(true);
        await apiClient.post('/telemetry/simulate-route', { donationId: donation.id, speedMultiplier: 1.5 });
      } else {
        setIsTelemetryStreaming(false);
        await apiClient.post('/telemetry/stop-simulation', { donationId: donation.id });
      }
    } catch (e) {
      console.error('Failed to toggle live telemetry:', e);
    }
  };

  const handleSimulateRisk = async () => {
    if (!donation) return;
    setRiskAlert(true);
    setRecalculating(true);

    const res = await matchingService.triggerDynamicRematch(donation.id, 'Traffic accident blocked primary corridor.');
    setBackupOptions({ drivers: res.backupDrivers, shelters: res.backupShelters });
    setRecalculating(false);
  };

  const handleActivateNewPlan = () => {
    if (!donation || !backupOptions) return;
    setDonation((prev) =>
      prev
        ? {
            ...prev,
            status: 'PICKUP_IN_PROGRESS',
            assignedDriver: backupOptions.drivers[0],
            matchedShelter: backupOptions.shelters[0],
            urgencyLevel: 'normal',
          }
        : null
    );
    setRiskAlert(false);
  };

  const handleConfirmSelfDelivery = async () => {
    if (!donation) return;
    const updated = await donationService.updateDonationStatus(donation.id, 'DELIVERED');
    setDonation(updated);
    setSelfDriveDelivered(true);
  };

  if (!donation) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-semibold text-xs">
        Loading Live Rescue Telemetry...
      </div>
    );
  }

  const isSelfDrive = donation.deliveryMode === 'SELF_DRIVE';

  const volunteerMilestones = [
    { key: 'POSTED', label: 'Donation Posted', done: true },
    { key: 'VERIFIED', label: 'Food Verified (Safety Gate)', done: true },
    { key: 'MATCHED', label: 'AI Matched with Shelter', done: true },
    { key: 'DRIVER_ASSIGNED', label: 'Volunteer Courier Assigned', done: !!donation.assignedDriver },
    {
      key: 'PICKUP_IN_PROGRESS',
      label: 'Courier En Route to Pickup (Ask for OTP)',
      active: donation.status === 'PICKUP_IN_PROGRESS' || donation.status === 'MATCHED' || donation.status === 'DRIVER_ASSIGNED',
      done: donation.status === 'PICKED_UP' || donation.status === 'IN_TRANSIT' || donation.status === 'DELIVERED',
    },
    {
      key: 'PICKED_UP',
      label: 'Food Picked Up & Temp Verified',
      active: donation.status === 'PICKED_UP',
      done: donation.status === 'IN_TRANSIT' || donation.status === 'DELIVERED',
    },
    {
      key: 'IN_TRANSIT',
      label: 'In Transit to Shelter',
      active: donation.status === 'IN_TRANSIT',
      done: donation.status === 'DELIVERED',
    },
    {
      key: 'DELIVERED',
      label: 'Delivered & Shelter Signed',
      active: false,
      done: donation.status === 'DELIVERED',
    },
  ];

  const selfDriveMilestones = [
    { key: 'POSTED', label: 'Donation Posted', done: true },
    { key: 'VERIFIED', label: 'Food Verified (Safety Gate)', done: true },
    { key: 'MATCHED', label: 'AI Matched with Recipient NGO', done: true },
    {
      key: 'IN_TRANSIT',
      label: 'Donor Driving to NGO (Navigation Active)',
      active: donation.status !== 'DELIVERED',
      done: donation.status === 'DELIVERED',
    },
    {
      key: 'DELIVERED',
      label: 'Food Handed Over at Shelter Intake Gate',
      active: false,
      done: donation.status === 'DELIVERED',
    },
  ];

  const currentMilestones = isSelfDrive ? selfDriveMilestones : volunteerMilestones;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <h1 className="text-2xl font-black text-slate-900">Live Rescue Operations Command</h1>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
              #{donation.id}
            </span>
            <span
              className={`text-[11px] font-extrabold px-3 py-1 rounded-full uppercase ${
                isSelfDrive
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
            >
              {isSelfDrive ? '🚗 Donor Self-Drive Mode' : '🛵 Courier Dispatch Mode'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time GPS telemetry, thermal audit tracking, and verified custody stream
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {!isSelfDrive && (
            <>
              <button
                onClick={handleSimulateRisk}
                className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                title="Simulate sudden traffic delay or driver cancellation to test dynamic re-matching"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Simulate Risk Event (Re-Match Test)
              </button>

              <Link
                href={`/driver/rescue/${donation.id}`}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1"
              >
                Open Driver HUD <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </>
          )}

          {isSelfDrive && donation.status !== 'DELIVERED' && (
            <button
              onClick={handleConfirmSelfDelivery}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Confirm Food Dropped Off at NGO
            </button>
          )}
        </div>
      </div>

      {/* DYNAMIC RE-MATCHING RISK ALERT BANNER */}
      {riskAlert && (
        <div className="bg-amber-950 text-white p-6 rounded-2xl border border-amber-700 space-y-4 shadow-xl animate-bounce-slow">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-base">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
              ⚠ Rescue Plan At Risk — High Probability of Delay
            </div>
            <span className="text-xs font-mono bg-amber-900 text-amber-200 px-2.5 py-1 rounded">
              AUTO-REROUTE ENGINE
            </span>
          </div>

          <p className="text-xs text-amber-200 leading-relaxed">
            Primary route experiencing 18-minute congestion spike. Dynamic matching engine has pre-computed alternative fallback route and available backup driver.
          </p>

          {recalculating ? (
            <div className="text-xs text-amber-300 font-mono animate-pulse">
              Recalculating rescue plan & driver availability...
            </div>
          ) : (
            backupOptions && (
              <div className="bg-amber-900/80 p-4 rounded-xl border border-amber-700 space-y-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider">
                  Recommended Fallback Plan:
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-amber-300">Backup Driver:</span> {backupOptions.drivers[0]?.name} ({backupOptions.drivers[0]?.vehicleType})
                  </div>
                  <div>
                    <span className="text-amber-300">Optimized ETA:</span> {backupOptions.drivers[0]?.etaToDonorMinutes} mins
                  </div>
                </div>

                <button
                  onClick={handleActivateNewPlan}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Activate New Rescue Plan NOW
                </button>
              </div>
            )
          )}
        </div>
      )}

      {/* REAL-TIME LIVE GPS TELEMETRY CONTROL BAR */}
      {!isSelfDrive && donation.status !== 'DELIVERED' && (
        <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <span>🛰️ Live Real-Time Courier Telemetry</span>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-mono">
                  WebSocket Stream Active
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Courier: <strong>{donation.assignedDriver?.name || 'Active Volunteer'}</strong> ({donation.assignedDriver?.vehicleType || 'Refrigerated Van'}) &bull;{' '}
                {liveDriverInfo ? (
                  <span>
                    Speed: <strong className="text-emerald-300">{liveDriverInfo.speed} km/h</strong> &bull; ETA:{' '}
                    <strong className="text-amber-300">~{liveDriverInfo.etaMinutes} mins</strong> &bull; Heading:{' '}
                    {liveDriverInfo.heading}°
                  </span>
                ) : (
                  <span className="text-slate-400">Tracking GPS satellite motion stream...</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleToggleTelemetry}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 shadow-md ${
                isTelemetryStreaming
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              {isTelemetryStreaming ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Pause Telemetry
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Start Live Courier Telemetry
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* MAIN TRACKING GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT / MAIN AREA: INTERACTIVE MAP */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-md h-[540px]">
            <RescueMap
              donations={[donation]}
              shelters={donation.matchedShelter ? [donation.matchedShelter] : MOCK_SHELTERS}
              drivers={isSelfDrive ? [] : donation.assignedDriver ? [donation.assignedDriver] : MOCK_DRIVERS}
              activeDonationId={donation.id}
              mode={isSelfDrive ? 'NGO_DESTINATION' : 'DRIVER_APPROACH'}
              height="514px"
            />
          </div>

          {/* ITEM PHOTOS GALLERY (DONOR ADDED) */}
          {donation.photos && donation.photos.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Verified Food Item Photos (Attached by Donor)
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {donation.photos.map((imgUrl, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 bg-slate-100 group shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl}
                      alt={`Food item ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                      Photo #{idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: RESCUE SUMMARY, OTP CARD & MILESTONES */}
        <div className="lg:col-span-4 space-y-5">
          {/* 1. PICKUP HANDOVER OTP CARD (FOR VOLUNTEER DISPATCH) */}
          {!isSelfDrive && (
            <div className="bg-emerald-950 text-white p-5 rounded-2xl border border-emerald-700 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    PICKUP HANDOVER OTP
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  DONOR VERIFICATION PIN
                </span>
              </div>

              <p className="text-xs text-emerald-200 leading-relaxed">
                The volunteer courier will request this 4-digit code upon arrival. Share this code to authorize package handover:
              </p>

              <div className="flex items-center justify-center py-3 bg-emerald-900/90 rounded-xl border border-emerald-600 shadow-inner">
                <span className="font-mono text-3xl font-black tracking-[0.4em] text-white">
                  {donation.pickupOtp || '4829'}
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] text-emerald-300 flex items-start gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Only disclose to the driver upon loading trays into courier vehicle.</span>
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1.5 font-bold bg-emerald-900/40 px-2.5 py-1 rounded-lg border border-emerald-700/60">
                  <Mail className="w-3 h-3 text-emerald-300" />
                  <span>Dispatched to your registered donor email address.</span>
                </div>
              </div>
            </div>
          )}

          {/* 1.5 DELIVERY HANDOVER OTP CARD (ACTIVE IN TRANSIT / DELIVERED) */}
          {!isSelfDrive && (donation.status === 'PICKED_UP' || donation.status === 'IN_TRANSIT' || donation.status === 'DELIVERED') && (
            <div className="bg-blue-950 text-white p-5 rounded-2xl border border-blue-700 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-mono font-bold text-blue-300 uppercase tracking-wider">
                    DELIVERY HANDOVER OTP
                  </span>
                </div>
                <span className="text-[10px] bg-blue-800 text-blue-200 px-2 py-0.5 rounded-full font-bold">
                  SHELTER SIGN-OFF PIN
                </span>
              </div>

              <p className="text-xs text-blue-200 leading-relaxed">
                Dispatched to the recipient shelter and donor email. Shelter intake coordinator will share this with the driver:
              </p>

              <div className="flex items-center justify-center py-3 bg-blue-900/90 rounded-xl border border-blue-600 shadow-inner">
                <span className="font-mono text-3xl font-black tracking-[0.4em] text-white">
                  {donation.deliveryOtp || '8392'}
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] text-blue-300 flex items-start gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <span>Driver must validate this code in their terminal to close the mission.</span>
                </div>
                <div className="text-[10px] text-blue-300 flex items-center gap-1.5 font-bold bg-blue-900/40 px-2.5 py-1 rounded-lg border border-blue-700/60">
                  <Mail className="w-3 h-3 text-blue-300" />
                  <span>Sent to shelter ({donation.matchedShelter?.name || 'Shelter'}) &amp; donor email.</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. SELF-DRIVE NGO DESTINATION CARD */}
          {isSelfDrive && donation.matchedShelter && (
            <div className="bg-blue-950 text-white p-5 rounded-2xl border border-blue-700 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-mono font-bold text-blue-300 uppercase tracking-wider">
                    DESTINATION NGO DROP-OFF
                  </span>
                </div>
                <span className="text-[10px] bg-blue-800 text-blue-200 px-2 py-0.5 rounded-full font-bold">
                  DIRECT DROP
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-white">{donation.matchedShelter.name}</h4>
                <p className="text-xs text-blue-200 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  {donation.matchedShelter.address}
                </p>
                <p className="text-[11px] text-blue-300">
                  Intake Gate: <strong>Rear Loading Bay 2</strong> &bull; Receiving Hours: 7:00 AM – 10:00 PM
                </p>
              </div>

              <div className="pt-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    donation.matchedShelter.address
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <Navigation className="w-3.5 h-3.5" /> Start Turn-by-Turn GPS Navigation
                </a>
              </div>
            </div>
          )}

          {/* 3. RESCUE SUMMARY CARD */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  OPERATIONAL HUD
                </span>
                <h3 className="font-extrabold text-slate-900 text-base">{donation.foodName}</h3>
              </div>
              <RescueCountdown deadline={donation.pickupDeadline} compact />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Portions / Qty:</span>
                <span className="font-bold text-slate-900">{donation.quantity}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Destination NGO:</span>
                <span className="font-bold text-blue-700">{donation.matchedShelter?.name || 'Hope Shelter'}</span>
              </div>
              {!isSelfDrive && (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Courier Name:</span>
                    <span className="font-bold text-amber-700">{donation.assignedDriver?.name || 'Aarav Patel'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Courier Vehicle:</span>
                    <span className="font-bold text-slate-800">{donation.assignedDriver?.vehicleType || 'EV Cargo Car'}</span>
                  </div>
                </>
              )}
              {donation.aiMatchReason && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                  <div className="text-[10px] uppercase font-bold text-emerald-700 mb-0.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Match Explanation
                  </div>
                  {donation.aiMatchReason}
                </div>
              )}
            </div>

            {/* Quick Contact Courier or Shelter */}
            {!isSelfDrive && donation.assignedDriver && (
              <div className="pt-2">
                <a
                  href={`tel:${donation.assignedDriver.phone}`}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                  Call Courier ({donation.assignedDriver.phone})
                </a>
              </div>
            )}
          </div>

          {/* 4. MILESTONES TIMELINE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h4 className="font-extrabold text-slate-900 text-sm">Rescue Progress Milestones</h4>

            <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {currentMilestones.map((m, idx) => (
                <div key={idx} className="flex items-start gap-3 relative z-10 text-xs">
                  <div className="mt-0.5">
                    {m.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 bg-white rounded-full" />
                    ) : m.active ? (
                      <span className="w-4 h-4 rounded-full bg-amber-500 border-2 border-white ring-2 ring-amber-300 animate-ping inline-block" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-slate-300 bg-white inline-block" />
                    )}
                  </div>
                  <div>
                    <span
                      className={`font-semibold ${
                        m.done
                          ? 'text-slate-900 font-bold'
                          : m.active
                          ? 'text-amber-700 font-extrabold'
                          : 'text-slate-400'
                      }`}
                    >
                      {m.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
