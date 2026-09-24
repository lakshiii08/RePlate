'use client';

import React, { useState } from 'react';
import { adminService } from '@/services/adminService';
import { Send, Terminal, ShieldCheck, ArrowRight, Radio, Sliders, MessageSquare } from 'lucide-react';

export default function RescueCopilotView() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: 'DISPATCH ASSISTANT ONLINE: Query real-time rescue status, courier availability, critical decay alerts, or shelter intake bottlenecks.',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const presetQueries = [
    'Which rescue should we prioritize?',
    'What is the status of RP-1024?',
    'Find the best available driver.',
    'Check shelter capacity status.',
  ];

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || query;
    if (!q.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setQuery('');
    setLoading(true);

    const answer = await adminService.askCopilot(q);
    setMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-1">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            OPERATIONAL DISPATCH ASSISTANT
          </div>
          <h1 className="text-2xl font-black text-slate-900">Operations Dispatch Copilot</h1>
          <p className="text-xs text-slate-500">
            Real-time querying of active rescue telemetry, courier positions, and perishability risks
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CHAT INTERFACE */}
        <div className="lg:col-span-8 bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 flex flex-col justify-between h-[540px] shadow-xl">
          {/* Messages list */}
          <div className="space-y-4 overflow-y-auto pr-2">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 font-mono font-bold text-[10px]">
                    OPS
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-lg leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-emerald-600 text-white font-medium'
                      : 'bg-slate-800 border border-slate-700 text-slate-200 font-mono text-[11px]'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                <span className="w-3 h-3 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                Querying live fleet telemetry and route graph...
              </div>
            )}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 pt-4 border-t border-slate-800"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-grow p-3 rounded-xl bg-slate-800 text-white border border-slate-700 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder='Query dispatch e.g. "Which rescue should we prioritize?"'
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </form>
        </div>

        {/* PRESET PROMPTS PANEL */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" /> Operational Dispatch Queries
            </h3>

            <div className="space-y-2">
              {presetQueries.map((pq, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(pq)}
                  className="w-full p-3 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/50 text-slate-800 text-xs font-bold text-left transition-all flex items-center justify-between group"
                >
                  <span>"{pq}"</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </button>
              ))}
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Operational Architecture
              </div>
              <p>
                Responses reflect current real-time telemetry (Distance, ETA, Perishability Windows, Thermal Logs) and comply strictly with food safety standards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
