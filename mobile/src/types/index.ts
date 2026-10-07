export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type TravelMode = 'car' | 'bike' | 'transit' | 'walk';

export type TravelPreference = 'Fastest' | 'Balanced' | 'Safety First';

export type IncidentType =
  | 'accident'
  | 'road_blockage'
  | 'road_damage'
  | 'heavy_traffic'
  | 'flooding'
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
  address?: string;
  coordinates?: Coordinates;
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
  coordinates?: [number, number][]; // [lng, lat] GeoJSON array
  durationSeconds?: number;
  distanceMeters?: number;
  arrivalTime?: string;
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
  type: IncidentType;
  title: string;
  location: string;
  distance: string;
  severity: SeverityLevel;
  confidence: number;
  status: VerificationStatus;
  coordinates?: Coordinates;
  timeAgo?: string;
  description?: string;
  supportingReports?: number;
  upvotes?: number;
}

export interface NearbyService {
  id: string;
  name: string;
  category: ServiceCategory;
  type?: ServiceCategory;
  distance: string;
  status?: string;
  address?: string;
  coordinates?: Coordinates;
  phone?: string;
}

export interface SavedPlace {
  id: string;
  title: string;
  subtitle: string;
  address: string;
  type: 'home' | 'work' | 'favorite';
  destination: DestinationItem;
}

export interface GeoTagMetadata {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  altitudeMeters?: number;
  timestamp: string;
  addressLabel: string;
}

export interface Report {
  id: string;
  incidentType: IncidentType;
  title: string;
  description: string;
  photoUri: string | null;
  latitude: number;
  longitude: number;
  locationLabel: string;
  createdAt: string;
  status: VerificationStatus;
  reliability: ReliabilityConfidence;
  supportingReports: number;
  geoTag?: GeoTagMetadata;
}

export interface NavigationInstruction {
  distance: string;
  instruction: string;
  turnType: 'straight' | 'right' | 'left' | 'slight_right' | 'slight_left' | 'u_turn';
  roadName: string;
}

export interface MapLayersState {
  incidents: boolean;
  hospitals: boolean;
  police: boolean;
  fuel: boolean;
  cng: boolean;
  garages: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatarUri: string;
  vehicleType: 'car' | 'suv' | 'bike' | 'walk';
  emergencyContactName: string;
  emergencyContactPhone: string;
  bloodGroup: string;
  bio: string;
  trustScore: number;
  hazardAlerts: boolean;
  slowdownSensors: boolean;
  voiceGuidance: boolean;
}

