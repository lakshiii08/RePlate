export type UserRole = 'DONOR' | 'SHELTER' | 'DRIVER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  organization?: string;
  avatar?: string;
}

export type FoodCategory =
  | 'Cooked Meal'
  | 'Bakery & Bread'
  | 'Fresh Produce'
  | 'Packaged Goods'
  | 'Dairy & Refrigerated'
  | 'Catered Buffet';

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

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  donorAddress: string;
  donorCoords: [number, number];
  foodName: string;
  category: FoodCategory;
  quantity: string;
  mealCount: number;
  description: string;
  prepTime: string;
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
  matchedShelter?: Shelter;
  assignedDriver?: Driver;
  driverCoords?: [number, number];
  pickupVerification?: PickupVerification;
  deliveryVerification?: DeliveryVerification;
  createdAt: string;
  urgencyLevel: 'normal' | 'attention' | 'critical' | 'expired';
}

export interface ImpactStats {
  mealsRescued: number;
  activeRescues: number;
  foodSavedKg: number;
  deliveriesCompleted: number;
  co2PreventedKg: number;
  sheltersServed: number;
}
