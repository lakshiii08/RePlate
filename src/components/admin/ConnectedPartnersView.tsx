'use client';

import React, { useState } from 'react';
import {
  MOCK_CONNECTED_PARTNERS,
  ConnectedPartner,
} from '@/services/adminData';
import {
  Store,
  Utensils,
  ShoppingBag,
  Building2,
  Filter,
  Search,
  CheckCircle2,
  Phone,
  Scale,
  TrendingUp,
} from 'lucide-react';

export default function ConnectedPartnersView() {
  const [partners, setPartners] = useState<ConnectedPartner[]>(MOCK_CONNECTED_PARTNERS);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique states & cities
  const states = Array.from(new Set(MOCK_CONNECTED_PARTNERS.map((p) => p.state)));
  const cities = Array.from(
    new Set(
      MOCK_CONNECTED_PARTNERS.filter((p) => selectedState === 'ALL' || p.state === selectedState).map(
        (p) => p.city
      )
    )
  );

  // Filtered partners
  const filtered = partners.filter((p) => {
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesState = selectedState === 'ALL' || p.state === selectedState;
    const matchesCity = selectedCity === 'ALL' || p.city === selectedCity;
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesState && matchesCity && matchesSearch;
  });

  // Category counts
  const restaurantCount = partners.filter((p) => p.category === 'Restaurant').length + 138;
  const groceryCount = partners.filter((p) => p.category === 'Grocery & Supermarket').length + 62;
  const catererCount = partners.filter((p) => p.category === 'Hotel Catering' || p.category === 'Cafeteria').length + 32;
  const bakeryCount = partners.filter((p) => p.category === 'Bakery').length + 26;
  const totalCombined = restaurantCount + groceryCount + catererCount + bakeryCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-1">
            <Store className="w-3.5 h-3.5 text-emerald-600" />
            FOOD DONOR NETWORK DIRECTORY
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Connected Restaurants & Groceries
          </h1>
          <p className="text-xs text-slate-500">
            Real-time directory of verified commercial food donors, supermarkets, hotel kitchens, and bakeries
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-slate-900">{totalCombined}</div>
          <div className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider">
            Total Active Donor Partners
          </div>
        </div>
      </div>

      {/* KPI Cards Breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Restaurants</span>
            <Utensils className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{restaurantCount}</div>
          <div className="text-[11px] text-slate-500 font-medium">Casual, fine-dining & chains</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Groceries & Markets</span>
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{groceryCount}</div>
          <div className="text-[11px] text-slate-500 font-medium">Supermarkets & produce markets</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Hotels & Caterers</span>
            <Building2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{catererCount}</div>
          <div className="text-[11px] text-slate-500 font-medium">Convention centers & banquets</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Artisan Bakeries</span>
            <Store className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{bakeryCount}</div>
          <div className="text-[11px] text-slate-500 font-medium">Daily surplus bread & pastries</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search partner by name, address, or contact person..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* State Filter */}
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

            {/* City Filter */}
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

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> TYPE:
          </span>
          {[
            { id: 'ALL', label: 'All Partners' },
            { id: 'Restaurant', label: 'Restaurants' },
            { id: 'Grocery & Supermarket', label: 'Groceries & Markets' },
            { id: 'Hotel Catering', label: 'Hotels & Caterers' },
            { id: 'Bakery', label: 'Bakeries' },
            { id: 'Cafeteria', label: 'Cafeterias' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Partners Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm">
            Commercial Food Partners ({filtered.length} Matching Records)
          </h3>
          <span className="text-xs text-slate-400">Verified Health Compliance Audited</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 font-bold text-slate-500 border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Partner Name & Type</th>
                <th className="p-3.5">Location (City, State)</th>
                <th className="p-3.5">Monthly Rescued</th>
                <th className="p-3.5">Weight (kg)</th>
                <th className="p-3.5">Lifetime Rescues</th>
                <th className="p-3.5">Contact Person</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                    <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {p.category} &bull; Joined {p.verifiedSince}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-800">{p.city}, {p.state}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-xs">{p.address}</div>
                  </td>
                  <td className="p-3.5 font-bold text-blue-700 font-mono">
                    {p.mealsSavedThisMonth.toLocaleString()} meals
                  </td>
                  <td className="p-3.5 font-bold text-emerald-700 font-mono">
                    {p.foodSavedKgThisMonth.toLocaleString()} kg
                  </td>
                  <td className="p-3.5 font-mono font-bold text-slate-800">
                    {p.totalRescues} drops
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-800">{p.contactPerson}</div>
                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" /> {p.phone}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {p.status}
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
