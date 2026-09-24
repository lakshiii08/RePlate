'use client';

import React, { useState, useMemo } from 'react';
import {
  Truck,
  Search,
  CheckCircle2,
  XCircle,
  Phone,
  Star,
  MapPin,
  Calendar,
  AlertCircle,
  Send,
  UserCheck,
  UserX,
  Plus,
  Check,
  FileSpreadsheet,
  Radio,
  X,
  BellRing,
} from 'lucide-react';
import { MOCK_DRIVERS } from '@/services/mockData';
import { Driver, Donation } from '@/types';
import { useRescue } from '@/context/RescueContext';

interface EnhancedDriver extends Driver {
  currentDeliveryDonationId?: string;
  currentDeliveryTitle?: string;
  currentDeliveryPickup?: string;
  currentDeliveryDropoff?: string;
  capacityKg?: number;
  serviceCity?: string;
}

const INITIAL_ENHANCED_DRIVERS: EnhancedDriver[] = MOCK_DRIVERS.map((d, idx) => ({
  ...d,
  currentDeliveryDonationId: d.status === 'ON_RESCUE' ? `RP-100${idx + 1}` : undefined,
  currentDeliveryTitle: d.status === 'ON_RESCUE' ? (idx % 2 === 0 ? 'Veg Biryani & Curries' : 'Bakery Loaves & Salads') : undefined,
  currentDeliveryPickup: d.status === 'ON_RESCUE' ? 'Grand Hyatt Hotel Catering, 345 Embarcadero' : undefined,
  currentDeliveryDropoff: d.status === 'ON_RESCUE' ? 'Hope Community Shelter, 452 Elm Street' : undefined,
  capacityKg: idx % 3 === 0 ? 300 : idx % 2 === 0 ? 150 : 60,
  serviceCity: idx % 2 === 0 ? 'San Francisco' : 'Oakland',
}));

