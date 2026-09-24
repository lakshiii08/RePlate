'use client';

import React, { useState } from 'react';
import { adminService, SafetyReviewItem } from '@/services/adminService';
import { ShieldCheck, CheckCircle2, XCircle, HelpCircle, AlertTriangle } from 'lucide-react';

export default function SafetyReviewView() {
  const [items, setItems] = useState<SafetyReviewItem[]>([
    {
      id: 'SR-201',
      donationId: 'RP-1029',
      donorName: 'Bistro 33 Caterers',
      foodName: 'Seafood Paella Trays',
      category: 'Cooked Meal',
      storageMethod: 'hot_held',
      pickupDeadline: new Date(Date.now() + 45 * 60000).toISOString(),
      flaggedReason: 'Unsealed thermal lid declaration requires manual audit check for hot seafood.',
      status: 'PENDING_REVIEW',
    },
    {
      id: 'SR-202',
      donationId: 'RP-1030',
      donorName: 'Organic Salad Bar',
      foodName: 'Chilled Caesar Salad Bowl',
      category: 'Fresh Produce',
      storageMethod: 'refrigerated',
      pickupDeadline: new Date(Date.now() + 60 * 60000).toISOString(),
      flaggedReason: 'Missing explicit dairy allergen declaration.',
      status: 'PENDING_REVIEW',
    },
  ]);

  const handleAction = (id: string, actionStatus: SafetyReviewItem['status']) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: actionStatus } : item))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-1">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            RULE-BASED DETERMINISTIC SAFETY AUDIT
          </div>
          <h1 className="text-2xl font-black text-slate-900">🥗 Safety Review</h1>
          <p className="text-xs text-slate-500">
            Pending food safety audits flagged by rule-based thermal & allergen verification logic
          </p>
        </div>
      </div>

      {/* SECTION 7 SMALL MVP SAFETY REVIEW TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-amber-50 border-b border-amber-200 text-xs text-amber-950 flex items-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Safety Criteria Integrity:</strong> Food safety verification relies strictly on deterministic rule checks (temperature threshold & sealed packaging). AI assists in flagging missing declarations.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 font-bold text-slate-500 border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Donation</th>
                <th className="p-4">Food</th>
                <th className="p-4">Storage</th>
                <th className="p-4">Pickup Time</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-bold text-slate-900">
                    #{item.donationId}
                    <div className="text-[10px] text-slate-400 font-normal">{item.donorName}</div>
                  </td>
                  <td className="p-4 font-bold text-slate-800">{item.foodName}</td>
                  <td className="p-4 font-mono font-bold uppercase">{item.storageMethod}</td>
                  <td className="p-4 font-mono">
                    {new Date(item.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        item.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1.5">
                    {item.status === 'PENDING_REVIEW' ? (
                      <>
                        <button
                          onClick={() => handleAction(item.id, 'APPROVED')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px]"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(item.id, 'REJECTED')}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[11px]"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleAction(item.id, 'CLARIFICATION_REQUESTED')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[11px]"
                        >
                          Request Clarification
                        </button>
                      </>
                    ) : (
                      <span className="text-slate-400 font-bold">Audit Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
