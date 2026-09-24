import { apiClient } from './apiClient';
import { donationService } from './donationService';
import { aiService } from './aiService';

export interface CriticalRescueAlert {
  id: string;
  foodName: string;
  mealCount: number;
  remainingMinutes: number;
  driverEtaMinutes: number;
  donorName: string;
  donorAddress: string;
  reason: string;
}

export interface SafetyReviewItem {
  id: string;
  donationId: string;
  donorName: string;
  foodName: string;
  category: string;
  storageMethod: string;
  pickupDeadline: string;
  flaggedReason: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'CLARIFICATION_REQUESTED';
}

export interface UserManagementItem {
  id: string;
  name: string;
  role: 'DONOR' | 'SHELTER' | 'DRIVER' | 'ADMIN';
  location: string;
  status: 'ACTIVE' | 'INACTIVE';
  activeRescueId?: string;
  phone: string;
}

export const adminService = {
  async getCriticalRescues(): Promise<CriticalRescueAlert[]> {
    // 1. Compute dynamically from live donations store
    const donations = await donationService.getDonations();
    const criticals = donations.filter(
      (d) =>
        d.status !== 'DELIVERED' &&
        d.status !== 'CANCELLED' &&
        (d.urgencyLevel === 'critical' || d.status === 'RE_MATCHING')
    );

    if (criticals.length > 0) {
      return criticals.map((d) => {
        const remainingMs = new Date(d.pickupDeadline).getTime() - Date.now();
        const remainingMin = Math.max(1, Math.round(remainingMs / 60000));
        const driverEta = d.assignedDriver?.etaToDonorMinutes || 15;

        return {
          id: d.id,
          foodName: d.foodName,
          mealCount: d.mealCount || 40,
          remainingMinutes: remainingMin,
          driverEtaMinutes: driverEta,
          donorName: d.donorName,
          donorAddress: d.donorAddress,
          reason:
            driverEta >= remainingMin
              ? `Courier ETA (${driverEta}m) exceeds remaining safety window (${remainingMin}m). Reroute required.`
              : `High perishable urgency: ${remainingMin}m remaining preservation window. Priority dispatch active.`,
        };
      });
    }

    // Baseline fallback if all current rescues are healthy
    return [
      {
        id: 'RP-1026',
        foodName: 'Grilled Herb Chicken & Quinoa Bowls',
        mealCount: 80,
        remainingMinutes: 16,
        driverEtaMinutes: 24,
        donorName: 'Corporate Tech Campus Cafeteria',
        donorAddress: '100 Silicon Way, SOMA South',
        reason: 'Courier transit ETA exceeds remaining preservation window. Backup dispatch recommended.',
      },
      {
        id: 'RP-1030',
        foodName: 'Herb Roasted Salmon & Wild Rice',
        mealCount: 35,
        remainingMinutes: 19,
        driverEtaMinutes: 14,
        donorName: 'Pacific Culinary Institute',
        donorAddress: '600 Townsend St, Design District',
        reason: 'Hot-held seafood approaching maximum allowable holding window.',
      },
    ];
  },

  async getSafetyReviewItems(): Promise<SafetyReviewItem[]> {
    const apiRes = await apiClient.get<SafetyReviewItem[]>('/admin/safety-reviews');
    if (apiRes.data && Array.isArray(apiRes.data) && apiRes.data.length > 0) {
      return apiRes.data;
    }

    return [
      {
        id: 'SR-201',
        donationId: 'RP-1029',
        donorName: 'Metro Express Deli',
        foodName: 'Artisan Turkey & Cheddar Baguette Boxes',
        category: 'Packaged Goods',
        storageMethod: 'refrigerated',
        pickupDeadline: new Date(Date.now() + 70 * 60000).toISOString(),
        flaggedReason: 'Dairy allergen affirmation requires food handling audit confirmation.',
        status: 'PENDING_REVIEW',
      },
      {
        id: 'SR-202',
        donationId: 'RP-1030',
        donorName: 'Pacific Culinary Institute',
        foodName: 'Herb Roasted Salmon & Wild Rice',
        category: 'Cooked Meal',
        storageMethod: 'hot_held',
        pickupDeadline: new Date(Date.now() + 19 * 60000).toISOString(),
        flaggedReason: 'Critical remaining time (<20 min) requires expedited thermal barrier confirmation.',
        status: 'PENDING_REVIEW',
      },
    ];
  },

  async getUsersList(): Promise<UserManagementItem[]> {
    const apiRes = await apiClient.get<UserManagementItem[]>('/admin/users');
    if (apiRes.data && Array.isArray(apiRes.data) && apiRes.data.length > 0) {
      return apiRes.data;
    }

    return [
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
        name: 'Artisan Sourdough & Cafe',
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
        name: 'Grace Haven Family Care',
        role: 'SHELTER',
        location: 'SOMA, SF',
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
    ];
  },

  async askCopilot(query: string): Promise<string> {
    return aiService.askCopilot(query);
  },
};