export default function AdminDriversView() {
  const { donations, updateDonation } = useRescue();
  const [drivers, setDrivers] = useState<EnhancedDriver[]>(INITIAL_ENHANCED_DRIVERS);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'ON_RESCUE' | 'OFFLINE'>('ALL');
  const [vehicleFilter, setVehicleFilter] = useState<string>('ALL');

  // Modals state
  const [assigningDriver, setAssigningDriver] = useState<EnhancedDriver | null>(null);
  const [selectedDonationId, setSelectedDonationId] = useState<string>('');
  
  // Register Driver Modal
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newDriverVehicle, setNewDriverVehicle] = useState<'Refrigerated Van' | 'EV Cargo Car' | 'E-Bike Courier' | 'Thermal Truck'>('Refrigerated Van');
  const [newDriverCapacity, setNewDriverCapacity] = useState('200');
  const [newDriverCity, setNewDriverCity] = useState('San Francisco');

  // Broadcast Modal
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastUrgency, setBroadcastUrgency] = useState<'NORMAL' | 'URGENT'>('NORMAL');

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Unassigned donations available for assignment
  const unassignedDonations = useMemo(() => {
    return donations.filter(
      (d) =>
        d.status === 'POSTED' ||
        d.status === 'MATCHED' ||
        d.status === 'RE_MATCHING' ||
        !d.assignedDriver
    );
  }, [donations]);

  // Filtered drivers
  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.phone.includes(q) ||
        d.vehicleType.toLowerCase().includes(q) ||
        (d.serviceCity && d.serviceCity.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'ALL' || d.status === statusFilter;

      const matchesVehicle =
        vehicleFilter === 'ALL' || d.vehicleType === vehicleFilter;

      return matchesSearch && matchesStatus && matchesVehicle;
    });
  }, [drivers, searchQuery, statusFilter, vehicleFilter]);

  // Toggle status: Available <-> Offline
  const handleToggleStatus = (id: string) => {
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const nextStatus = d.status === 'OFFLINE' ? 'AVAILABLE' : 'OFFLINE';
          return { ...d, status: nextStatus };
        }
        return d;
      })
    );
    triggerToast('Driver operational status updated');
  };

  // Open assignment modal
  const handleOpenAssignModal = (driver: EnhancedDriver) => {
    setAssigningDriver(driver);
    if (unassignedDonations.length > 0) {
      setSelectedDonationId(unassignedDonations[0].id);
    } else {
      setSelectedDonationId('');
    }
  };

  // Confirm assignment
  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningDriver || !selectedDonationId) return;

    const matchedDonation = donations.find((d) => d.id === selectedDonationId);
    if (!matchedDonation) return;

    // Update donation with assigned driver
    updateDonation(selectedDonationId, {
      status: 'DRIVER_ASSIGNED',
      assignedDriver: assigningDriver,
    });

    // Update driver state to ON_RESCUE
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id === assigningDriver.id) {
          return {
            ...d,
            status: 'ON_RESCUE',
            currentDeliveryDonationId: matchedDonation.id,
            currentDeliveryTitle: matchedDonation.foodName,
            currentDeliveryPickup: matchedDonation.donorAddress,
            currentDeliveryDropoff: matchedDonation.matchedShelter?.name || 'Assigned Shelter',
          };
        }
        return d;
      })
    );

    triggerToast(`Assigned ${matchedDonation.foodName} to ${assigningDriver.name}`);
    setAssigningDriver(null);
  };

  // Register New Driver
  const handleRegisterDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverName.trim() || !newDriverPhone.trim()) return;

    const newDriver: EnhancedDriver = {
      id: `drv-${Date.now().toString().slice(-4)}`,
      name: newDriverName.trim(),
      phone: newDriverPhone.trim(),
      vehicleType: newDriverVehicle,
      capacityKg: parseInt(newDriverCapacity) || 150,
      serviceCity: newDriverCity,
      status: 'AVAILABLE',
      rating: 5.0,
      deliveriesCompleted: 0,
      etaToDonorMinutes: 10,
      coords: [37.7749, -122.4194],
    };

    setDrivers((prev) => [newDriver, ...prev]);
    setIsRegisterModalOpen(false);
    setNewDriverName('');
    setNewDriverPhone('');
    triggerToast(`Driver ${newDriver.name} registered and activated`);
  };

  // Broadcast Message to fleet
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    triggerToast(`Broadcast alert dispatched to ${drivers.filter((d) => d.status !== 'OFFLINE').length} active drivers`);
    setIsBroadcastModalOpen(false);
    setBroadcastMessage('');
  };

  // Export Drivers CSV
  const handleExportCSV = () => {
    const headers = ['Driver ID', 'Name', 'Phone', 'Vehicle Type', 'Capacity (kg)', 'Status', 'Rating', 'Total Deliveries', 'Active Mission'];
    const rows = filteredDrivers.map((d) => [
      d.id,
      `"${d.name.replace(/"/g, '""')}"`,
      d.phone,
      d.vehicleType,
      d.capacityKg || 150,
      d.status,
      d.rating,
      d.deliveriesCompleted || 0,
      `"${(d.currentDeliveryTitle || 'None').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RePlate_Driver_Fleet_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Fleet roster exported to CSV');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Driver Fleet Management</h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {drivers.length} VOLUNTEERS & COURIERS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time driver availability, active courier dispatches, vehicle capabilities, and assign rescues.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Register Driver</span>
          </button>

          <button
            onClick={() => setIsBroadcastModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <BellRing className="w-3.5 h-3.5 text-blue-600" />
            <span>Broadcast Alert</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export Roster</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Fleet Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Total Drivers</div>
          <div className="text-2xl font-black text-slate-900">{drivers.length}</div>
          <div className="text-[11px] text-slate-500 font-medium">Registered fleet</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">On Delivery</div>
          <div className="text-2xl font-black text-blue-600">
            {drivers.filter((d) => d.status === 'ON_RESCUE').length}
          </div>
          <div className="text-[11px] text-blue-600 font-medium">Actively in transit</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Available / Standby</div>
          <div className="text-2xl font-black text-emerald-600">
            {drivers.filter((d) => d.status === 'AVAILABLE').length}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">Ready for dispatch</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Offline</div>
          <div className="text-2xl font-black text-slate-500">
            {drivers.filter((d) => d.status === 'OFFLINE').length}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">Off duty</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search driver by name, phone, or vehicle type..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="ON_RESCUE">On Delivery</option>
              <option value="OFFLINE">Offline</option>
            </select>

            {/* Vehicle Filter */}
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
            >
              <option value="ALL">All Vehicles</option>
              <option value="Refrigerated Van">Refrigerated Van</option>
              <option value="Standard Car">Standard Car</option>
              <option value="Cargo Van">Cargo Van</option>
              <option value="E-Bike Cargo">E-Bike Cargo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDrivers.map((driver) => (
          <div
            key={driver.id}
            className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs hover:shadow-sm transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Top row */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 font-black text-sm">
                    {driver.name[0]}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">{driver.name}</h3>
                    <div className="text-[11px] text-slate-400 font-mono">ID: {driver.id}</div>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                    driver.status === 'AVAILABLE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : driver.status === 'ON_RESCUE'
                      ? 'bg-blue-100 text-blue-800 animate-pulse'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {driver.status === 'ON_RESCUE' ? 'On Delivery' : driver.status}
                </span>
              </div>

              {/* Driver Details */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Vehicle & Payload</div>
                  <div className="font-bold text-slate-800 truncate">{driver.vehicleType}</div>
                  <div className="text-[10px] text-slate-500">{driver.capacityKg || 150} kg max payload</div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Rating & Track Record</div>
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>{driver.rating || '5.0'}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({driver.deliveriesCompleted || 0} rescues)</span>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold">100% On-time safe</div>
                </div>
              </div>

              {/* Phone / Contact */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold">{driver.phone}</span>
                </div>
                <a
                  href={`tel:${driver.phone}`}
                  className="text-[11px] font-bold text-emerald-700 hover:underline"
                >
                  Call Courier
                </a>
              </div>

              {/* Current Delivery Manifest if on delivery */}
              {driver.status === 'ON_RESCUE' && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-blue-900 uppercase tracking-wide flex items-center gap-1">
                      <Truck className="w-3 h-3 text-blue-600" /> Current Delivery
                    </span>
                    <span className="text-[10px] font-mono text-blue-700 font-bold">
                      {driver.currentDeliveryDonationId || 'Active'}
                    </span>
                  </div>
                  <div className="font-extrabold text-slate-900 text-xs">
                    {driver.currentDeliveryTitle || 'Assigned Food Package'}
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    <div className="truncate">&bull; Pickup: {driver.currentDeliveryPickup || 'Provider Kitchen'}</div>
                    <div className="truncate">&bull; Drop: {driver.currentDeliveryDropoff || 'Community Shelter'}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              {/* Toggle Available/Offline */}
              <button
                onClick={() => handleToggleStatus(driver.id)}
                disabled={driver.status === 'ON_RESCUE'}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  driver.status === 'ON_RESCUE'
                    ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                    : driver.status === 'AVAILABLE'
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                }`}
              >
                {driver.status === 'AVAILABLE' ? (
                  <>
                    <UserX className="w-3.5 h-3.5" />
                    <span>Set Offline</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Set Available</span>
                  </>
                )}
              </button>

              {/* Assign Delivery Action */}
              <button
                onClick={() => handleOpenAssignModal(driver)}
                disabled={driver.status === 'OFFLINE' || driver.status === 'ON_RESCUE'}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-2xs ${
                  driver.status === 'AVAILABLE'
                    ? 'bg-slate-900 hover:bg-slate-800 text-white'
                    : 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                }`}
              >
                <Send className="w-3 h-3" />
                <span>Assign Delivery</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDrivers.length === 0 && (
        <div className="bg-slate-50 rounded-3xl border border-dashed border-slate-300 p-8 text-center text-slate-500 text-xs">
          No drivers found matching your search.
        </div>
      )}

      {/* Assign Delivery Modal */}
      {assigningDriver && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-base">Assign Rescue Delivery</h3>
              </div>
              <button
                onClick={() => setAssigningDriver(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs">
              <div className="font-extrabold text-slate-900 text-sm">{assigningDriver.name}</div>
              <div className="text-slate-500">
                Vehicle: {assigningDriver.vehicleType} &bull; Capacity: {assigningDriver.capacityKg || 150} kg &bull; Status: {assigningDriver.status}
              </div>
            </div>

            <form onSubmit={handleConfirmAssignment} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 uppercase">
                  Select Unassigned Food Rescue Listing
                </label>
                {unassignedDonations.length > 0 ? (
                  <select
                    value={selectedDonationId}
                    onChange={(e) => setSelectedDonationId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-900"
                  >
                    {unassignedDonations.map((d) => (
                      <option key={d.id} value={d.id}>
                        #{d.id} &bull; {d.foodName} ({d.quantity}) - {d.matchedShelter?.name || 'Unmatched'}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-amber-50 rounded-xl text-amber-800 border border-amber-200">
                    No unassigned rescues pending right now. All active food donations currently have couriers.
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningDriver(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedDonationId}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Confirm Dispatch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Driver Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4 text-emerald-700" />
                </div>
                <h3 className="font-black text-slate-900 text-base">Register New Driver / Courier</h3>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterDriver} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase">Driver Full Name *</label>
                <input
                  type="text"
                  required
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  placeholder="e.g. David Ramirez"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={newDriverPhone}
                  onChange={(e) => setNewDriverPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase">Vehicle Type</label>
                  <select
                    value={newDriverVehicle}
                    onChange={(e) => setNewDriverVehicle(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                  >
                    <option value="Refrigerated Van">Refrigerated Van</option>
                    <option value="EV Cargo Car">EV Cargo Car</option>
                    <option value="E-Bike Courier">E-Bike Courier</option>
                    <option value="Thermal Truck">Thermal Truck</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase">Payload (kg)</label>
                  <input
                    type="number"
                    value={newDriverCapacity}
                    onChange={(e) => setNewDriverCapacity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase">Operating Region</label>
                <input
                  type="text"
                  value={newDriverCity}
                  onChange={(e) => setNewDriverCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center gap-1.5 shadow-xs"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Activate Driver</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BellRing className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-slate-900 text-base">Broadcast to Fleet</h3>
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase">Broadcast Message</label>
                <textarea
                  rows={3}
                  required
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="e.g. Flash alert: Heavy traffic on Bay Bridge. Please reroute via alternate exits..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="font-bold text-slate-700 uppercase">Priority:</label>
                <label className="flex items-center gap-1 text-slate-700">
                  <input
                    type="radio"
                    checked={broadcastUrgency === 'NORMAL'}
                    onChange={() => setBroadcastUrgency('NORMAL')}
                  />
                  <span>Normal</span>
                </label>
                <label className="flex items-center gap-1 text-rose-700 font-bold">
                  <input
                    type="radio"
                    checked={broadcastUrgency === 'URGENT'}
                    onChange={() => setBroadcastUrgency('URGENT')}
                  />
                  <span>High Priority / Emergency</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
