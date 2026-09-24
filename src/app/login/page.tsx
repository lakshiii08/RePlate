'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import {
  ArrowRight,
  Lock,
  Mail,
  ShieldCheck,
  Utensils,
  Building2,
  Truck,
  Eye,
  EyeOff,
  Phone,
  KeyRound,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, sendOtp, verifyOtp } = useAuth();

  // Mode: 'PHONE' or 'EMAIL'
  const [authMode, setAuthMode] = useState<'PHONE' | 'EMAIL'>('PHONE');

  // Phone OTP Flow State
  const [phoneNumber, setPhoneNumber] = useState('+91 98765 23456');
  const [countryCode, setCountryCode] = useState('+91');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtp, setDemoOtp] = useState('8492');
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // New user registration fields (if phone is new)
  const [isNewUser, setIsNewUser] = useState(false);
  const [fullName, setFullName] = useState('');
  const [orgName, setOrgName] = useState('');

  // Email / Password Fallback
  const [email, setEmail] = useState('donor@replate.org');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);

  // Common UI State
  const [selectedRole, setSelectedRole] = useState<UserRole>('DONOR');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Countdown timer for OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && otpCountdown > 0) {
      interval = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    } else if (otpCountdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [otpSent, otpCountdown]);

  const getDashboardRoute = (role: UserRole) => {
    switch (role) {
      case 'DONOR':
        return '/donor/dashboard';
      case 'SHELTER':
        return '/recipient/dashboard';
      case 'DRIVER':
        return '/driver/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/donor/dashboard';
    }
  };

  // 1. Send OTP Handler
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    const clean = phoneNumber.trim();
    if (clean.length < 8) {
      setErrorMessage('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(clean);
      setOtpSent(true);
      setDemoOtp(res.demoOtp || '8492');
      setOtpCode(res.demoOtp || '8492'); // Pre-fill for instant frictionless demo convenience
      setOtpCountdown(60);
      setCanResend(false);
    } catch {
      setErrorMessage('Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP Handler
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!otpCode || otpCode.length < 4) {
      setErrorMessage('Please enter the 4-digit code');
      return;
    }

    setLoading(true);
    try {
      const user = await verifyOtp(phoneNumber, otpCode, selectedRole, {
        name: fullName || (selectedRole === 'DONOR' ? 'Sarah Jenkins' : selectedRole === 'SHELTER' ? 'Hope Shelter Admin' : 'Aarav Volunteer'),
        role: selectedRole,
        organization: orgName || (selectedRole === 'DONOR' ? 'Grand Hyatt Hotel' : selectedRole === 'SHELTER' ? 'Hope Community Shelter' : 'Eco Courier Fleet'),
      });
      router.push(getDashboardRoute(user.role));
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Email Login Handler
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);
    try {
      const user = await login(email, selectedRole);
      router.push(getDashboardRoute(user.role));
    } catch {
      setErrorMessage('Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Preset demo account selector
  const handleSelectDemoProfile = (role: UserRole, phoneNum: string, mail: string) => {
    setSelectedRole(role);
    setPhoneNumber(phoneNum);
    setEmail(mail);
    setOtpSent(false);
    setErrorMessage('');
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* LEFT BRAND SHOWCASE SIDEBAR */}
        <div className="lg:col-span-5 bg-slate-900 text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-600/30">
                R
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">RePlate</span>
            </Link>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 text-[11px] font-extrabold border border-emerald-800/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              REAL-TIME FOOD RESCUE LOGISTICS
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-100 leading-tight">
                From Surplus to <span className="text-emerald-400 underline decoration-emerald-500/50">Someone’s Plate.</span>
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect restaurants, caterers, shelters, and volunteer drivers before food rescue windows expire.
              </p>
            </div>
          </div>

          {/* Operational Telemetry Badge */}
          <div className="relative z-10 my-8 bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 space-y-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              VERIFIED RESCUE NETWORK
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-xl font-black text-emerald-400 block">42,850+</span>
                <span className="text-[11px] text-slate-400">Portions Saved</span>
              </div>
              <div>
                <span className="text-xl font-black text-amber-400 block">&lt; 15 min</span>
                <span className="text-[11px] text-slate-400">Match Buffer</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-[11px] text-slate-400 flex items-center gap-2 pt-4 border-t border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Secure OTP Handover & Temperature Verification</span>
          </div>
        </div>

        {/* RIGHT FORM CONTAINER */}
        <div className="lg:col-span-7 p-8 lg:p-12 space-y-6 flex flex-col justify-center bg-white">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to RePlate</h1>
            <p className="text-xs text-slate-500">Access your donor, shelter receiver, or driver workspace</p>
          </div>

          {/* MODE SELECTOR (PHONE OTP vs EMAIL) */}
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setAuthMode('PHONE');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'PHONE'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" /> Phone OTP Login
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('EMAIL');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'EMAIL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-blue-600" /> Email & Password
            </button>
          </div>

          {/* ROLE SELECTOR */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Account Portal</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('DONOR')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  selectedRole === 'DONOR'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Utensils className="w-4 h-4 text-emerald-600" />
                <span>Food Donor</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('SHELTER')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  selectedRole === 'SHELTER'
                    ? 'border-purple-500 bg-purple-50 text-purple-900 ring-2 ring-purple-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-4 h-4 text-purple-600" />
                <span>NGO / Shelter</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('DRIVER')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  selectedRole === 'DRIVER'
                    ? 'border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Truck className="w-4 h-4 text-blue-600" />
                <span>Driver Courier</span>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* ========================================== */}
          {/* 1. PHONE OTP AUTHENTICATION FLOW */}
          {/* ========================================== */}
          {authMode === 'PHONE' && (
            <div className="space-y-4">
              {!otpSent ? (
                /* STEP 1: ENTER PHONE NUMBER */
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Mobile Phone Number</label>
                    <div className="relative flex rounded-xl border border-slate-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/10 overflow-hidden bg-white">
                      <span className="inline-flex items-center px-3.5 bg-slate-50 border-r border-slate-200 text-xs font-bold text-slate-600 select-none">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="98765 43210"
                        required
                        className="w-full px-3.5 py-3 text-sm font-semibold text-slate-900 focus:outline-none placeholder:text-slate-400"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      We will send a 4-digit verification code to authenticate your session.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send Verification Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* STEP 2: ENTER OTP & VERIFY */
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  {/* Real-life SMS Notification banner mockup */}
                  <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold">Verification code sent to {phoneNumber}</p>
                      <p className="text-[11px] text-emerald-800">
                        Demo OTP Code: <strong className="font-mono text-sm bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-900 tracking-widest">{demoOtp}</strong> (Valid for 5 mins)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">Enter 4-Digit OTP</label>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
                      >
                        Change Number
                      </button>
                    </div>

                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="• • • •"
                        required
                        autoFocus
                        className="w-full pl-10 pr-4 py-3 text-lg font-mono font-bold tracking-widest text-slate-900 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  {/* Resend Countdown */}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {otpCountdown > 0 ? `Resend code in ${otpCountdown}s` : 'Did not receive code?'}
                    </span>
                    {canResend && (
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        className="font-bold text-emerald-600 hover:text-emerald-700"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  {/* Optional user details for new registration */}
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <button
                      type="button"
                      onClick={() => setIsNewUser(!isNewUser)}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    >
                      <span>{isNewUser ? '– Hide Profile Details' : '+ New user? Add Profile Details'}</span>
                    </button>

                    {isNewUser && (
                      <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name</label>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Sarah Jenkins"
                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">Organization / Store Name</label>
                          <input
                            type="text"
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                            placeholder="Grand Hyatt Catering / Hope Shelter"
                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none bg-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Verify OTP & Sign In</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ========================================== */}
          {/* 2. EMAIL & PASSWORD FALLBACK */}
          {/* ========================================== */}
          {authMode === 'EMAIL' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@grandhyatt.com"
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm font-semibold text-slate-900 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <Link href="/forgot-password" className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-10 py-3 text-sm font-semibold text-slate-900 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* QUICK DEMO LOGIN BUTTONS */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
              Quick One-Click Demo Profiles
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectDemoProfile('DONOR', '+91 98765 23456', 'donor@replate.org')}
                className="py-1.5 px-2 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition-colors"
              >
                🥗 Donor Demo
              </button>
              <button
                type="button"
                onClick={() => handleSelectDemoProfile('SHELTER', '+91 98765 87654', 'shelter@replate.org')}
                className="py-1.5 px-2 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition-colors"
              >
                🏠 Shelter Demo
              </button>
              <button
                type="button"
                onClick={() => handleSelectDemoProfile('DRIVER', '+91 98765 11223', 'driver@replate.org')}
                className="py-1.5 px-2 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition-colors"
              >
                🚗 Courier Demo
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500">
            Don’t have an account?{' '}
            <Link href="/register" className="font-extrabold text-emerald-600 hover:text-emerald-700">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
