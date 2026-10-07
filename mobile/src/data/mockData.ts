import {
  DestinationItem,
  RouteOption,
  QuickDestination,
  Incident,
  NearbyService,
  SavedPlace,
} from '../types';

export type VehicleIconType = 'car' | 'suv' | 'bike' | 'arrow' | 'walk';

// Default Central Reference Coordinates (New Delhi center)
export const DEFAULT_COORDS = {
  latitude: 28.6139,
  longitude: 77.209,
};

// Aliases for compatibility
export const DEHRADUN_COORDS = DEFAULT_COORDS;
export const DELHI_COORDS = DEFAULT_COORDS;
export const MUMBAI_COORDS = {
  latitude: 19.076,
  longitude: 72.8777,
};
export const BENGALURU_COORDS = {
  latitude: 12.9716,
  longitude: 77.5946,
};

// Clean Quick Destinations (Home & Work for user to set)
export const mockQuickDestinations: QuickDestination[] = [
  {
    id: 'quick-home',
    title: 'Home',
    subtitle: 'Add',
    icon: 'home',
    destination: {
      id: 'd-home',
      name: 'Home',
      state: 'Set location',
      address: 'Add your home address',
    },
  },
  {
    id: 'quick-work',
    title: 'Work',
    subtitle: 'Add',
    icon: 'briefcase',
    destination: {
      id: 'd-work',
      name: 'Work',
      state: 'Set location',
      address: 'Add your workplace address',
    },
  },
];

// Clean Recent Destinations (Starts empty - user builds their history)
export const mockRecentDestinations: DestinationItem[] = [];

// Clean Saved Places (Starts empty - user saves their own)
export const mockSavedPlaces: SavedPlace[] = [];

// Clean Incidents (Starts empty - no default fake accidents/hazards)
export const mockIncidents: Incident[] = [];

// Clean Nearby Services (Starts empty - real-time services fetched near user)
export const mockNearbyServices: NearbyService[] = [];

export const mockRoutes: RouteOption[] = [
  {
    id: 'route-recommended',
    type: 'recommended',
    name: 'Recommended',
    duration: 'Calculating...',
    distance: 'Calculating...',
    tagline: 'Optimal route via national highways',
    isRecommended: true,
    trustScore: 95,
    durationSeconds: 0,
    distanceMeters: 0,
    arrivalTime: '--:--',
    coordinates: [],
  },
  {
    id: 'route-fastest',
    type: 'fastest',
    name: 'Fastest Route',
    duration: 'Calculating...',
    distance: 'Calculating...',
    tagline: 'Fastest travel time',
    isRecommended: false,
    trustScore: 88,
    durationSeconds: 0,
    distanceMeters: 0,
    arrivalTime: '--:--',
    coordinates: [],
  },
];

export const mockAlternativeRoutes: {
  currentRoute: RouteOption;
  alternateRoute: RouteOption;
  saferRoute: RouteOption;
} = {
  currentRoute: {
    id: 'alt-current',
    type: 'recommended',
    name: 'Current route',
    duration: 'Calculating...',
    distance: 'Calculating...',
    tagline: 'Standard route',
    trustScore: 85,
    arrivalTime: '--:--',
    coordinates: [],
  },
  alternateRoute: {
    id: 'alt-alt',
    type: 'alternate',
    name: 'Alternate route',
    duration: 'Calculating...',
    distance: 'Calculating...',
    tagline: 'Alternate highway bypass',
    trustScore: 89,
    arrivalTime: '--:--',
    coordinates: [],
  },
  saferRoute: {
    id: 'alt-safer',
    type: 'recommended',
    name: 'Safer route',
    duration: 'Calculating...',
    distance: 'Calculating...',
    tagline: 'Bypasses high-congestion stretches',
    trustScore: 96,
    isRecommended: true,
    arrivalTime: '--:--',
    coordinates: [],
  },
};

export const PRESET_AVATARS: string[] = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=240&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=80',
];

export const DEFAULT_USER_PROFILE = {
  name: 'Roman Developer',
  email: 'roman.dev@waysure.app',
  phone: '+91 98765 43210',
  avatarUri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
  vehicleType: 'car' as const,
  emergencyContactName: 'Family Support',
  emergencyContactPhone: '+91 91234 56789',
  bloodGroup: 'O+',
  bio: 'Daily commuter & verified road safety contributor',
  trustScore: 98,
  hazardAlerts: true,
  slowdownSensors: true,
  voiceGuidance: true,
};

