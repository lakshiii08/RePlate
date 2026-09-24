'use client';

import React, { useState } from 'react';
import {
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  Edit3,
  Check,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function DonorProfileView() {
  const { user, updateUserProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [profileOrg, setProfileOrg] = useState(user?.organization || 'Grand Hyatt Hotel Catering');
  const [profileOwner, setProfileOwner] = useState(user?.ownerName || user?.name || 'Sarah Jenkins (General Manager)');
  const [profileAddress, setProfileAddress] = useState(
    user?.address || '345 Embarcadero Plaza, Financial District, SF, CA 94111'
  );
  const [profilePhone, setProfilePhone] = useState(user?.phone || '+1 (555) 234-5678');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'donor@replate.org');
  const [profileHours, setProfileHours] = useState(
    user?.operatingHours || 'Mon - Sun: 06:30 AM - 11:30 PM'
  );

  const [toastMsg, setToastMsg] = useState('');
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserProfile({
        organization: profileOrg.trim(),
        ownerName: profileOwner.trim(),
        address: profileAddress.trim(),
        phone: profilePhone.trim(),
        email: profileEmail.trim(),
        operatingHours: profileHours.trim(),
      });
      setIsEditing(false);
      triggerToast('Organization profile updated successfully');
    } catch (err) {
      console.error('Failed to update profile', err);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Organization Profile</h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              VERIFIED DONOR
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered business details, kitchen pickup instructions, operating hours, and dispatch contacts.
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
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {!isEditing ? (
        /* Profile Display (Lakshita MVP spec: Business name, Owner/contact details, Address, Phone/email, Operating hours) */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-2xl flex items-center justify-center shrink-0">
              {profileOrg ? profileOrg[0] : 'G'}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">{profileOrg}</h2>
              <div className="text-xs text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Certified Food Facility &bull; ServSafe Verified
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Business Name */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-500" /> Business Name
              </div>
              <div className="font-extrabold text-slate-900 text-sm">{profileOrg}</div>
            </div>

            {/* Owner/Contact Details */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-500" /> Owner / Contact Details
              </div>
              <div className="font-extrabold text-slate-900 text-sm">{profileOwner}</div>
            </div>

            {/* Address */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 sm:col-span-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" /> Registered Pickup Address
              </div>
              <div className="font-bold text-slate-900 text-xs">{profileAddress}</div>
            </div>

            {/* Phone */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-500" /> Contact Phone
              </div>
              <div className="font-bold text-slate-900 text-xs">{profilePhone}</div>
            </div>

            {/* Email */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> Dispatch Email
              </div>
              <div className="font-bold text-slate-900 text-xs">{profileEmail}</div>
            </div>

            {/* Operating Hours */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 sm:col-span-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" /> Operating & Kitchen Hours
              </div>
              <div className="font-bold text-slate-900 text-xs">{profileHours}</div>
            </div>
          </div>
        </div>
      ) : (
        /* Edit Profile Form (Lakshita MVP spec: Edit profile) */
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-2xs">
          <h2 className="font-black text-slate-900 text-sm">Edit Organization Details</h2>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Business Name
            </label>
            <input
              type="text"
              required
              value={profileOrg}
              onChange={(e) => setProfileOrg(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Owner / Contact Person
            </label>
            <input
              type="text"
              required
              value={profileOwner}
              onChange={(e) => setProfileOwner(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Registered Address
            </label>
            <input
              type="text"
              required
              value={profileAddress}
              onChange={(e) => setProfileAddress(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Contact Phone
              </label>
              <input
                type="text"
                required
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Dispatch Email
              </label>
              <input
                type="email"
                required
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Operating Hours
            </label>
            <input
              type="text"
              required
              value={profileHours}
              onChange={(e) => setProfileHours(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              Save Profile
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
