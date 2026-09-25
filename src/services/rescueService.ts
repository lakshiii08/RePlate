import { Donation, PickupVerification, DeliveryVerification } from '@/types';
import { donationService } from './donationService';
import { apiClient } from './apiClient';

export interface RescueModel {
  rescue_id: string;
  donationId: string;
  status: string;
  donor: {
    name: string;
    phone?: string;
    address: string;
    coords: [number, number];
    contactPerson?: string;
  };
  shelter: {
    id: string;
    name: string;
    address: string;
    coords: [number, number];
    contactPhone?: string;
    intakeCapacity: number;
    contactPerson?: string;
  };
  driver?: {
    id: string;
    name: string;
    phone: string;
    vehicleType?: string;
    vehiclePlate?: string;
    coords?: [number, number];
    etaMinutes?: number;
  };
  foodDetails: {
    foodName: string;
    quantity: string;
    quantityKg?: number;
    mealCount?: number;
    category?: string;
    foodType?: string;
    storageMethod?: string;
    pickupDeadline?: string;
  };
  pickupOtp: string;
  deliveryOtp: string;
  pickupVerified: boolean;
  deliveryVerified: boolean;
  route?: {
    source?: string;
    distanceMeters?: number;
    distanceKm?: number;
    durationSeconds?: number;
    durationMinutes?: number;
    geometry?: any;
    steps?: Array<{ instruction: string; distance: number; duration: number }>;
  };
  telemetry?: {
    temperatureCelsius?: number;
    coldChainCompliant?: boolean;
    lastPingAt?: string;
  };
  timeline?: Array<{
    status: string;
    timestamp: string;
    message: string;
    actor: string;
  }>;
}

export const rescueService = {
  // 1. Create Rescue Lifecycle Mission
  async createRescue(donationId: string, shelterId: string): Promise<{ success: boolean; rescue: RescueModel }> {
    const res = await apiClient.post<{ success: boolean; rescue: RescueModel }>('/rescues/create', {
      donation_id: donationId,
      shelter_id: shelterId,
    });
    if (res.data) return res.data;
    throw new Error(res.message || 'Failed to initialize rescue mission.');
  },

  // 2. Assign Driver to Rescue
  async assignDriver(rescueId: string, driverId?: string): Promise<{ success: boolean; rescue: RescueModel }> {
    const res = await apiClient.post<{ success: boolean; rescue: RescueModel }>(`/rescues/${rescueId}/assign-driver`, {
      driver_id: driverId,
    });
    if (res.data) return res.data;
    throw new Error(res.message || 'Failed to assign driver.');
  },

  // 3. Update Rescue Status
  async updateStatus(
    rescueId: string,
    status: string,
    note?: string,
    temperatureCelsius?: number
  ): Promise<{ success: boolean; rescue: RescueModel }> {
    const res = await apiClient.post<{ success: boolean; rescue: RescueModel }>(`/rescues/${rescueId}/status`, {
      status,
      note,
      temperatureCelsius,
    });
    if (res.data) return res.data;
    throw new Error(res.message || 'Failed to update rescue status.');
  },

  // 4. Verify Rescue OTP (Pickup or Delivery)
  async verifyOtp(
    rescueId: string,
    otp: string,
    stage: 'pickup' | 'delivery'
  ): Promise<{ verified: boolean; stage: string; message: string; rescue: RescueModel }> {
    const res = await apiClient.post<{ verified: boolean; stage: string; message: string; rescue: RescueModel }>(
      `/rescues/${rescueId}/verify-otp`,
      { otp, stage }
    );
    if (res.data) return res.data;
    throw new Error(res.message || 'Failed to verify OTP.');
  },

  // 5. Get Rescue Details
  async getRescue(rescueId: string): Promise<{ success: boolean; rescue: RescueModel }> {
    const res = await apiClient.get<{ success: boolean; rescue: RescueModel }>(`/rescues/${rescueId}`);
    if (res.data) return res.data;
    throw new Error(res.message || 'Failed to load rescue details.');
  },

  // 6. Simulator: Driver Cancellation
  async simulateDriverCancel(rescueId: string, reason?: string): Promise<any> {
    const res = await apiClient.post<any>('/simulator/driver-cancel', {
      rescue_id: rescueId,
      reason,
    });
    if (res.data) return res.data;
    throw new Error(res.message || 'Simulation failed.');
  },

  // 7. Simulator: Shelter Capacity Full
  async simulateShelterFull(rescueId: string, reason?: string): Promise<any> {
    const res = await apiClient.post<any>('/simulator/shelter-full', {
      rescue_id: rescueId,
      reason,
    });
    if (res.data) return res.data;
    throw new Error(res.message || 'Simulation failed.');
  },

  // 8. Simulator: Route Delay
  async simulateRouteDelay(rescueId: string, delayMinutes = 25, reason?: string): Promise<any> {
    const res = await apiClient.post<any>('/simulator/route-delay', {
      rescue_id: rescueId,
      delayMinutes,
      reason,
    });
    if (res.data) return res.data;
    throw new Error(res.message || 'Simulation failed.');
  },

  // Legacy Pickup & Delivery compatibility
  async verifyPickup(
    donationId: string,
    verification: {
      tempCelsius: number;
      packagingVerified: boolean;
      pinCode: string;
      driverId: string;
    }
  ): Promise<Donation> {
    const apiRes = await apiClient.post<Donation>(`/donations/${donationId}/verify-pickup`, verification);
    if (apiRes.data) {
      return apiRes.data;
    }

    const pickupData: PickupVerification = {
      ...verification,
      photoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop',
      timestamp: new Date().toISOString(),
      verifiedByDriverId: verification.driverId,
    };

    return donationService.updateDonationStatus(donationId, 'PICKED_UP', {
      pickupVerification: pickupData,
      status: 'IN_TRANSIT',
    });
  },

  async verifyDelivery(
    donationId: string,
    verification: {
      tempCelsius: number;
      recipientName: string;
      recipientSignature: string;
    }
  ): Promise<Donation> {
    const apiRes = await apiClient.post<Donation>(`/donations/${donationId}/verify-delivery`, verification);
    if (apiRes.data) {
      return apiRes.data;
    }

    const deliveryData: DeliveryVerification = {
      ...verification,
      photoUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500&auto=format&fit=crop',
      timestamp: new Date().toISOString(),
    };

    return donationService.updateDonationStatus(donationId, 'DELIVERED', {
      deliveryVerification: deliveryData,
      status: 'DELIVERED',
    });
  },
};
