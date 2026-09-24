import { Shelter, Driver, Donation } from '@/types';
import { MOCK_SHELTERS, MOCK_DRIVERS } from './mockData';
import { donationService } from './donationService';
import { aiService } from './aiService';

export interface MatchingStageProgress {
  stage: string;
  completed: boolean;
}

export const matchingService = {
  async getCandidateShelters(donationId: string): Promise<Shelter[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const donation = await donationService.getDonationById(donationId);
    
    // Compute explainable scores for shelters
    const sheltersWithScores = await Promise.all(
      MOCK_SHELTERS.map(async (shelter) => {
        const score = await aiService.generateExplainableMatchReason(
          shelter.name,
          donation?.category || 'Cooked Meal',
          shelter.etaMinutes,
          shelter.capacityMeals,
          donation?.rescueWindowMinutes || 90
        );
        return {
          ...shelter,
          feasibilityScore: score,
        };
      })
    );

    // Sort by feasibility score descending
    return sheltersWithScores.sort(
      (a, b) => (b.feasibilityScore?.overallScore || 0) - (a.feasibilityScore?.overallScore || 0)
    );
  },

  async getAvailableDrivers(): Promise<Driver[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...MOCK_DRIVERS];
  },

  async selectMatch(donationId: string, shelterId: string): Promise<Donation> {
    const shelter = MOCK_SHELTERS.find((s) => s.id === shelterId) || MOCK_SHELTERS[0];
    return donationService.updateDonationStatus(donationId, 'MATCHED', {
      matchedShelter: shelter,
    });
  },

  async assignDriver(donationId: string, driverId: string): Promise<Donation> {
    const driver = MOCK_DRIVERS.find((d) => d.id === driverId) || MOCK_DRIVERS[0];
    return donationService.updateDonationStatus(donationId, 'DRIVER_ASSIGNED', {
      assignedDriver: driver,
      driverCoords: driver.coords,
    });
  },

  async triggerDynamicRematch(donationId: string, reason: string): Promise<{ donation: Donation; backupDrivers: Driver[]; backupShelters: Shelter[] }> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const backupShelters = MOCK_SHELTERS.slice(1);
    const backupDrivers = MOCK_DRIVERS.slice(1);
    
    const updated = await donationService.updateDonationStatus(donationId, 'RE_MATCHING', {
      assignedDriver: backupDrivers[0],
      matchedShelter: backupShelters[0],
      driverCoords: backupDrivers[0].coords,
    });

    return {
      donation: updated,
      backupDrivers,
      backupShelters,
    };
  }
};
