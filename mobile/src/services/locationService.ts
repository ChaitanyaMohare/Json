import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { Coordinates } from '../types';
import { DEFAULT_COORDS } from '../data/mockData';

export interface LocationResult {
  granted: boolean;
  coordinates: Coordinates;
  label: string;
  speedKmh?: number;
  heading?: number | null;
  error?: string;
}

export interface SpeedResult {
  speedKmh: number;
  rawSpeedKmh: number;
  calculatedHeading: number | null;
  isStationary: boolean;
  accuracy: number;
}

/**
 * Calculates high-precision distance in meters between two coordinates on Earth (Haversine formula).
 */
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates compass bearing (0-359 deg) from origin to destination coordinates.
 */
export function calculateBearingBetweenCoords(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dLambda = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);
  const theta = Math.atan2(y, x);
  return Math.round(((theta * 180) / Math.PI + 360) % 360);
}

interface LocationFixRecord {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy: number;
  hardwareSpeedKmh: number | null;
}

/**
 * Production-grade GPS Speed Engine combining:
 * 1. Hardware Doppler Satellite Velocity
 * 2. High-precision Haversine Differential Ground Displacement
 * 3. Stationary Deadband Noise Gate (Strict 0 km/h clamp when sitting still/parking)
 * 4. Adaptive Exponential Moving Average (EMA) smoothing for flutter-free digital display
 */
export class AccurateSpeedEngine {
  private static lastFix: LocationFixRecord | null = null;
  private static smoothedSpeedKmh: number = 0;
  private static stationaryConfidenceCounter: number = 0;

  public static reset(): void {
    this.lastFix = null;
    this.smoothedSpeedKmh = 0;
    this.stationaryConfidenceCounter = 0;
  }

