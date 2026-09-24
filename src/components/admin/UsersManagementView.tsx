'use client';

import React, { useState } from 'react';
import { adminService, UserManagementItem } from '@/services/adminService';
import { Users, Utensils, Building2, Truck, Power } from 'lucide-react';

export default function UsersManagementView() {
  const [activeTab, setActiveTab] = useState<'DONOR' | 'SHELTER' | 'DRIVER'>('DONOR');
  const [users, setUsers] = useState<UserManagementItem[]>([
    {
      id: 'u-1',
      name: 'Grand Hyatt Hotel Catering',
      role: 'DONOR',
      location: 'Financial District, SF',
      status: 'ACTIVE',
      activeRescueId: 'RP-1024',
      phone: '+1 (555) 234-5678',
    },
    {
      id: 'u-2',
      name: 'Artisan Cafe & Bakery',
      role: 'DONOR',
      location: 'Mission District, SF',
      status: 'ACTIVE',
      activeRescueId: 'RP-1025',
      phone: '+1 (555) 876-5432',
    },
    {
      id: 'u-3',
      name: 'Hope Community Shelter',
      role: 'SHELTER',
      location: 'Downtown, SF',
      status: 'ACTIVE',
      activeRescueId: 'RP-1024',
      phone: '+1 (555) 111-2233',
    },
    {
      id: 'u-4',
      name: 'Grace Haven Care Center',
      role: 'SHELTER',
      location: 'District 4, SF',
      status: 'ACTIVE',
      phone: '+1 (555) 444-5566',
    },
    {
      id: 'u-5',
      name: 'Aarav Patel (Refrigerated Van)',
      role: 'DRIVER',
      location: 'En Route Embarcadero',
      status: 'ACTIVE',
      activeRescueId: 'RP-1024',
      phone: '+1 (555) 777-8899',
    },
    {
      id: 'u-6',
      name: 'Elena Rostova (EV Cargo)',
      role: 'DRIVER',
      location: 'Mission Corridor',
      status: 'ACTIVE',
      phone: '+1 (555) 999-0000',
    },
  ]);

  const filteredUsers = users.filter((u) => u.role === activeTab);

  const toggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : u
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">👥 Users Management</h1>
          <p className="text-xs text-slate-500">
            Basic account directory & operational status control for Donors, Shelters, and Volunteer Drivers
          </p>
        </div>
      </div>

      {/* SECTION 8 THREE TABS */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('DONOR')}
          className={`px-4 py-2 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'DONOR'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" /> Food Donors
        </button>

        <button
          onClick={() => setActiveTab('SHELTER')}
          className={`px-4 py-2 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'SHELTER'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" /> Shelters / NGOs
        </button>

        <button
          onClick={() => setActiveTab('DRIVER')}
          className={`px-4 py-2 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'DRIVER'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Truck className="w-3.5 h-3.5" /> Volunteer Drivers
        </button>
      </div>

      {/* USERS DATA TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 font-bold text-slate-500 border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Name / Entity</th>
                <th className="p-4">Location</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Active Rescue</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{item.name}</td>
                  <td className="p-4 font-medium text-slate-700">{item.location}</td>
                  <td className="p-4 font-mono text-slate-600">{item.phone}</td>
                  <td className="p-4 font-mono font-bold text-emerald-700">
                    {item.activeRescueId ? `#${item.activeRescueId}` : 'None'}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        item.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1.5">
                    <button
                      onClick={() => toggleStatus(item.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                        item.status === 'ACTIVE'
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
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
