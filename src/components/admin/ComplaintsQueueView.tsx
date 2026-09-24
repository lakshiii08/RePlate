'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CircleAlert, RefreshCw, Search } from 'lucide-react';
import { Complaint, ComplaintStatus } from '@/types';

const statusLabels: Record<ComplaintStatus, string> = {
  OPEN: 'Open',
  UNDER_REVIEW: 'Under review',
  RESOLVED: 'Resolved',
};

const statusClasses: Record<ComplaintStatus, string> = {
  OPEN: 'bg-rose-50 text-rose-700 ring-rose-200',
  UNDER_REVIEW: 'bg-amber-50 text-amber-700 ring-amber-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

const priorityClasses: Record<Complaint['priority'], string> = {
  High: 'text-rose-700',
  Medium: 'text-amber-700',
  Low: 'text-slate-600',
};

const dateFormat = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export default function ComplaintsQueueView() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ComplaintStatus>('ALL');
  const [stateFilter, setStateFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/complaints', { cache: 'no-store' });
      if (!response.ok) throw new Error('Could not load complaints');
      setComplaints(await response.json());
    } catch {
      setError('Complaints are unavailable. Refresh to try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadComplaints();
  }, []);

  const states = useMemo(
    () => Array.from(new Set(complaints.map((item) => item.state))).sort(),
    [complaints]
  );
  const cities = useMemo(
    () =>
      complaints
        .filter((item) => !stateFilter || item.state === stateFilter)
        .map((item) => item.city)
        .filter((city, index, list) => list.indexOf(city) === index)
        .sort(),
    [complaints, stateFilter]
  );
  const filteredComplaints = useMemo(() => {
    const query = search.trim().toLowerCase();
    return complaints.filter((complaint) => {
      const matchesQuery =
        !query ||
        [
          complaint.id,
          complaint.reporterName,
          complaint.organization,
          complaint.subject,
          complaint.details,
        ].some((value) => value.toLowerCase().includes(query));
      return (
        matchesQuery &&
        (statusFilter === 'ALL' || complaint.status === statusFilter) &&
        (!stateFilter || complaint.state === stateFilter) &&
        (!cityFilter || complaint.city === cityFilter)
      );
    });
  }, [cityFilter, complaints, search, stateFilter, statusFilter]);

  const updateStatus = async (id: string, status: ComplaintStatus) => {
    const previous = complaints;
    setSavingId(id);
    setComplaints((current) =>
      current.map((complaint) =>
        complaint.id === id ? { ...complaint, status } : complaint
      )
    );
    try {
      const response = await fetch('/api/admin/complaints/' + encodeURIComponent(id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Could not update complaint');
    } catch {
      setComplaints(previous);
      setError('The complaint status could not be updated. Try again.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">Administration</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">Complaints</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review and resolve every partner report in one queue.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadComplaints()}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition-colors hover:bg-slate-50"
          aria-label="Refresh complaints"
          title="Refresh complaints"
        >
          <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
        </button>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_150px_150px_150px]">
          <label className="relative block">
            <span className="sr-only">Search complaints</span>
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by report, partner, or reference"
              className="h-9 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none ring-emerald-600 placeholder:text-slate-400 focus:ring-2"
            />
          </label>
          <label className="grid gap-1 text-xs font-medium text-slate-600">
            Status
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as 'ALL' | ComplaintStatus)
              }
              className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none ring-emerald-600 focus:ring-2"
            >
              <option value="ALL">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="UNDER_REVIEW">Under review</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </label>
          <label className="grid gap-1 text-xs font-medium text-slate-600">
            State
            <select
              value={stateFilter}
              onChange={(event) => {
                setStateFilter(event.target.value);
                setCityFilter('');
              }}
              className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none ring-emerald-600 focus:ring-2"
            >
              <option value="">All states</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs font-medium text-slate-600">
            City
            <select
              value={cityFilter}
              onChange={(event) => setCityFilter(event.target.value)}
              className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none ring-emerald-600 focus:ring-2"
            >
              <option value="">All cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <CircleAlert className="h-4 w-4 text-slate-500" />
            <h2 className="text-base font-semibold text-slate-950">All complaints</h2>
          </div>
          <span className="text-xs text-slate-500">
            {filteredComplaints.length} shown
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className={loading ? 'min-w-[1020px] w-full text-left text-sm opacity-60' : 'min-w-[1020px] w-full text-left text-sm'}>
            <thead className="bg-slate-50 text-xs font-medium text-slate-500">
              <tr>
                <th className="px-5 py-3">Report</th>
                <th className="px-5 py-3">Reported by</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Submitted</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredComplaints.map((complaint) => (
                <tr key={complaint.id} className="align-top text-slate-700">
                  <td className="max-w-sm px-5 py-4">
                    <p className="font-medium text-slate-900">{complaint.subject}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                      {complaint.details}
                    </p>
                    <p className="mt-2 text-xs font-medium text-slate-400">{complaint.id}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-800">{complaint.reporterName}</p>
                    <p className="mt-1 text-xs text-slate-500">{complaint.organization}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p>{complaint.city}</p>
                    <p className="mt-1 text-xs text-slate-500">{complaint.state}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className={'font-medium ' + priorityClasses[complaint.priority]}>
                      {complaint.priority}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{complaint.category}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {dateFormat.format(new Date(complaint.submittedAt))}
                  </td>
                  <td className="px-5 py-4">
                    <div className="grid gap-2">
                      <span
                        className={
                          'w-fit rounded px-2 py-1 text-xs font-medium ring-1 ring-inset ' +
                          statusClasses[complaint.status]
                        }
                      >
                        {statusLabels[complaint.status]}
                      </span>
                      <select
                        value={complaint.status}
                        onChange={(event) =>
                          void updateStatus(
                            complaint.id,
                            event.target.value as ComplaintStatus
                          )
                        }
                        disabled={savingId === complaint.id}
                        aria-label={'Update status for ' + complaint.id}
                        className="h-8 min-w-32 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-700 outline-none ring-emerald-600 focus:ring-2 disabled:opacity-60"
                      >
                        <option value="OPEN">Open</option>
                        <option value="UNDER_REVIEW">Under review</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredComplaints.length && !loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    No complaints match these filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
