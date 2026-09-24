'use client';

import React, { useState, useMemo } from 'react';
import {
  Store,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit3,
  Eye,
  Filter,
  Building2,
  Phone,
  MapPin,
  Utensils,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Check,
  FileSpreadsheet,
} from 'lucide-react';
import { MOCK_CONNECTED_PARTNERS, ConnectedPartner } from '@/services/adminData';
import { useRescue } from '@/context/RescueContext';

export interface ProviderItem extends ConnectedPartner {
  isVerified?: boolean;
  activeDonationsCount?: number;
  pastDonationsCount?: number;
  listings?: {
    id: string;
    foodName: string;
    quantity: string;
    category: string;
    date: string;
    status: string;
  }[];
}

const INITIAL_PROVIDERS: ProviderItem[] = MOCK_CONNECTED_PARTNERS.map((p, idx) => ({
  ...p,
  isVerified: idx % 4 !== 3, // most are verified, some pending
  activeDonationsCount: idx % 3 === 0 ? 2 : idx % 2 === 0 ? 1 : 0,
  pastDonationsCount: p.totalRescues || 24,
  listings: [
    {
      id: `lst-${idx}-1`,
      foodName: idx % 2 === 0 ? 'Surplus Hot Entrees & Rice' : 'Artisanal Loaves & Pastries',
      quantity: idx % 2 === 0 ? '25 kg' : '40 packets',
      category: idx % 2 === 0 ? 'Meal' : 'Bakery',
      date: 'Today, 2:30 PM',
      status: idx % 3 === 0 ? 'IN_TRANSIT' : 'DELIVERED',
    },
    {
      id: `lst-${idx}-2`,
      foodName: 'Mixed Fruit & Vegetable Crates',
      quantity: '30 kg',
      category: 'Fruits',
      date: 'Yesterday',
      status: 'DELIVERED',
    },
  ],
}));

