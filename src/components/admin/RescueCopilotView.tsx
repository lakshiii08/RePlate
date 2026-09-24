'use client';

import React, { useState } from 'react';
import { adminService } from '@/services/adminService';
import { Bot, Sparkles, Send, HelpCircle, Terminal, ShieldCheck, ArrowRight } from 'lucide-react';

export default function RescueCopilotView() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: 'OPERATIONAL AI COPILOT READY: Ask me data-backed questions regarding active rescue feasibility, driver routing options, or risk priorities.',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const presetQueries = [
    'Which rescue should we prioritize?',
    'Why is RP-1024 at risk?',
    'Find the best available driver.',
    'Why is this donation unmatched?',
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
            <Bot className="w-4 h-4 text-emerald-600" />
            DATA-BACKED AI OPERATIONAL ASSISTANT
          </div>
          <h1 className="text-2xl font-black text-slate-900">🤖 AI Rescue Copilot</h1>
          <p className="text-xs text-slate-500">
            Ask operational queries regarding active rescue prioritization, risk root causes, or courier assignment
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
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-lg leading-relaxed font-mono ${
                    m.role === 'user'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-800 border border-slate-700 text-slate-200'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                <span className="w-3 h-3 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                Analyzing active rescue telemetry graph...
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
              placeholder='Ask Copilot e.g., "Which rescue should we prioritize?"'
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" /> Ask
            </button>
          </form>
        </div>

        {/* PRESET PROMPTS PANEL */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" /> Prescribed Admin Queries
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
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Safety Architecture Note
              </div>
              <p>
                AI responses are backed strictly by empirical telemetry data (Distance, ETA, Thermal Logs) and do NOT override deterministic safety gates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
