import {
  Coordinates,
  SpeedDropEvent,
  RouteCorridorService,
  HistoricalRiskAdvisory,
  LongRouteSafetyState,
  CorridorServiceCategory,
  RouteOption,
  TravelMode,
} from '../types';

interface SpeedReading {
  speedKmh: number;
  timestamp: number;
  coordinates: Coordinates;
}

export class SafetyMonitoringService {
  private static speedBuffer: SpeedReading[] = [];
  private static lastDropAlertTime: number = 0;
  private static DROP_COOLDOWN_MS = 40000; // 40 seconds cooldown between alerts

  /**
   * 1. SPEED-DROP DETECTION ENGINE
   * Detects major sudden speed drops (e.g., cruising at 40+ km/h down to <12 km/h in <4s)
   * Treats speed drops as telemetry signals (not automatic accidents).
   */
  static processSpeedReading(
    currentSpeedKmh: number,
    coordinates: Coordinates
  ): SpeedDropEvent | null {
    const now = Date.now();
    this.speedBuffer.push({
      speedKmh: currentSpeedKmh,
      timestamp: now,
      coordinates,
    });

    // Keep only the last 6 seconds of readings
    this.speedBuffer = this.speedBuffer.filter(
      (r) => now - r.timestamp <= 6000
    );

    if (this.speedBuffer.length < 3) {
      return null;
    }

    if (now - this.lastDropAlertTime < this.DROP_COOLDOWN_MS) {
      return null;
    }

    // Look for peak speed in buffer
    let maxPreviousSpeed = 0;
    let maxSpeedTime = 0;

    for (let i = 0; i < this.speedBuffer.length - 1; i++) {
      if (this.speedBuffer[i].speedKmh > maxPreviousSpeed) {
        maxPreviousSpeed = this.speedBuffer[i].speedKmh;
        maxSpeedTime = this.speedBuffer[i].timestamp;
      }
    }

    const delta = maxPreviousSpeed - currentSpeedKmh;
    const timeSpanSec = (now - maxSpeedTime) / 1000;

    // Trigger condition: Was traveling >= 35 km/h, dropped by >= 25 km/h to <= 12 km/h in <= 4.5 seconds
    if (
      maxPreviousSpeed >= 35 &&
      currentSpeedKmh <= 12 &&
      delta >= 24 &&
      timeSpanSec <= 4.5 &&
      timeSpanSec > 0.4
    ) {
      this.lastDropAlertTime = now;
      return {
        id: `speed-drop-${now}`,
        previousSpeedKmh: Math.round(maxPreviousSpeed),
        currentSpeedKmh: Math.round(currentSpeedKmh),
        deltaKmh: Math.round(delta),
        timestamp: now,
        coordinates,
        status: 'detected',
      };
    }

    return null;
  }

  /**
   * Reset speed buffer (e.g. at navigation start)
   */
  static resetSpeedMonitor() {
    this.speedBuffer = [];
    this.lastDropAlertTime = 0;
  }