export default function AdminProvidersView() {
  const { donations } = useRescue();
  const [providers, setProviders] = useState<ProviderItem[]>(INITIAL_PROVIDERS);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED'>('ALL');
  const [verificationFilter, setVerificationFilter] = useState<'ALL' | 'VERIFIED' | 'UNVERIFIED'>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ProviderItem | null>(null);
  const [viewingListingsProvider, setViewingListingsProvider] = useState<ProviderItem | null>(null);

  // New Provider Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<ConnectedPartner['category']>('Restaurant');
  const [newCity, setNewCity] = useState('San Francisco');
  const [newState, setNewState] = useState('California');
  const [newAddress, setNewAddress] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newIsVerified, setNewIsVerified] = useState(true);

  // Edit Provider Form State
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<ConnectedPartner['category']>('Restaurant');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Toast feedback
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const triggerToast = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  // Filtered Providers
  const filteredProviders = useMemo(() => {
    return providers.filter((p) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.contactPerson.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q);

      // Category
      const matchesCategory =
        categoryFilter === 'ALL' ||
        (categoryFilter === 'Restaurant' && p.category === 'Restaurant') ||
        (categoryFilter === 'Hotel' && p.category === 'Hotel Catering') ||
        (categoryFilter === 'Cafeteria' && p.category === 'Cafeteria') ||
        (categoryFilter === 'Grocery' && p.category === 'Grocery & Supermarket') ||
        (categoryFilter === 'Bakery' && p.category === 'Bakery');

      // Status
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && p.status === 'ACTIVE') ||
        (statusFilter === 'PAUSED' && p.status !== 'ACTIVE');

      // Verification
      const matchesVerification =
        verificationFilter === 'ALL' ||
        (verificationFilter === 'VERIFIED' && p.isVerified) ||
        (verificationFilter === 'UNVERIFIED' && !p.isVerified);

      return matchesSearch && matchesCategory && matchesStatus && matchesVerification;
    });
  }, [providers, searchQuery, categoryFilter, statusFilter, verificationFilter]);

  // Actions
  const handleToggleStatus = (id: string) => {
    setProviders((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextStatus = p.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
    triggerToast('Provider status updated successfully');
  };

  const handleToggleVerification = (id: string) => {
    setProviders((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const next = !p.isVerified;
          return { ...p, isVerified: next };
        }
        return p;
      })
    );
    triggerToast('Provider verification status changed');
  };

  const handleOpenEdit = (p: ProviderItem) => {
    setEditingProvider(p);
    setEditName(p.name);
    setEditCategory(p.category);
    setEditCity(p.city);
    setEditState(p.state);
    setEditAddress(p.address);
    setEditContact(p.contactPerson);
    setEditPhone(p.phone);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProvider) return;
    setProviders((prev) =>
      prev.map((p) => {
        if (p.id === editingProvider.id) {
          return {
            ...p,
            name: editName.trim(),
            category: editCategory,
            city: editCity.trim(),
            state: editState.trim(),
            address: editAddress.trim(),
            contactPerson: editContact.trim(),
            phone: editPhone.trim(),
          };
        }
        return p;
      })
    );
    setEditingProvider(null);
    triggerToast(`Updated provider "${editName}"`);
  };

  const handleAddProvider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newProvider: ProviderItem = {
      id: `pt-${Date.now().toString().slice(-4)}`,
      name: newName.trim(),
      category: newCategory,
      city: newCity.trim(),
      state: newState.trim(),
      address: newAddress.trim() || '100 Main Street',
      contactPerson: newContact.trim() || 'Operations Lead',
      phone: newPhone.trim() || '+1 (555) 000-1122',
      status: 'ACTIVE',
      isVerified: newIsVerified,
      mealsSavedThisMonth: 0,
      foodSavedKgThisMonth: 0,
      totalRescues: 0,
      activeDonationsCount: 0,
      pastDonationsCount: 0,
      verifiedSince: 'Just now',
      listings: [],
    };

    setProviders((prev) => [newProvider, ...prev]);
    setIsAddModalOpen(false);
    setNewName('');
    setNewAddress('');
    setNewContact('');
    setNewPhone('');
    triggerToast(`Added new provider "${newProvider.name}"`);
  };

  // Export Providers CSV
  const handleExportCSV = () => {
    const headers = ['Provider ID', 'Name', 'Category', 'City', 'State', 'Address', 'Contact Person', 'Phone', 'Status', 'Verified', 'Total Rescues'];
    const rows = filteredProviders.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.category,
      `"${p.city}"`,
      `"${p.state}"`,
      `"${p.address.replace(/"/g, '""')}"`,
      `"${p.contactPerson.replace(/"/g, '""')}"`,
      p.phone,
      p.status,
      p.isVerified ? 'VERIFIED' : 'UNVERIFIED',
      p.totalRescues || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RePlate_Providers_Roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Providers roster exported to CSV');
  };

  // Bulk Verify all pending
  const handleBulkVerifyPending = () => {
    setProviders((prev) => prev.map((p) => ({ ...p, isVerified: true })));
    triggerToast('All pending providers verified');
  };

  const unverifiedCount = providers.filter((p) => !p.isVerified).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Food Providers Management</h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {providers.length} REGISTERED
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage participating restaurants, hotel banquets, corporate canteens, bakeries & supermarkets.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {unverifiedCount > 0 && (
            <button
              onClick={handleBulkVerifyPending}
              className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify All Pending ({unverifiedCount})</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export Roster (CSV)</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-black rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Provider
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-2xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search providers by name, city, address, or manager..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:bg-white focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Providers</option>
              <option value="PAUSED">Inactive / Paused</option>
            </select>

            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:bg-white focus:outline-hidden"
            >
              <option value="ALL">All Verification</option>
              <option value="VERIFIED">Verified Only</option>
              <option value="UNVERIFIED">Pending Verification</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 scrollbar-none text-xs">
          {[
            { id: 'ALL', label: 'All Categories' },
            { id: 'Restaurant', label: '🍽️ Restaurants' },
            { id: 'Hotel', label: '🏨 Hotel Catering' },
            { id: 'Cafeteria', label: '🍱 Canteens & Cafeterias' },
            { id: 'Grocery', label: '🛒 Supermarkets' },
            { id: 'Bakery', label: '🥖 Bakeries' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                categoryFilter === cat.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Providers Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProviders.map((provider) => (
          <div
            key={provider.id}
            className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              {/* Header: Name, Verification Badge, Status */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {provider.category}
                  </span>
                  <h3 className="font-black text-slate-900 text-sm leading-snug">{provider.name}</h3>
                </div>

                <button
                  onClick={() => handleToggleStatus(provider.id)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold transition-colors shrink-0 ${
                    provider.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title="Click to toggle status"
                >
                  {provider.status}
                </button>
              </div>

              {/* Verification & Address */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  {provider.isVerified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Provider
                    </span>
                  ) : (
                    <button
                      onClick={() => handleToggleVerification(provider.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200 transition-colors"
                      title="Click to verify"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      Verify Now
                    </button>
                  )}
                </div>

                <div className="flex items-start gap-1.5 text-slate-500 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{provider.address}, {provider.city}</span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{provider.contactPerson} &bull; {provider.phone}</span>
                </div>
              </div>

              {/* Stats: Active & Past Donations */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Active Donations</div>
                  <div className="text-sm font-black text-blue-600">
                    {provider.activeDonationsCount || 0} in progress
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Total Rescues</div>
                  <div className="text-sm font-black text-slate-900">
                    {provider.totalRescues || 0} completed
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={() => setViewingListingsProvider(provider)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" /> View Listings
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(provider)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 font-bold transition-colors flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" /> Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProviders.length === 0 && (
        <div className="bg-slate-50 rounded-3xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">
          No providers found matching your filter criteria.
        </div>
      )}

      {/* ===================================================================== */}
      {/* ADD PROVIDER MODAL */}
      {/* ===================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">Add New Food Provider</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProvider} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold uppercase text-slate-700">Business / Provider Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Salesforce Tower Canteen, Marriott Marquis"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold uppercase text-slate-700">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
                  >
                    <option value="Restaurant">Restaurant</option>
                    <option value="Hotel Catering">Hotel Catering</option>
                    <option value="Cafeteria">Cafeteria / Canteen</option>
                    <option value="Grocery & Supermarket">Grocery & Supermarket</option>
                    <option value="Bakery">Bakery</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold uppercase text-slate-700">City</label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold uppercase text-slate-700">Street Address</label>
                <input
                  type="text"
                  required
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Street and building number"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold uppercase text-slate-700">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    placeholder="General Manager or Chef"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold uppercase text-slate-700">Phone</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="newVerify"
                  checked={newIsVerified}
                  onChange={(e) => setNewIsVerified(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="newVerify" className="font-semibold text-slate-700">
                  Mark as verified food-safe facility immediately
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs"
                >
                  Create Provider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* EDIT PROVIDER MODAL */}
      {/* ===================================================================== */}
      {editingProvider && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">Edit Provider: {editingProvider.name}</h3>
              <button
                onClick={() => setEditingProvider(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold uppercase text-slate-700">Provider Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold uppercase text-slate-700">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
                  >
                    <option value="Restaurant">Restaurant</option>
                    <option value="Hotel Catering">Hotel Catering</option>
                    <option value="Cafeteria">Cafeteria</option>
                    <option value="Grocery & Supermarket">Grocery & Supermarket</option>
                    <option value="Bakery">Bakery</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold uppercase text-slate-700">City</label>
                  <input
                    type="text"
                    required
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold uppercase text-slate-700">Address</label>
                <input
                  type="text"
                  required
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold uppercase text-slate-700">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={editContact}
                    onChange={(e) => setEditContact(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold uppercase text-slate-700">Phone</label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProvider(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW FOOD LISTINGS MODAL (Lakshita MVP requirement) */}
      {/* ===================================================================== */}
      {viewingListingsProvider && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Provider Inventory</span>
                <h3 className="font-black text-slate-900 text-base">{viewingListingsProvider.name}</h3>
              </div>
              <button
                onClick={() => setViewingListingsProvider(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {viewingListingsProvider.listings && viewingListingsProvider.listings.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {viewingListingsProvider.listings.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-extrabold text-slate-900 text-xs">{item.foodName}</div>
                        <div className="text-[11px] text-slate-500">
                          {item.quantity} &bull; {item.category} &bull; Listed {item.date}
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          item.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'IN_TRANSIT'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                  No food listings currently posted by this provider.
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Lifetime food saved: <strong className="text-slate-900">{viewingListingsProvider.mealsSavedThisMonth * 3} meals</strong>
              </span>
              <button
                onClick={() => setViewingListingsProvider(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
