'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import {
  ArrowRight,
  User,
  Mail,
  Phone,
  Lock,
  Utensils,
  Building2,
  Truck,
  ShieldCheck,
  Sparkles,
  KeyRound,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { sendOtp, verifyOtp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState<UserRole>('DONOR');

  // OTP State (Strict Email Verification)
  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'OTP' && otpCountdown > 0) {
      interval = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    } else if (otpCountdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, otpCountdown]);

  const getDashboardRoute = (selectedRole: UserRole) => {
    switch (selectedRole) {
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

  const handleSendRegistrationOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!name.trim()) {
      setErrorMessage('Please enter your full name or organization lead.');
      return;
    }

    setLoading(true);
    try {
      await sendOtp(email.trim(), role, name.trim());
      setStep('OTP');
      setOtpCode(''); // Strictly blank: retrieved from user's email
      setOtpCountdown(60);
      setCanResend(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send verification code. Please check your email address and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanOtp = otpCode.trim();

    if (!cleanOtp || cleanOtp.length < 4) {
      setErrorMessage('Please enter the 4-digit code sent to your email.');
      return;
    }

    setLoading(true);
    try {
      const newUser = await verifyOtp(email.trim(), cleanOtp, role, {
        name: name.trim(),
        role,
        organization: organization.trim() || name.trim(),
      });
      router.push(getDashboardRoute(newUser.role));
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please check the code sent to your email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50/50">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            Verified Email Registration
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create your RePlate Account</h1>
          <p className="text-xs text-slate-500">
            {step === 'DETAILS'
              ? 'Select your workspace role and register your official organization email'
              : `Enter the code sent to ${email} to complete registration`}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {step === 'DETAILS' ? (
          <form onSubmit={handleSendRegistrationOtp} className="space-y-4">
            {/* Role selector cards */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Choose Workspace Role</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { r: 'DONOR' as UserRole, label: 'Food Donor', desc: 'Restaurants & Hotels', icon: Utensils },
                  { r: 'SHELTER' as UserRole, label: 'Shelter / NGO', desc: 'Receiving Food Banks', icon: Building2 },
                  { r: 'DRIVER' as UserRole, label: 'Volunteer Driver', desc: 'Transport Logistics', icon: Truck },
                  { r: 'ADMIN' as UserRole, label: 'Operations Admin', desc: 'System Command', icon: ShieldCheck },
                ].map((item) => {
                  const active = role === item.r;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.r}
                      type="button"
                      onClick={() => setRole(item.r)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                        active
                          ? 'bg-emerald-50/80 border-emerald-600 shadow-xs ring-2 ring-emerald-600/20'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <div>
                        <div className={`text-xs font-bold ${active ? 'text-emerald-950' : 'text-slate-800'}`}>
                          {item.label}
                        </div>
                        <div className="text-[10px] text-slate-500">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Full Name / Contact Person</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  placeholder="e.g. Mayank Raj"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Organization / Facility Name</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  placeholder="e.g. Spice Route Kitchen / Seva Food Bank"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Official Email Address (OTP will be sent here)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  placeholder="e.g. yourname@gmail.com"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                A 4-digit one-time passcode will be dispatched to this email to verify registration.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Contact Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  placeholder="e.g. +91 98765 43210"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-60"
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
          /* STEP 2: VERIFY REGISTRATION OTP */
          <form onSubmit={handleVerifyRegistration} className="space-y-5">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600" />
                <strong className="text-xs">Check Your Email Inbox</strong>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                We sent a 4-digit verification code to <strong>{email}</strong>. For your privacy and security, passcodes are never displayed on screen.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Enter 4-Digit Passcode</label>
                <button
                  type="button"
                  onClick={() => setStep('DETAILS')}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800"
                >
                  Edit Email
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
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Verify Email & Activate {role} Account</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Didn’t receive the email?</span>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleSendRegistrationOtp}
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

        <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-600 font-bold hover:underline">
            Log in to existing portal
          </Link>
        </div>
      </div>
    </div>
  );
}