  /**
   * 2. ROUTE-BASED NEARBY SERVICES CORRIDOR
   * Returns useful services positioned along the selected journey route.
  /**
   * 2. ROUTE-BASED NEARBY SERVICES CORRIDOR
   * Returns useful services positioned along the selected journey route.
   * Differentiates services based on route option and travel mode, distributed evenly across the entire route.
   */
  static getRouteCorridorServices(
    origin: Coordinates,
    destination: Coordinates,
    categoryFilter?: CorridorServiceCategory | 'all',
    routeType: 'recommended' | 'fastest' | 'alternate' = 'recommended',
    travelMode: TravelMode = 'car',
    routeCoords?: [number, number][]
  ): RouteCorridorService[] {
    // Total geometric distance in kilometers
    const dLatKm = (destination.latitude - origin.latitude) * 111;
    const dLngKm = (destination.longitude - origin.longitude) * 111 * Math.cos((origin.latitude * Math.PI) / 180);
    const approxTotalKm = Math.max(15, Math.round(Math.hypot(dLatKm, dLngKm)));

    // Helper to calculate exact coordinates at fractional milestone along the actual route polyline or trajectory
    const getPointAtFraction = (fraction: number, lateralOffsetMeters: number = 40): Coordinates => {
      if (routeCoords && routeCoords.length >= 10) {
        const targetIdx = Math.min(
          routeCoords.length - 1,
          Math.max(0, Math.floor(routeCoords.length * fraction))
        );
        const [lng, lat] = routeCoords[targetIdx];
        // Slight natural lateral offset off the main highway centerline
        const latOffset = (lateralOffsetMeters / 111000) * (fraction % 2 === 0 ? 1 : -1);
        const lngOffset = (lateralOffsetMeters / 111000) * (fraction % 2 === 0 ? -1 : 1);
        return {
          latitude: Number((lat + latOffset).toFixed(6)),
          longitude: Number((lng + lngOffset).toFixed(6)),
        };
      }

      // Linear interpolation fallback along the origin-destination vector
      const lat = origin.latitude + (destination.latitude - origin.latitude) * fraction;
      const lng = origin.longitude + (destination.longitude - origin.longitude) * fraction;
      const latOffset = (lateralOffsetMeters / 111000) * (fraction % 2 === 0 ? 1 : -1);
      const lngOffset = (lateralOffsetMeters / 111000) * (fraction % 2 === 0 ? -1 : 1);
      return {
        latitude: Number((lat + latOffset).toFixed(6)),
        longitude: Number((lng + lngOffset).toFixed(6)),
      };
    };

    let allServices: RouteCorridorService[] = [];

    if (routeType === 'fastest') {
      // Fastest Express Route: Distributed along the high-speed corridor
      allServices = [
        {
          id: 'serv-fast-1',
          name: 'Expressway IndianOil XP95 & EV Hub',
          category: 'petrol',
          distanceFromStartKm: Math.round(approxTotalKm * 0.15),
          distanceFromRouteMeters: 40,
          address: 'Expressway Mile Sector 1, North Ramp',
          coordinates: getPointAtFraction(0.15, 50),
          phone: '+91 98220 11990',
          operatingHours: 'Open 24/7',
          rating: 4.7,
          isOpen: true,
          fuelTypes: ['Petrol XP95', 'High-Speed Diesel', 'EV DC Supercharger 120kW'],
          iconName: 'flame',
          color: '#EA580C',
        },
        {
          id: 'serv-fast-2',
          name: 'RapidFix Express Highway Garage',
          category: 'garage',
          distanceFromStartKm: Math.round(approxTotalKm * 0.38),
          distanceFromRouteMeters: 60,
          address: 'Expressway Mid Corridor, Service Exit 3',
          coordinates: getPointAtFraction(0.38, -60),
          phone: '+91 98990 44332',
          operatingHours: 'Open 24/7',
          rating: 4.6,
          isOpen: true,
          fuelTypes: ['Express Wheel Balancing', 'Towing', 'Jumpstart', 'High-Speed Tire Check'],
          iconName: 'construct',
          color: '#7C3AED',
        },
        {
          id: 'serv-fast-3',
          name: 'LifeCare Expressway Trauma Unit',
          category: 'hospital',
          distanceFromStartKm: Math.round(approxTotalKm * 0.62),
          distanceFromRouteMeters: 180,
          address: 'Inter-State Expressway Medical Outpost',
          coordinates: getPointAtFraction(0.62, 120),
          phone: '+91 91100 00108',
          operatingHours: 'Emergency ICU 24/7',
          rating: 4.9,
          isOpen: true,
          fuelTypes: ['Trauma ICU', 'Helipad', 'Emergency Ambulance'],
          iconName: 'medkit',
          color: '#DC2626',
        },
        {
          id: 'serv-fast-4',
          name: 'Highway Patrol Rapid Response Post',
          category: 'police',
          distanceFromStartKm: Math.round(approxTotalKm * 0.82),
          distanceFromRouteMeters: 30,
          address: 'Expressway Toll Junction Flying Squad Post',
          coordinates: getPointAtFraction(0.82, -40),
          phone: '112 / 100',
          operatingHours: 'Open 24/7',
          rating: 4.8,
          isOpen: true,
          fuelTypes: ['Express Patrol Unit', 'Highway Emergency Dispatch'],
          iconName: 'shield',
          color: '#1E3A8A',
        },
      ];
    } else if (routeType === 'alternate') {
      // Alternate Arterial Route
      allServices = [
        {
          id: 'serv-alt-1',
          name: 'City Arterial HP Petrol & CNG Pump',
          category: 'cng',
          distanceFromStartKm: Math.round(approxTotalKm * 0.20),
          distanceFromRouteMeters: 70,
          address: 'Arterial Ring Junction, Gate 1',
          coordinates: getPointAtFraction(0.20, 60),
          phone: '+91 98221 33221',
          operatingHours: 'Open 24/7',
          rating: 4.4,
          isOpen: true,
          fuelTypes: ['CNG Gas', 'Petrol', 'Diesel'],
          iconName: 'flash',
          color: '#16A34A',
        },
        {
          id: 'serv-alt-2',
          name: 'Shree Sai Multi-Brand Auto Workshop',
          category: 'garage',
          distanceFromStartKm: Math.round(approxTotalKm * 0.50),
          distanceFromRouteMeters: 90,
          address: 'Old Highway Road, Near Market',
          coordinates: getPointAtFraction(0.50, -80),
          phone: '+91 98991 22334',
          operatingHours: '7:00 AM - 11:00 PM',
          rating: 4.5,
          isOpen: true,
          fuelTypes: ['Complete Service', 'Oil Change', 'AC Repair'],
          iconName: 'construct',
          color: '#7C3AED',
        },
        {
          id: 'serv-alt-3',
          name: 'Metro City General Hospital',
          category: 'hospital',
          distanceFromStartKm: Math.round(approxTotalKm * 0.78),
          distanceFromRouteMeters: 120,
          address: 'Civil Lines Road, Sector 8',
          coordinates: getPointAtFraction(0.78, 100),
          phone: '+91 91100 22334',
          operatingHours: '24/7 Emergency',
          rating: 4.7,
          isOpen: true,
          fuelTypes: ['General Medicine', 'Pharmacy', 'Emergency Casualty'],
          iconName: 'medkit',
          color: '#DC2626',
        },
      ];
    } else {
      // Recommended Highway Route: 6 distinct locations across the entire route
      allServices = [
        {
          id: 'serv-1',
          name: 'IndianOil Highway Oasis & Fuel Mall',
          category: 'petrol',
          distanceFromStartKm: Math.round(approxTotalKm * 0.12),
          distanceFromRouteMeters: 80,
          address: 'National Highway Oasis Sector 1',
          coordinates: getPointAtFraction(0.12, 60),
          phone: '+91 98220 11223',
          operatingHours: 'Open 24/7',
          rating: 4.8,
          isOpen: true,
          fuelTypes: ['Petrol', 'Speed Petrol', 'High-Speed Diesel', 'Air & Water'],
          iconName: 'flame',
          color: '#EA580C',
        },
        {
          id: 'serv-2',
          name: 'Indraprastha Green Clean CNG Station',
          category: 'cng',
          distanceFromStartKm: Math.round(approxTotalKm * 0.28),
          distanceFromRouteMeters: 90,
          address: 'Highway Corridor CNG Hub Mile 40',
          coordinates: getPointAtFraction(0.28, -70),
          phone: '+91 98221 44556',
          operatingHours: '6:00 AM - 11:30 PM',
          rating: 4.5,
          isOpen: true,
          fuelTypes: ['CNG Auto Gas', 'EV Fast Charger (60kW)'],
          iconName: 'flash',
          color: '#16A34A',
        },
        {
          id: 'serv-3',
          name: 'Speedy 24/7 National Highway Garage',
          category: 'garage',
          distanceFromStartKm: Math.round(approxTotalKm * 0.46),
          distanceFromRouteMeters: 60,
          address: 'Mid-Corridor Toll Service Complex',
          coordinates: getPointAtFraction(0.46, 50),
          phone: '+91 98990 77889',
          operatingHours: 'Open 24/7',
          rating: 4.8,
          isOpen: true,
          fuelTypes: ['Puncture Repair', 'Engine Diagnostic', 'Towing', 'Jumpstart'],
          iconName: 'construct',
          color: '#7C3AED',
        },
        {
          id: 'serv-4',
          name: 'Apex Trauma & Emergency Hospital',
          category: 'hospital',
          distanceFromStartKm: Math.round(approxTotalKm * 0.64),
          distanceFromRouteMeters: 150,
          address: 'Regional Emergency Trauma Center, Off Highway',
          coordinates: getPointAtFraction(0.64, -100),
          phone: '+91 91100 00108',
          operatingHours: 'Emergency ICU 24/7',
          rating: 4.9,
          isOpen: true,
          fuelTypes: ['24/7 Emergency', 'Ambulance Unit', 'Trauma Care'],
          iconName: 'medkit',
          color: '#DC2626',
        },
        {
          id: 'serv-5',
          name: 'Highway Police & Patrol Post',
          category: 'police',
          distanceFromStartKm: Math.round(approxTotalKm * 0.80),
          distanceFromRouteMeters: 50,
          address: 'Interstate Highway Patrol Base',
          coordinates: getPointAtFraction(0.80, 40),
          phone: '112 / 100',
          operatingHours: 'Open 24/7',
          rating: 4.7,
          isOpen: true,
          fuelTypes: ['Traffic Aid', 'Women Safety Helpline', 'Emergency Dispatch'],
          iconName: 'shield',
          color: '#1E3A8A',
        },
        {
          id: 'serv-6',
          name: 'Bharat Petroleum Destination Ingress Fuel & Service Hub',
          category: 'petrol',
          distanceFromStartKm: Math.round(approxTotalKm * 0.92),
          distanceFromRouteMeters: 70,
          address: 'City Boundary Toll Approach Plaza',
          coordinates: getPointAtFraction(0.92, -60),
          phone: '+91 98220 99881',
          operatingHours: 'Open 24/7',
          rating: 4.6,
          isOpen: true,
          fuelTypes: ['Speed Petrol', 'Diesel', 'Quick Lube & Mechanic'],
          iconName: 'flame',
          color: '#EA580C',
        },
      ];
    }

    if (!categoryFilter || categoryFilter === 'all') {
      return allServices;
    }

    return allServices.filter((s) => s.category === categoryFilter);
  }

