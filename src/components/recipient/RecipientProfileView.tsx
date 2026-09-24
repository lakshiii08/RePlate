'use client';

import React, { useState } from 'react';
import {
  Building2,
  User,
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Edit3,
  Check,
  Utensils,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function RecipientProfileView() {
  const { user, updateUserProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);

  // Form states initialized with live user context or sensible defaults
  const [orgName, setOrgName] = useState(user?.organization || 'Hope Community Shelter & Kitchen');
  const [facilityType, setFacilityType] = useState(user?.facilityType || 'Emergency Shelter & Soup Kitchen');
  const [taxId, setTaxId] = useState(user?.taxId || '501(c)(3) EIN: 94-2849102');
  const [managerName, setManagerName] = useState(user?.ownerName || user?.name || 'Maria Santos (Intake Lead)');
  const [phone, setPhone] = useState(user?.phone || '+1 (415) 890-4432');
  const [email, setEmail] = useState(user?.email || 'intake@hopekitchen.org');
  const [address, setAddress] = useState(user?.address || '452 Elm Street, Tenderloin, San Francisco, CA 94102');
  const [dockInstructions, setDockInstructions] = useState(
    user?.intakeInstructions || 'Side loading bay via alleyway. Ring buzzer #2 for kitchen coordinator.'
  );
  const [operatingHours, setOperatingHours] = useState(
    user?.operatingHours || 'Mon - Sun: 07:00 AM - 09:30 PM'
  );
  const [intakeCapacity, setIntakeCapacity] = useState(user?.intakeCapacity || 200);

  const [selectedDietary, setSelectedDietary] = useState<string[]>(
    user?.dietaryPreferences || ['Cooked Meal', 'Bakery', 'Fresh Produce', 'Dairy & Refrigerated']
  );

  const [toastMsg, setToastMsg] = useState('');
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const toggleDietary = (item: string) => {
    if (selectedDietary.includes(item)) {
      setSelectedDietary(selectedDietary.filter((d) => d !== item));
    } else {
      setSelectedDietary([...selectedDietary, item]);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserProfile({
        organization: orgName.trim(),
        facilityType: facilityType.trim(),
        taxId: taxId.trim(),
        ownerName: managerName.trim(),
        name: managerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        intakeInstructions: dockInstructions.trim(),
        operatingHours: operatingHours.trim(),
        intakeCapacity: Number(intakeCapacity) || 200,
        dietaryPreferences: selectedDietary,
      });

      setIsEditing(false);
      triggerToast('Recipient shelter profile updated successfully');
    } catch (err) {
      console.error('Failed to update profile', err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Organization Profile & Facility Settings</h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              VERIFIED RECIPIENT
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered nonprofit details, dock delivery access instructions, kitchen intake capacity, and dietary criteria.
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Edit3 className="w-3.5 h-3.5" />
          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {!isEditing ? (
        /* Read-only Display Mode */
        <div className="space-y-6">
          {/* Main Org Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-800 font-black text-2xl flex items-center justify-center shrink-0">
                {orgName ? orgName[0] : 'H'}
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-black text-slate-900">{orgName}</h2>
                <div className="text-xs text-blue-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified 501(c)(3) Non-Profit Organization &bull; {taxId}
                </div>
                <div className="text-xs text-slate-500">{facilityType}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-500" /> Intake Director / Lead
                </div>
                <div className="font-extrabold text-slate-900 text-sm">{managerName}</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Utensils className="w-3.5 h-3.5 text-slate-500" /> Intake Capacity
                </div>
                <div className="font-extrabold text-emerald-800 text-sm">{intakeCapacity} Meals / Day</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-500" /> Intake Desk Phone
                </div>
                <div className="font-bold text-slate-900 text-xs">{phone}</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" /> Dispatch Email
                </div>
                <div className="font-bold text-slate-900 text-xs">{email}</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 sm:col-span-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" /> Drop-Off / Intake Bay Address
                </div>
                <div className="font-bold text-slate-900 text-xs">{address}</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 sm:col-span-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" /> Dock Access Instructions for Couriers
                </div>
                <div className="font-semibold text-slate-800 text-xs">{dockInstructions}</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 sm:col-span-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" /> Operating Receiving Hours
                </div>
                <div className="font-bold text-slate-900 text-xs">{operatingHours}</div>
              </div>
            </div>
          </div>

          {/* Accepted Dietary Categories */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xs">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-600" />
              Accepted Dietary Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedDietary.map((item) => (
                <span
                  key={item}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold text-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Edit Form Mode */
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-2xs text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 uppercase">Organization / Shelter Name *</label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700 uppercase">Facility Type</label>
              <input
                type="text"
                value={facilityType}
                onChange={(e) => setFacilityType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700 uppercase">Tax ID / 501(c)(3) EIN</label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700 uppercase">Daily Intake Capacity (Meals)</label>
              <input
                type="number"
                value={intakeCapacity}
                onChange={(e) => setIntakeCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700 uppercase">Intake Lead / Manager Name *</label>
              <input
                type="text"
                required
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700 uppercase">Phone Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase">Dispatch / Notification Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase">Delivery & Intake Address *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase">Dock Access Instructions for Couriers</label>
              <textarea
                rows={2}
                value={dockInstructions}
                onChange={(e) => setDockInstructions(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase">Operating Hours</label>
              <input
                type="text"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
              />
            </div>
          </div>

          {/* Dietary Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block font-bold text-slate-700 uppercase">Accepted Food Categories</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {['Cooked Meal', 'Bakery', 'Fresh Produce', 'Dairy & Refrigerated', 'Packaged Goods', 'Halal / Kosher'].map(
                (item) => (
                  <label
                    key={item}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer font-bold transition-all ${
                      selectedDietary.includes(item)
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDietary.includes(item)}
                      onChange={() => toggleDietary(item)}
                      className="rounded text-emerald-600"
                    />
                    <span>{item}</span>
                  </label>
                )
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
