'use client';

import React, { useState } from 'react';
import {
  MOCK_COMPLAINT_TICKETS,
  ComplaintTicket,
  adminDataService,
} from '@/services/adminData';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  Building2,
  Truck,
  Store,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function ComplaintsDeskView() {
  const [tickets, setTickets] = useState<ComplaintTicket[]>(adminDataService.getComplaints());
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [resolutionInput, setResolutionInput] = useState<{ [id: string]: string }>({});

  const states = Array.from(new Set(tickets.map((t) => t.state)));

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = selectedStatus === 'ALL' || t.status === selectedStatus;
    const matchesSeverity = selectedSeverity === 'ALL' || t.severity === selectedSeverity;
    const matchesState = selectedState === 'ALL' || t.state === selectedState;
    const matchesSearch =
      searchQuery === '' ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.targetEntity.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSeverity && matchesState && matchesSearch;
  });

  const handleUpdateStatus = (id: string, newStatus: ComplaintTicket['status']) => {
    const notes = resolutionInput[id];
    const updated = adminDataService.updateComplaintStatus(id, newStatus, notes);
    if (updated) {
      setTickets([...adminDataService.getComplaints()]);
    }
  };

  // Metrics
  const openCount = tickets.filter((t) => t.status === 'OPEN').length;
  const investigatingCount = tickets.filter((t) => t.status === 'INVESTIGATING').length;
  const criticalCount = tickets.filter((t) => t.severity === 'CRITICAL').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200 mb-1">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            OPERATIONS INCIDENT & GRIEVANCE RESOLUTION DESK
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Complaints & Incident Management
          </h1>
          <p className="text-xs text-slate-500">
            Real-time audit log of courier delays, packaging breaches, temperature excursions, and partner grievances
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-center shadow-xs">
            <div className="text-xs font-bold text-slate-500">Avg Resolution SLA</div>
            <div className="text-lg font-black text-emerald-700">38 mins</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Critical Incidents</span>
            <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-rose-600">{criticalCount}</div>
          <div className="text-[11px] text-rose-700 font-medium">Temperature/safety compliance</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>In Active Investigation</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">{investigatingCount}</div>
          <div className="text-[11px] text-slate-500 font-medium">Manager assigned</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Awaiting Action</span>
            <AlertTriangle className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{openCount}</div>
          <div className="text-[11px] text-slate-500 font-medium">Unassigned tickets</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Resolved (Past 7d)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{resolvedCount}</div>
          <div className="text-[11px] text-emerald-700 font-medium">100% verified closure</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket ID (e.g. CMP-4091), restaurant, NGO, courier..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
              <span className="text-slate-500 font-semibold">State:</span>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All States</option>
                {states.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
              <span className="text-slate-500 font-semibold">Severity:</span>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> STATUS:
          </span>
          {[
            { id: 'ALL', label: 'All Tickets' },
            { id: 'OPEN', label: 'Open' },
            { id: 'INVESTIGATING', label: 'Investigating' },
            { id: 'RESOLVED', label: 'Resolved' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedStatus === st.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.map((t) => {
          const isExpanded = expandedTicketId === t.id;

          return (
            <div
              key={t.id}
              className={`bg-white rounded-2xl border transition-all ${
                isExpanded ? 'border-slate-400 shadow-md' : 'border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              {/* Ticket Row Header */}
              <div
                onClick={() => setExpandedTicketId(isExpanded ? null : t.id)}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {t.id}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        t.severity === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : t.severity === 'HIGH'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {t.severity}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        t.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.status === 'INVESTIGATING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {t.status}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {t.city}, {t.state}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-sm">{t.title}</h3>
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span>
                      Reported by: <strong className="text-slate-700">{t.reporterName}</strong> ({t.reporterType})
                    </span>
                    <span>&bull;</span>
                    <span>
                      Involved Entity: <strong className="text-slate-700">{t.targetEntity}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right text-[11px] text-slate-400">
                    <div>{new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div>{new Date(t.createdAt).toLocaleDateString()}</div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Incident Investigation Details */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl space-y-4 text-xs">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                      Incident Statement:
                    </span>
                    <p className="text-slate-800 bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed font-sans">
                      {t.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Incident Category:
                      </span>
                      <div className="font-bold text-slate-800">{t.category}</div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Assigned Investigation Lead:
                      </span>
                      <div className="font-bold text-emerald-800">{t.assignedManager}</div>
                    </div>
                  </div>

                  {/* Resolution Notes */}
                  {t.resolutionNotes && (
                    <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 space-y-1 text-emerald-950">
                      <div className="font-bold text-[10px] uppercase flex items-center gap-1 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolution Record & Corrective Action:
                      </div>
                      <p className="leading-relaxed">{t.resolutionNotes}</p>
                    </div>
                  )}

                  {/* Actions Bar */}
                  {t.status !== 'RESOLVED' && (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                      <label className="font-bold text-slate-700 block text-[11px]">
                        Add Corrective Action / Resolution Note:
                      </label>
                      <input
                        type="text"
                        value={resolutionInput[t.id] || ''}
                        onChange={(e) =>
                          setResolutionInput({ ...resolutionInput, [t.id]: e.target.value })
                        }
                        placeholder="e.g. Courier counselled on hot lid protocols. Temperature data log verified at 61°C."
                        className="w-full p-2.5 border rounded-lg text-xs"
                      />

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(t.id, 'INVESTIGATING')}
                          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors"
                        >
                          Mark as In Investigation
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(t.id, 'RESOLVED')}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors"
                        >
                          Mark as Resolved & Close Ticket
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredTickets.length === 0 && (
          <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-slate-800">No matching grievances found</h3>
            <p className="text-xs text-slate-500">All commercial donors and recipient NGOs are operating within SLA.</p>
          </div>
        )}
      </div>
    </div>
  );
}
