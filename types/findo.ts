export type MainCategoryId =
  | 'automotive'
  | 'home_construction'
  | 'medical_dental'
  | 'beauty_wellness'
  | 'legal_consulting'
  | 'tech_digital'
  | 'education'
  | 'real_estate'
  | 'events_dining'
  | 'repair_technical'
  | 'delivery_moving'
  | 'other_services';

export type AutomotiveSubcategoryId =
  | 'mechanic'
  | 'electrical'
  | 'battery'
  | 'towing'
  | 'body_paint'
  | 'suspension'
  | 'diagnostics'
  | 'car_wash'
  | 'gearbox'
  | 'periodic_service';

export type ServiceCategoryId =
  | MainCategoryId
  | AutomotiveSubcategoryId
  | 'plumbing'
  | 'home_electrical'
  | 'appliance_repair'
  | 'mobile_repair'
  | 'legal_counsel'
  | 'tutoring'
  | 'moving'
  | string;

export interface MainCategoryMeta {
  id: MainCategoryId;
  titleFa: string;
  titleEn: string;
  iconName: string;
  descriptionFa: string;
  popularServices: string[];
  subcategories?: {
    id: string;
    titleFa: string;
    descriptionFa: string;
    badge?: string;
    popularIssues?: string[];
  }[];
}

export interface ServiceCategory {
  id: ServiceCategoryId;
  titleFa: string;
  mainCategory?: MainCategoryId;
  iconName: string;
  description: string;
  descriptionFa?: string;
  badge?: string;
  popularIssues: string[];
  basePriceRange: string;
  avgResponseMinutes: number;
}

export type UrgencyLevel = 'emergency' | 'today' | 'flexible';

export interface SanandajDistrict {
  id: string;
  nameFa: string;
  zone: 'central' | 'west' | 'east' | 'north' | 'south' | 'industrial';
  popularStreets: string[];
}

export interface VehicleInfo {
  brand: string;
  model: string;
  year?: string;
  fuelType?: 'gasoline' | 'cng' | 'diesel' | 'hybrid';
}

export interface ItemOrServiceDetails {
  itemType?: string; // e.g. 'خودرو', 'لوازم خانگی', 'ساختمان', 'پرونده حقوقی', 'بیمار', 'کالا/بار'
  brandOrModel?: string; // e.g. 'پژو ۲۰۶', 'یخچال سامسونگ', 'پکیج بوتان'
  yearOrCondition?: string;
  scope?: string;
  specifications?: Record<string, string>;
}

export type LeadStatus =
  | 'created'
  | 'dispatched'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface AIQualificationResult {
  mainCategory: MainCategoryId;
  mainCategoryTitleFa: string;
  subCategory?: string;
  serviceNameFa: string;
  confidenceScore: number;
  detectedSymptoms: string[];
  probableFaultOrScope: string;
  probableFault?: string; // backwards compatibility
  severity: 'low' | 'medium' | 'high' | 'critical';
  urgencyRecommended: UrgencyLevel;
  targetBudgetEstimate?: {
    minToman: number;
    maxToman: number;
    description: string;
  };
  itemOrVehicleDetails?: ItemOrServiceDetails;
  requiresOnSiteVisit: boolean;
  estimatedDuration: string;
  estimatedDurationMinutes?: number;
  recommendedActionsFa: string[];
  immediateActionTips?: string[];
  questionsToClarify?: string[];

  // Automotive specific helpers for rich car triage
  requiresTowTruck?: boolean;
  canDriveSafely?: boolean;
  estimatedPriceMin?: number;
  estimatedPriceMax?: number;
  estimatedCostTomanMin?: number;
  estimatedCostTomanMax?: number;
  categoryId?: ServiceCategoryId;
  categoryTitleFa?: string;
  titleFa?: string;
  probableCause?: string;
}

export interface ServiceQuote {
  id: string;
  businessId: string;
  businessNameFa: string;
  specialistName: string;
  mechanicName?: string; // backwards compatibility
  phone: string;
  estimatedCost: number;
  message: string;
  canVisitLocation: boolean;
  createdAt: string;
}

export interface Lead {
  id: string;
  customerName: string;
  customerPhone: string;
  naturalLanguageQuery: string;
  category: MainCategoryId | ServiceCategoryId;
  categoryTitleFa: string;
  serviceTitle: string;
  districtId: string;
  districtNameFa: string;
  exactAddress?: string;
  urgency: UrgencyLevel;
  budgetEstimate?: {
    min: number;
    max: number;
  };
  itemDetails?: ItemOrServiceDetails;
  vehicle?: VehicleInfo;
  qualification: AIQualificationResult;
  status: LeadStatus;
  createdAt: string;
  matchedBusinessIds: string[];
  assignedBusinessId?: string;
  quotes: ServiceQuote[];
  unlockedByBusinessIds: string[];
  finalNote?: string;
  rating?: number;
  reviewComment?: string;
}

export interface BusinessReview {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  serviceDone: string;
}

export interface BusinessProfile {
  id: string;
  businessNameFa: string;
  ownerName: string;
  phone: string;
  whatsapp?: string;
  licenseNumber?: string;
  mainCategory: MainCategoryId;
  categories: ServiceCategoryId[];
  districtId: string;
  districtNameFa: string;
  addressFa: string;
  cityFa?: string;
  latitude?: number;
  longitude?: number;
  rating: number;
  reviewsCount: number;
  reviewCount?: number;
  isVerified: boolean;
  hasOnsiteService: boolean; // خدمات در محل / اعزام کارشناس
  hasTowingFleet?: boolean;
  yearsInBusiness: number;
  credits: number;
  completedLeadsCount: number;
  responseSpeedMinutes: number;
  workingHours: string;
  bioFa: string;
  badges: string[];
  recentReviews: BusinessReview[];
}

export interface CreditPackage {
  id: string;
  titleFa: string;
  leadsCount: number;
  credits?: number;
  bonusCredits?: number;
  priceToman: number;
  pricePerLeadToman?: number;
  discountPercentage?: number;
  isPopular?: boolean;
  features: string[];
  featuresFa?: string[];
}

export interface WalletTransaction {
  id: string;
  type: 'credit_purchase' | 'lead_unlock' | 'bonus_award' | 'refund';
  amountToman?: number;
  creditsDelta: number;
  leadId?: string;
  description: string;
  date: string;
}

export type UserRole = 'customer' | 'business' | 'admin';
