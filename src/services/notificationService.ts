import { AppNotification, NotificationType, UserRole, Donation } from '@/types';
import { apiClient } from './apiClient';

const STORAGE_KEY = 'replate_notifications';

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'user-donor-1',
    userRole: 'DONOR',
    type: 'DONATION_MATCHED',
    title: 'Donation Matched with Shelter',
    message: 'Your donation of 50 portions of Paneer Rice was matched with Hope Community Shelter (96% fit).',
    donationId: 'RP-1024',
    timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
    read: false,
    actionUrl: '/rescue/RP-1024',
    metadata: {
      foodName: 'Paneer Rice & Vegetable Curry',
      shelterName: 'Hope Community Shelter & Kitchen',
      deliveryMode: 'VOLUNTEER',
    },
  },
  {
    id: 'notif-2',
    userId: 'user-donor-1',
    userRole: 'DONOR',
    type: 'DRIVER_ASSIGNED',
    title: 'Volunteer Driver Assigned',
    message: 'Aarav Patel (EV Cargo Car) has accepted your dispatch request. Estimated arrival in 12 mins.',
    donationId: 'RP-1024',
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    read: false,
    actionUrl: '/rescue/RP-1024',
    metadata: {
      driverName: 'Aarav Patel',
      otp: '4829',
    },
  },
  {
    id: 'notif-3',
    userId: 'user-donor-1',
    userRole: 'DONOR',
    type: 'PICKUP_REMINDER',
    title: 'Pickup Reminder: Driver Arriving',
    message: 'Driver arriving in 5 mins! Keep food packages ready in loading bay. Share Handover OTP [4829] upon inspection.',
    donationId: 'RP-1024',
    timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
    read: false,
    actionUrl: '/rescue/RP-1024',
    metadata: {
      otp: '4829',
    },
  },
  {
    id: 'notif-4',
    userId: 'user-shelter-1',
    userRole: 'SHELTER',
    type: 'DONATION_MATCHED',
    title: 'Incoming Rescue Matched',
    message: 'AI matched an incoming rescue: 50 portions of warm Paneer Rice from Grand Hyatt Hotel Catering.',
    donationId: 'RP-1024',
    timestamp: new Date(Date.now() - 17 * 60000).toISOString(),
    read: false,
    actionUrl: '/shelter/dashboard',
    metadata: {
      foodName: 'Paneer Rice & Vegetable Curry',
      shelterName: 'Hope Community Shelter & Kitchen',
    },
  },
  {
    id: 'notif-5',
    userId: 'user-shelter-1',
    userRole: 'SHELTER',
    type: 'DRIVER_ASSIGNED',
    title: 'Courier Dispatched to Donor',
    message: 'Volunteer Aarav Patel is picking up donation #RP-1024 and will deliver directly to your kitchen.',
    donationId: 'RP-1024',
    timestamp: new Date(Date.now() - 9 * 60000).toISOString(),
    read: false,
    actionUrl: '/shelter/dashboard',
    metadata: {
      driverName: 'Aarav Patel',
    },
  },
  {
    id: 'notif-6',
    userId: 'user-donor-1',
    userRole: 'DONOR',
    type: 'DONATION_DELIVERED',
    title: 'Rescue Successfully Delivered!',
    message: 'Your donation of 45 portions of Artisanal Sourdough was safely checked in at St. Anthony Dining Room.',
    donationId: 'RP-1028',
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    read: true,
    actionUrl: '/rescue/RP-1028',
    metadata: {
      foodName: 'Artisanal Sourdough & Croissants',
      shelterName: 'St. Anthony Dining Room',
    },
  },
  {
    id: 'notif-7',
    userId: 'user-shelter-1',
    userRole: 'SHELTER',
    type: 'DONATION_DELIVERED',
    title: 'Food Received & Checked In',
    message: 'Donation #RP-1028 checked in. 45 portions received in ambient sealed crates.',
    donationId: 'RP-1028',
    timestamp: new Date(Date.now() - 118 * 60000).toISOString(),
    read: true,
    actionUrl: '/shelter/dashboard',
    metadata: {
      foodName: 'Artisanal Sourdough & Croissants',
    },
  },
];

function getStoredNotifications(): AppNotification[] {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATIONS;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
    return DEFAULT_NOTIFICATIONS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
}

