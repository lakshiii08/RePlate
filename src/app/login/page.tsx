'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import {
  ArrowRight,
  Lock,
  Mail,
  Sparkles,
  ShieldCheck,
  Utensils,
  Building2,
  Truck,
  Eye,
  EyeOff,
  ChevronDown,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('donor@replate.org');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('DONOR');
  const [rememberMe, setRememberMe] = useState(true);

  const getDashboardRoute = (role: UserRole) => {
    switch (role) {
      case 'DONOR':
        return '/donor/dashboard';
      case 'SHELTER':
        return '/shelter/dashboard';
      case 'DRIVER':
        return '/driver/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/donor/dashboard';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, selectedRole);
      router.push(getDashboardRoute(user.role));
    } catch {
      alert('Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setLoading(true);
    setSelectedRole(role);
    const demoEmail = `${role.toLowerCase()}@replate.org`;
    setEmail(demoEmail);
    const user = await login(demoEmail, role);
    router.push(getDashboardRoute(user.role));
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* LEFT BRAND SHOWCASE SIDEBAR (DESKTOP) */}
        <div className="lg:col-span-5 bg-slate-900 text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10 space-y-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-600/30">
                R
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">RePlate</span>
            </Link>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 text-[11px] font-extrabold border border-emerald-800/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              REAL-TIME LOGISTICS ENGINE
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

          {/* Live Telemetry Card */}
          <div className="relative z-10 my-8 bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 space-y-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              OPERATIONAL TELEMETRY
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-xl font-black text-emerald-400 block">42,850+</span>
                <span className="text-[11px] text-slate-400">Meals Rescued</span>
              </div>
              <div>
                <span className="text-xl font-black text-amber-400 block">&lt; 15 min</span>
                <span className="text-[11px] text-slate-400">Dispatch Feasibility</span>
              </div>
            </div>
          </div>

          {/* Bottom Security Assurance */}
          <div className="relative z-10 text-[11px] text-slate-400 flex items-center gap-2 pt-4 border-t border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Deterministic Food Safety Gate & Thermal Verification Enabled</span>
          </div>
        </div>

        {/* RIGHT FORM CONTAINER */}
        <div className="lg:col-span-7 p-8 lg:p-12 space-y-6 flex flex-col justify-center bg-white">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to RePlate</h1>
            <p className="text-xs text-slate-500">Select your account role to access your dedicated workspace</p>
          </div>

          {/* ROLE PORTAL SWITCHER DROPDOWN */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Account Role Portal</label>
            <div className="relative">
              <div className="absolute left-3.5 top-3 text-emerald-600 pointer-events-none">
                {selectedRole === 'DONOR' && <Utensils className="w-4 h-4" />}
                {selectedRole === 'SHELTER' && <Building2 className="w-4 h-4" />}
                {selectedRole === 'DRIVER' && <Truck className="w-4 h-4" />}
                {selectedRole === 'ADMIN' && <ShieldCheck className="w-4 h-4" />}
              </div>
              <select
                value={selectedRole}
                onChange={(e) => {
                  const r = e.target.value as UserRole;
                  setSelectedRole(r);
                  setEmail(`${r.toLowerCase()}@replate.org`);
                }}
                className="w-full pl-10 pr-10 py-3 bg-slate-50 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white appearance-none cursor-pointer transition-all shadow-2xs"
              >
                <option value="DONOR">🍲 Food Donor Portal (donor@replate.org)</option>
                <option value="SHELTER">🏠 Shelter / NGO Portal (shelter@replate.org)</option>
                <option value="DRIVER">🚚 Volunteer Driver Portal (driver@replate.org)</option>
                <option value="ADMIN">⚡ Operations Admin Portal (admin@replate.org)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* QUICK DEMO PERSONA SHORTCUTS */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Quick Hackathon Demo Login (1-Click Direct Redirect)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickLogin('DONOR')}
                type="button"
                className="p-2.5 bg-white hover:bg-emerald-50 text-slate-800 rounded-xl text-xs font-bold transition-all text-left border border-slate-200 hover:border-emerald-300 shadow-2xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                    🍲 Donor Portal
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <span className="block text-[10px] text-slate-400 font-normal">donor@replate.org</span>
              </button>

              <button
                onClick={() => handleQuickLogin('SHELTER')}
                type="button"
                className="p-2.5 bg-white hover:bg-blue-50 text-slate-800 rounded-xl text-xs font-bold transition-all text-left border border-slate-200 hover:border-blue-300 shadow-2xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-blue-700 font-extrabold flex items-center gap-1">
                    🏠 Shelter Portal
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <span className="block text-[10px] text-slate-400 font-normal">shelter@replate.org</span>
              </button>

              <button
                onClick={() => handleQuickLogin('DRIVER')}
                type="button"
                className="p-2.5 bg-white hover:bg-amber-50 text-slate-800 rounded-xl text-xs font-bold transition-all text-left border border-slate-200 hover:border-amber-300 shadow-2xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-amber-700 font-extrabold flex items-center gap-1">
                    🚚 Driver Portal
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <span className="block text-[10px] text-slate-400 font-normal">driver@replate.org</span>
              </button>

              <button
                onClick={() => handleQuickLogin('ADMIN')}
                type="button"
                className="p-2.5 bg-white hover:bg-purple-50 text-slate-800 rounded-xl text-xs font-bold transition-all text-left border border-slate-200 hover:border-purple-300 shadow-2xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-purple-700 font-extrabold flex items-center gap-1">
                    ⚡ Admin Portal
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <span className="block text-[10px] text-slate-400 font-normal">admin@replate.org</span>
              </button>
            </div>
          </div>

          {/* CREDENTIALS FORM */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
                  placeholder="name@organization.org"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <Link href="/forgot-password" className="text-xs text-emerald-600 hover:underline font-semibold">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Remember this device for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Authenticating Session...
                </div>
              ) : (
                <>
                  <span>Sign In to {selectedRole} Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
            Don’t have an account yet?{' '}
            <Link href="/register" className="text-emerald-600 font-bold hover:underline">
              Create a new account / Register organization
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
