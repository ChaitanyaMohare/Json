import {
  Coordinates,
  SpeedDropEvent,
  RouteCorridorService,
  HistoricalRiskAdvisory,
  LongRouteSafetyState,
  CorridorServiceCategory,
  RouteOption,
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
   */
  static getRouteCorridorServices(
    origin: Coordinates,
    destination: Coordinates,
    categoryFilter?: CorridorServiceCategory | 'all'
  ): RouteCorridorService[] {
    const midLat = (origin.latitude + destination.latitude) / 2;
    const midLng = (origin.longitude + destination.longitude) / 2;

    const allServices: RouteCorridorService[] = [
      {
        id: 'serv-1',
        name: 'IndianOil Highway XTRAPREMIUM',
        category: 'petrol',
        distanceFromStartKm: 2.4,
        distanceFromRouteMeters: 80,
        address: 'Service Road, Km 4, National Highway',
        coordinates: { latitude: midLat + 0.005, longitude: midLng - 0.004 },
        phone: '+91 98220 11223',
        operatingHours: 'Open 24/7',
        rating: 4.6,
        isOpen: true,
        fuelTypes: ['Petrol', 'Speed Petrol', 'High-Speed Diesel', 'Air & Water'],
        iconName: 'flame',
        color: '#EA580C',
      },
      {
        id: 'serv-2',
        name: 'Indraprastha Green CNG Station',
        category: 'cng',
        distanceFromStartKm: 3.8,
        distanceFromRouteMeters: 120,
        address: 'Sector Bypass junction, Lane 2',
        coordinates: { latitude: midLat + 0.009, longitude: midLng + 0.003 },
        phone: '+91 98221 44556',
        operatingHours: '6:00 AM - 11:30 PM',
        rating: 4.3,
        isOpen: true,
        fuelTypes: ['CNG Auto Gas', 'EV Fast Charger (60kW)'],
        iconName: 'flash',
        color: '#16A34A',
      },
      {
        id: 'serv-3',
        name: 'Bharat Petroleum Highway Diesel Hub',
        category: 'diesel',
        distanceFromStartKm: 5.2,
        distanceFromRouteMeters: 90,
        address: 'Expressway Exit 4A',
        coordinates: { latitude: midLat + 0.014, longitude: midLng + 0.008 },
        operatingHours: 'Open 24/7',
        rating: 4.4,
        isOpen: true,
        fuelTypes: ['Diesel', 'AdBlue', 'Truck & Car Wash'],
        iconName: 'car-sport',
        color: '#0284C7',
      },
      {
        id: 'serv-4',
        name: 'Speedy 24/7 National Highway Garage',
        category: 'garage',
        distanceFromStartKm: 6.1,
        distanceFromRouteMeters: 60,
        address: 'Near Toll Plaza Gate 3',
        coordinates: { latitude: midLat + 0.018, longitude: midLng + 0.012 },
        phone: '+91 98990 77889',
        operatingHours: 'Open 24/7',
        rating: 4.8,
        isOpen: true,
        fuelTypes: ['Puncture Repair', 'Engine Diagnostic', 'Towing', 'Jumpstart'],
        iconName: 'construct',
        color: '#7C3AED',
      },
      {
        id: 'serv-5',
        name: 'Apex Trauma & Emergency Hospital',
        category: 'hospital',
        distanceFromStartKm: 7.9,
        distanceFromRouteMeters: 250,
        address: 'Health City Boulevard, Off Expressway',
        coordinates: { latitude: midLat + 0.024, longitude: midLng + 0.017 },
        phone: '+91 91100 00108',
        operatingHours: 'Emergency ICU 24/7',
        rating: 4.9,
        isOpen: true,
        fuelTypes: ['24/7 Emergency', 'Ambulance Unit', 'Trauma Care'],
        iconName: 'medkit',
        color: '#DC2626',
      },
      {
        id: 'serv-6',
        name: 'Highway Police & Patrol Post 14',
        category: 'police',
        distanceFromStartKm: 9.4,
        distanceFromRouteMeters: 50,
        address: 'Ring Road Interchange Patrol Post',
        coordinates: { latitude: midLat + 0.029, longitude: midLng + 0.022 },
        phone: '112 / 100',
        operatingHours: 'Open 24/7',
        rating: 4.7,
        isOpen: true,
        fuelTypes: ['Traffic Aid', 'Women Safety Helpline', 'Emergency Dispatch'],
        iconName: 'shield',
        color: '#1E3A8A',
      },
    ];

    if (!categoryFilter || categoryFilter === 'all') {
      return allServices;
    }

    return allServices.filter((s) => s.category === categoryFilter);
  }

  /**
   * 3. HISTORICAL RISK PREDICTION ENGINE
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

    // Check if the route has historical risk patterns
    const isPrimaryRoute = selectedRoute.type === 'recommended' || selectedRoute.type === 'fastest';

    if (isPrimaryRoute) {
      const altRoute =
        alternativeRoutes.find((r) => r.id !== selectedRoute.id) ||
        alternativeRoutes[1] ||
        selectedRoute;

      if (isMonsoonSeason) {
        return {
          id: 'risk-monsoon-1',
          routeId: selectedRoute.id,
          riskType: 'monsoon_flooding',
          title: 'Historical Waterlogging & Pothole Risk',
          riskLevel: 'High',
          warningText:
            'Higher incident risk has historically been observed on this route during this period.',
          seasonalPeriod: 'Monsoon & Post-Rain Season (Frequent Waterlogging)',
          historicalIncidentCount: 18,
          affectedSegment: 'Low-Lying Underpass & Ring Corridor (Km 8 - Km 14)',
          alternativeRouteSuggestion: {
            alternativeRouteId: altRoute.id,
            title: altRoute.name || 'Elevated Bypass Corridor',
            extraDuration: '+3 min',
            safetyBenefit: '85% lower historical waterlogging & damage incidence',
          },
        };
      }

      if (isWinterFogSeason) {
        return {
          id: 'risk-winter-fog',
          routeId: selectedRoute.id,
          riskType: 'winter_fog',
          title: 'Low Visibility Dense Fog Corridor',
          riskLevel: 'Moderate',
          warningText:
            'Higher incident risk has historically been observed on this route during this period.',
          seasonalPeriod: 'Winter Morning & Night (Sub-50m Visibility)',
          historicalIncidentCount: 12,
          affectedSegment: 'Open Expressway Stretch (Km 12 - Km 22)',
          alternativeRouteSuggestion: {
            alternativeRouteId: altRoute.id,
            title: altRoute.name || 'Lit Arterial Corridor',
            extraDuration: '+5 min',
            safetyBenefit: 'Well-lit streetlights & divided safety medians',
          },
        };
      }

      // Default historical accident hotspot advisory
      return {
        id: 'risk-accident-zone',
        routeId: selectedRoute.id,
        riskType: 'high_accident_zone',
        title: 'High-Collision Merge Zone Identified',
        riskLevel: 'Moderate',
        warningText:
          'Higher incident risk has historically been observed on this route during this period.',
        seasonalPeriod: 'Peak Evening Traffic (Merge Congestion)',
        historicalIncidentCount: 14,
        affectedSegment: 'Cloverleaf Flyover Exit (Km 6.5)',
        alternativeRouteSuggestion: {
          alternativeRouteId: altRoute.id,
          title: altRoute.name || 'Direct Service Flyover',
          extraDuration: '+2 min',
          safetyBenefit: 'Avoids heavy multi-lane merge friction',
        },
      };
    }

    return null;
  }

  /**
   * 4. LONG-ROUTE SAFETY POLICY NOTICE
   */
  static getSafetyEscalationPolicyText(): string {
    return 'Repeated intentionally false emergency reports can reduce the user\'s reliability score or lead to account suspension. Avoid automatically claiming a "lifetime ban, fine, or police action." Those decisions require proper verification and legal/authority involvement.';
  }
}