function saveStoredNotifications(notifs: AppNotification[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
}

export const notificationService = {
  async getNotifications(userRole?: UserRole, userId?: string): Promise<AppNotification[]> {
    const list = getStoredNotifications();
    return list.filter((n) => {
      if (userRole && n.userRole !== userRole && n.userRole !== 'ADMIN') return false;
      if (userId && n.userId && n.userId !== userId && n.userRole !== userRole) return false;
      return true;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  async markAsRead(id: string): Promise<void> {
    const list = getStoredNotifications();
    const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
    saveStoredNotifications(updated);
  },

  async markAllAsRead(userRole?: UserRole): Promise<void> {
    const list = getStoredNotifications();
    const updated = list.map((n) => {
      if (userRole && n.userRole !== userRole) return n;
      return { ...n, read: true };
    });
    saveStoredNotifications(updated);
  },

  async addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): Promise<AppNotification> {
    const list = getStoredNotifications();
    const newEntry: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    const updated = [newEntry, ...list];
    saveStoredNotifications(updated);

    // Try background sync with API
    try {
      await apiClient.post('/notifications', newEntry);
    } catch {
      // In-memory local persistence suffices
    }

    // Dispatch window custom event so UI components can update instantly
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('replate_notification_added', { detail: newEntry }));
    }

    return newEntry;
  },

  // High-level automated workflow triggers for Donor & Receiver
  async triggerDonationMatched(donation: Donation): Promise<void> {
    const shelterName = donation.matchedShelter?.name || 'Partner Food Bank';
    // 1. Notify Donor
    await this.addNotification({
      userId: donation.donorId || 'user-donor-1',
      userRole: 'DONOR',
      type: 'DONATION_MATCHED',
      title: 'AI Matched Your Donation!',
      message: `Your donation of ${donation.foodName} has been matched by AI with ${shelterName}.`,
      donationId: donation.id,
      actionUrl: `/rescue/${donation.id}`,
      metadata: {
        foodName: donation.foodName,
        shelterName,
        deliveryMode: donation.deliveryMode,
      },
    });

    // 2. Notify Receiver / Shelter
    await this.addNotification({
      userId: donation.matchedShelter?.id || 'user-shelter-1',
      userRole: 'SHELTER',
      type: 'DONATION_MATCHED',
      title: 'Incoming Food Donation Matched',
      message: `AI routed ${donation.quantity} of ${donation.foodName} from ${donation.donorName} to your center.`,
      donationId: donation.id,
      actionUrl: '/shelter/dashboard',
      metadata: {
        foodName: donation.foodName,
        shelterName,
      },
    });
  },

  async triggerDriverAssigned(donation: Donation): Promise<void> {
    const driverName = donation.assignedDriver?.name || 'Volunteer Courier';
    const vehicle = donation.assignedDriver?.vehicleType || 'Vehicle';
    const otp = donation.pickupOtp || '4829';

    // 1. Notify Donor
    await this.addNotification({
      userId: donation.donorId || 'user-donor-1',
      userRole: 'DONOR',
      type: 'DRIVER_ASSIGNED',
      title: 'Volunteer Driver Assigned',
      message: `${driverName} (${vehicle}) accepted the pickup. Keep Handover OTP [${otp}] ready.`,
      donationId: donation.id,
      actionUrl: `/rescue/${donation.id}`,
      metadata: {
        driverName,
        otp,
        foodName: donation.foodName,
      },
    });

    // 2. Notify Receiver
    await this.addNotification({
      userId: donation.matchedShelter?.id || 'user-shelter-1',
      userRole: 'SHELTER',
      type: 'DRIVER_ASSIGNED',
      title: 'Courier Dispatched for Pickup',
      message: `${driverName} is on the way to pick up ${donation.foodName} for delivery to you.`,
      donationId: donation.id,
      actionUrl: '/shelter/dashboard',
      metadata: {
        driverName,
        foodName: donation.foodName,
      },
    });
  },

  async triggerPickupReminder(donation: Donation): Promise<void> {
    const driverName = donation.assignedDriver?.name || 'Volunteer Courier';
    const otp = donation.pickupOtp || '4829';

    // 1. Notify Donor
    await this.addNotification({
      userId: donation.donorId || 'user-donor-1',
      userRole: 'DONOR',
      type: 'PICKUP_REMINDER',
      title: 'Pickup Reminder: Driver Arriving in 5 Mins',
      message: `${driverName} is arriving at your pickup spot. Please inspect food and share Handover OTP [${otp}].`,
      donationId: donation.id,
      actionUrl: `/rescue/${donation.id}`,
      metadata: {
        driverName,
        otp,
        foodName: donation.foodName,
      },
    });
  },

  async triggerDonationDelivered(donation: Donation): Promise<void> {
    const shelterName = donation.matchedShelter?.name || 'Recipient Center';

    // 1. Notify Donor
    await this.addNotification({
      userId: donation.donorId || 'user-donor-1',
      userRole: 'DONOR',
      type: 'DONATION_DELIVERED',
      title: 'Donation Delivered Successfully! 🎉',
      message: `${donation.quantity} of ${donation.foodName} was safely handed over to ${shelterName}. Thank you for preventing waste!`,
      donationId: donation.id,
      actionUrl: `/rescue/${donation.id}`,
      metadata: {
        foodName: donation.foodName,
        shelterName,
      },
    });

    // 2. Notify Receiver
    await this.addNotification({
      userId: donation.matchedShelter?.id || 'user-shelter-1',
      userRole: 'SHELTER',
      type: 'DONATION_DELIVERED',
      title: 'Rescue Checked In Successfully',
      message: `${donation.foodName} received from ${donation.donorName} and logged in inventory.`,
      donationId: donation.id,
      actionUrl: '/shelter/dashboard',
      metadata: {
        foodName: donation.foodName,
      },
    });
  },
};