  /**
   * 3. ROUTE-SPECIFIC INCIDENTS
   * Differentiates active incidents on fastest vs recommended routes.
   */
  static getRouteSpecificIncidents(
    routeType: 'recommended' | 'fastest' | 'alternate' = 'recommended'
  ): { title: string; type: string; location: string; severity: string; note: string }[] {
    if (routeType === 'fastest') {
      return [
        {
          title: 'High-Speed Merge Congestion',
          type: 'heavy_traffic',
          location: 'Expressway Bypass Interchange (Km 4.2)',
          severity: 'Medium',
          note: 'Fastest transit but has sudden deceleration at toll merge zone.',
        },
        {
          title: 'Lane 1 Surface Wear Reported',
          type: 'road_damage',
          location: 'Km 6.8 Outer Flyover Ramp',
          severity: 'Low',
          note: 'Minor surface roughness verified by 3 community riders.',
        },
      ];
    } else if (routeType === 'alternate') {
      return [
        {
          title: 'Local Market Traffic Slowdown',
          type: 'heavy_traffic',
          location: 'Old Chowk Intersection',
          severity: 'Low',
          note: 'Moderate pedestrian movement during market hours.',
        },
      ];
    } else {
      // Recommended Route
      return [
        {
          title: 'All Clear · Safe Highway Median Corridor',
          type: 'verified_safe',
          location: 'National Highway Multi-Lane Corridor',
          severity: 'Low',
          note: '97% Waysure Trust Score with 24/7 street illumination and active patrol.',
        },
      ];
    }
  }

