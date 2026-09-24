import { Donation, PickupVerification, DeliveryVerification } from '@/types';
import { donationService } from './donationService';

export const rescueService = {
  async verifyPickup(
    donationId: string,
    verification: {
      tempCelsius: number;
      packagingVerified: boolean;
      pinCode: string;
      driverId: string;
    }
  ): Promise<Donation> {
    await new Promise((resolve) => setTimeout(resolve, 500));
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
    await new Promise((resolve) => setTimeout(resolve, 500));
    const deliveryData: DeliveryVerification = {
      ...verification,
      photoUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500&auto=format&fit=crop',
      timestamp: new Date().toISOString(),
    };

    return donationService.updateDonationStatus(donationId, 'DELIVERED', {
      deliveryVerification: deliveryData,
      status: 'DELIVERED',
    });
  }
};
