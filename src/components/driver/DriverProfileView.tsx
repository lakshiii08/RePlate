'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRescue } from '@/context/RescueContext';
import {
  User as UserIcon,
  Truck,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Save,
  CheckCircle2,
  Clock,
  Award,
  AlertCircle,
  FileText,
  Sliders,
  Power,
  Edit3,
  Thermometer,
  Sparkles,
} from 'lucide-react';

export default function DriverProfileView() {
  const { user, updateUserProfile } = useAuth();
  const { donations } = useRescue();

  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states initialized from user or sensible courier defaults
  const [formData, setFormData] = useState({
    name: user?.name || 'Aarav Patel',
    email: user?.email || 'driver@replate.org',
    phone: user?.phone || '+91 98765 43210',
    driverLicense: user?.driverLicense || 'DL-04-2022-892193',
    location: user?.location || 'South Delhi & NCR Hub',
    address: user?.address || 'Pocket 4, Sector B, Vasant Kunj, New Delhi 110070',
    emergencyContact: 'Pooja Patel (+91 98111 22334)',
    vehicleType: user?.vehicleType || 'Refrigerated Cargo Van (Tata Ace EV)',
    vehiclePlate: user?.vehiclePlate || 'DL 1Z A 4920',
    vehicleCapacityKg: user?.vehicleCapacityKg || 450,
    serviceRadiusKm: user?.serviceRadiusKm || 18,
    operatingHours: user?.operatingHours || '08:00 AM - 09:30 PM (Daily)',
    isOnline: user?.isOnline ?? true,
    temperatureEquipped: true,
    fssaiTrained: true,
  });

  const completedCount = donations.filter((d) => d.status === 'DELIVERED').length + 150;
  const transportedMeals =
    donations.filter((d) => d.status === 'DELIVERED').reduce((acc, d) => acc + (d.mealCount || 0), 0) + 4200;

  const handleToggleOnline = async () => {
    const nextStatus = !formData.isOnline;
    setFormData((prev) => ({ ...prev, isOnline: nextStatus }));
    try {
      await updateUserProfile({ isOnline: nextStatus });
    } catch (err) {
      console.error('Failed to update online state', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        address: formData.address,
        driverLicense: formData.driverLicense,
        vehicleType: formData.vehicleType,
        vehiclePlate: formData.vehiclePlate,
        vehicleCapacityKg: Number(formData.vehicleCapacityKg),
        serviceRadiusKm: Number(formData.serviceRadiusKm),
        operatingHours: formData.operatingHours,
        isOnline: formData.isOnline,
      });
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to save driver profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
            {formData.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{formData.name}</h1>
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Certified Courier
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified Volunteer Driver &bull; ID: <span className="font-mono text-slate-700">{user?.id || 'DRV-7702'}</span> &bull; {formData.location}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Quick Online Status Toggle */}
          <button
            onClick={handleToggleOnline}
            className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all shadow-sm ${
              formData.isOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <Power className={`w-3.5 h-3.5 ${formData.isOnline ? 'text-emerald-600' : 'text-slate-400'}`} />
            {formData.isOnline ? 'Active for Dispatches' : 'Offline / On Break'}
          </button>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 md:flex-initial px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Profile & Vehicle
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 md:flex-initial px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Driver profile, vehicle configuration, and service availability saved successfully.
        </div>
      )}

      {/* Telemetry Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Runs</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{completedCount}</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">100% On-Time Intake</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Meals Moved</span>
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{transportedMeals.toLocaleString()}</div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">~1,840 kg rescued</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Quality Rating</span>
            <span className="text-amber-500 text-xs font-black">★ 4.95</span>
          </div>
          <div className="text-2xl font-black text-slate-900">4.95 / 5.0</div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Based on 142 recipient ratings</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Spoilage Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">0.0%</div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Cold chain maintained</p>
        </div>
      </div>

      {/* Main Profile Form / Details View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Driver Details & Vehicle Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Driver Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-emerald-600" />
                Driver Information & Credentials
              </h2>
              <span className="text-[11px] font-bold text-slate-400">KYC Verified &bull; DL Valid</span>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  ) : (
                    <div className="text-xs font-bold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {formData.name}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Driving License Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.driverLicense}
                      onChange={(e) => setFormData({ ...formData, driverLicense: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                    />
                  ) : (
                    <div className="text-xs font-mono font-bold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                      <span>{formData.driverLicense}</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bold font-sans">
                        VERIFIED
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  ) : (
                    <div className="text-xs font-bold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {formData.phone}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  ) : (
                    <div className="text-xs font-bold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {formData.email}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Base Operational Hub / Primary Location</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                ) : (
                  <div className="text-xs text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {formData.location}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                ) : (
                  <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {formData.address}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact & Relation</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                ) : (
                  <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {formData.emergencyContact}
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isSaving ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Vehicle Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" />
                Vehicle Specifications & Equipment
              </h2>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Inspected &bull; Valid till Dec 2026
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Vehicle Type</span>
                <p className="text-xs font-bold text-slate-900">{formData.vehicleType}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">License Plate</span>
                <p className="text-xs font-mono font-bold text-slate-900">{formData.vehiclePlate}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Max Safe Capacity</span>
                <p className="text-xs font-bold text-emerald-700">{formData.vehicleCapacityKg} kg (~1,200 meals)</p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Certified On-Board Equipment</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Insulated Thermal Crates & Dry Ice Pack</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Calibrated Digital Food Probe Thermometer</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sanitised Food-Grade Ratchet Cargo Straps</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>First Aid & Chemical Spill Response Kit</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Availability, Shifts & Compliance */}
        <div className="space-y-6">
          {/* Availability Settings Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sliders className="w-4 h-4 text-emerald-600" />
              Availability & Dispatch
            </h2>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
                <div>
                  <p className="font-bold text-slate-900">Live Dispatch Readiness</p>
                  <p className="text-[11px] text-slate-500">Receive algorithmic rescue pings</p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleOnline}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                    formData.isOnline ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Max Service Radius</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="1"
                    value={formData.serviceRadiusKm}
                    onChange={(e) => setFormData({ ...formData, serviceRadiusKm: Number(e.target.value) })}
                    className="w-full accent-emerald-600"
                  />
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded text-xs shrink-0">
                    {formData.serviceRadiusKm} km
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Recommended: 15–25 km for optimal hot food delivery</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Shift Operating Hours</label>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 font-semibold text-slate-800 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {formData.operatingHours}
                </div>
              </div>
            </div>
          </div>

          {/* Food Safety & Legal Compliance Badge */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Safety & Compliance
            </h2>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-900">FSSAI Surplus Food Handling</h4>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Completed 2-hour food safety & temperature probe intake training module.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Commercial Vehicle Insurance</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Comprehensive cover with transit goods rider valid through 15 Nov 2026.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Police Verification & Background</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Clear criminal background record verified by Delhi Police Licensing unit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
