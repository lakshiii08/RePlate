'use client';

import React, { useState, useMemo } from 'react';
import {
  Bell,
  Clock,
  AlertTriangle,
  XCircle,
  Truck,
  MessageSquareWarning,
  CheckCircle2,
  ShieldAlert,
  Send,
  Check,
  RefreshCw,
  Plus,
  FileSpreadsheet,
  CheckCheck,
  X,
} from 'lucide-react';

export type AlertCategory =
  | 'DELAYED_PICKUP'
  | 'EXPIRING_FOOD'
  | 'FAILED_DELIVERY'
  | 'UNASSIGNED_DELIVERY'
  | 'REPORTED_ISSUE';

export interface OperationalAlert {
  id: string;
  category: AlertCategory;
  categoryLabel: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  entity: string;
  location: string;
  timestamp: string;
  resolved: boolean;
  suggestedAction: string;
}

const INITIAL_ALERTS: OperationalAlert[] = [
  {
    id: 'alt-101',
    category: 'DELAYED_PICKUP',
    categoryLabel: 'Delayed Pickup',
    title: 'Courier 35 minutes behind scheduled arrival',
    description: 'Driver Kenji Takahashi encountered heavy traffic on US-101. Donor Grand Hyatt catering holding hot trays.',
    severity: 'HIGH',
    entity: 'Driver: Kenji Takahashi &bull; Donor: Grand Hyatt',
    location: 'Financial District, SF',
    timestamp: '8 mins ago',
    resolved: false,
    suggestedAction: 'Notify donor of updated ETA or reroute backup courier',
  },
  {
    id: 'alt-102',
    category: 'EXPIRING_FOOD',
    categoryLabel: 'Expiring Food',
    title: 'Surplus buffet window expires in 28 minutes',
    description: '35 kg prepared rice & stew approaching the safe 4-hour hot-holding limit without shelter intake confirmation.',
    severity: 'CRITICAL',
    entity: 'Rescue #RP-3921 &bull; Catered Luncheon Trays',
    location: 'SOMA, San Francisco',
    timestamp: '12 mins ago',
    resolved: false,
    suggestedAction: 'Expedite priority direct drop to Hope Community Kitchen',
  },
  {
    id: 'alt-103',
    category: 'UNASSIGNED_DELIVERY',
    categoryLabel: 'Unassigned Delivery',
    title: '40 hot dinners waiting for volunteer courier',
    description: 'Bella Vista Trattoria completed cooking at 7:30 PM. No nearby volunteer auto-accepted within 10-minute window.',
    severity: 'HIGH',
    entity: 'Donation #RP-4102 &bull; Bella Vista Trattoria',
    location: 'North Beach, SF',
    timestamp: '15 mins ago',
    resolved: false,
    suggestedAction: 'Dispatch reserve refrigerated transport van',
  },
  {
    id: 'alt-104',
    category: 'FAILED_DELIVERY',
    categoryLabel: 'Failed Delivery',
    title: 'Temperature deviation recorded at drop-off',
    description: 'Recipient shelter temperature probe measured chilled salad trays at 9.2°C (threshold: < 5°C). Food safety audit triggered.',
    severity: 'CRITICAL',
    entity: 'Rescue #RP-2804 &bull; Grace Haven Shelter',
    location: 'Tenderloin, SF',
    timestamp: '32 mins ago',
    resolved: false,
    suggestedAction: 'Hold items for safety review or safe non-consumption compost diversion',
  },
  {
    id: 'alt-105',
    category: 'REPORTED_ISSUE',
    categoryLabel: 'Reported Issues',
    title: 'Donor reported packaging seal breach by courier',
    description: 'Bakery manager reported bulk pastry bags were mishandled during transport loading.',
    severity: 'MEDIUM',
    entity: 'Ticket #TK-842 &bull; Whole Harvest Grocers',
    location: 'Mission District, SF',
    timestamp: '45 mins ago',
    resolved: false,
    suggestedAction: 'Contact volunteer coordinator and verify sealed containers',
  },
];

