export type UserRole = 'DONOR' | 'SHELTER' | 'DRIVER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  organization?: string;
  avatar?: string;
  location?: string;
  status?: string;
  activeRescueId?: string;
  address?: string;
  ownerName?: string;
  operatingHours?: string;
  taxId?: string;
  facilityType?: string;
  intakeCapacity?: number;
  dietaryPreferences?: string[];
  intakeInstructions?: string;
  vehicleType?: string;
  vehiclePlate?: string;
  vehicleCapacityKg?: number;
  driverLicense?: string;
  serviceRadiusKm?: number;
  isOnline?: boolean;
}

export type FoodCategory =
  | 'Meal'
  | 'Bakery'
  | 'Fruits'
  | 'Other'
  | 'Cooked Meal'
  | 'Bakery & Bread'
  | 'Fresh Produce'
  | 'Packaged Goods'
  | 'Dairy & Refrigerated'
  | 'Catered Buffet';

export type FoodType = 'Veg' | 'Non-Veg';

export type StorageMethod = 'refrigerated' | 'hot_held' | 'ambient' | 'frozen';
export type PackagingType = 'sealed' | 'covered' | 'individual_containers' | 'bulk_boxes';

export type EligibilityStatus = 'ELIGIBLE' | 'REVIEW_REQUIRED' | 'DO_NOT_ROUTE';

export type RescueStatus =
  | 'POSTED'
  | 'VERIFIED'
  | 'MATCHING'
  | 'MATCHED'
  | 'DRIVER_ASSIGNED'
  | 'PICKUP_IN_PROGRESS'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RE_MATCHING';

export interface Shelter {
  id: string;
  name: string;
  address: string;
  coords: [number, number];
  capacityMeals: number;
  currentNeeds: string[];
  distanceKm: number;
  etaMinutes: number;
  contactPhone: string;
  feasibilityScore?: FeasibilityBreakdown;
  cityZone?: string;
}

export interface RestaurantLocation {
  id: string;
  name: string;
  category: string;
  address: string;
  coords: [number, number];
  cityZone: string;
  phone?: string;
  operatingHours?: string;
  defaultFoodType?: FoodType;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleType: 'Refrigerated Van' | 'EV Cargo Car' | 'E-Bike Courier' | 'Thermal Truck';
  coords: [number, number];
  status: 'AVAILABLE' | 'ON_RESCUE' | 'OFFLINE';
  rating: number;
  etaToDonorMinutes: number;
  deliveriesCompleted: number;
}

export interface FeasibilityBreakdown {
  overallScore: number;
  timeFeasibility: number;
  capacityFit: number;
  foodCompatibility: number;
  distanceEta: number;
  needPriority: number;
  driverReadiness: number;
  explanation: string;
}

export interface SafetyDeclarations {
  safeStorage: boolean;
  cleanContainers: boolean;
  noContamination: boolean;
  donorVerified: boolean;
}

export interface PickupVerification {
  tempCelsius: number;
  packagingVerified: boolean;
  pinCode: string;
  photoUrl?: string;
  timestamp: string;
  verifiedByDriverId: string;
}

export interface DeliveryVerification {
  tempCelsius: number;
  recipientName: string;
  recipientSignature: string;
  photoUrl?: string;
  timestamp: string;
}

export type DeliveryMode = 'VOLUNTEER' | 'SELF_DRIVE';

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  donorAddress: string;
  donorCoords: [number, number];
  donorEmail?: string;
  recipientEmail?: string;
  foodName: string;
  foodType?: FoodType;
  category: FoodCategory;
  quantity: string;
  mealCount: number;
  description: string;
  specialNotes?: string;
  prepTime: string;
  bestBefore?: string;
  availableFrom: string;
  pickupDeadline: string; // ISO format
  rescueWindowMinutes: number;
  storageMethod: StorageMethod;
  packagingType: PackagingType;
  allergens: string[];
  declarations: SafetyDeclarations;
  eligibilityStatus: EligibilityStatus;
  eligibilityReason?: string;
  status: RescueStatus;
  deliveryMode?: DeliveryMode;
  photos?: string[];
  pickupOtp?: string;
  deliveryOtp?: string;
  aiMatchReason?: string;
  aiMatchScore?: number;
  matchedShelter?: Shelter;
  assignedDriver?: Driver;
  driverCoords?: [number, number];
  pickupVerification?: PickupVerification;
  deliveryVerification?: DeliveryVerification;
  createdAt: string;
  urgencyLevel: 'normal' | 'attention' | 'critical' | 'expired';
}

export type NotificationType =
  | 'DONATION_MATCHED'
  | 'DRIVER_ASSIGNED'
  | 'PICKUP_REMINDER'
  | 'DONATION_DELIVERED'
  | 'SYSTEM_ALERT';

export interface AppNotification {
  id: string;
  userId: string;
  userRole: UserRole;
  type: NotificationType;
  title: string;
  message: string;
  donationId?: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  metadata?: {
    foodName?: string;
    shelterName?: string;
    driverName?: string;
    otp?: string;
    deliveryMode?: DeliveryMode;
  };
}

export interface ImpactStats {
  mealsRescued: number;
  activeRescues: number;
  foodSavedKg: number;
  deliveriesCompleted: number;
  co2PreventedKg: number;
  sheltersServed: number;
}

export type PartnerKind = 'RESTAURANT' | 'GROCERY' | 'NGO';

export interface NetworkPartner {
  id: string;
  name: string;
  kind: PartnerKind;
  state: string;
  city: string;
  status: 'CONNECTED' | 'PAUSED';
}

export type ComplaintStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED';

export interface Complaint {
  id: string;
  reporterName: string;
  organization: string;
  subject: string;
  details: string;
  category: 'Food safety' | 'Pickup issue' | 'Account' | 'Other';
  priority: 'High' | 'Medium' | 'Low';
  status: ComplaintStatus;
  state: string;
  city: string;
  submittedAt: string;
}

export interface RecoveryRecord {
  id: string;
  completedAt: string;
  meals: number;
  state: string;
  city: string;
}
