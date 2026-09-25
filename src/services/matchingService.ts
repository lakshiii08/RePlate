import { Shelter, Driver, Donation } from '@/types';
import { findRankedSheltersForDonation, VERIFIED_SHELTERS_DATA } from './locationData';
import { donationService } from './donationService';
import { apiClient } from './apiClient';

export interface MatchingStageProgress {
  stage: string;
  completed: boolean;
}

export const matchingService = {
  async getCandidateShelters(donationId: string): Promise<Shelter[]> {
    const apiRes = await apiClient.get<Shelter[]>(`/matching/candidates/${donationId}`);
    if (apiRes.data && Array.isArray(apiRes.data) && apiRes.data.length > 0) {
      return apiRes.data;
    }

    const donation = await donationService.getDonationById(donationId);
    const donorCoords = donation?.donorCoords || [28.6315, 77.2167];

    // Compute real distance-ranked candidate shelters using AI nearest-route algorithm
    const rankedShelters = findRankedSheltersForDonation(
      donorCoords,
      donation?.category || 'Meal',
      donation?.mealCount || 30,
      donation?.foodType || 'Veg',
      donation?.rescueWindowMinutes || 180
    );

    return rankedShelters;
  },

  async getAvailableDrivers(donorCoords?: [number, number]): Promise<Driver[]> {
    const query = donorCoords
      ? `/drivers?status=AVAILABLE&lat=${donorCoords[0]}&lng=${donorCoords[1]}`
      : '/drivers?status=AVAILABLE';
    const apiRes = await apiClient.get<Driver[]>(query);
    if (apiRes.data && Array.isArray(apiRes.data) && apiRes.data.length > 0) {
      return apiRes.data;
    }

    // Fallback: fetch all active couriers from database
    const allRes = await apiClient.get<Driver[]>('/drivers');
    if (allRes.data && Array.isArray(allRes.data) && allRes.data.length > 0) {
      return allRes.data.filter((d) => d.status !== 'OFFLINE');
    }

    return [];
  },

  async selectMatch(donationId: string, shelterId: string): Promise<Donation> {
    const sRes = await apiClient.get<Shelter[]>('/shelters');
    const allShelters = (sRes.data && sRes.data.length > 0) ? sRes.data : VERIFIED_SHELTERS_DATA;
    const shelter = allShelters.find((s) => s.id === shelterId) || allShelters[0];

    return donationService.updateDonationStatus(donationId, 'MATCHED', {
      matchedShelter: shelter,
    });
  },

  async assignDriver(donationId: string, driverId: string): Promise<Donation> {
    const apiRes = await apiClient.post<Donation>('/matching/assign', {
      donationId,
      driverId,
    });
    if (apiRes.data) {
      return apiRes.data;
    }

    const dRes = await apiClient.get<Driver[]>('/drivers');
    const drivers = dRes.data || [];
    const driver = drivers.find((d) => d.id === driverId) || drivers[0];

    return donationService.updateDonationStatus(donationId, 'DRIVER_ASSIGNED', {
      assignedDriver: driver,
      driverCoords: driver?.coords,
    });
  },

  async triggerDynamicRematch(
    donationId: string,
    reason: string
  ): Promise<{ donation: Donation; backupDrivers: Driver[]; backupShelters: Shelter[] }> {
    const apiRes = await apiClient.post<{
      donation: Donation;
      backupDriver: Driver;
      backupShelter: Shelter;
    }>('/matching/rematch', { donationId, reason });

    if (apiRes.data && apiRes.data.donation) {
      return {
        donation: apiRes.data.donation,
        backupDrivers: apiRes.data.backupDriver ? [apiRes.data.backupDriver] : [],
        backupShelters: apiRes.data.backupShelter ? [apiRes.data.backupShelter] : [],
      };
    }

    const [dRes, sRes] = await Promise.all([
      apiClient.get<Driver[]>('/drivers'),
      apiClient.get<Shelter[]>('/shelters'),
    ]);
    const backupDrivers = dRes.data || [];
    const backupShelters = sRes.data || VERIFIED_SHELTERS_DATA;

    const updated = await donationService.updateDonationStatus(donationId, 'RE_MATCHING', {
      assignedDriver: backupDrivers[0],
      matchedShelter: backupShelters[0],
      driverCoords: backupDrivers[0]?.coords,
    });

    return {
      donation: updated,
      backupDrivers,
      backupShelters,
    };
  },
};