  public static processLocationFix(
    latitude: number,
    longitude: number,
    timestamp: number = Date.now(),
    accuracy: number = 10,
    hardwareSpeedMs?: number | null,
    hardwareHeading?: number | null
  ): SpeedResult {
    // 1. Hardware Doppler Speed conversion (m/s -> km/h)
    let hwSpeedKmh: number | null = null;
    if (hardwareSpeedMs !== null && hardwareSpeedMs !== undefined && hardwareSpeedMs >= 0) {
      hwSpeedKmh = hardwareSpeedMs * 3.6;
    }

    let calculatedHeading: number | null = hardwareHeading ?? null;
    let targetSpeedKmh = 0;
    let isStationary = false;

    // First fix baseline initialization
    if (!this.lastFix) {
      if (hwSpeedKmh !== null && hwSpeedKmh > 1.8) {
        targetSpeedKmh = hwSpeedKmh;
        isStationary = false;
      } else {
        targetSpeedKmh = 0;
        isStationary = true;
      }

      this.lastFix = {
        latitude,
        longitude,
        timestamp,
        accuracy,
        hardwareSpeedKmh: hwSpeedKmh,
      };
      this.smoothedSpeedKmh = targetSpeedKmh;

      return {
        speedKmh: Math.round(targetSpeedKmh),
        rawSpeedKmh: targetSpeedKmh,
        calculatedHeading,
        isStationary,
        accuracy,
      };
    }

    // 2. Differential displacement and delta time
    const dtSeconds = Math.max(0.2, (timestamp - this.lastFix.timestamp) / 1000);
    const distMeters = calculateHaversineDistanceMeters(
      this.lastFix.latitude,
      this.lastFix.longitude,
      latitude,
      longitude
    );

    // Bearing calculation when vehicle or user moves at least 2.0 meters
    if (distMeters >= 2.0) {
      calculatedHeading = calculateBearingBetweenCoords(
        this.lastFix.latitude,
        this.lastFix.longitude,
        latitude,
        longitude
      );
    }

    // Hiatus reset: If time gap is too large (> 15 seconds), re-anchor baseline
    if (dtSeconds > 15) {
      this.lastFix = {
        latitude,
        longitude,
        timestamp,
        accuracy,
        hardwareSpeedKmh: hwSpeedKmh,
      };
      const initialSpeed = hwSpeedKmh !== null && hwSpeedKmh > 1.8 ? hwSpeedKmh : 0;
      this.smoothedSpeedKmh = initialSpeed;
      return {
        speedKmh: Math.round(initialSpeed),
        rawSpeedKmh: initialSpeed,
        calculatedHeading,
        isStationary: initialSpeed === 0,
        accuracy,
      };
    }

    // Ground displacement speed (km/h)
    const displacementSpeedKmh = (distMeters / dtSeconds) * 3.6;

    // 3. Stationary Deadband Noise Gate:
    // Prevents stationary GPS jitter from producing phantom speeds (e.g., 3-8 km/h while stationary).
    // Stationary if:
    // - Distance moved < 1.6 meters and (hardware speed is null or < 2.0 km/h)
    // - OR hardware speed is explicitly < 1.2 km/h
    // - OR accuracy is low (> 30m) and displacement speed is under 5.0 km/h
    const stationaryByDist = distMeters < 1.6 && (hwSpeedKmh === null || hwSpeedKmh < 2.0);
    const stationaryByHardware = hwSpeedKmh !== null && hwSpeedKmh < 1.2;
    const stationaryByJitter = accuracy > 30 && displacementSpeedKmh < 5.0;

    if (stationaryByDist || stationaryByHardware || stationaryByJitter) {
      this.stationaryConfidenceCounter++;
      isStationary = true;
      targetSpeedKmh = 0;
    } else {
      this.stationaryConfidenceCounter = 0;
      isStationary = false;

      // 4. Sensor Fusion: Hybrid Hardware Doppler + Ground Displacement
      if (hwSpeedKmh !== null && hwSpeedKmh >= 1.5) {
        // Hardware Doppler speed is available and validated
        if (accuracy <= 25 && displacementSpeedKmh >= 1.5 && displacementSpeedKmh <= 160) {
          // Weighted sensor fusion: 75% hardware Doppler + 25% differential displacement
          targetSpeedKmh = hwSpeedKmh * 0.75 + displacementSpeedKmh * 0.25;
        } else {
          targetSpeedKmh = hwSpeedKmh;
        }
      } else {
        // Hardware speed is null or 0 (common on Android at walking/pedestrian speeds or Web)
        if (accuracy <= 35) {
          if (displacementSpeedKmh <= 160) {
            targetSpeedKmh = displacementSpeedKmh;
          } else {
            // Outlier rejection (GPS multipath glitch > 160 km/h)
            targetSpeedKmh = this.smoothedSpeedKmh;
          }
        } else {
          // Low GPS accuracy: attenuate potential jump
          targetSpeedKmh = Math.min(displacementSpeedKmh * 0.65, 45);
        }
      }

      // Acceleration plausibility clamping (prevent impossible spikes e.g. 0 to 80 km/h in 1 second)
      const maxDelta = 22 * dtSeconds; // Max 22 km/h change per second
      if (targetSpeedKmh > this.smoothedSpeedKmh + maxDelta) {
        targetSpeedKmh = this.smoothedSpeedKmh + maxDelta;
      }
    }

    // 5. Adaptive Low-Pass Exponential Moving Average (EMA) Filter
    // Rapid response when braking/stopping (alpha = 0.82)
    // Smooth transition when accelerating/cruising (alpha = 0.62) to stop digit fluttering
    let alpha = 0.62;
    if (isStationary || targetSpeedKmh < this.smoothedSpeedKmh) {
      alpha = 0.82;
    }

    this.smoothedSpeedKmh = alpha * targetSpeedKmh + (1 - alpha) * this.smoothedSpeedKmh;

    // Hard zero clamp for speeds below 1.2 km/h
    if (this.smoothedSpeedKmh < 1.2 || isStationary) {
      this.smoothedSpeedKmh = 0;
    }

    // Update state for next calculation
    this.lastFix = {
      latitude,
      longitude,
      timestamp,
      accuracy,
      hardwareSpeedKmh: hwSpeedKmh,
    };

    return {
      speedKmh: Math.round(this.smoothedSpeedKmh),
      rawSpeedKmh: Math.round(this.smoothedSpeedKmh * 10) / 10,
      calculatedHeading,
      isStationary: this.smoothedSpeedKmh === 0,
      accuracy,
    };
  }
}

export class LocationService {
  private static defaultLocation: Coordinates = DEFAULT_COORDS;
  private static locationSubscription: Location.LocationSubscription | null = null;
  private static webWatchId: number | null = null;
  private static cachedResult: LocationResult | null = null;

  public static resetSpeed(): void {
    AccurateSpeedEngine.reset();
    if (this.cachedResult) {
      this.cachedResult.speedKmh = 0;
    }
  }

