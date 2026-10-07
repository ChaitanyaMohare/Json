import { DestinationItem, RouteOption, QuickDestination, Incident, NearbyService } from '../types';

export const mockQuickDestinations: QuickDestination[] = [
  {
    id: 'quick-home',
    title: 'Home',
    subtitle: 'Add',
    icon: 'home',
    destination: { id: 'd-home', name: 'Home', state: 'Set location' },
  },
  {
    id: 'quick-work',
    title: 'Work',
    subtitle: 'Add',
    icon: 'briefcase',
    destination: { id: 'd-work', name: 'Work', state: 'Set location' },
  },
  {
    id: 'quick-dehradun',
    title: 'Dehradun',
    subtitle: 'Recent',
    icon: 'map-pin',
    destination: { id: 'd-dehradun', name: 'Dehradun', state: 'Uttarakhand' },
  },
];

export const mockRecentDestinations: DestinationItem[] = [
  {
    id: 'dest-1',
    name: 'Dehradun',
    state: 'Uttarakhand',
  },
  {
    id: 'dest-2',
    name: 'Haridwar',
    state: 'Uttarakhand',
  },
  {
    id: 'dest-3',
    name: 'Mussoorie',
    state: 'Uttarakhand',
  },
  {
    id: 'dest-4',
    name: 'Delhi',
    state: 'New Delhi',
  },
];

export const mockRoutes: RouteOption[] = [
  {
    id: 'route-recommended',
    type: 'recommended',
    name: 'Recommended',
    duration: '2 hr 42 min',
    distance: '96 km',
    tagline: 'Safer with real-time updates',
    isRecommended: true,
    trustScore: 94,
  },
  {
    id: 'route-fastest',
    type: 'fastest',
    name: 'Fastest Route',
    duration: '2 hr 18 min',
    distance: '94 km',
    tagline: 'Usual traffic',
    isRecommended: false,
    trustScore: 74,
  },
  {
    id: 'route-alternate',
    type: 'alternate',
    name: 'Alternate Route',
    duration: '3 hr 6 min',
    distance: '102 km',
    tagline: 'Avoids high-risk areas',
    isRecommended: false,
    trustScore: 88,
  },
];

export const mockIncidents: Incident[] = [
  {
    id: 'inc-1',
    title: 'Accident Ahead',
    location: 'Near Rajpur Road Turn',
    distance: '1.4 km away',
    severity: 'High',
    confidence: 92,
    status: 'Confirmed',
    timeAgo: '12 min ago',
    supportingReports: 5,
  },
  {
    id: 'inc-2',
    title: 'Road Blockage',
    location: 'Mohand Pass Tunnel',
    distance: '14.2 km away',
    severity: 'Medium',
    confidence: 84,
    status: 'Under Verification',
    timeAgo: '28 min ago',
    supportingReports: 2,
  },
  {
    id: 'inc-3',
    title: 'Road Damage & Potholes',
    location: 'Haridwar Bypass',
    distance: '26.8 km away',
    severity: 'Low',
    confidence: 76,
    status: 'Resolved',
    timeAgo: '2 hr ago',
    supportingReports: 9,
  },
];

export const mockNearbyServices: NearbyService[] = [
  {
    id: 'srv-1',
    name: 'City Care Hospital',
    category: 'hospital',
    distance: '1.8 km',
    status: '24x7 Emergency Ready',
  },
  {
    id: 'srv-2',
    name: 'Central Police Station',
    category: 'police',
    distance: '2.2 km',
    status: 'Active Patrol Base',
  },
  {
    id: 'srv-3',
    name: 'HP Fuel Station',
    category: 'fuel',
    distance: '1.1 km',
    status: 'Open 24 hrs',
  },
  {
    id: 'srv-4',
    name: 'Green CNG Station',
    category: 'cng',
    distance: '3.0 km',
    status: 'Fast CNG Dispenser',
  },
  {
    id: 'srv-5',
    name: 'QuickFix Garage',
    category: 'garage',
    distance: '1.6 km',
    status: 'On-Call Highway Recovery',
  },
];