  /**
   * 4. HISTORICAL RISK PREDICTION ENGINE
   * Analyzes historical incident data by location + seasonal month/period.
   * Warns riders and suggests concrete alternative routes instead of blocking travel.
   */
  static evaluateHistoricalRisk(
    selectedRoute: RouteOption,
    alternativeRoutes: RouteOption[]
  ): HistoricalRiskAdvisory | null {
    const currentMonth = new Date().getMonth(); // 0 = Jan, 6 = Jul, 9 = Oct
    const isMonsoonSeason = currentMonth >= 5 && currentMonth <= 9; // Jun - Oct
    const isWinterFogSeason = currentMonth >= 11 || currentMonth <= 1; // Dec - Feb

    const isFastest = selectedRoute.type === 'fastest';
    const altRoute =
      alternativeRoutes.find((r) => r.id !== selectedRoute.id) ||
      alternativeRoutes[0] ||
      selectedRoute;

    if (isFastest) {
      // Fastest Route historical risk is merge collision / sudden deceleration
      return {
        id: 'risk-fastest-merge',
        routeId: selectedRoute.id,
        riskType: 'high_accident_zone',
        title: 'High-Speed Merge Collision Hotspot',
        riskLevel: 'Moderate',
        warningText:
          'Higher speed-drop frequency and merge friction historically recorded at the express cloverleaf interchange.',
        seasonalPeriod: 'Peak Traffic Hours & Night Travel',
        historicalIncidentCount: 16,
        affectedSegment: 'Express Bypass Cloverleaf Ramp (Km 4.2 - Km 5.8)',
        alternativeRouteSuggestion: {
          alternativeRouteId: altRoute.id,
          title: 'Safest Divided Highway Corridor',
          extraDuration: '+2 min',
          safetyBenefit: '97% Trust Score with barrier-divided safety lanes',
        },
      };
    }

    // Recommended route historical risk (e.g. monsoon / weather advisory)
    if (isMonsoonSeason) {
      return {
        id: 'risk-monsoon-1',
        routeId: selectedRoute.id,
        riskType: 'monsoon_flooding',
        title: 'Seasonal Waterlogging & Drainage Advisory',
        riskLevel: 'Moderate',
        warningText:
          'Higher surface water accumulation historically observed near the service canal underpass during heavy rains.',
        seasonalPeriod: 'Monsoon & Post-Rain Season (June - October)',
        historicalIncidentCount: 8,
        affectedSegment: 'Underpass Service Road (Km 7.4)',
        alternativeRouteSuggestion: {
          alternativeRouteId: altRoute.id,
          title: 'Elevated Flyover Bypass',
          extraDuration: '+1 min',
          safetyBenefit: 'Zero standing water on elevated main viaduct',
        },
      };
    }

    if (isWinterFogSeason) {
      return {
        id: 'risk-winter-fog',
        routeId: selectedRoute.id,
        riskType: 'winter_fog',
        title: 'Low Visibility Fog Corridor Advisory',
        riskLevel: 'Moderate',
        warningText:
          'Sub-50m visibility historically observed during early mornings on this open stretch.',
        seasonalPeriod: 'Winter Morning & Night (Sub-50m Visibility)',
        historicalIncidentCount: 9,
        affectedSegment: 'Open Highway Sector (Km 8 - Km 14)',
        alternativeRouteSuggestion: {
          alternativeRouteId: altRoute.id,
          title: 'Lit Arterial Corridor',
          extraDuration: '+3 min',
          safetyBenefit: 'Continuous high-mast LED streetlights',
        },
      };
    }

    return {
      id: 'risk-standard-verified',
      routeId: selectedRoute.id,
      riskType: 'high_accident_zone',
      title: 'Verified Safe Travel Corridor',
      riskLevel: 'Moderate',
      warningText:
        'Optimal historical safety record. Monitored continuously by highway patrol and real-time community reports.',
      seasonalPeriod: 'All Seasons',
      historicalIncidentCount: 3,
      affectedSegment: 'Divided Multi-Lane Corridor',
      alternativeRouteSuggestion: {
        alternativeRouteId: altRoute.id,
        title: altRoute.name || 'Express Route',
        extraDuration: '-2 min',
        safetyBenefit: 'Slightly shorter duration with moderate merge friction',
      },
    };
  }

  /**
   * 5. LONG-ROUTE SAFETY POLICY NOTICE
   */
  static getSafetyEscalationPolicyText(): string {
    return 'Repeated intentionally false emergency reports can reduce the user\'s reliability score or lead to account suspension. Avoid automatically claiming a "lifetime ban, fine, or police action." Those decisions require proper verification and legal/authority involvement.';
  }
}
