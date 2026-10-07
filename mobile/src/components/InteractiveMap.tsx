import React, { useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { Coordinates, Incident, NearbyService, MapLayersState } from '../types';
import { VehicleIconType } from '../data/mockData';
import { MAPBOX_ACCESS_TOKEN } from '../config/mapbox';
import { BUNDLED_LEAFLET_CSS, BUNDLED_LEAFLET_JS } from '../assets/leafletBundle';

export interface NavigationProgressData {
  coveredKm: number;
  remainingKm: number;
  progress: number; // 0 to 1
  speedKmh: number;
  nextTurnMeters: number;
  turnType: 'right' | 'left' | 'slight-right' | 'slight-left' | 'straight' | 'u-turn';
  turnInstruction: string;
}

interface InteractiveMapProps {
  currentLocation?: Coordinates;
  currentHeading?: number | null;
  currentSpeed?: number;
  destination?: { latitude?: number; longitude?: number; name?: string };
  routeCoordinates?: [number, number][]; // [lng, lat]
  alternativeRouteCoordinates?: [number, number][];
  incidents?: Incident[];
  services?: NearbyService[];
  layers?: MapLayersState;
  showIncidentHotspot?: boolean;
  destinationLabel?: string;
  isNavigating?: boolean;
  isDriving?: boolean; // False by default: Only real-time GPS moves the marker!
  simulationSpeed?: number; // 1, 2, or 4
  vehicleType?: VehicleIconType;
  recenterTrigger?: number;
  restartTrigger?: number;
  onNavigationProgress?: (data: NavigationProgressData) => void;
  onArrived?: () => void;
  onSelectIncident?: (inc: Incident) => void;
  onSelectService?: (srv: NearbyService) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  currentLocation = { latitude: 28.6139, longitude: 77.209 },
  currentHeading = null,
  currentSpeed = 0,
  destination,
  routeCoordinates = [],
  alternativeRouteCoordinates = [],
  incidents = [],
  services = [],
  layers = {
    incidents: true,
    hospitals: true,
    police: true,
    fuel: true,
    cng: true,
    garages: true,
  },
  showIncidentHotspot = false,
  destinationLabel = 'Destination',
  isNavigating = false,
  isDriving = false, // Default FALSE: ONLY real-time GPS data moves the user!
  simulationSpeed = 2,
  vehicleType = 'car',
  recenterTrigger = 0,
  restartTrigger = 0,
  onNavigationProgress,
  onArrived,
  onSelectIncident,
  onSelectService,
}) => {
  const webViewRef = useRef<WebView>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Stable center coordinates to prevent WebView reloads on every GPS coordinate tick
  const initialCenterRef = useRef<Coordinates>(currentLocation);

  // Convert [lng, lat] to Leaflet [lat, lng]
  const leafletRouteCoords = useMemo(() => {
    if (!routeCoordinates || routeCoordinates.length === 0) return [];
    return routeCoordinates.map(([lng, lat]) => [lat, lng]);
  }, [routeCoordinates]);

  const leafletAltCoords = useMemo(() => {
    if (!alternativeRouteCoordinates || alternativeRouteCoordinates.length === 0) return [];
    return alternativeRouteCoordinates.map(([lng, lat]) => [lat, lng]);
  }, [alternativeRouteCoordinates]);

  // Handle messages sent from the Leaflet Map
  const handleMapMessage = (rawJson: string) => {
    try {
      const data = JSON.parse(rawJson);
      if (data.type === 'NAV_PROGRESS' && onNavigationProgress) {
        onNavigationProgress({
          coveredKm: data.coveredKm,
          remainingKm: data.remainingKm,
          progress: data.progress,
          speedKmh: data.speedKmh,
          nextTurnMeters: data.nextTurnMeters,
          turnType: data.turnType,
          turnInstruction: data.turnInstruction,
        });
      } else if (data.type === 'ARRIVED' && onArrived) {
        onArrived();
      }
    } catch {
      // Ignore parse error
    }
  };

  // Send real-time GPS movement updates directly into the map engine without page reload
  useEffect(() => {
    if (!currentLocation) return;
    const payload = JSON.stringify({
      type: 'GPS_UPDATE',
      lat: currentLocation.latitude,
      lng: currentLocation.longitude,
      heading: currentHeading ?? null,
      speedKmh: currentSpeed ?? 0,
    });
    if (Platform.OS === 'web' && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(payload, '*');
    } else if (webViewRef.current) {
      webViewRef.current.postMessage(payload);
    }
  }, [currentLocation?.latitude, currentLocation?.longitude, currentHeading, currentSpeed]);

  // Sync vehicle type changes to the active map without reload
  useEffect(() => {
    const payload = JSON.stringify({ type: 'SET_VEHICLE', vehicle: vehicleType });
    if (Platform.OS === 'web' && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(payload, '*');
    } else if (webViewRef.current) {
      webViewRef.current.postMessage(payload);
    }
  }, [vehicleType]);

  // Sync simulation driving state (only runs if user turns ON demo simulation)
  useEffect(() => {
    const payload = JSON.stringify({
      type: 'SET_DRIVE_STATE',
      driving: isDriving,
      speedMultiplier: simulationSpeed,
    });
    if (Platform.OS === 'web' && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(payload, '*');
    } else if (webViewRef.current) {
      webViewRef.current.postMessage(payload);
    }
  }, [isDriving, simulationSpeed]);

  // Recenter trigger
  useEffect(() => {
    if (!recenterTrigger) return;
    const payload = JSON.stringify({ type: 'RECENTER' });
    if (Platform.OS === 'web' && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(payload, '*');
    } else if (webViewRef.current) {
      webViewRef.current.postMessage(payload);
    }
  }, [recenterTrigger]);

  // Restart trigger
  useEffect(() => {
    if (!restartTrigger) return;
    const payload = JSON.stringify({ type: 'RESTART_ROUTE' });
    if (Platform.OS === 'web' && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(payload, '*');
    } else if (webViewRef.current) {
      webViewRef.current.postMessage(payload);
    }
  }, [restartTrigger]);

  // Web event listener for postMessage
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const listener = (event: MessageEvent) => {
      if (typeof event.data === 'string') {
        handleMapMessage(event.data);
      }
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [onNavigationProgress, onArrived]);

  const mapHtml = useMemo(() => {
    const userLat = initialCenterRef.current.latitude;
    const userLng = initialCenterRef.current.longitude;
    const destLat = destination?.latitude;
    const destLng = destination?.longitude;
    const destName = (destination?.name || destinationLabel || 'Destination')
      .replace(/'/g, "\\'")
      .replace(/,\s*India/gi, '');

    const activeServices = services.filter((s) => {
      if (s.category === 'hospital' && !layers.hospitals) return false;
      if (s.category === 'police' && !layers.police) return false;
      if (s.category === 'petrol' && !layers.fuel) return false;
      if (s.category === 'cng' && !layers.cng) return false;
      if (s.category === 'garage' && !layers.garages) return false;
      return true;
    });

    const activeIncidents = layers.incidents ? incidents : [];

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin />
  <link rel="preconnect" href="https://api.mapbox.com" crossorigin />
  <link rel="dns-prefetch" href="https://api.mapbox.com" />
  <style>
    ${BUNDLED_LEAFLET_CSS}

    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      min-width: 100vw;
      min-height: 100vh;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: #F8FAFC;
    }
    #map {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      min-width: 100vw;
      min-height: 100vh;
      background: #F8FAFC;
      touch-action: pan-x pan-y;
      -webkit-user-select: none;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    .leaflet-control-attribution, .leaflet-control-zoom { display: none !important; }

    /* Vehicle Marker Styles */
    .vehicle-marker-wrapper {
      position: relative;
      width: 48px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    /* Pulse wave under vehicle */
    .vehicle-pulse {
      position: absolute;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: rgba(37, 99, 235, 0.25);
      animation: vPulse 1.8s infinite ease-out;
      z-index: 1;
    }
    .vehicle-pulse-walk {
      background: rgba(16, 185, 129, 0.28);
    }
    @keyframes vPulse {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(1.8); opacity: 0; }
    }

    /* Walk Pedestrian Emoji Avatar */
    .walker-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #10B981;
      border: 3px solid #FFFFFF;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
      z-index: 2;
    }
    .walker-emoji {
      font-size: 24px;
      line-height: 1;
    }

    /* Destination Pin with Pill Badge */
    .dest-pin-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translate(-50%, -100%);
    }
    .dest-pill {
      background: #EF4444;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 14px;
      white-space: nowrap;
      box-shadow: 0 3px 8px rgba(0,0,0,0.35);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin-bottom: 2px;
      border: 1.5px solid #FFFFFF;
    }
    .dest-dot {
      width: 14px;
      height: 14px;
      background: #EF4444;
      border: 3px solid #FFFFFF;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    }

    /* Incident Marker */
    .incident-marker {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #EF4444;
      border: 2px solid #FFFFFF;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.45);
    }

    /* Service Marker */
    .service-marker {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #10B981;
      border: 2px solid #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    }

    /* Precision Destination Pin Marker & Target Needle */
    .dest-pin-anchor {
      position: relative;
      width: 140px;
      height: 74px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      pointer-events: auto;
    }
    .dest-pill-badge {
      background: #FFFFFF;
      border: 1.5px solid #EF4444;
      border-radius: 12px;
      padding: 3px 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.22);
      display: flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
      max-width: 135px;
      margin-bottom: 3px;
      z-index: 2;
    }
    .dest-pill-badge span {
      font-size: 11px;
      font-weight: 800;
      color: #0F172A;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .dest-needle-pin {
      width: 32px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
    }
    .dest-target-dot {
      position: absolute;
      bottom: 0px;
      left: 50%;
      transform: translateX(-50%);
      width: 12px;
      height: 6px;
      background: radial-gradient(ellipse at center, rgba(239, 68, 68, 0.9) 0%, rgba(239, 68, 68, 0.2) 60%, rgba(239, 68, 68, 0) 100%);
      border-radius: 50%;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    ${BUNDLED_LEAFLET_JS}

    // Post message helper
    function sendAppMessage(msgObj) {
      var str = JSON.stringify(msgObj);
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(str);
      } else if (window.parent && window.parent.postMessage) {
        window.parent.postMessage(str, '*');
      }
    }

    // Initialize Leaflet Map with smooth inertia & gestures
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
      fadeAnimation: true,
      zoomAnimation: true,
      inertia: true,
      inertiaDeceleration: 3400,
      easeLinearity: 0.2,
      preferCanvas: true
    }).setView([${userLat}, ${userLng}], 15);

    // Force complete full-screen render to eliminate "half-map" bugs
    function forceCompleteMapRender() {
      if (map) {
        map.invalidateSize({ debounceMoveend: true });
      }
    }
    window.addEventListener('resize', forceCompleteMapRender);
    window.addEventListener('orientationchange', forceCompleteMapRender);
    if (window.ResizeObserver) {
      try {
        var ro = new ResizeObserver(function() {
          forceCompleteMapRender();
        });
        ro.observe(document.getElementById('map'));
        ro.observe(document.body);
      } catch(e) {}
    }
    setTimeout(forceCompleteMapRender, 50);
    setTimeout(forceCompleteMapRender, 150);
    setTimeout(forceCompleteMapRender, 350);
    setTimeout(forceCompleteMapRender, 700);
    setTimeout(forceCompleteMapRender, 1500);

    // Ultra-fast Mapbox Streets v12 raster tiles (256 standard size loads 4x faster)
    var mapboxToken = '${MAPBOX_ACCESS_TOKEN}';
    var mapboxLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/{z}/{x}/{y}?access_token=' + mapboxToken, {
      maxZoom: 20,
      tileSize: 256,
      zoomOffset: 0,
      attribution: '',
      crossOrigin: true
    }).addTo(map);

    // Fast fallback to Carto Voyager / OpenStreetMap if tile error occurs
    var fallbackAdded = false;
    mapboxLayer.on('tileerror', function() {
      if (!fallbackAdded) {
        fallbackAdded = true;
        L.tileLayer('https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19
        }).addTo(map);
      }
    });

    var userCoords = [${userLat}, ${userLng}];
    var destCoords = ${destLat && destLng ? `[${destLat}, ${destLng}]` : 'null'};
    var routePoints = ${JSON.stringify(leafletRouteCoords)};
    var altRoutePoints = ${JSON.stringify(leafletAltCoords)};
    var activeVehicle = '${vehicleType}';
    var isDriving = ${isDriving}; // Only true if user turned on demo simulation
    var simSpeedMultiplier = ${simulationSpeed};
    var isNavigating = ${isNavigating};
    var followCamera = true;
    var lastGpsPt = null;

    // Detect user manual pan to temporarily release camera follow
    map.on('dragstart', function() {
      followCamera = false;
    });

    // SVGs & Emojis for Vehicle Types (including Walk 🚶)
    function getVehicleSvg(type) {
      if (type === 'walk') {
        return '<div class="walker-avatar"><div class="walker-emoji">🚶</div></div>';
      } else if (type === 'suv') {
        return '<svg viewBox="0 0 44 64" width="38" height="56"><filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.35"/></filter><g filter="url(#sh)"><rect x="6" y="8" width="32" height="48" rx="10" fill="#D97706"/><rect x="7.5" y="9.5" width="29" height="45" rx="8" fill="#F59E0B"/><rect x="10" y="20" width="2.5" height="22" rx="1" fill="#78350F"/><rect x="31.5" y="20" width="2.5" height="22" rx="1" fill="#78350F"/><path d="M11 22 L14 14 L30 14 L33 22 Z" fill="#FEF3C7" opacity="0.95"/><rect x="15" y="24" width="14" height="10" rx="3" fill="#B45309" opacity="0.8"/><rect x="9" y="8.5" width="6" height="3" rx="1" fill="#FFFFFF"/><rect x="29" y="8.5" width="6" height="3" rx="1" fill="#FFFFFF"/><rect x="9" y="55" width="7" height="2.5" rx="1" fill="#DC2626"/><rect x="28" y="55" width="7" height="2.5" rx="1" fill="#DC2626"/></g></svg>';
      } else if (type === 'bike') {
        return '<svg viewBox="0 0 36 60" width="32" height="52"><filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.35"/></filter><g filter="url(#sh)"><rect x="15" y="6" width="6" height="14" rx="3" fill="#1E293B"/><rect x="15" y="40" width="6" height="14" rx="3" fill="#1E293B"/><rect x="6" y="16" width="24" height="3.5" rx="1.5" fill="#64748B"/><circle cx="7" cy="18" r="2" fill="#0F172A"/><circle cx="29" cy="18" r="2" fill="#0F172A"/><rect x="13.5" y="18" width="9" height="24" rx="4.5" fill="#10B981"/><circle cx="18" cy="27" r="6" fill="#0F172A"/><circle cx="18" cy="7" r="2.5" fill="#FDE047"/></g></svg>';
      } else if (type === 'arrow') {
        return '<svg viewBox="0 0 48 48" width="40" height="40"><filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.35"/></filter><g filter="url(#sh)"><path d="M24 4 L42 42 L24 33 L6 42 Z" fill="#2563EB" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round"/><path d="M24 7 L38 38 L24 30 Z" fill="#3B82F6"/></g></svg>';
      } else {
        // Standard Modern Sedan Car (Default)
        return '<svg viewBox="0 0 40 60" width="36" height="54"><filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.35"/></filter><g filter="url(#sh)"><rect x="6" y="8" width="28" height="44" rx="9" fill="#1D4ED8"/><rect x="7" y="10" width="26" height="40" rx="8" fill="#2563EB"/><rect x="9" y="18" width="22" height="20" rx="5" fill="#1E40AF"/><path d="M10 21 L13 14 L27 14 L30 21 Z" fill="#93C5FD" opacity="0.9"/><path d="M11 36 L13 40 L27 40 L29 36 Z" fill="#93C5FD" opacity="0.8"/><rect x="8.5" y="23" width="2" height="11" rx="1" fill="#93C5FD"/><rect x="29.5" y="23" width="2" height="11" rx="1" fill="#93C5FD"/><circle cx="10" cy="9" r="2.5" fill="#FDE047"/><circle cx="30" cy="9" r="2.5" fill="#FDE047"/><rect x="8" y="50" width="6" height="2" rx="1" fill="#EF4444"/><rect x="26" y="50" width="6" height="2" rx="1" fill="#EF4444"/></g></svg>';
      }
    }

    // 1. Google Maps Navigation Route Polyline
    var mainRoutePoly = null;
    var passedRoutePoly = null;
    if (routePoints && routePoints.length > 0) {
      // Glow Border
      L.polyline(routePoints, {
        color: '#1D4ED8',
        weight: 10,
        opacity: 0.4,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Primary Blue Line
      mainRoutePoly = L.polyline(routePoints, {
        color: '#2563EB',
        weight: 6,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Traveled Gray Line (updates dynamically as user moves on real GPS)
      passedRoutePoly = L.polyline([], {
        color: '#94A3B8',
        weight: 6,
        opacity: 0.75,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
    }

    // 2. Alternative Route Polyline
    if (altRoutePoints && altRoutePoints.length > 0) {
      L.polyline(altRoutePoints, {
        color: '#10B981',
        weight: 5,
        opacity: 0.75,
        dashArray: '6, 8',
        lineCap: 'round'
      }).addTo(map);
    }

    // 3. Vehicle / User Marker with Dynamic Rotation
    var vehicleHeading = 0;
    var vehicleMarkerEl = document.createElement('div');
    vehicleMarkerEl.className = 'vehicle-marker-wrapper';
    var isWalk = activeVehicle === 'walk';
    vehicleMarkerEl.innerHTML = '<div class="vehicle-pulse ' + (isWalk ? 'vehicle-pulse-walk' : '') + '"></div><div id="v-icon-box">' + getVehicleSvg(activeVehicle) + '</div>';

    var vehicleIcon = L.divIcon({
      className: '',
      html: vehicleMarkerEl,
      iconSize: [48, 64],
      iconAnchor: [24, 32]
    });

    var vehicleMarker = L.marker(userCoords, {
      icon: vehicleIcon,
      zIndexOffset: 1200
    }).addTo(map);

    function updateVehicleIconVisual(type) {
      activeVehicle = type;
      var box = document.getElementById('v-icon-box');
      if (box) {
        box.innerHTML = getVehicleSvg(type);
      }
      var pulse = vehicleMarkerEl.querySelector('.vehicle-pulse');
      if (pulse) {
        if (type === 'walk') {
          pulse.classList.add('vehicle-pulse-walk');
        } else {
          pulse.classList.remove('vehicle-pulse-walk');
        }
      }
    }

    function setVehicleRotation(deg) {
      var box = document.getElementById('v-icon-box');
      if (!box) return;

      if (activeVehicle === 'walk') {
        if (deg > 90 && deg < 270) {
          box.style.transform = 'scaleX(-1)';
        } else {
          box.style.transform = 'scaleX(1)';
        }
        box.style.transition = 'transform 0.2s ease-out';
      } else {
        var current = vehicleHeading;
        var diff = (deg - current) % 360;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        vehicleHeading = current + diff;
        box.style.transform = 'rotate(' + vehicleHeading + 'deg)';
        box.style.transition = 'transform 0.12s linear';
      }
    }

    // 4. Destination Marker Pin (Exact needle tip points directly to destination coordinates)
    if (destCoords) {
      var pinHtml = '<div class="dest-pin-anchor">' +
        '<div class="dest-pill-badge">' +
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="#EF4444"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>' +
          '<span>' + '${destName}' + '</span>' +
        '</div>' +
        '<div class="dest-needle-pin">' +
          '<svg viewBox="0 0 32 44" width="32" height="44" style="filter: drop-shadow(0 3px 5px rgba(0,0,0,0.35));">' +
            '<path d="M16 0 C7.16 0 0 7.16 0 16 C0 28 16 44 16 44 C16 44 32 28 32 16 C32 7.16 24.84 0 16 0 Z" fill="#EF4444"/>' +
            '<circle cx="16" cy="16" r="6.5" fill="#FFFFFF"/>' +
            '<circle cx="16" cy="16" r="3.2" fill="#DC2626"/>' +
          '</svg>' +
        '</div>' +
        '<div class="dest-target-dot"></div>' +
      '</div>';

      var destIcon = L.divIcon({
        className: '',
        html: pinHtml,
        iconSize: [140, 74],
        iconAnchor: [70, 74] // Exact bottom needle tip touches destCoords
      });

      var destMarker = L.marker(destCoords, {
        icon: destIcon,
        zIndexOffset: 1500
      }).addTo(map);

      // Ensure route line connects directly to destination pin tip
      if (routePoints && routePoints.length > 0) {
        var lastPt = routePoints[routePoints.length - 1];
        var distToPin = calcDistanceMeters(lastPt, destCoords);
        if (distToPin > 0.5 && distToPin < 400) {
          routePoints.push(destCoords);
          if (mainRoutePoly) mainRoutePoly.setLatLngs(routePoints);
        }
      }
    }

    // 5. Total Route Distance & Geometry Helpers
    function calcDistanceMeters(p1, p2) {
      var R = 6371e3;
      var f1 = p1[0] * Math.PI / 180;
      var f2 = p2[0] * Math.PI / 180;
      var df = (p2[0] - p1[0]) * Math.PI / 180;
      var dl = (p2[1] - p1[1]) * Math.PI / 180;
      var a = Math.sin(df/2) * Math.sin(df/2) +
              Math.cos(f1) * Math.cos(f2) *
              Math.sin(dl/2) * Math.sin(dl/2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }

    function calcBearing(p1, p2) {
      var y = Math.sin((p2[1] - p1[1]) * Math.PI / 180) * Math.cos(p2[0] * Math.PI / 180);
      var x = Math.cos(p1[0] * Math.PI / 180) * Math.sin(p2[0] * Math.PI / 180) -
              Math.sin(p1[0] * Math.PI / 180) * Math.cos(p2[0] * Math.PI / 180) * Math.cos((p2[1] - p1[1]) * Math.PI / 180);
      var brng = Math.atan2(y, x) * 180 / Math.PI;
      return (brng + 360) % 360;
    }

    function projectPointOnSegment(p, a, b) {
      var dx = b[1] - a[1];
      var dy = b[0] - a[0];
      var l2 = dx * dx + dy * dy;
      if (l2 === 0) return { pt: a, t: 0 };
      var t = Math.max(0, Math.min(1, ((p[1] - a[1]) * dx + (p[0] - a[0]) * dy) / l2));
      return {
        pt: [a[0] + t * dy, a[1] + t * dx],
        t: t
      };
    }

    var totalRouteMeters = 0;
    var cumDistances = [0];
    if (routePoints.length >= 2) {
      for (var i = 0; i < routePoints.length - 1; i++) {
        var segDist = calcDistanceMeters(routePoints[i], routePoints[i+1]);
        totalRouteMeters += segDist;
        cumDistances.push(totalRouteMeters);
      }
    }

    // 6. REAL-TIME PHYSICAL GPS MOVEMENT ENGINE (Tied to Phone GPS Sensors)
    function handleRealGpsUpdate(lat, lng, heading, speedKmh) {
      var realGpsPt = [lat, lng];

      if (isNavigating && routePoints && routePoints.length >= 2) {
        var minDistance = Infinity;
        var bestSegIdx = 0;
        var bestProj = realGpsPt;
        var bestT = 0;

        for (var i = 0; i < routePoints.length - 1; i++) {
          var segA = routePoints[i];
          var segB = routePoints[i + 1];
          var proj = projectPointOnSegment(realGpsPt, segA, segB);
          var dist = calcDistanceMeters(realGpsPt, proj.pt);
          if (dist < minDistance) {
            minDistance = dist;
            bestSegIdx = i;
            bestProj = proj.pt;
            bestT = proj.t;
          }
        }

        var displayPt = realGpsPt;
        var carBearing = (heading !== null && heading !== undefined && !isNaN(heading)) ? heading : null;

        // Lane precision snap to road if within 45m of route
        if (minDistance <= 45) {
          displayPt = bestProj;
          if (carBearing === null) {
            carBearing = calcBearing(routePoints[bestSegIdx], routePoints[bestSegIdx + 1]);
          }
        } else if (carBearing === null && lastGpsPt) {
          carBearing = calcBearing(lastGpsPt, realGpsPt);
        }
        lastGpsPt = realGpsPt;

        // Position vehicle marker exactly at real GPS location
        vehicleMarker.setLatLng(displayPt);
        if (carBearing !== null && !isNaN(carBearing)) {
          setVehicleRotation(carBearing);
        }

        // Camera follow smoothly without jumping
        if (followCamera) {
          map.panTo(displayPt, { animate: true, duration: 0.35 });
        }

        var segLen = calcDistanceMeters(routePoints[bestSegIdx], routePoints[bestSegIdx + 1]);
        var covered = (cumDistances[bestSegIdx] || 0) + (bestT * segLen);
        var remaining = Math.max(0, totalRouteMeters - covered);

        if (passedRoutePoly) {
          var passed = routePoints.slice(0, bestSegIdx + 1);
          passed.push(displayPt);
          passedRoutePoly.setLatLngs(passed);
        }

        // Arrival check (< 35m)
        var distToDest = calcDistanceMeters(displayPt, routePoints[routePoints.length - 1]);
        if (distToDest < 35 || remaining < 30) {
          sendAppMessage({ type: 'ARRIVED' });
          return;
        }

        // Calculate upcoming turn direction from real GPS position
        var nextTurnType = 'straight';
        var distToTurn = 0;
        for (var j = bestSegIdx; j < Math.min(routePoints.length - 2, bestSegIdx + 15); j++) {
          var b1 = calcBearing(routePoints[j], routePoints[j + 1]);
          var b2 = calcBearing(routePoints[j + 1], routePoints[j + 2]);
          var diff = ((b2 - b1 + 540) % 360) - 180;
          if (Math.abs(diff) >= 20) {
            distToTurn = (cumDistances[j + 1] - covered);
            if (diff > 45) nextTurnType = 'right';
            else if (diff > 20) nextTurnType = 'slight-right';
            else if (diff < -45) nextTurnType = 'left';
            else if (diff < -20) nextTurnType = 'slight-left';
            break;
          }
        }

        if (distToTurn <= 0) {
          distToTurn = Math.max(50, Math.round(remaining));
        }

        var turnInst = distToTurn < 60
          ? (activeVehicle === 'walk' ? 'Walk ahead' : 'Turn ahead')
          : (nextTurnType === 'right' || nextTurnType === 'slight-right')
          ? 'In ' + Math.round(distToTurn) + ' m, turn right'
          : (nextTurnType === 'left' || nextTurnType === 'slight-left')
          ? 'In ' + Math.round(distToTurn) + ' m, turn left'
          : (activeVehicle === 'walk' ? 'Walk straight along path' : 'Continue straight');

        sendAppMessage({
          type: 'NAV_PROGRESS',
          coveredKm: Math.round((covered / 1000) * 10) / 10,
          remainingKm: Math.round((remaining / 1000) * 10) / 10,
          progress: Math.min(1, covered / Math.max(1, totalRouteMeters)),
          speedKmh: speedKmh || 0,
          nextTurnMeters: Math.round(distToTurn),
          turnType: nextTurnType,
          turnInstruction: turnInst
        });
      } else {
        // Free Browsing Mode
        vehicleMarker.setLatLng(realGpsPt);
        if (heading !== null && heading !== undefined && !isNaN(heading)) {
          setVehicleRotation(heading);
        }
        if (!window.__hasCenteredInitially) {
          window.__hasCenteredInitially = true;
          map.setView(realGpsPt, 15);
        }
      }
    }

    // 7. OPTIONAL INDOOR SIMULATION ENGINE (ONLY runs if user explicitly turns on simulation)
    var currSegmentIdx = 0;
    var segProgress = 0;
    var coveredMeters = 0;
    var lastAnimTime = Date.now();
    var animFrameId = null;

    function updateNavigationStep() {
      if (!isNavigating || !isDriving || routePoints.length < 2) return;

      var now = Date.now();
      var dt = Math.min(0.1, (now - lastAnimTime) / 1000);
      lastAnimTime = now;

      var p1 = routePoints[currSegmentIdx];
      var p2 = routePoints[currSegmentIdx + 1];
      if (!p1 || !p2) {
        sendAppMessage({ type: 'ARRIVED' });
        return;
      }

      var segLen = calcDistanceMeters(p1, p2);
      if (segLen <= 0.5) {
        currSegmentIdx++;
        animFrameId = requestAnimationFrame(updateNavigationStep);
        return;
      }

      // Upcoming turn calculation for cornering deceleration and guidance
      var nextTurnType = 'straight';
      var distToTurn = 0;
      for (var j = currSegmentIdx; j < Math.min(routePoints.length - 2, currSegmentIdx + 12); j++) {
        var b1 = calcBearing(routePoints[j], routePoints[j+1]);
        var b2 = calcBearing(routePoints[j+1], routePoints[j+2]);
        var diff = ((b2 - b1 + 540) % 360) - 180;
        if (Math.abs(diff) >= 20) {
          distToTurn = (cumDistances[j+1] - (cumDistances[currSegmentIdx] + segProgress * segLen));
          if (diff > 45) nextTurnType = 'right';
          else if (diff > 20) nextTurnType = 'slight-right';
          else if (diff < -45) nextTurnType = 'left';
          else if (diff < -20) nextTurnType = 'slight-left';
          break;
        }
      }

      if (distToTurn <= 0) {
        distToTurn = Math.max(50, Math.round(totalRouteMeters - coveredMeters));
      }

      // Realistic Vehicle Base Speed & Cornering Physics
      var baseSpeedKmh = 42;
      if (activeVehicle === 'walk') baseSpeedKmh = 5;
      else if (activeVehicle === 'bike') baseSpeedKmh = 24;
      else if (activeVehicle === 'suv') baseSpeedKmh = 40;
      else if (activeVehicle === 'arrow') baseSpeedKmh = 45;

      var corneringFactor = 1.0;
      if (distToTurn < 35 && nextTurnType !== 'straight') {
        corneringFactor = Math.max(0.48, distToTurn / 35);
      }
      var remDistMeters = Math.max(0, totalRouteMeters - coveredMeters);
      if (remDistMeters < 50) {
        corneringFactor = Math.min(corneringFactor, Math.max(0.25, remDistMeters / 50));
      }

      var speedMultiplierFactor = simSpeedMultiplier === 1 ? 1 : simSpeedMultiplier === 2 ? 1.5 : 2.2;
      var speedKmh = Math.max(2, baseSpeedKmh * corneringFactor * speedMultiplierFactor);
      var speedMs = (speedKmh * 1000) / 3600;

      var distTravelled = speedMs * dt;
      segProgress += distTravelled / segLen;
      coveredMeters += distTravelled;

      if (segProgress >= 1) {
        segProgress = 0;
        currSegmentIdx++;
        if (currSegmentIdx >= routePoints.length - 1) {
          sendAppMessage({ type: 'ARRIVED' });
          return;
        }
        p1 = routePoints[currSegmentIdx];
        p2 = routePoints[currSegmentIdx + 1];
      }

      var curLat = p1[0] + (p2[0] - p1[0]) * segProgress;
      var curLng = p1[1] + (p2[1] - p1[1]) * segProgress;
      var curPos = [curLat, curLng];

      vehicleMarker.setLatLng(curPos);
      var bearing = calcBearing(p1, p2);
      setVehicleRotation(bearing);

      if (passedRoutePoly) {
        var traveled = routePoints.slice(0, currSegmentIdx + 1);
        traveled.push(curPos);
        passedRoutePoly.setLatLngs(traveled);
      }

      if (followCamera) {
        map.setView(curPos, 17, { animate: false });
      }

      var turnInst = distToTurn < 60
        ? (activeVehicle === 'walk' ? 'Walk ahead' : 'Turn ahead')
        : (nextTurnType === 'right' || nextTurnType === 'slight-right')
        ? 'In ' + Math.round(distToTurn) + ' m, turn right'
        : (nextTurnType === 'left' || nextTurnType === 'slight-left')
        ? 'In ' + Math.round(distToTurn) + ' m, turn left'
        : (activeVehicle === 'walk' ? 'Walk straight along path' : 'Continue straight');

      var coveredKm = Math.round((coveredMeters / 1000) * 10) / 10;
      var remainingKm = Math.max(0, Math.round(((totalRouteMeters - coveredMeters) / 1000) * 10) / 10);
      var progressFrac = Math.min(1, coveredMeters / Math.max(1, totalRouteMeters));

      sendAppMessage({
        type: 'NAV_PROGRESS',
        coveredKm: coveredKm,
        remainingKm: remainingKm,
        progress: progressFrac,
        speedKmh: Math.round(speedKmh),
        nextTurnMeters: Math.round(distToTurn),
        turnType: nextTurnType,
        turnInstruction: turnInst
      });

      animFrameId = requestAnimationFrame(updateNavigationStep);
    }

    // Initial camera: Display complete route on screen immediately
    if (mainRoutePoly) {
      map.fitBounds(mainRoutePoly.getBounds(), { padding: [50, 50], maxZoom: 16 });
      if (isNavigating && isDriving) {
        lastAnimTime = Date.now();
        animFrameId = requestAnimationFrame(updateNavigationStep);
      }
    } else if (destCoords) {
      var grp = L.featureGroup([L.marker(userCoords), L.marker(destCoords)]);
      map.fitBounds(grp.getBounds(), { padding: [80, 80], maxZoom: 15 });
    }

    // Inbound Message Listener from React Native
    function handleInboundMessage(raw) {
      try {
        var data = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (!data || !data.type) return;

        if (data.type === 'GPS_UPDATE') {
          handleRealGpsUpdate(data.lat, data.lng, data.heading, data.speedKmh);
        } else if (data.type === 'SET_VEHICLE') {
          updateVehicleIconVisual(data.vehicle);
        } else if (data.type === 'SET_DRIVE_STATE') {
          isDriving = !!data.driving;
          if (data.speedMultiplier) simSpeedMultiplier = data.speedMultiplier;
          if (isDriving) {
            lastAnimTime = Date.now();
            if (animFrameId) cancelAnimationFrame(animFrameId);
            animFrameId = requestAnimationFrame(updateNavigationStep);
          } else if (animFrameId) {
            cancelAnimationFrame(animFrameId);
          }
        } else if (data.type === 'RECENTER') {
          followCamera = true;
          var pos = vehicleMarker ? vehicleMarker.getLatLng() : userCoords;
          map.setView(pos, isNavigating ? 17 : 15, { animate: true });
        } else if (data.type === 'INVALIDATE_SIZE') {
          forceCompleteMapRender();
        } else if (data.type === 'RESTART_ROUTE') {
          currSegmentIdx = 0;
          segProgress = 0;
          coveredMeters = 0;
          followCamera = true;
          if (routePoints.length >= 2) {
            vehicleMarker.setLatLng(routePoints[0]);
            if (passedRoutePoly) passedRoutePoly.setLatLngs([]);
            map.setView(routePoints[0], 17);
          }
          if (isDriving) {
            lastAnimTime = Date.now();
            if (animFrameId) cancelAnimationFrame(animFrameId);
            animFrameId = requestAnimationFrame(updateNavigationStep);
          }
        }
      } catch(err) {}
    }

    window.addEventListener('message', function(e) {
      handleInboundMessage(e.data);
    });
    document.addEventListener('message', function(e) {
      handleInboundMessage(e.data);
    });
  </script>
</body>
</html>`;
  }, [
    destination?.latitude,
    destination?.longitude,
    destination?.name,
    leafletRouteCoords,
    leafletAltCoords,
    incidents,
    services,
    layers,
    destinationLabel,
    isNavigating,
  ]);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <iframe
          ref={iframeRef}
          srcDoc={mapHtml}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          }}
          title="Navigation Map"
          onLoad={() => {
            iframeRef.current?.contentWindow?.postMessage(
              JSON.stringify({ type: 'INVALIDATE_SIZE' }),
              '*'
            );
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        style={styles.webView}
        containerStyle={styles.webViewContainer}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        onMessage={(event) => handleMapMessage(event.nativeEvent.data)}
        onLoadEnd={() => {
          webViewRef.current?.postMessage(JSON.stringify({ type: 'INVALIDATE_SIZE' }));
          setTimeout(() => {
            webViewRef.current?.postMessage(JSON.stringify({ type: 'INVALIDATE_SIZE' }));
          }, 300);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
  },
  webViewContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  webView: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
  },
});
