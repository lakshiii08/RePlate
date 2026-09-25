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
  RefreshCw,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, sendOtp, verifyOtp } = useAuth();

  // Mode: 'EMAIL_OTP' (Primary) | 'PHONE_OTP' | 'PASSWORD'
  const [authMode, setAuthMode] = useState<'EMAIL_OTP' | 'PHONE_OTP' | 'PASSWORD'>('EMAIL_OTP');

  // Email OTP State
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sentToAddress, setSentToAddress] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // New user registration fields
  const [fullName, setFullName] = useState('');
  const [orgName, setOrgName] = useState('');

  // Password Login
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Common UI State
  const [selectedRole, setSelectedRole] = useState<UserRole>('DONOR');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

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

  // 1. Send OTP Strictly to Email
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    const targetIdentifier = authMode === 'EMAIL_OTP' ? email.trim() : phoneNumber.trim();

    if (authMode === 'EMAIL_OTP') {
      if (!targetIdentifier || !targetIdentifier.includes('@')) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
    } else {
      if (targetIdentifier.length < 8) {
        setErrorMessage('Please enter a valid phone number.');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await sendOtp(targetIdentifier, selectedRole, fullName);
      setOtpSent(true);
      setSentToAddress(res.sentTo || targetIdentifier);
      setOtpCode(''); // STRICTLY BLANK: User must get code from their actual email inbox!
      setOtpCountdown(60);
      setCanResend(false);
      setSuccessNotice(res.message || `Verification code sent to ${targetIdentifier}.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send verification code to your email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP Handler
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanCode = otpCode.trim();

    if (!cleanCode || cleanCode.length < 4) {
      setErrorMessage('Please enter the 4-digit code sent to your email.');
      return;
    }

    setLoading(true);
    const targetIdentifier = authMode === 'EMAIL_OTP' ? email.trim() : phoneNumber.trim();

    try {
      const emailPrefix = targetIdentifier.includes('@') ? targetIdentifier.split('@')[0] : 'Partner';
      const fallbackName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1).replace(/[._]/g, ' ');
      const user = await verifyOtp(targetIdentifier, cleanCode, selectedRole, {
        name: fullName || fallbackName,
        role: selectedRole,
        organization: orgName || `${selectedRole} Organization`,
      });
      router.push(getDashboardRoute(user.role));
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please check the code in your email inbox.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Password Fallback Login
  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);
    try {
      const user = await login(email, selectedRole);
      router.push(getDashboardRoute(user.role));
    } catch {
      setErrorMessage('Login failed. Please verify your credentials or use Email OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 bg-slate-50/50">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-slate-200 overflow-hidden shadow-2xl bg-white">
        {/* LEFT BRAND PANEL */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-8 lg:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-slate-950 text-base shadow-lg shadow-emerald-500/30">
                R
              </div>
              <span className="text-xl font-black tracking-tight text-white">RePlate</span>
            </div>

            <div className="space-y-2 pt-6">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                STRICT EMAIL VERIFICATION
              </span>
              <h2 className="text-2xl font-black tracking-tight text-white leading-tight">
                Surplus Food Rescue & Logistics Network
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect surplus food directly to community kitchens and shelters with cryptographically verified OTP handovers.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-3 pt-8">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 backdrop-blur-xs">
              <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Security Protocol
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Authentication codes and delivery handovers are transmitted strictly via email to guarantee legitimate custody.
              </p>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-2 border-t border-slate-800">
              <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>10-minute secure single-use email passcodes</span>
            </div>
          </div>
        </div>

        {/* RIGHT FORM CONTAINER */}
        <div className="lg:col-span-7 p-8 lg:p-12 space-y-6 flex flex-col justify-center bg-white">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to RePlate</h1>
            <p className="text-xs text-slate-500">Access your donor, shelter receiver, or driver courier portal</p>
          </div>

          {/* MODE SELECTOR (EMAIL OTP vs PHONE OTP vs PASSWORD) */}
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setAuthMode('EMAIL_OTP');
                setOtpSent(false);
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'EMAIL_OTP'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-emerald-600" /> Email OTP (Direct)
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('PHONE_OTP');
                setOtpSent(false);
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'PHONE_OTP'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-blue-600" /> Phone OTP
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('PASSWORD');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'PASSWORD'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-slate-600" /> Password
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

          {successNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* ========================================== */}
          {/* 1. EMAIL / PHONE OTP AUTHENTICATION FLOW   */}
          {/* ========================================== */}
          {(authMode === 'EMAIL_OTP' || authMode === 'PHONE_OTP') && (
            <div className="space-y-4">
              {!otpSent ? (
                /* STEP 1: ENTER EMAIL / PHONE & DISPATCH CODE */
                <form onSubmit={handleSendOtp} className="space-y-4">
                  {authMode === 'EMAIL_OTP' ? (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Your Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="yourname@gmail.com"
                          required
                          className="w-full pl-10 pr-4 py-3 text-sm font-semibold text-slate-900 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 placeholder:text-slate-400"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500">
                        We will send a 4-digit verification code to your actual email inbox.
                      </p>
                    </div>
                  ) : (
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
                        A verification code will be dispatched to your registered address.
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send Verification Code to Email</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* STEP 2: ENTER OTP & VERIFY (STRICTLY FROM INBOX) */
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  {/* Clean Email Dispatch Notification - Strictly NO OTP displayed on frontend */}
                  <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1.5 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span className="font-extrabold text-xs text-emerald-900">
                        Verification Code Dispatched to Email
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      We sent your one-time passcode to <strong>{sentToAddress || email}</strong>. Please check your email inbox (and spam/junk folder) and enter the 4-digit code below.
                    </p>
                    <div className="text-[10px] text-emerald-700 font-semibold pt-1 border-t border-emerald-200/60 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Security Standard: Passcodes are never exposed on the web interface.</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">Enter 4-Digit Passcode</label>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpCode('');
                        }}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800"
                      >
                        Change Email
                      </button>
                    </div>

                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••"
                        required
                        autoFocus
                        className="w-full pl-10 pr-4 py-3 text-center tracking-[0.4em] font-mono text-xl font-black text-slate-900 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length < 4}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Verify Email & Sign In</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Didn’t receive the code?</span>
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Resend Code
                      </button>
                    ) : (
                      <span className="text-slate-400 font-medium">Resend in {otpCountdown}s</span>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ========================================== */}
          {/* 2. PASSWORD FALLBACK                      */}
          {/* ========================================== */}
          {authMode === 'PASSWORD' && (
            <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
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

          {/* LIVE EMAIL VERIFICATION BADGE */}
          <div className="pt-2 border-t border-slate-100">
            <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl text-center space-y-1">
              <span className="text-[11px] font-extrabold text-emerald-900 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Live Email OTP Verification Active
              </span>
              <p className="text-[11px] text-emerald-800 leading-normal">
                Enter your real email above. A secure 4-digit code will be generated and dispatched directly to your inbox via the configured system sender.
              </p>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500">
            Don’t have an account?{' '}
            <Link href="/register" className="font-extrabold text-emerald-600 hover:text-emerald-700">
              Create an Account with Email Verification
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
