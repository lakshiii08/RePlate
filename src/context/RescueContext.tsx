'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Donation, ImpactStats } from '@/types';
import { donationService } from '@/services/donationService';
import { INITIAL_IMPACT_STATS } from '@/services/mockData';
import { realtimeEngine } from '@/services/realtime';

interface RescueContextType {
  donations: Donation[];
  impactStats: ImpactStats;
  loading: boolean;
  refreshDonations: () => Promise<void>;
  addDonation: (donation: Donation) => void;
  updateDonation: (id: string, updates: Partial<Donation>) => void;
  editDonation: (id: string, updates: Partial<Donation>) => Promise<Donation>;
  cancelDonation: (id: string) => Promise<Donation>;
  simulateRiskEvent: (donationId: string) => void;
}

const RescueContext = createContext<RescueContextType | undefined>(undefined);

export function RescueProvider({ children }: { children: React.ReactNode }) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [impactStats, setImpactStats] = useState<ImpactStats>(INITIAL_IMPACT_STATS);
  const [loading, setLoading] = useState(true);

  const fetchDonations = async () => {
    try {
      const data = await donationService.getDonations();
      setDonations(data);
    } catch (e) {
      console.error('Failed to load donations', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();

    // Subscribe to realtime rescue events
    const unsub = realtimeEngine.subscribe('RESCUE_UPDATE', (event) => {
      if (event.payload && event.payload.id) {
        setDonations((prev) =>
          prev.map((d) => (d.id === event.payload.id ? { ...d, ...event.payload } : d))
        );
      }
    });

    return () => unsub();
  }, []);

  const refreshDonations = async () => {
    await fetchDonations();
  };

  const addDonation = (newDonation: Donation) => {
    setDonations((prev) => [newDonation, ...prev]);
    setImpactStats((prev) => ({
      ...prev,
      activeRescues: prev.activeRescues + 1,
    }));
  };

  const updateDonation = (id: string, updates: Partial<Donation>) => {
    setDonations((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  };

  const editDonation = async (id: string, updates: Partial<Donation>) => {
    const updated = await donationService.updateDonation(id, updates);
    setDonations((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updated } : d))
    );
    return updated;
  };

  const cancelDonation = async (id: string) => {
    const cancelled = await donationService.cancelDonation(id);
    setDonations((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'CANCELLED' } : d))
    );
    return cancelled;
  };

  const simulateRiskEvent = (donationId: string) => {
    setDonations((prev) =>
      prev.map((d) => {
        if (d.id === donationId) {
          return {
            ...d,
            status: 'RE_MATCHING',
            urgencyLevel: 'critical',
          };
        }
        return d;
      })
    );
  };

  return (
    <RescueContext.Provider
      value={{
        donations,
        impactStats,
        loading,
        refreshDonations,
        addDonation,
        updateDonation,
        editDonation,
        cancelDonation,
        simulateRiskEvent,
      }}
    >
      {children}
    </RescueContext.Provider>
  );
}

export function useRescue() {
  const context = useContext(RescueContext);
  if (!context) {
    throw new Error('useRescue must be used within a RescueProvider');
  }
  return context;
}