  public static async requestPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        return true;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return false;
      }

      if (Platform.OS === 'android') {
        try {
          const isEnabled = await Location.hasServicesEnabledAsync();
          if (!isEnabled) {
            await Location.enableNetworkProviderAsync().catch(() => {});
          }
        } catch {
          // Ignore provider check error
        }
      }

      return true;
    } catch (error) {
      console.warn('Error requesting location permission:', error);
      return false;
    }
  }

  // Reverse geocode with local + OSM Nominatim fallback (without mentioning country)
  public static async reverseGeocode(coords: Coordinates): Promise<string> {
    try {
      const results = await Location.reverseGeocodeAsync(coords);
      if (results && results.length > 0) {
        const first = results[0];
        const city =
          first.city || first.district || first.subregion || first.name;
        const street = first.street || first.formattedAddress;
        let cleanName = '';
        if (street && city && street !== city) {
          cleanName = `${street}, ${city}`;
        } else {
          cleanName = city || street || 'Current Location';
        }
        return cleanName.replace(/,?\s*India$/i, '').trim();
      }
    } catch {
      // Fall through to Nominatim API
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`,
        { headers: { 'User-Agent': 'WaySureApp/1.0' } }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const road = addr.road || addr.suburb || addr.neighbourhood;
        const city =
          addr.city || addr.town || addr.village || addr.county || addr.state_district;
        const state = addr.state;
        let clean = '';
        if (road && city) clean = `${road}, ${city}`;
        else if (city && state) clean = `${city}, ${state}`;
        else if (city) clean = city;
        else if (data.display_name) clean = data.display_name.split(',')[0];
        return clean.replace(/,?\s*India$/i, '').trim();
      }
    } catch {
      // Ignore network fallback error
    }

    return 'Your location';
  }

  // IP Geolocation fallback when GPS is unavailable
  private static async getIpLocation(): Promise<Coordinates | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch('https://freeipapi.com/api/json', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          return {
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude),
          };
        }
      }
    } catch {
      try {
        const res2 = await fetch('https://ipapi.co/json/');
        if (res2.ok) {
          const data2 = await res2.json();
          if (data2.latitude && data2.longitude) {
            return {
              latitude: parseFloat(data2.latitude),
              longitude: parseFloat(data2.longitude),
            };
          }
        }
      } catch {
        // Fallback exhausted
      }
    }
    return null;
  }

  public static async getCurrentLocation(): Promise<LocationResult> {
    try {
      const hasPermission = await this.requestPermission();

      // 1. Try real GPS position directly with High accuracy
      if (hasPermission) {
        try {
          const accuracyLevel =
            Platform.OS === 'android' || Platform.OS === 'ios'
              ? Location.Accuracy.High
              : Location.Accuracy.Balanced;

          const positionPromise = Location.getCurrentPositionAsync({
            accuracy: accuracyLevel,
          });

          const timeoutPromise = new Promise<null>((resolve) =>
            setTimeout(() => resolve(null), 7000)
          );

          const position = await Promise.race([positionPromise, timeoutPromise]);

          if (position && position.coords) {
            const coordinates: Coordinates = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };

            const label = await this.reverseGeocode(coordinates);
            const speedResult = AccurateSpeedEngine.processLocationFix(
              position.coords.latitude,
              position.coords.longitude,
              position.timestamp || Date.now(),
              position.coords.accuracy ?? 15,
              position.coords.speed,
              position.coords.heading
            );

            const result: LocationResult = {
              granted: true,
              coordinates,
              label,
              speedKmh: speedResult.speedKmh,
              heading: speedResult.calculatedHeading ?? position.coords.heading ?? null,
            };
            this.cachedResult = result;
            return result;
          }
        } catch (gpsErr) {
          console.warn('GPS getCurrentPositionAsync error:', gpsErr);
        }

        // 2. Try Last Known Position if current position timed out or failed
        try {
          const lastKnown = await Location.getLastKnownPositionAsync({});
          if (lastKnown && lastKnown.coords) {
            const coords: Coordinates = {
              latitude: lastKnown.coords.latitude,
              longitude: lastKnown.coords.longitude,
            };
            const label = await this.reverseGeocode(coords);
            const speedResult = AccurateSpeedEngine.processLocationFix(
              lastKnown.coords.latitude,
              lastKnown.coords.longitude,
              lastKnown.timestamp || Date.now(),
              lastKnown.coords.accuracy ?? 15,
              lastKnown.coords.speed,
              lastKnown.coords.heading
            );

            const result: LocationResult = {
              granted: true,
              coordinates: coords,
              label,
              speedKmh: speedResult.speedKmh,
              heading: speedResult.calculatedHeading ?? lastKnown.coords.heading ?? null,
            };
            this.cachedResult = result;
            return result;
          }
        } catch {
          // Last known not available
        }
      }

      // 3. For Web environment: Use navigator.geolocation directly if available
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
        const webPosition = await new Promise<GeolocationPosition | null>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos),
            () => resolve(null),
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
          );
        });

        if (webPosition && webPosition.coords) {
          const coords: Coordinates = {
            latitude: webPosition.coords.latitude,
            longitude: webPosition.coords.longitude,
          };
          const label = await this.reverseGeocode(coords);
          const speedResult = AccurateSpeedEngine.processLocationFix(
            webPosition.coords.latitude,
            webPosition.coords.longitude,
            webPosition.timestamp || Date.now(),
            webPosition.coords.accuracy ?? 15,
            webPosition.coords.speed,
            webPosition.coords.heading
          );

          const result: LocationResult = {
            granted: true,
            coordinates: coords,
            label,
            speedKmh: speedResult.speedKmh,
            heading: speedResult.calculatedHeading ?? webPosition.coords.heading ?? null,
          };
          this.cachedResult = result;
          return result;
        }
      }
    } catch (error) {
      console.warn('GPS location request error:', error);
    }

    // 4. Fallback via IP Geolocation
    const ipCoords = await this.getIpLocation();
    if (ipCoords) {
      const label = await this.reverseGeocode(ipCoords);
      return {
        granted: true,
        coordinates: ipCoords,
        label,
        speedKmh: 0,
        heading: null,
      };
    }

    // 5. Final fallback
    return {
      granted: false,
      coordinates: this.defaultLocation,
      label: 'Locating...',
      heading: null,
      error: 'Location unavailable. Showing default region.',
    };
  }

  private static refreshLocationInBackground() {
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      .then(async (pos) => {
        if (pos && pos.coords) {
          const coords: Coordinates = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          const label = await this.reverseGeocode(coords);
          const speedResult = AccurateSpeedEngine.processLocationFix(
            pos.coords.latitude,
            pos.coords.longitude,
            pos.timestamp || Date.now(),
            pos.coords.accuracy ?? 15,
            pos.coords.speed,
            pos.coords.heading
          );
          this.cachedResult = {
            granted: true,
            coordinates: coords,
            label,
            speedKmh: speedResult.speedKmh,
            heading: speedResult.calculatedHeading ?? pos.coords.heading ?? null,
          };
        }
      })
      .catch(() => {});
  }

  public static async watchLocation(
    onUpdate: (coords: Coordinates, speedKmh: number, heading?: number | null) => void
  ): Promise<void> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) return;

      // Clean up previous watchers
      this.stopWatching();

      // Web Fallback: Use navigator.geolocation.watchPosition directly
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
        this.webWatchId = navigator.geolocation.watchPosition(
          (pos) => {
            const speedResult = AccurateSpeedEngine.processLocationFix(
              pos.coords.latitude,
              pos.coords.longitude,
              pos.timestamp || Date.now(),
              pos.coords.accuracy ?? 10,
              pos.coords.speed,
              pos.coords.heading
            );

            const coords: Coordinates = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            };
            const speed = speedResult.speedKmh;
            const heading = speedResult.calculatedHeading ?? pos.coords.heading ?? null;

            this.cachedResult = {
              granted: true,
              coordinates: coords,
              label: this.cachedResult?.label || 'Your location',
              speedKmh: speed,
              heading: heading,
            };
            onUpdate(coords, speed, heading);
          },
          (err) => {
            console.warn('Web watchPosition error:', err);
          },
          { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
        );
        return;
      }

      // Native Platform (Android / iOS): Use expo-location with smooth 1.5s cadence & 2m threshold
      const accuracySetting = Location.Accuracy.High;

      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: accuracySetting,
          timeInterval: 1500,
          distanceInterval: 2, // Filter out sub-2m GPS noise while stationary to eliminate map jitter
        },
        (loc) => {
          const speedResult = AccurateSpeedEngine.processLocationFix(
            loc.coords.latitude,
            loc.coords.longitude,
            loc.timestamp || Date.now(),
            loc.coords.accuracy ?? 10,
            loc.coords.speed,
            loc.coords.heading
          );

          const coords: Coordinates = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };
          const speed = speedResult.speedKmh;
          const heading = speedResult.calculatedHeading ?? loc.coords.heading ?? null;

          this.cachedResult = {
            granted: true,
            coordinates: coords,
            label: this.cachedResult?.label || 'Your location',
            speedKmh: speed,
            heading: heading,
          };
          onUpdate(coords, speed, heading);
        }
      );
    } catch (error) {
      console.warn('Error watching location:', error);
    }
  }

  public static stopWatching(): void {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
    if (this.webWatchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.webWatchId);
      this.webWatchId = null;
    }
    AccurateSpeedEngine.reset();
  }
}