export default function AdminAlertsView() {
  const [alerts, setAlerts] = useState<OperationalAlert[]>(INITIAL_ALERTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [toastMsg, setToastMsg] = useState('');

  // New Alert Modal
  const [isNewAlertModalOpen, setIsNewAlertModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<AlertCategory>('DELAYED_PICKUP');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSeverity, setNewSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('HIGH');
  const [newEntity, setNewEntity] = useState('');
  const [newLocation, setNewLocation] = useState('San Francisco Downtown');
  const [newAction, setNewAction] = useState('Reroute dispatch team immediately');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleResolveAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolved: true } : a))
    );
    triggerToast('Alert marked as resolved');
  };

  const handleResolveAll = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, resolved: true })));
    triggerToast('All active alerts marked as resolved');
  };

  const handleTriggerAction = (alert: OperationalAlert) => {
    handleResolveAlert(alert.id);
    triggerToast(`Action executed: ${alert.suggestedAction}`);
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    const categoryLabels: Record<AlertCategory, string> = {
      DELAYED_PICKUP: 'Delayed Pickup',
      EXPIRING_FOOD: 'Expiring Food',
      FAILED_DELIVERY: 'Failed Delivery',
      UNASSIGNED_DELIVERY: 'Unassigned Delivery',
      REPORTED_ISSUE: 'Reported Issues',
    };

    const created: OperationalAlert = {
      id: `alt-${Date.now().toString().slice(-4)}`,
      category: newCategory,
      categoryLabel: categoryLabels[newCategory],
      title: newTitle.trim(),
      description: newDescription.trim(),
      severity: newSeverity,
      entity: newEntity.trim() || 'Rescue Dispatch',
      location: newLocation.trim(),
      timestamp: 'Just now',
      resolved: false,
      suggestedAction: newAction.trim() || 'Review dispatch parameters',
    };

    setAlerts((prev) => [created, ...prev]);
    setIsNewAlertModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setNewEntity('');
    triggerToast(`Alert #${created.id} simulated and added to live dispatch board`);
  };

  const handleExportCSV = () => {
    const headers = ['Alert ID', 'Category', 'Severity', 'Title', 'Description', 'Entity', 'Location', 'Timestamp', 'Status', 'Resolution Action'];
    const rows = filteredAlerts.map((a) => [
      a.id,
      a.categoryLabel,
      a.severity,
      `"${a.title.replace(/"/g, '""')}"`,
      `"${a.description.replace(/"/g, '""')}"`,
      `"${a.entity.replace(/"/g, '""')}"`,
      `"${a.location.replace(/"/g, '""')}"`,
      a.timestamp,
      a.resolved ? 'RESOLVED' : 'ACTIVE',
      `"${a.suggestedAction.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RePlate_Operational_Alerts_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Alerts incident log exported to CSV');
  };

  const activeAlerts = useMemo(() => alerts.filter((a) => !a.resolved), [alerts]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (selectedCategory === 'ALL') return true;
      return a.category === selectedCategory;
    });
  }, [alerts, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Real-Time Operational Alerts</h1>
            <span
              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                activeAlerts.length > 0 ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {activeAlerts.length} ACTIVE INCIDENTS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry flagging delayed couriers, expiring food batches, failed deliveries, and reported anomalies.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsNewAlertModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Simulate Alert</span>
          </button>

          {activeAlerts.length > 0 && (
            <button
              onClick={handleResolveAll}
              className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 transition-all border border-emerald-200"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Resolve All</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export Log</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 5 Core Alert Categories Filters (Lakshita MVP spec) */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: 'ALL', label: `All Alerts (${alerts.length})` },
          { key: 'DELAYED_PICKUP', label: 'Delayed Pickups' },
          { key: 'EXPIRING_FOOD', label: 'Expiring Food' },
          { key: 'FAILED_DELIVERY', label: 'Failed Deliveries' },
          { key: 'UNASSIGNED_DELIVERY', label: 'Unassigned Deliveries' },
          { key: 'REPORTED_ISSUE', label: 'Reported Issues' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setSelectedCategory(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              selectedCategory === f.key
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-black'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-white rounded-3xl border p-5 shadow-2xs transition-all space-y-3 ${
              alert.resolved
                ? 'opacity-60 border-slate-200'
                : alert.severity === 'CRITICAL'
                ? 'border-rose-300 ring-2 ring-rose-100/50'
                : 'border-amber-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800'
                        : alert.severity === 'HIGH'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {alert.severity}
                  </span>

                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {alert.categoryLabel}
                  </span>

                  <span className="text-slate-400 text-xs">&bull;</span>
                  <span className="text-[11px] text-slate-400">{alert.timestamp}</span>

                  {alert.resolved && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> RESOLVED
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black text-slate-900 mt-1">{alert.title}</h3>
                <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">{alert.description}</p>
              </div>

              {/* Action Buttons */}
              {!alert.resolved && (
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    onClick={() => handleTriggerAction(alert)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    <span>Execute Action</span>
                  </button>

                  <button
                    onClick={() => handleResolveAlert(alert.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    Resolve
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Meta & Suggested Action */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3 text-slate-500">
                <span dangerouslySetInnerHTML={{ __html: alert.entity }} />
                <span>&bull;</span>
                <span>{alert.location}</span>
              </div>

              <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                <span className="text-slate-400 uppercase text-[10px] font-bold">Recommended:</span>
                <span>{alert.suggestedAction}</span>
              </div>
            </div>
          </div>
        ))}

        {filteredAlerts.length === 0 && (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-8 text-center text-slate-400 text-xs">
            No alerts found under this category. Dispatch fleet running optimally.
          </div>
        )}
      </div>

      {/* Simulate / Create Risk Alert Modal */}
      {isNewAlertModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="font-black text-slate-900 text-base">Simulate Dispatch Risk Alert</h3>
              </div>
              <button
                onClick={() => setIsNewAlertModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase">Alert Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as AlertCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                  >
                    <option value="DELAYED_PICKUP">Delayed Pickup</option>
                    <option value="EXPIRING_FOOD">Expiring Food</option>
                    <option value="FAILED_DELIVERY">Failed Delivery</option>
                    <option value="UNASSIGNED_DELIVERY">Unassigned Delivery</option>
                    <option value="REPORTED_ISSUE">Reported Issue</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase">Alert Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Courier late due to vehicle flat tire"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase">Description / Details *</label>
                <textarea
                  rows={2}
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="e.g. Courier reported flat tire at 3rd & Market. 25 kg cooked rice awaiting transfer."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase">Entity / Rescue ID</label>
                  <input
                    type="text"
                    value={newEntity}
                    onChange={(e) => setNewEntity(e.target.value)}
                    placeholder="Rescue #RP-3921"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase">Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase">Suggested Action</label>
                <input
                  type="text"
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  placeholder="e.g. Dispatch backup courier immediately"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewAlertModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold flex items-center gap-1.5 shadow-xs"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Log Alert</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
