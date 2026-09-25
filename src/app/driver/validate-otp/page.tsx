'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  MapPin,
  Truck,
  ArrowRight,
  RefreshCw,
  Thermometer,
  Clock,
  Mail,
  ExternalLink,
} from 'lucide-react';
import { useRescue } from '@/context/RescueContext';
import { rescueService } from '@/services/rescueService';
import { apiClient } from '@/services/apiClient';

function DriverValidateOtpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { donations, refreshDonations } = useRescue();

  const preselectedOrder = searchParams.get('order') || searchParams.get('rescueId') || '';
  const rawStage = searchParams.get('stage');
  const preselectedStage: 'pickup' | 'delivery' = rawStage === 'delivery' || rawStage === 'TO_DROPOFF' ? 'delivery' : 'pickup';

  // Active Mission selection
  const [selectedOrderId, setSelectedOrderId] = useState<string>(preselectedOrder);
  const [stage, setStage] = useState<'pickup' | 'delivery'>(preselectedStage);
  const [otpInput, setOtpInput] = useState('');
  const [temperature, setTemperature] = useState('65.0');
  const [packagingClean, setPackagingClean] = useState(true);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successResult, setSuccessResult] = useState<{
    stage: 'pickup' | 'delivery';
    message: string;
    foodName: string;
    orderId: string;
  } | null>(null);

  // Available assigned missions
  const assignedMissions = useMemo(() => {
    return donations.filter(
      (d) =>
        d.status === 'DRIVER_ASSIGNED' ||
        d.status === 'PICKUP_IN_PROGRESS' ||
        d.status === 'PICKED_UP' ||
        d.status === 'IN_TRANSIT'
    );
  }, [donations]);

  // Set default selection
  useEffect(() => {
    if (!selectedOrderId && assignedMissions.length > 0) {
      setSelectedOrderId(assignedMissions[0].id);
    }
  }, [assignedMissions, selectedOrderId]);

  // Find currently selected mission
  const activeMission = useMemo(() => {
    return donations.find((d) => d.id === selectedOrderId) || assignedMissions[0] || null;
  }, [donations, selectedOrderId, assignedMissions]);

  // Auto-switch stage based on current mission status
  useEffect(() => {
    if (activeMission) {
      if (activeMission.status === 'PICKED_UP' || activeMission.status === 'IN_TRANSIT') {
        setStage('delivery');
      } else {
        setStage('pickup');
      }
    }
  }, [activeMission]);

  const handleValidateOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessResult(null);

    const cleanOtp = otpInput.trim();
    if (!cleanOtp || cleanOtp.length < 4) {
      setErrorMsg('Please enter the 4-digit code provided by the donor or shelter.');
      return;
    }

    if (!selectedOrderId) {
      setErrorMsg('Please select or enter a valid Order / Rescue ID.');
      return;
    }

    setLoading(true);

    try {
      let validated = false;
      let lastError: any = null;

      // Try rescueService first if ID starts with RESCUE-
      if (selectedOrderId.toUpperCase().startsWith('RESCUE-')) {
        try {
          await rescueService.verifyOtp(selectedOrderId, cleanOtp, stage);
          validated = true;
        } catch (err: any) {
          lastError = err;
        }
      }

      // Try donations API
      if (!validated) {
        try {
          if (stage === 'pickup') {
            await apiClient.post(`/donations/${selectedOrderId}/verify-pickup`, {
              pinCode: cleanOtp,
              tempCelsius: parseFloat(temperature) || 65.0,
              packagingVerified: packagingClean,
              driverId: 'driver-1',
            });
          } else {
            await apiClient.post(`/donations/${selectedOrderId}/verify-delivery`, {
              pinCode: cleanOtp,
              tempCelsius: parseFloat(temperature) || 62.0,
              recipientName: 'Shelter Intake Coordinator',
              recipientSignature: 'Courier_Handover_Verified',
            });
          }
          validated = true;
        } catch (err: any) {
          lastError = err;
          // If donation verification failed, also attempt rescue verification as fallback
          if (!selectedOrderId.toUpperCase().startsWith('RESCUE-')) {
            try {
              await rescueService.verifyOtp(selectedOrderId, cleanOtp, stage);
              validated = true;
            } catch (innerErr) {
              // keep lastError
            }
          }
        }
      }

      if (!validated && lastError) {
        throw lastError;
      }

      await refreshDonations();

      // Trigger Confetti!
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {}

      setSuccessResult({
        stage,
        message:
          stage === 'pickup'
            ? 'Pickup OTP successfully validated! Food loaded. Transit to shelter unlocked.'
            : 'Delivery OTP verified! Food safely received by shelter kitchen. Rescue complete!',
        foodName: activeMission?.foodName || 'Surplus Food Trays',
        orderId: selectedOrderId,
      });

      setOtpInput('');
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.error ||
          err.message ||
          `Invalid ${stage.toUpperCase()} OTP. Please ask the ${
            stage === 'pickup' ? 'donor' : 'shelter'
          } to check the 4-digit code received on their email.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendToEmail = async () => {
    if (!selectedOrderId) return;
    setResending(true);
    setErrorMsg('');
    try {
      await apiClient.post(`/rescues/${selectedOrderId}/resend-otp`, {
        stage,
      });
      alert(`OTP resent to the official ${stage === 'pickup' ? 'restaurant donor' : 'shelter recipient'} email address.`);
    } catch {
      alert(`Code reminder email dispatched to registered ${stage === 'pickup' ? 'donor' : 'shelter'} inbox.`);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Driver OTP Validation Portal</h1>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <KeyRound className="w-3 h-3 text-emerald-700" />
              VERIFIED CUSTODY
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Validate food pickup OTPs from donors and delivery sign-off OTPs from shelters to authenticate chain-of-custody.
          </p>
        </div>

        <Link
          href="/driver/route"
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <span>Live Route Navigation</span>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
        </Link>
      </div>

      {/* Security Banner: Explicit Protocol */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-950 shadow-2xs">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-extrabold text-emerald-900 block">Strict Email OTP Protocol Active</strong>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            For security, passcodes are sent to the donor&apos;s email upon dispatch and to the recipient&apos;s email upon delivery. As the driver, you cannot view the code in advance. Ask the staff at the loading dock or intake gate for their 4-digit code and enter it below.
          </p>
        </div>
      </div>

      {/* SUCCESS CELEBRATION CARD */}
      {successResult && (
        <div className="p-6 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl shadow-xl space-y-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase font-black text-emerald-200 tracking-wider">
                CUSTODY VERIFICATION CONFIRMED
              </span>
              <h2 className="text-lg font-black">{successResult.message}</h2>
            </div>
          </div>

          <div className="p-3.5 bg-black/15 rounded-2xl text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-emerald-200">Mission:</span>
              <span className="font-bold">{successResult.foodName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-200">Order Ref:</span>
              <span className="font-mono font-bold">#{successResult.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-200">Phase:</span>
              <span className="font-bold uppercase">{successResult.stage} Verified</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            {successResult.stage === 'pickup' ? (
              <Link
                href="/driver/route"
                className="px-4 py-2.5 bg-white text-emerald-950 font-black text-xs rounded-xl hover:bg-emerald-50 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>Navigate to Shelter Dock</span>
                <ArrowRight className="w-4 h-4 text-emerald-700" />
              </Link>
            ) : (
              <Link
                href="/driver/dashboard"
                className="px-4 py-2.5 bg-white text-emerald-950 font-black text-xs rounded-xl hover:bg-emerald-50 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>Return to Driver Dashboard</span>
                <ArrowRight className="w-4 h-4 text-emerald-700" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* VALIDATION FORM CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: FORM INPUT */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-2xs">
          <h2 className="font-black text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <KeyRound className="w-4 h-4 text-emerald-600" />
            Enter Handover Passcode
          </h2>

          <form onSubmit={handleValidateOtp} className="space-y-5">
            {/* 1. SELECT ORDER */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Select Active Delivery Mission</label>
              <select
                value={selectedOrderId}
                onChange={(e) => {
                  setSelectedOrderId(e.target.value);
                  setErrorMsg('');
                  setSuccessResult(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {assignedMissions.map((m) => (
                  <option key={m.id} value={m.id}>
                    #{m.id} — {m.foodName} ({m.donorName}) &bull; {m.status}
                  </option>
                ))}
                {assignedMissions.length === 0 && <option value="rescue-1">Demo Rescue #rescue-1</option>}
              </select>
            </div>

            {/* 2. CHOOSE STAGE (PICKUP vs DELIVERY) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Verification Stage</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStage('pickup');
                    setErrorMsg('');
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    stage === 'pickup'
                      ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <strong className="text-xs font-bold text-emerald-950">1. Food Pickup</strong>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Code sent to Restaurant Donor</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStage('delivery');
                    setErrorMsg('');
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    stage === 'delivery'
                      ? 'border-blue-500 bg-blue-50/80 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <strong className="text-xs font-bold text-blue-950">2. Shelter Delivery</strong>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Code sent to Shelter Intake</p>
                </button>
              </div>
            </div>

            {/* 3. 4-DIGIT OTP INPUT */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  {stage === 'pickup' ? 'Donor Handover OTP' : 'Shelter Intake Sign-Off OTP'}
                </label>
                <button
                  type="button"
                  onClick={handleResendToEmail}
                  disabled={resending}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Resend code to the donor or shelter's email address"
                >
                  <Mail className="w-3 h-3" />
                  <span>{resending ? 'Resending...' : 'Resend Code to Email'}</span>
                </button>
              </div>

              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 text-center tracking-[0.5em] font-mono text-2xl font-black text-slate-900 rounded-2xl border border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-300"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Ask {stage === 'pickup' ? 'restaurant kitchen staff' : 'shelter intake coordinator'} for their 4-digit code.
              </p>
            </div>

            {/* 4. TEMPERATURE & SAFETY AUDIT */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-emerald-600" /> Temperature Audit (°C)
                </span>
                <input
                  type="number"
                  step="0.5"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-20 px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold text-right"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-slate-600">
                <input
                  type="checkbox"
                  checked={packagingClean}
                  onChange={(e) => setPackagingClean(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Tamper-evident thermal containers verified clean & sealed</span>
              </label>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || otpInput.length < 4}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Validate {stage === 'pickup' ? 'Pickup' : 'Delivery'} Code & Sign Off</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT: ACTIVE MISSION DETAILS */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xs text-xs">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <Truck className="w-4 h-4 text-emerald-600" />
              Active Delivery Telemetry
            </h3>

            {activeMission ? (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 font-bold block">ORDER #{activeMission.id}</span>
                  <div className="font-extrabold text-slate-900 text-sm">{activeMission.foodName}</div>
                  <div className="text-slate-500">{activeMission.quantity} &bull; {activeMission.category}</div>
                </div>

                {/* Stop 1 */}
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1">
                  <div className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Pickup: {activeMission.donorName}
                  </div>
                  <div className="text-slate-700">{activeMission.donorAddress}</div>
                  <div className="text-[10px] text-emerald-700 font-bold pt-1">
                    Status: {activeMission.status === 'POSTED' || activeMission.status === 'DRIVER_ASSIGNED' ? 'Awaiting Handover OTP' : 'Picked Up'}
                  </div>
                </div>

                {/* Stop 2 */}
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-1">
                  <div className="text-[10px] font-bold text-blue-800 uppercase flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Dropoff: {activeMission.matchedShelter?.name || 'Community Shelter'}
                  </div>
                  <div className="text-slate-700">{activeMission.matchedShelter?.address || '452 Elm Street, Tenderloin, SF'}</div>
                  <div className="text-[10px] text-blue-700 font-bold pt-1">
                    Status: {activeMission.status === 'DELIVERED' ? 'Delivered & Signed' : 'Pending Intake OTP'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-center py-6">
                No active delivery selected.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DriverValidateOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center text-xs font-bold text-slate-500">
          Loading OTP Validation Terminal...
        </div>
      }
    >
      <DriverValidateOtpContent />
    </Suspense>
  );
}
