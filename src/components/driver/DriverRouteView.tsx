'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { useRescue } from '@/context/RescueContext';
import { useAuth } from '@/context/AuthContext';
import RescueCountdown from '@/components/ui/RescueCountdown';

export default function DriverRouteView() {
  const { donations } = useRescue();
  const { user } = useAuth();

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

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${encodeURIComponent(
    activeMission?.status === 'PICKUP_IN_PROGRESS' || activeMission?.status === 'DRIVER_ASSIGNED'
      ? donorAddress
      : shelterAddress
  )}`;

  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(
    activeMission?.status === 'PICKUP_IN_PROGRESS' || activeMission?.status === 'DRIVER_ASSIGNED'
      ? donorAddress
      : shelterAddress
  )}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Active Route & Turn-by-Turn Navigation</h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              LIVE HUD
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-point route itinerary from donor loading bay to community shelter kitchen.
          </p>
        </div>

        {/* External Map Navigation Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Waze Navigation</span>
            <ExternalLink className="w-3 h-3 text-blue-200" />
          </a>
        </div>
      </div>

      {activeMission ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Route Waypoint Itinerary */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">ROUTE MANIFEST #{activeMission.id}</span>
                  <h2 className="text-lg font-black text-slate-900">{activeMission.foodName}</h2>
                  <p className="text-xs text-slate-500">{activeMission.quantity} &bull; {activeMission.category}</p>
                </div>
                <RescueCountdown deadline={activeMission.pickupDeadline} compact />
              </div>

              {/* Waypoint 1: Current Courier Position */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs text-slate-700 shrink-0">
                  A
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Your Position</div>
                  <div className="font-extrabold text-slate-900 text-xs">San Francisco Downtown Hub</div>
                  <div className="text-[11px] text-emerald-700 font-semibold">Active &bull; On Duty</div>
                </div>
              </div>

              <div className="w-0.5 h-6 bg-slate-200 ml-4 -my-2" />

              {/* Waypoint 2: Pickup Location */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                      B
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-emerald-800 uppercase">Stop 1: Pickup Location</div>
                      <div className="font-black text-slate-900 text-sm">{activeMission.donorName}</div>
                      <div className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{activeMission.donorAddress}</span>
                      </div>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-black text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                    OTP: {activeMission.pickupOtp || '4829'}
                  </span>
                </div>

                <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">Loading dock buzzer via service alley</span>
                  <a
                    href="tel:+15552345678"
                    className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3 text-emerald-700" /> Call Kitchen
                  </a>
                </div>
              </div>

              <div className="w-0.5 h-6 bg-slate-200 ml-4 -my-2" />

              {/* Waypoint 3: Drop Location */}
              <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                      C
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-blue-800 uppercase">Stop 2: Final Destination (Dropoff)</div>
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

                <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">Ring buzzer #2 &bull; Kitchen Dock Entrance</span>
                  <a
                    href="tel:+14158904432"
                    className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3 text-blue-700" /> Call Shelter
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Live Guidance Steps & Safety Requirements */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xs text-xs">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                <Navigation className="w-4 h-4 text-emerald-600" />
                Turn-by-Turn Leg Overview
              </h3>

              <div className="space-y-3">
                {[
                  { step: '1', text: 'Proceed west on Market St toward 4th St (0.4 mi)', icon: Compass },
                  { step: '2', text: 'Turn right onto Embarcadero Plaza loading ramp (0.2 mi)', icon: MapPin },
                  { step: '3', text: 'Arrive at Grand Hyatt Catering Dock. Present OTP 4829 to kitchen lead', icon: KeyRound },
                  { step: '4', text: 'Inspect temperature probe (Chilled < 5°C, Hot > 60°C) and load sealed containers', icon: ShieldCheck },
                  { step: '5', text: 'Head west on Geary St toward Elm St (1.2 mi)', icon: Compass },
                  { step: '6', text: 'Arrive at Hope Community Shelter Kitchen. Verify temperature upon handover', icon: CheckCircle2 },
                ].map((leg) => {
                  const Icon = leg.icon;
                  return (
                    <div key={leg.step} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="w-5 h-5 rounded-md bg-white border border-slate-200 font-black text-[10px] text-slate-700 flex items-center justify-center shrink-0">
                        {leg.step}
                      </div>
                      <div className="text-slate-700 font-medium leading-relaxed">{leg.text}</div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>Cold-Chain Assurance: Do not leave thermal transport totes exposed to direct sunlight.</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-400 text-xs">
          No active route. Claim a delivery run from your dashboard to begin route navigation.
        </div>
      )}
    </div>
  );
}
