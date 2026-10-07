export type TravelMode = 'car' | 'bike' | 'transit' | 'walk';

export type TravelPreference = 'Fastest' | 'Balanced' | 'Safety First';

export type IncidentType =
  | 'accident'
  | 'road_blockage'
  | 'road_damage'
  | 'flooding'
  | 'vehicle_breakdown'
  | 'other';

export type SeverityLevel = 'Low' | 'Medium' | 'High';

export type VerificationStatus =
  | 'Reported'
  | 'Under Verification'
  | 'Confirmed'
  | 'Resolved';

export type ReliabilityConfidence =
  | 'High Confidence'
  | 'Needs Verification'
  | 'Suspicious';

export type ServiceCategory =
  | 'hospital'
  | 'police'
  | 'petrol'
  | 'diesel'
  | 'cng'
  | 'garage'
  | 'fuel';

export interface DestinationItem {
  id: string;
  name: string;
  state: string;
  subtitle?: string;
  icon?: string;
}

export interface RouteOption {
  id: string;
  type: 'recommended' | 'fastest' | 'alternate';
  name: string;
  duration: string; // e.g. "2 hr 42 min"
  distance: string; // e.g. "96 km"
  tagline: string; // e.g. "Safer with real-time updates"
  isRecommended?: boolean;
  trustScore: number;
}

export interface QuickDestination {
  id: string;
  title: string;
  subtitle: string;
  icon: 'home' | 'briefcase' | 'map-pin';
  destination: DestinationItem;
}

export interface Incident {
  id: string;
  type?: IncidentType;
  title: string;
  location?: string;
  distance: string;
  severity: SeverityLevel;
  confidence: number;
  status: VerificationStatus;
  verificationStatus?: VerificationStatus;
  reliability?: ReliabilityConfidence;
  timeAgo?: string;
  reportedTimeAgo?: string;
  description?: string;
  supportingReports?: number;
  upvotes?: number;
}

export interface NearbyService {
  id: string;
  name: string;
  category?: ServiceCategory;
  type?: ServiceCategory;
  distance: string;
  status?: string;
  address?: string;
  openStatus?: string;
}
