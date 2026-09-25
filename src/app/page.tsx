'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Navigation,
  RefreshCw,
  Award,
  Sparkles,
  Bot,
  BrainCircuit,
  HelpCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  Utensils,
  Truck,
  Building2,
  ChevronRight,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import RescueCountdown from '@/components/ui/RescueCountdown';
import { useRescue } from '@/context/RescueContext';

const RescueMap = dynamic(() => import('@/components/map/RescueMap'), { ssr: false });

export default function LandingPage() {
  const { impactStats, donations, shelters, drivers, isLiveConnected } = useRescue();
  const sampleActiveDonation = donations[0];

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-8 pb-16 lg:pt-16 lg:pb-24 overflow-hidden border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold border border-emerald-300/60 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                REAL-TIME FOOD RESCUE ENGINE
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                From Surplus to <span className="text-emerald-600 underline decoration-emerald-300">Someone’s Plate.</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
                RePlate connects surplus food with nearby shelters and available drivers before the rescue window expires.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  href="/donor/donations/new"
                  className="px-6 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 group"
                >
                  <Utensils className="w-5 h-5" />
                  Rescue Food Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="#how-it-works"
                  className="px-6 py-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-base border border-slate-300 shadow-sm transition-all text-center flex items-center justify-center gap-2"
                >
                  See How It Works
                </a>
              </div>

              {/* Hero Status Callout */}
              <div className="pt-4 flex items-center gap-6 text-xs text-slate-500 border-t border-slate-200/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Rule-Based Safety Gate</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Sub-Minute Dispatch</span>
                </div>
              </div>
            </div>

            {/* Right Live Map Preview */}
            <div className="lg:col-span-6 relative">
              <div className="bg-white rounded-2xl p-3 shadow-xl border border-slate-200/80 relative">
                {/* Embedded Countdown overlay */}
                <div className="absolute top-6 left-6 z-20 max-w-xs shadow-md">
                  <RescueCountdown
                    deadline={sampleActiveDonation?.pickupDeadline || new Date(Date.now() + 42 * 60000).toISOString()}
                    compact
                  />
                </div>

                <div className="h-[420px] w-full rounded-xl overflow-hidden">
                  <RescueMap
                    donations={donations}
                    shelters={MOCK_SHELTERS}
                    drivers={MOCK_DRIVERS}
                    activeDonationId={sampleActiveDonation?.id}
                    height="420px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE IMPACT COUNTERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <div className="text-center mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Rescue Telemetry</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-3xl sm:text-4xl font-black text-emerald-600 mb-1">
                {impactStats.mealsRescued.toLocaleString()}
              </div>
              <div className="text-xs font-semibold text-slate-600">Meals Rescued</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-3xl sm:text-4xl font-black text-amber-600 mb-1">
                {impactStats.activeRescues}
              </div>
              <div className="text-xs font-semibold text-slate-600">Active Rescues</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-3xl sm:text-4xl font-black text-slate-800 mb-1">
                {(impactStats.foodSavedKg / 1000).toFixed(1)}k kg
              </div>
              <div className="text-xs font-semibold text-slate-600">Food Saved</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-3xl sm:text-4xl font-black text-blue-600 mb-1">
                {impactStats.deliveriesCompleted.toLocaleString()}
              </div>
              <div className="text-xs font-semibold text-slate-600">Deliveries Completed</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-xs font-bold text-emerald-600 tracking-widest uppercase">Process Architecture</h2>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
            POST → VERIFY → MATCH → ROUTE → RESCUE → IMPACT
          </p>
          <p className="text-sm text-slate-600">
            A zero-lag sequence designed to move perishable food safely before decay window expires.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { step: '01', name: 'POST', desc: 'Donor posts surplus in 30 seconds or via AI prompt.', icon: Utensils },
            { step: '02', name: 'VERIFY', desc: 'Deterministic safety rules verify thermal & packaging parameters.', icon: ShieldCheck },
            { step: '03', name: 'MATCH', desc: 'Matching engine computes feasibility scores across shelters.', icon: Zap },
            { step: '04', name: 'ROUTE', desc: 'Driver assigned based on vehicle compatibility & ETA.', icon: Navigation },
            { step: '05', name: 'RESCUE', desc: 'Real-time GPS tracking with temperature audit.', icon: Truck },
            { step: '06', name: 'IMPACT', desc: 'Verified delivery certificate generated & shelter stock updated.', icon: Award },
          ].map((s, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 mb-2">
                  <span>{s.step}</span>
                  <s.icon className="w-4 h-4 text-emerald-600" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm mb-1">{s.name}</h4>
                <p className="text-xs text-slate-500 leading-normal">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. WHY REPLATE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-xs font-bold text-emerald-600 tracking-widest uppercase">Built for Real Operations</h2>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">Why RePlate is Different</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Real-Time Matching',
              desc: 'Sub-second search across shelter requirements, current meal gaps, and storage limits.',
              icon: Zap,
            },
            {
              title: 'Expiry-Aware Rescue',
              desc: 'Dynamic countdown clocks prioritize critical items under 30 minutes before total decay.',
              icon: Clock,
            },
            {
              title: 'Smart Routing',
              desc: 'Optimized travel paths matching vehicle types (Refrigerated van vs E-bike) to food requirements.',
              icon: Navigation,
            },
            {
              title: 'Dynamic Re-Matching',
              desc: 'If a driver delays or shelter closes, system instantly auto-calculates alternative fallback plan.',
              icon: RefreshCw,
            },
            {
              title: 'Verified Food Information',
              desc: 'Digital chain of custody with temperature logging at pickup and recipient sign-off.',
              icon: ShieldCheck,
            },
            {
              title: 'Measurable Impact',
              desc: 'Automated CO2 reduction, meals served, and tax-deductible donor donation audit logs.',
              icon: TrendingUp,
            },
          ].map((card, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <card.icon className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">{card.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. AUTOMATED LOGISTICS & DISPATCH CAPABILITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 lg:p-12 space-y-8 relative overflow-hidden border border-slate-800 shadow-xl">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 text-xs font-bold border border-emerald-800">
              <Zap className="w-3.5 h-3.5" />
              INTELLIGENT DISPATCH & LOGISTICS ENGINE
            </div>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight">
              Automated logistics with transparent safeguards.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Purpose-built automation eliminates manual phone calls and spreadsheets—accelerating perishable food rescue while ensuring 100% auditable food safety compliance.
            </p>
          </div>

          {/* Core Capabilities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 space-y-2">
              <div className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                <Utensils className="w-4 h-4" />
                Natural Language Surplus Parser
              </div>
              <p className="text-xs text-slate-300">
                Transforms unstructured kitchen notes and culinary descriptions into verified categories, meal counts, and thermal parameters.
              </p>
            </div>

            <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 space-y-2">
              <div className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Expiry-Aware Urgency Engine
              </div>
              <p className="text-xs text-slate-300">
                Calculates real-time perishability decay countdowns, escalating couriers dynamically before safe holding thresholds expire.
              </p>
            </div>

            <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 space-y-2">
              <div className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Explainable Feasibility Matching
              </div>
              <p className="text-xs text-slate-300">
                Ranks candidate shelters by dietary need, intake capacity, and live transit ETA with transparent multi-factor scoring.
              </p>
            </div>

            <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 space-y-2">
              <div className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                <Navigation className="w-4 h-4" />
                Operations Copilot & Dispatch
              </div>
              <p className="text-xs text-slate-300">
                Inspects live fleet telemetry and route bottlenecks to recommend automated contingency rerouting and backup couriers.
              </p>
            </div>
          </div>

          {/* Transparent Safety Notice */}
          <div className="bg-amber-950/40 border border-amber-800/60 p-4 rounded-xl flex items-start gap-3 text-xs text-amber-200">
            <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white uppercase tracking-wider block mb-0.5">
                FOOD SAFETY & COMPLIANCE INTEGRITY
              </span>
              Algorithms assist logistical coordination and data entry, but food safety is never left to unpredictable black boxes. All donations pass through deterministic rule verification and physical courier temperature checks.
            </div>
          </div>
        </div>
      </section>

      {/* 6. ROLE PORTAL PREVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-xs font-bold text-emerald-600 tracking-widest uppercase">Role Portals</h2>
          <p className="text-3xl font-extrabold text-slate-900">Tailored Workspaces for Every Stakeholder</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Utensils className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">For Food Donors</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Restaurants, caterers & cafeterias post surplus in seconds. Track pickup status and generate tax-deductible rescue receipts.
              </p>
            </div>
            <Link
              href="/donor/dashboard"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 pt-2"
            >
              Open Donor Dashboard <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">For Shelters & NGOs</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Specify capacity and dietary needs. Receive automatic matched incoming deliveries with verified safety details.
              </p>
            </div>
            <Link
              href="/recipient/dashboard"
              className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 pt-2"
            >
              Open Recipient Dashboard <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">For Volunteer Drivers</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mobile-first route navigation, step-by-step pickup confirmation, thermal verification, and digital recipient sign-off.
              </p>
            </div>
            <Link
              href="/driver/dashboard"
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 pt-2"
            >
              Open Driver Workspace <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
