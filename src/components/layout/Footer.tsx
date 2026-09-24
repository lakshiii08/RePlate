import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart, Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                R
              </div>
              <span className="font-bold text-white text-lg">RePlate</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time food rescue & logistics engine connecting surplus donors with shelters and volunteers before expiration window closes.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/donor/donations/new" className="hover:text-emerald-400">
                  Post Surplus Food
                </Link>
              </li>
              <li>
                <Link href="/donor/dashboard" className="hover:text-emerald-400">
                  Donor Portal
                </Link>
              </li>
              <li>
                <Link href="/shelter/dashboard" className="hover:text-emerald-400">
                  Shelter Network
                </Link>
              </li>
              <li>
                <Link href="/driver/dashboard" className="hover:text-emerald-400">
                  Driver Fleet
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Architecture & Safety</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <span className="text-slate-300">Deterministic Safety Gate</span>
              </li>
              <li>
                <span className="text-slate-300">Explainable AI Matching</span>
              </li>
              <li>
                <span className="text-slate-300">Dynamic Re-Routing</span>
              </li>
              <li>
                <span className="text-slate-300">Temperature & Photo Verification</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">System Status</h4>
            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                LOGISTICS ENGINE ONLINE
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                WS: ws://localhost:8000
                <br />
                API: http://localhost:8000/api
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>© {new Date().getFullYear()} RePlate Food Rescue Platform. Built for Hackathon Excellence.</div>
          <div className="flex items-center gap-2">
            <span>Powered by Next.js 15, Tailwind & React Leaflet</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
