import { Donation, Shelter, Driver, EligibilityStatus } from '@/types';
import { MOCK_DONATIONS, MOCK_SHELTERS, MOCK_DRIVERS } from './mockData';

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
  role: 'DONOR' | 'SHELTER' | 'DRIVER';
  location: string;
  status: 'ACTIVE' | 'INACTIVE';
  activeRescueId?: string;
  phone: string;
}

export const adminService = {
  async getCriticalRescues(): Promise<CriticalRescueAlert[]> {
    return [
      {
        id: 'RP-1026',
        foodName: 'Grilled Chicken & Quinoa Bowls',
        mealCount: 80,
        remainingMinutes: 18,
        driverEtaMinutes: 28,
        donorName: 'Corporate Tech Campus Cafeteria',
        donorAddress: '100 Silicon Way, Soma',
        reason: 'Driver ETA (28 min) exceeds remaining rescue window (18 min). Rescue at risk of expiration.',
      },
      {
        id: 'RP-1028',
        foodName: 'Artisanal Bakery Trays',
        mealCount: 45,
        remainingMinutes: 24,
        driverEtaMinutes: 31,
        donorName: 'Mission Delicatessen',
        donorAddress: '512 Valencia Street',
        reason: 'Primary corridor gridlock delayed assigned courier.',
      },
    ];
  },

  async getSafetyReviewItems(): Promise<SafetyReviewItem[]> {
    return [
      {
        id: 'SR-201',
        donationId: 'RP-1029',
        donorName: 'Bistro 33 Caterers',
        foodName: 'Seafood Paella Trays',
        category: 'Cooked Meal',
        storageMethod: 'hot_held',
        pickupDeadline: new Date(Date.now() + 45 * 60000).toISOString(),
        flaggedReason: 'Unsealed thermal lid declaration require manual audit check for hot seafood.',
        status: 'PENDING_REVIEW',
      },
      {
        id: 'SR-202',
        donationId: 'RP-1030',
        donorName: 'Organic Salad Bar',
        foodName: 'Chilled Caesar Salad Bowl',
        category: 'Fresh Produce',
        storageMethod: 'refrigerated',
        pickupDeadline: new Date(Date.now() + 60 * 60000).toISOString(),
        flaggedReason: 'Missing explicit dairy allergen declaration.',
        status: 'PENDING_REVIEW',
      },
    ];
  },

  async getUsersList(): Promise<UserManagementItem[]> {
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
    ];
  },

  async askCopilot(query: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 450));
    const lower = query.toLowerCase();

    if (lower.includes('prioritize') || lower.includes('priority')) {
      return 'DATA ANALYSIS: Prioritize Rescue #RP-1026 (Grilled Chicken Bowls). Remaining rescue window is 18 mins, but assigned driver ETA is 28 mins due to congestion. Recommend immediate dynamic rematch to EV Courier Elena Rostova (8 min ETA).';
    }
    if (lower.includes('rp-1024') || lower.includes('1024')) {
      return 'RESCUE STATUS RP-1024: Currently PICKUP_IN_PROGRESS. Food: 50 Paneer Rice Meals. Donor: Grand Hyatt Catering. Shelter: Hope Community Shelter. Driver: Aarav Patel (8 min ETA). Feasibility Score: 94%. Safety Audit: Passed.';
    }
    if (lower.includes('driver') || lower.includes('available driver')) {
      return 'DRIVER DISPATCH OPTION: Driver Elena Rostova (EV Cargo) is currently AVAILABLE 1.2 km from RP-1026 with an estimated pickup time of 8 minutes. Rating: 4.8/5.0.';
    }
    if (lower.includes('unmatched') || lower.includes('match')) {
      return 'UNMATCHED REASONING: RP-1026 was unmatched because Hope Shelter exceeded capacity for cooked meals at 7:30 PM. Backup candidate Grace Haven shelter has confirmed intake availability for 75 meals.';
    }

    return `OPERATIONAL INTELLIGENCE LOG: Query analyzed against active rescue graph. System telemetry: 18 Active Rescues, 2 Critical Alerts, 100% Deterministic Food Safety Compliance.`;
  }
};
