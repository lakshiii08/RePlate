'use client';

import React, { useState } from 'react';
import {
  MOCK_CONNECTED_NGOS,
  ConnectedNGO,
} from '@/services/adminData';
import {
  HeartHandshake,
  Building2,
  Utensils,
  Search,
  Filter,
  Phone,
  Clock,
  CheckCircle2,
  Users,
} from 'lucide-react';

export default function ConnectedNGOsView() {
  const [ngos, setNgos] = useState<ConnectedNGO[]>(MOCK_CONNECTED_NGOS);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique states & cities
  const states = Array.from(new Set(MOCK_CONNECTED_NGOS.map((n) => n.state)));
  const cities = Array.from(
    new Set(
      MOCK_CONNECTED_NGOS.filter((n) => selectedState === 'ALL' || n.state === selectedState).map(
        (n) => n.city
      )
    )
  );

  // Filter logic
  const filtered = ngos.filter((n) => {
    const matchesType = selectedType === 'ALL' || n.type === selectedType;
    const matchesState = selectedState === 'ALL' || n.state === selectedState;
    const matchesCity = selectedCity === 'ALL' || n.city === selectedCity;
    const matchesSearch =
      searchQuery === '' ||
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesState && matchesCity && matchesSearch;
  });

  // Aggregate totals
  const totalConnected = ngos.length + 74; // 86 total active verified organizations
  const totalDailyCapacity = ngos.reduce((acc, n) => acc + n.dailyIntakeCapacity, 0) + 16200;
  const totalMealsReceivedMonth = ngos.reduce((acc, n) => acc + n.mealsReceivedThisMonth, 0) + 42000;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-1">
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
            VERIFIED CHARITABLE RECIPIENT NETWORK
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Connected NGOs, Food Banks & Shelters
          </h1>
          <p className="text-xs text-slate-500">
            Registered charitable organizations receiving daily surplus deliveries under verified food safety protocol
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-slate-900">{totalConnected}</div>
          <div className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider">
            Connected Charitable NGOs
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Registered NGOs</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalConnected}</div>
          <div className="text-[11px] text-slate-500 font-medium">Pan-regional coverage</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Daily Intake Capacity</span>
            <Utensils className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {totalDailyCapacity.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Meals / day maximum</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Meals Received (Sep)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {totalMealsReceivedMonth.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">100% receipt signed</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Safety Audit Pass Rate</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">99.4%</div>
          <div className="text-[11px] text-slate-500 font-medium">Thermal & container standards</div>
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
              placeholder="Search NGO by name, district, or contact..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
              <span className="text-slate-500 font-semibold">State:</span>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedCity('ALL');
                }}
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
              <span className="text-slate-500 font-semibold">City:</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Cities</option>
                {cities.map((ct) => (
                  <option key={ct} value={ct}>
                    {ct}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> NGO TYPE:
          </span>
          {[
            { id: 'ALL', label: 'All NGO Types' },
            { id: 'Soup Kitchen', label: 'Soup Kitchens' },
            { id: 'Emergency Shelter', label: 'Emergency Shelters' },
            { id: 'Food Bank', label: 'Food Banks' },
            { id: 'Community Pantry', label: 'Community Pantries' },
            { id: 'Youth Refuge', label: 'Youth Refuges' },
            { id: 'Senior Center', label: 'Senior Centers' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedType === type.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* NGOs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm">
            Partner Charitable Organizations ({filtered.length} Matching Records)
          </h3>
          <span className="text-xs text-slate-400">Direct Recipient Verification</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 font-bold text-slate-500 border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Organization & Type</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Daily Intake Capacity</th>
                <th className="p-3.5">Current Demand</th>
                <th className="p-3.5">Meals Received (Month)</th>
                <th className="p-3.5">Operating Hours</th>
                <th className="p-3.5">Contact Person</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((ngo) => (
                <tr key={ngo.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900 text-sm">{ngo.name}</div>
                    <div className="text-[11px] text-blue-700 font-semibold flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {ngo.type} &bull; Verified {ngo.verifiedSince}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-800">{ngo.city}, {ngo.state}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-xs">{ngo.address}</div>
                  </td>
                  <td className="p-3.5 font-bold font-mono text-slate-900">
                    {ngo.dailyIntakeCapacity} meals/day
                  </td>
                  <td className="p-3.5 font-bold font-mono text-amber-700">
                    {ngo.currentIntakeDemand} portions
                  </td>
                  <td className="p-3.5 font-bold font-mono text-emerald-700">
                    {ngo.mealsReceivedThisMonth.toLocaleString()} meals
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-slate-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {ngo.operatingHours}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-800">{ngo.contactPerson}</div>
                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" /> {ngo.phone}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {ngo.status}
                    </span>
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
