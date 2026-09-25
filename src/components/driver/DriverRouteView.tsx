'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Navigation,
  MapPin,
  Building2,
  Phone,
  Clock,
  ExternalLink,
  KeyRound,
  ShieldCheck,
  Compass,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Layers,
  Sparkles,
  Truck,
  FileCheck,
} from 'lucide-react';
import { useRescue } from '@/context/RescueContext';
import { useAuth } from '@/context/AuthContext';
import RescueCountdown from '@/components/ui/RescueCountdown';
import type { NavigatorWaypoint } from '@/components/map/InAppNavigator';

const InAppNavigator = dynamic(() => import('@/components/map/InAppNavigator'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[620px] bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-white gap-3 border border-slate-800">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <div className="text-xs font-bold text-slate-300">Initializing In-App Mapbox Navigation Engine...</div>
      <p className="text-[11px] text-slate-500">Loading vector street tiles, road maneuvers & audio voice engine</p>
    </div>
  ),
});

export default function DriverRouteView() {
  const { donations } = useRescue();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'MAP' | 'MANIFEST'>('MAP');

  // Active assignment
  const activeMission = useMemo(() => {
    return (
      donations.find(
        (d) =>
          d.status === 'DRIVER_ASSIGNED' ||
          d.status === 'PICKUP_IN_PROGRESS' ||
          d.status === 'PICKED_UP' ||
          d.status === 'IN_TRANSIT'
      ) || donations[0]
    );
  }, [donations]);

  const donorAddress = activeMission?.donorAddress || '345 Embarcadero Plaza, Financial District, SF';
  const shelterAddress = activeMission?.matchedShelter?.address || '452 Elm Street, Tenderloin, San Francisco, CA';

  // Navigation Waypoints for In-App Live Mapbox Engine
  const originWaypoint: NavigatorWaypoint = useMemo(
    () => ({
      name: 'Courier Staging Hub',
      address: 'Downtown Logistics Dispatch Hub, San Francisco',
      coords: activeMission?.driverCoords || [37.783, -122.408],
      role: 'ORIGIN',
    }),
    [activeMission]
  );

  const pickupWaypoint: NavigatorWaypoint = useMemo(
    () => ({
      name: activeMission?.donorName || 'Grand Hyatt Catering Dock',
      address: donorAddress,
      coords: activeMission?.donorCoords || [37.7925, -122.3995],
      phone: '+1 (555) 234-5678',
      role: 'PICKUP',
      notes: 'Service Bay 3 via alleyway. Ask for Chef Marcus.',
    }),
    [activeMission, donorAddress]
  );

  const dropoffWaypoint: NavigatorWaypoint = useMemo(
    () => ({
      name: activeMission?.matchedShelter?.name || 'Hope Community Shelter & Kitchen',
      address: shelterAddress,
      coords: activeMission?.matchedShelter?.coords || [37.7749, -122.4194],
      phone: activeMission?.matchedShelter?.contactPhone || '+1 (415) 890-4432',
      role: 'DROPOFF',
      notes: 'Kitchen dock entrance. Ring buzzer #2 for intake receiver.',
    }),
    [activeMission, shelterAddress]
  );

  const currentLeg: 'TO_PICKUP' | 'TO_DROPOFF' =
    activeMission?.status === 'PICKED_UP' || activeMission?.status === 'IN_TRANSIT'
      ? 'TO_DROPOFF'
      : 'TO_PICKUP';

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${encodeURIComponent(
    currentLeg === 'TO_PICKUP' ? donorAddress : shelterAddress
  )}`;

  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(
    currentLeg === 'TO_PICKUP' ? donorAddress : shelterAddress
  )}`;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Real-Time In-App Route Navigation</h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              LIVE MAP ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Turn-by-turn interactive road guidance, live simulation, voice maneuvers, and cold-chain compliance.
          </p>
        </div>

        {/* View Switcher & External Backup */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="p-1 bg-slate-100 rounded-xl flex items-center border border-slate-200">
            <button
              onClick={() => setActiveTab('MAP')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'MAP'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>In-App Live Map</span>
            </button>
            <button
              onClick={() => setActiveTab('MANIFEST')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'MANIFEST'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Manifest & Stops</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors shadow-2xs"
              title="Open Google Maps as offline backup"
            >
              <Compass className="w-3 h-3 text-emerald-600" />
              <span>Google Maps</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </a>

            <a
              href={wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors shadow-2xs"
              title="Open Waze as offline backup"
            >
              <Navigation className="w-3 h-3 text-blue-600" />
              <span>Waze</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </a>
          </div>
        </div>
      </div>

      {activeMission ? (
        <div className="space-y-6">
          {/* Active Mission Telemetry Strip */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-black shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 font-bold">MISSION #{activeMission.id}</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {activeMission.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h2 className="text-sm font-black text-slate-900">{activeMission.foodName} &bull; {activeMission.quantity}</h2>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap w-full md:w-auto justify-between md:justify-end">
              <Link
                href={`/driver/validate-otp?order=${activeMission.id}&stage=${currentLeg}`}
                className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3.5 py-1.5 rounded-xl transition-all shadow-2xs group"
                title="Open Driver OTP Validation Terminal"
              >
                <KeyRound className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <span className="text-[9px] uppercase font-extrabold text-emerald-800 block">Validate Handover OTP</span>
                  <span className="font-extrabold text-xs text-emerald-950 flex items-center gap-1">
                    <span>{currentLeg === 'TO_PICKUP' ? 'Ask Donor for PIN' : 'Ask Shelter for PIN'}</span>
                    <ArrowRight className="w-3 h-3 text-emerald-600" />
                  </span>
                </div>
              </Link>

              <RescueCountdown deadline={activeMission.pickupDeadline} compact />

              <Link
                href={`/driver/rescue/${activeMission.id}`}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                <span>Mission Console</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </Link>
            </div>
          </div>

          {/* TAB 1: IN-APP LIVE MAP NAVIGATION */}
          {activeTab === 'MAP' && (
            <div className="space-y-4">
              <InAppNavigator
                origin={originWaypoint}
                pickup={pickupWaypoint}
                dropoff={dropoffWaypoint}
                currentLeg={currentLeg}
                height="620px"
                mapId="driver-route-view-navigator"
              />

              {/* Waypoint Quick Cards below map */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Donor Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      Step 1: Food Pickup
                    </span>
                    <a
                      href="tel:+15552345678"
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" /> Call Kitchen
                    </a>
                  </div>
                  <div className="font-black text-slate-900 text-sm">{activeMission.donorName}</div>
                  <div className="text-xs text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{activeMission.donorAddress}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    Loading bay entrance via alley ramp &bull; Temperature audit required at handover
                  </div>
                </div>

                {/* Shelter Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                      Step 2: Shelter Dropoff
                    </span>
                    <a
                      href="tel:+14158904432"
                      className="text-xs text-blue-700 hover:text-blue-800 font-bold flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" /> Call Shelter
                    </a>
                  </div>
                  <div className="font-black text-slate-900 text-sm">
                    {activeMission.matchedShelter?.name || 'Hope Community Shelter & Kitchen'}
                  </div>
                  <div className="text-xs text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{activeMission.matchedShelter?.address || '452 Elm Street, Tenderloin, SF'}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    Kitchen receiver dock open &bull; Present delivery code & recipient signature
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANIFEST & SAFETY AUDIT */}
          {activeTab === 'MANIFEST' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Stops Breakdown */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-2xs">
                <h3 className="font-black text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  Mission Itinerary & Waypoints
                </h3>

                {/* Stop 1 */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs text-slate-700 shrink-0">
                    A
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Origin Staging</div>
                    <div className="font-extrabold text-slate-900 text-xs">San Francisco Logistics Hub</div>
                    <div className="text-[11px] text-emerald-700 font-semibold">Active &bull; On Duty</div>
                  </div>
                </div>

                <div className="w-0.5 h-6 bg-slate-200 ml-4 -my-2" />

                {/* Stop 2 */}
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                        B
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-emerald-800 uppercase">Stop 1: Food Pickup</div>
                        <div className="font-black text-slate-900 text-sm">{activeMission.donorName}</div>
                        <div className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{activeMission.donorAddress}</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/driver/validate-otp?order=${activeMission.id}&stage=pickup`}
                      className="font-mono text-xs font-black text-emerald-900 bg-white hover:bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-300 shadow-2xs flex items-center gap-1.5 transition-colors"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Validate Pickup</span>
                    </Link>
                  </div>
                </div>

                <div className="w-0.5 h-6 bg-slate-200 ml-4 -my-2" />

                {/* Stop 3 */}
                <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                        C
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-blue-800 uppercase">Stop 2: Shelter Delivery</div>
                        <div className="font-black text-slate-900 text-sm">
                          {activeMission.matchedShelter?.name || 'Hope Community Shelter & Kitchen'}
                        </div>
                        <div className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{activeMission.matchedShelter?.address || '452 Elm Street, Tenderloin, SF'}</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-extrabold text-blue-900 bg-white px-2 py-0.5 rounded-lg border border-blue-200">
                      Intake Open
                    </span>
                  </div>
                </div>
              </div>

              {/* Safety & Cold Chain Checklist */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xs text-xs">
                  <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Cold-Chain Safety Protocols
                  </h3>

                  <div className="space-y-3">
                    {[
                      { title: 'Temperature Audit', desc: 'Chilled items must register < 5°C. Hot meals must register > 60°C.' },
                      { title: 'Container Seals', desc: 'Verify tamper-evident lids are tightly fitted before loading.' },
                      { title: 'PIN Verification', desc: 'Exchange 4-digit OTP with donor kitchen supervisor.' },
                      { title: 'Recipient Sign-Off', desc: 'Shelter intake personnel must physically verify upon delivery.' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 block font-bold">{item.title}</strong>
                          <span className="text-slate-600 text-[11px] leading-relaxed">{item.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>Food safety notice: Thermal transport bags must remain closed during transit.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-400 text-xs">
          No active route. Claim a delivery run from your dashboard to begin route navigation.
        </div>
      )}
    </div>
  );
}
