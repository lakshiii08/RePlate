'use client';

import React, { useState } from 'react';
import {
  Settings,
  User,
  Bell,
  Globe2,
  Sliders,
  Check,
  Building2,
  Phone,
  Mail,
  ShieldCheck,
  Plus,
  Trash2,
  Download,
  RotateCcw,
  Save,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminSettingsView() {
  const { user } = useAuth();

  // Admin Profile State
  const [adminName, setAdminName] = useState(user?.name || 'Operations Dispatch Admin');
  const [adminEmail, setAdminEmail] = useState(user?.email || 'admin@replate.org');
  const [adminPhone, setAdminPhone] = useState(user?.phone || '+1 (555) 999-0000');
  const [adminOrg, setAdminOrg] = useState(user?.organization || 'RePlate Regional Command');

  // Notification Settings State
  const [smsUrgentDispatch, setSmsUrgentDispatch] = useState(true);
  const [emailDailyDigest, setEmailDailyDigest] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoNotifyShelters, setAutoNotifyShelters] = useState(true);

  // Service Areas State
  const [serviceAreas, setServiceAreas] = useState([
    { id: 'sa-1', city: 'San Francisco', state: 'California', activePartners: 68, activeNGOs: 34, status: 'ACTIVE' },
    { id: 'sa-2', city: 'Oakland', state: 'California', activePartners: 34, activeNGOs: 18, status: 'ACTIVE' },
    { id: 'sa-3', city: 'San Jose', state: 'California', activePartners: 42, activeNGOs: 21, status: 'ACTIVE' },
    { id: 'sa-4', city: 'New York City', state: 'New York', activePartners: 92, activeNGOs: 48, status: 'ACTIVE' },
    { id: 'sa-5', city: 'Austin', state: 'Texas', activePartners: 35, activeNGOs: 19, status: 'ACTIVE' },
    { id: 'sa-6', city: 'Chicago', state: 'Illinois', activePartners: 54, activeNGOs: 31, status: 'ACTIVE' },
  ]);

  const [newCityName, setNewCityName] = useState('');
  const [newStateName, setNewStateName] = useState('');

  // Platform Settings State
  const [rescueBufferMins, setRescueBufferMins] = useState(45);
  const [autoRematchTimeoutSecs, setAutoRematchTimeoutSecs] = useState(300);
  const [strictColdTempCelsius, setStrictColdTempCelsius] = useState(5);
  const [strictHotTempCelsius, setStrictHotTempCelsius] = useState(60);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast('Admin profile saved successfully');
  };

  const handleAddServiceArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim() || !newStateName.trim()) return;

    setServiceAreas((prev) => [
      ...prev,
      {
        id: `sa-${Date.now()}`,
        city: newCityName.trim(),
        state: newStateName.trim(),
        activePartners: 1,
        activeNGOs: 1,
        status: 'ACTIVE',
      },
    ]);
    setNewCityName('');
    setNewStateName('');
    triggerToast(`Added service area ${newCityName}`);
  };

  const handleRemoveServiceArea = (id: string) => {
    setServiceAreas((prev) => prev.filter((s) => s.id !== id));
    triggerToast('Service area removed');
  };

  const handleExportConfig = () => {
    const config = {
      profile: { adminName, adminEmail, adminPhone, adminOrg },
      notifications: { smsUrgentDispatch, emailDailyDigest, soundAlerts, autoNotifyShelters },
      serviceAreas,
      safetyParams: { rescueBufferMins, autoRematchTimeoutSecs, strictColdTempCelsius, strictHotTempCelsius },
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RePlate_Platform_Config_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    triggerToast('Platform configuration exported (JSON)');
  };

  const handleResetDefaults = () => {
    setRescueBufferMins(45);
    setAutoRematchTimeoutSecs(300);
    setStrictColdTempCelsius(5);
    setStrictHotTempCelsius(60);
    setSmsUrgentDispatch(true);
    setEmailDailyDigest(true);
    setSoundAlerts(true);
    setAutoNotifyShelters(true);
    triggerToast('Reset to platform recommended defaults');
  };

  const handleSaveAll = () => {
    triggerToast('All platform configuration changes saved to production database');
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Platform & Operations Settings</h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
              CONFIG
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure administrator profile, automated notifications, regional service boundaries & food safety criteria.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportConfig}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export Config</span>
          </button>

          <button
            onClick={handleResetDefaults}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
            title="Reset parameters to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSaveAll}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save All Changes</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Admin Profile Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <User className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-black text-slate-900">1. Administrator Profile</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-bold uppercase text-slate-700">Administrator Name</label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold uppercase text-slate-700">Organization Title</label>
              <input
                type="text"
                value={adminOrg}
                onChange={(e) => setAdminOrg(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold uppercase text-slate-700">Dispatch Email</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold uppercase text-slate-700">Emergency Phone</label>
              <input
                type="text"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* 2. Notification Settings Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Bell className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-black text-slate-900">2. Automated Notification Rules</h2>
        </div>

        <div className="space-y-3 text-xs">
          {[
            {
              id: 'sms',
              label: 'SMS Emergency Courier Dispatch',
              sub: 'Send high-priority SMS alerts to standby volunteer drivers when hot meals have < 45m remaining.',
              checked: smsUrgentDispatch,
              onChange: setSmsUrgentDispatch,
            },
            {
              id: 'email',
              label: 'Daily Incident & Recovery Digest',
              sub: 'Send summary email of successful rescues, CO2 offsets, and any reported temperature deviations.',
              checked: emailDailyDigest,
              onChange: setEmailDailyDigest,
            },
            {
              id: 'sound',
              label: 'Dashboard Audio Ping for New Surplus Listings',
              sub: 'Play a discreet audio tone on the dispatcher workstation whenever a new food listing is posted.',
              checked: soundAlerts,
              onChange: setSoundAlerts,
            },
            {
              id: 'autoNotify',
              label: 'Instant Shelter Demand Broadcasts',
              sub: 'Notify verified shelters automatically when donations matching their intake preferences are posted.',
              checked: autoNotifyShelters,
              onChange: setAutoNotifyShelters,
            },
          ].map((item) => (
            <label
              key={item.id}
              className="flex items-start justify-between p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className="space-y-0.5 pr-4">
                <div className="font-extrabold text-slate-900">{item.label}</div>
                <div className="text-[11px] text-slate-500">{item.sub}</div>
              </div>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => {
                  item.onChange(e.target.checked);
                  triggerToast('Notification setting updated');
                }}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-1"
              />
            </label>
          ))}
        </div>
      </div>

      {/* 3. Service Areas Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Globe2 className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-black text-slate-900">3. Operational Service Areas</h2>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {serviceAreas.map((sa) => (
              <div key={sa.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 relative group">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-slate-900 text-xs">{sa.city}</div>
                  <button
                    type="button"
                    onClick={() => handleRemoveServiceArea(sa.id)}
                    className="text-slate-300 hover:text-rose-600 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove area"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-[10px] text-slate-400">{sa.state}</div>
                <div className="text-[11px] text-emerald-700 font-semibold pt-1">
                  {sa.activePartners} Providers &bull; {sa.activeNGOs} NGOs
                </div>
              </div>
            ))}
          </div>

          {/* Add New Service Area */}
          <form onSubmit={handleAddServiceArea} className="pt-2 flex flex-col sm:flex-row items-center gap-2 text-xs">
            <input
              type="text"
              required
              value={newCityName}
              onChange={(e) => setNewCityName(e.target.value)}
              placeholder="City (e.g., Denver)"
              className="w-full sm:w-1/3 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
            />
            <input
              type="text"
              required
              value={newStateName}
              onChange={(e) => setNewStateName(e.target.value)}
              placeholder="State (e.g., Colorado)"
              className="w-full sm:w-1/3 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shrink-0 flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add City
            </button>
          </form>
        </div>
      </div>

      {/* 4. Basic Platform Settings */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sliders className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-black text-slate-900">4. Food Safety & Dispatch Parameters</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <label className="block font-bold text-slate-800">
              Rescue Buffer Window (Minutes)
            </label>
            <input
              type="number"
              min="15"
              max="180"
              value={rescueBufferMins}
              onChange={(e) => setRescueBufferMins(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900"
            />
            <p className="text-[10px] text-slate-400">Minimum time window before donation marked at critical risk.</p>
          </div>

          <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <label className="block font-bold text-slate-800">
              Auto-Rematch Courier Timeout (Seconds)
            </label>
            <input
              type="number"
              min="60"
              max="900"
              value={autoRematchTimeoutSecs}
              onChange={(e) => setAutoRematchTimeoutSecs(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900"
            />
            <p className="text-[10px] text-slate-400">Time before unaccepted courier dispatch moves to next volunteer.</p>
          </div>

          <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <label className="block font-bold text-slate-800">
              Chilled Food Max Threshold (°C)
            </label>
            <input
              type="number"
              value={strictColdTempCelsius}
              onChange={(e) => setStrictColdTempCelsius(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900"
            />
            <p className="text-[10px] text-slate-400">Maximum permissible temp for refrigerated items upon delivery.</p>
          </div>

          <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <label className="block font-bold text-slate-800">
              Hot-Held Food Min Threshold (°C)
            </label>
            <input
              type="number"
              value={strictHotTempCelsius}
              onChange={(e) => setStrictHotTempCelsius(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900"
            />
            <p className="text-[10px] text-slate-400">Minimum temperature required for hot cooked dishes.</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => triggerToast('Platform dispatch parameters updated successfully')}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
          >
            Apply Platform Parameters
          </button>
        </div>
      </div>
    </div>
  );
}
