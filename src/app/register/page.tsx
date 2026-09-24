'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { ArrowRight, User, Mail, Phone, Lock, Utensils, Building2, Truck, ShieldCheck, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('DONOR');
  const [loading, setLoading] = useState(false);

  const getDashboardRoute = (selectedRole: UserRole) => {
    switch (selectedRole) {
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
      const newUser = await register({ name, email, phone, role });
      router.push(getDashboardRoute(newUser.role));
    } catch {
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create your RePlate Account</h1>
          <p className="text-xs text-slate-500">Sign up and get directed straight to your role dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector cards */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Choose Account Role & Workspace</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { r: 'DONOR' as UserRole, label: 'Food Donor', desc: 'Restaurants & Caterers', icon: Utensils, color: 'emerald' },
                { r: 'SHELTER' as UserRole, label: 'Shelter / NGO', desc: 'Receiving Food Banks', icon: Building2, color: 'blue' },
                { r: 'DRIVER' as UserRole, label: 'Volunteer Driver', desc: 'Transport & Logistics', icon: Truck, color: 'amber' },
                { r: 'ADMIN' as UserRole, label: 'Operations Admin', desc: 'System Command', icon: ShieldCheck, color: 'purple' },
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
                    <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
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
            <label className="text-xs font-bold text-slate-700">Full Name / Organization Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Sarah Jenkins (Grand Hyatt Catering)"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="sarah@cateringco.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="+1 (555) 234-5678"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-4"
          >
            {loading ? 'Creating Account & Loading Dashboard...' : `Sign Up & Direct to ${role} Dashboard`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

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
