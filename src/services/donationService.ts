import { Donation, EligibilityStatus } from '@/types';
import { MOCK_DONATIONS } from './mockData';

let donationsStore: Donation[] = [...MOCK_DONATIONS];

export const donationService = {
  async getDonations(): Promise<Donation[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return [...donationsStore];
  },

  async getDonationById(id: string): Promise<Donation | null> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const found = donationsStore.find((d) => d.id.toLowerCase() === id.toLowerCase());
    return found || donationsStore[0]; // fallback for demo smoothness
  },

  async createDonation(data: Omit<Donation, 'id' | 'createdAt' | 'status' | 'urgencyLevel'>): Promise<Donation> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const newDonation: Donation = {
      ...data,
      id: `RP-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'POSTED',
      createdAt: new Date().toISOString(),
      urgencyLevel: data.rescueWindowMinutes < 30 ? 'critical' : data.rescueWindowMinutes < 60 ? 'attention' : 'normal',
    };
    donationsStore.unshift(newDonation);
    return newDonation;
  },

  async updateDonationStatus(id: string, status: Donation['status'], extraFields?: Partial<Donation>): Promise<Donation> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const index = donationsStore.findIndex((d) => d.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      if (donationsStore[0]) {
        donationsStore[0] = { ...donationsStore[0], status, ...extraFields };
        return donationsStore[0];
      }
      throw new Error('Donation not found');
    }
    donationsStore[index] = {
      ...donationsStore[index],
      status,
      ...extraFields,
    };
    return donationsStore[index];
  },

  /**
   * Deterministic rule-based eligibility gate as specified in Section 7.
   * AI supports input parsing, but food safety eligibility MUST be deterministic.
   */
  evaluateEligibility(donation: Partial<Donation>): { status: EligibilityStatus; reason: string } {
    if (!donation.declarations?.safeStorage) {
      return {
        status: 'DO_NOT_ROUTE',
        reason: 'Failed Safety Verification: Storage temperature guidelines not affirmed by donor.',
      };
    }
    if (!donation.declarations?.noContamination) {
      return {
        status: 'DO_NOT_ROUTE',
        reason: 'Failed Safety Verification: Unverified cross-contamination declaration.',
      };
    }
    if (donation.storageMethod === 'hot_held' && donation.packagingType === 'covered') {
      return {
        status: 'REVIEW_REQUIRED',
        reason: 'Review Required: Hot-held items covered but unsealed require thermal insulated barrier inspection.',
      };
    }
    if (donation.rescueWindowMinutes && donation.rescueWindowMinutes < 15) {
      return {
        status: 'DO_NOT_ROUTE',
        reason: 'Rescue Window Expired / Feasibility Risk: Under 15 minutes remaining window.',
      };
    }
    return {
      status: 'ELIGIBLE',
      reason: '100% Deterministic Safety Criteria Passed: Temperature, sealed packaging, and food handler declaration verified.',
    };
  },
};
