import React, { useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import {
  Coordinates,
  Incident,
  NearbyService,
  MapLayersState,
  RouteCorridorService,
} from '../types';
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
  subsequentTurnType?: 'right' | 'left' | 'slight-right' | 'slight-left' | 'straight' | 'u-turn' | null;
  subsequentTurnMeters?: number | null;
  subsequentInstruction?: string | null;
  autoZoomLevel?: number;
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
  corridorServices?: RouteCorridorService[];
  layers?: MapLayersState;
  showIncidentHotspot?: boolean;
  destinationLabel?: string;
  isNavigating?: boolean;
  isDriving?: boolean; // False by default: Only real-time GPS moves the marker!
  simulationSpeed?: number; // 1, 2, or 4
  vehicleType?: VehicleIconType;
  recenterTrigger?: number;
  restartTrigger?: number;
  driverMode?: boolean; // Dedicated Driver Mode with forward lookahead
  driverAutoZoom?: boolean; // Auto-zoom engine toggle
  navigationMuted?: boolean;
  onUserPanned?: () => void;
  onNavigationProgress?: (data: NavigationProgressData) => void;
  onArrived?: () => void;
  onSelectIncident?: (inc: Incident) => void;
  onSelectService?: (srv: NearbyService) => void;
}

const InteractiveMapComponent: React.FC<InteractiveMapProps> = ({
  currentLocation = { latitude: 28.6139, longitude: 77.209 },
  currentHeading = null,
  currentSpeed = 0,
  destination,
  routeCoordinates = [],
  alternativeRouteCoordinates = [],
  incidents = [],
  services = [],
  corridorServices = [],
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
  isDriving = false,
  simulationSpeed = 2,
  vehicleType = 'car',
  recenterTrigger = 0,
  restartTrigger = 0,
  driverMode = true,
  driverAutoZoom = true,
  navigationMuted = false,
  onUserPanned,
  onNavigationProgress,
  onArrived,
  onSelectIncident,
  onSelectService,
}) => {
  const webViewRef = useRef<WebView>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Stable center coordinates to prevent WebView reloads on GPS ticks
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
          subsequentTurnType: data.subsequentTurnType ?? null,
          subsequentTurnMeters: data.subsequentTurnMeters ?? null,
          subsequentInstruction: data.subsequentInstruction ?? null,
          autoZoomLevel: data.autoZoomLevel,
        });
      } else if (data.type === 'USER_PANNED' && onUserPanned) {
        onUserPanned();
      } else if (data.type === 'ARRIVED' && onArrived) {
        onArrived();
      } else if (data.type === 'SELECT_INCIDENT' && onSelectIncident && data.incident) {
        const inc = { ...data.incident };
        if (data.distanceText) inc.distance = data.distanceText;
        onSelectIncident(inc);
      } else if (data.type === 'SELECT_SERVICE' && onSelectService && data.service) {
        onSelectService(data.service);
      }
    } catch {
      // Ignore parse error
    }
  };

  const postToMap = (payloadObj: any) => {
    const payload = JSON.stringify(payloadObj);
    if (Platform.OS === 'web' && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(payload, '*');
    } else if (webViewRef.current) {
      webViewRef.current.postMessage(payload);
    }
  };

  // Real-time GPS movement updates directly into map without page reload
  useEffect(() => {
    if (!currentLocation) return;
    postToMap({
      type: 'GPS_UPDATE',
      lat: currentLocation.latitude,
      lng: currentLocation.longitude,
      heading: currentHeading ?? null,
      speedKmh: currentSpeed ?? 0,
    });
  }, [currentLocation?.latitude, currentLocation?.longitude, currentHeading, currentSpeed]);

  // Sync vehicle type changes to active map
  useEffect(() => {
    postToMap({ type: 'SET_VEHICLE', vehicle: vehicleType });
  }, [vehicleType]);

  // Sync simulation driving state
  useEffect(() => {
    postToMap({
      type: 'SET_DRIVE_STATE',
      driving: isDriving,
      speedMultiplier: simulationSpeed,
    });
  }, [isDriving, simulationSpeed]);

  // Recenter trigger
  useEffect(() => {
    if (!recenterTrigger) return;
    postToMap({
      type: 'RECENTER',
      lat: currentLocation?.latitude,
      lng: currentLocation?.longitude,
    });
  }, [recenterTrigger, currentLocation?.latitude, currentLocation?.longitude]);

  // Restart trigger
  useEffect(() => {
    if (!restartTrigger) return;
    postToMap({ type: 'RESTART_ROUTE' });
  }, [restartTrigger]);

  // Sync route updates instantly without full HTML reload
  useEffect(() => {
    if (!leafletRouteCoords || leafletRouteCoords.length === 0) return;
    postToMap({
      type: 'SET_ROUTE',
      routeCoords: leafletRouteCoords,
      altCoords: leafletAltCoords,
      fitBounds: !isNavigating,
    });
  }, [leafletRouteCoords, leafletAltCoords, isNavigating]);

  // Sync POI Services and Layer Toggles smoothly
  useEffect(() => {
    postToMap({
      type: 'SET_SERVICES',
      services,
      layers,
    });
  }, [services, layers]);

  // Sync Incidents and Layer Toggles smoothly
  useEffect(() => {
    postToMap({
      type: 'SET_INCIDENTS',
      incidents,
      layers,
    });
  }, [incidents, layers]);

  // Sync Corridor Services along route
  useEffect(() => {
    postToMap({
      type: 'SET_CORRIDOR_SERVICES',
      corridorServices,
    });
  }, [corridorServices]);

  // Sync Navigation State
  useEffect(() => {
    postToMap({
      type: 'SET_NAV_STATE',
      isNavigating,
    });
  }, [isNavigating]);

  // Sync Driver Mode and Auto-Zoom
  useEffect(() => {
    postToMap({
      type: 'SET_DRIVER_MODE',
      enabled: driverMode,
      autoZoom: driverAutoZoom,
      muted: navigationMuted,
    });
  }, [driverMode, driverAutoZoom, navigationMuted]);

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
  }, [onNavigationProgress, onArrived, onSelectIncident, onSelectService]);

  const mapHtml = useMemo(() => {
    const userLat = initialCenterRef.current.latitude;
    const userLng = initialCenterRef.current.longitude;
    const destLat = destination?.latitude;
    const destLng = destination?.longitude;
    const destName = (destination?.name || destinationLabel || 'Destination')
      .replace(/'/g, "\\'")
      .replace(/,\s*India/gi, '');

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

    #v-icon-box {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.22s cubic-bezier(0.25, 1, 0.5, 1);
      will-change: transform;
    }

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

    /* Destination Needle Pin */
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

    /* ==========================================================
       RICH POI SERVICE MARKERS (Petrol, CNG, Garage, Hospital, Police)
       ========================================================== */
    .poi-marker-pin {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.32);
      border: 2.5px solid #FFFFFF;
      cursor: pointer;
      font-size: 16px;
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .poi-marker-pin:hover {
      transform: scale(1.18);
    }

    /* Category Specific Badge Gradients */
    .poi-bg-petrol {
      background: linear-gradient(135deg, #F97316 0%, #EA580C 100%);
    }
    .poi-bg-cng {
      background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%);
    }
    .poi-bg-garage {
      background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
    }
    .poi-bg-hospital {
      background: linear-gradient(135deg, #F43F5E 0%, #BE123C 100%);
    }
    .poi-bg-police {
      background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
    }

    /* Hazard & Incident Marker */
    .incident-marker-pin {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, #EF4444 0%, #B91C1C 100%);
      border: 2.5px solid #FFFFFF;
      box-shadow: 0 4px 14px rgba(239, 68, 68, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      cursor: pointer;
      animation: incPulse 2s infinite ease-in-out;
    }
    @keyframes incPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.12); }
    }

    /* Corridor Service Marker along active route */
    .corridor-service-marker {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 2.5px solid #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.35);
      cursor: pointer;
      transition: transform 0.15s ease;
    }

    /* Leaflet Popups */
    .leaflet-popup-content-wrapper {
      border-radius: 16px;
      padding: 0px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(15, 23, 42, 0.22);
    }
    .leaflet-popup-content {
      margin: 0;
      line-height: 1.4;
    }
    .poi-popup-card {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 12px 14px;
      min-width: 200px;
      max-width: 250px;
      background: #FFFFFF;
    }
    .poi-popup-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }
    .poi-popup-pill {
      font-size: 9px;
      font-weight: 800;
      color: #FFFFFF;
      padding: 2px 7px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .poi-popup-dist {
      font-size: 11px;
      font-weight: 800;
      color: #2563EB;
    }
    .poi-popup-title {
      font-size: 13px;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 3px;
    }
    .poi-popup-sub {
      font-size: 11px;
      color: #64748B;
      font-weight: 500;
      line-height: 14px;
    }
    .poi-popup-phone {
      margin-top: 6px;
      padding-top: 6px;
      border-top: 1px solid #F1F5F9;
      font-size: 10px;
      color: #10B981;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    ${BUNDLED_LEAFLET_JS}

    function sendAppMessage(msgObj) {
      var str = JSON.stringify(msgObj);
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(str);
      } else if (window.parent && window.parent.postMessage) {
        window.parent.postMessage(str, '*');
      }
    }

    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
      fadeAnimation: false,
      zoomAnimation: true,
      markerZoomAnimation: true,
      inertia: true,
      inertiaDeceleration: 3400,
      easeLinearity: 0.2,
      preferCanvas: true
    }).setView([${userLat}, ${userLng}], 15);

    function forceCompleteMapRender() {
      if (map) {
        map.invalidateSize({ debounceMoveend: true });
      }
    }
    window.addEventListener('resize', forceCompleteMapRender);
    window.addEventListener('orientationchange', forceCompleteMapRender);
    if (window.ResizeObserver) {
      try {
        var ro = new ResizeObserver(function() { forceCompleteMapRender(); });
        ro.observe(document.getElementById('map'));
        ro.observe(document.body);
      } catch(e) {}
    }
    setTimeout(forceCompleteMapRender, 50);
    setTimeout(forceCompleteMapRender, 150);
    setTimeout(forceCompleteMapRender, 400);

    var mapboxToken = '${MAPBOX_ACCESS_TOKEN}';
    var mapboxLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/{z}/{x}/{y}?access_token=' + mapboxToken, {
      maxZoom: 20,
      tileSize: 256,
      zoomOffset: 0,
      attribution: '',
      crossOrigin: true
    }).addTo(map);

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
    var routePoints = [];
    var altRoutePoints = [];
    var activeVehicle = '${vehicleType}';
    var isDriving = false;
    var simSpeedMultiplier = 2;
    var isNavigating = ${isNavigating ? 'true' : 'false'};
    var driverModeEnabled = ${driverMode ? 'true' : 'false'};
    var driverAutoZoomEnabled = ${driverAutoZoom ? 'true' : 'false'};
    var isNavMuted = ${navigationMuted ? 'true' : 'false'};
    var followCamera = true;
    var lastGpsPt = null;
    var lastAppliedAutoZoom = 17.0;
    var lastAutoZoomTime = 0;
    var lastSpokenTurnKey = '';
    var lastRecordedSpeedKmh = 0;
    var lastRecordedDistToTurn = 300;

    // Auto-Recenter on touch release
    var autoRecenterTimer = null;
    map.on('dragstart', function() {
      followCamera = false;
      sendAppMessage({ type: 'USER_PANNED' });
      if (autoRecenterTimer) clearTimeout(autoRecenterTimer);
      autoRecenterTimer = setTimeout(function() {
        followCamera = true;
        sendAppMessage({ type: 'CAMERA_FOLLOW_RESUMED' });
      }, 7000);
    });

    // SVGs for Vehicle Types
    function getVehicleSvg(type) {
      if (type === 'walk') {
        return '<svg viewBox="0 0 24 24" width="32" height="42" fill="#10B981"><circle cx="12" cy="4" r="3.2" fill="#10B981"/><path d="M13.5 8.5 L10.5 8.5 C9.4 8.5 8.5 9.4 8.5 10.5 L8.5 14.5 L10 14.5 L10 20 L12 20 L12 15 L13 15 L14 20 L16 20 L16 13.5 L14.5 13.5 L14.5 10.5 C14.5 9.4 14.1 8.5 13.5 8.5 Z" fill="#10B981"/></svg>';
      } else if (type === 'suv') {
        return '<svg viewBox="0 0 44 64" width="38" height="56"><rect x="6" y="8" width="32" height="48" rx="10" fill="#D97706"/><rect x="7.5" y="9.5" width="29" height="45" rx="8" fill="#F59E0B"/><path d="M11 22 L14 14 L30 14 L33 22 Z" fill="#FEF3C7" opacity="0.95"/><rect x="15" y="24" width="14" height="10" rx="3" fill="#B45309" opacity="0.8"/><rect x="9" y="8.5" width="6" height="3" rx="1" fill="#FFFFFF"/><rect x="29" y="8.5" width="6" height="3" rx="1" fill="#FFFFFF"/><rect x="9" y="55" width="7" height="2.5" rx="1" fill="#DC2626"/><rect x="28" y="55" width="7" height="2.5" rx="1" fill="#DC2626"/></svg>';
      } else if (type === 'bike') {
        return '<svg viewBox="0 0 36 60" width="32" height="52"><rect x="15" y="6" width="6" height="14" rx="3" fill="#1E293B"/><rect x="15" y="40" width="6" height="14" rx="3" fill="#1E293B"/><rect x="6" y="16" width="24" height="3.5" rx="1.5" fill="#64748B"/><circle cx="7" cy="18" r="2" fill="#0F172A"/><circle cx="29" cy="18" r="2" fill="#0F172A"/><rect x="13.5" y="18" width="9" height="24" rx="4.5" fill="#10B981"/><circle cx="18" cy="27" r="6" fill="#0F172A"/><circle cx="18" cy="7" r="2.5" fill="#FDE047"/></svg>';
      } else if (type === 'arrow') {
        return '<svg viewBox="0 0 48 48" width="40" height="40"><path d="M24 4 L42 42 L24 33 L6 42 Z" fill="#2563EB" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round"/><path d="M24 7 L38 38 L24 30 Z" fill="#3B82F6"/></svg>';
      } else {
        return '<svg viewBox="0 0 40 60" width="36" height="54"><rect x="6" y="8" width="28" height="44" rx="9" fill="#1D4ED8"/><rect x="7" y="10" width="26" height="40" rx="8" fill="#2563EB"/><rect x="9" y="18" width="22" height="20" rx="5" fill="#1E40AF"/><path d="M10 21 L13 14 L27 14 L30 21 Z" fill="#93C5FD" opacity="0.9"/><rect x="8.5" y="23" width="2" height="11" rx="1" fill="#93C5FD"/><rect x="29.5" y="23" width="2" height="11" rx="1" fill="#93C5FD"/><circle cx="10" cy="9" r="2.5" fill="#FDE047"/><circle cx="30" cy="9" r="2.5" fill="#FDE047"/><rect x="8" y="50" width="6" height="2" rx="1" fill="#EF4444"/><rect x="26" y="50" width="6" height="2" rx="1" fill="#EF4444"/></svg>';
      }
    }

    var mainRouteGlow = null;
    var mainRoutePoly = null;
    var passedRoutePoly = null;
    var altRoutePoly = null;

    // Vehicle Marker
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
      if (box) { box.innerHTML = getVehicleSvg(type); }
      var pulse = vehicleMarkerEl.querySelector('.vehicle-pulse');
      if (pulse) {
        if (type === 'walk') pulse.classList.add('vehicle-pulse-walk');
        else pulse.classList.remove('vehicle-pulse-walk');
      }
    }

    function setVehicleRotation(deg) {
      var box = document.getElementById('v-icon-box');
      if (!box) return;
      if (activeVehicle === 'walk') {
        box.style.transform = (deg > 90 && deg < 270) ? 'scaleX(-1)' : 'scaleX(1)';
      } else {
        // In Heads-Up mode, vehicle points UP (0deg); in North-Up, vehicle rotates to deg
        var targetDeg = (isNavigating && isHeadsUp) ? 0 : deg;
        var current = vehicleHeading;
        var diff = (targetDeg - current) % 360;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        vehicleHeading = current + diff;
        box.style.transform = 'rotate(' + vehicleHeading + 'deg)';
        box.style.transition = 'transform 0.12s linear';
      }
    }

    // Destination Pin
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
        iconAnchor: [70, 74]
      });

      L.marker(destCoords, { icon: destIcon, zIndexOffset: 1500 }).addTo(map);
    }

    // Layer Groups for zero-flicker dynamic marker management
    var serviceLayerGroup = L.layerGroup().addTo(map);
    var incidentLayerGroup = L.layerGroup().addTo(map);
    var corridorServiceLayerGroup = L.layerGroup().addTo(map);

    var currentServices = [];
    var currentIncidents = [];
    var currentLayers = { incidents: true, hospitals: true, police: true, fuel: true, cng: true, garages: true };
    var lastServicesSignature = '';
    var lastIncidentsSignature = '';

    // Render Nearby Services on Leaflet Map
    function renderServices(servicesList, layersState) {
      var activeLayers = layersState || currentLayers;
      var signature = (servicesList ? servicesList.length : 0) + '_' + JSON.stringify(activeLayers) + '_' + (servicesList && servicesList[0] ? servicesList[0].id : '');
      if (signature === lastServicesSignature) return;
      lastServicesSignature = signature;

      serviceLayerGroup.clearLayers();
      if (!servicesList || !servicesList.length) return;

      servicesList.forEach(function(s) {
        if (!s.coordinates || !s.coordinates.latitude || !s.coordinates.longitude) return;
        var cat = s.category || s.type;
        if (cat === 'hospital' && !activeLayers.hospitals) return;
        if (cat === 'police' && !activeLayers.police) return;
        if ((cat === 'petrol' || cat === 'fuel' || cat === 'diesel') && !activeLayers.fuel) return;
        if (cat === 'cng' && !activeLayers.cng) return;
        if (cat === 'garage' && !activeLayers.garages) return;

        var catCode = (cat === 'petrol' || cat === 'fuel' || cat === 'diesel') ? 'P' :
                      cat === 'cng' ? 'CNG' :
                      cat === 'garage' ? 'G' :
                      cat === 'hospital' ? '+' :
                      cat === 'police' ? 'POL' : '*';

        var bgClass = (cat === 'petrol' || cat === 'fuel' || cat === 'diesel') ? 'poi-bg-petrol' :
                      cat === 'cng' ? 'poi-bg-cng' :
                      cat === 'garage' ? 'poi-bg-garage' :
                      cat === 'hospital' ? 'poi-bg-hospital' :
                      cat === 'police' ? 'poi-bg-police' : 'poi-bg-petrol';

        var pillColor = (cat === 'petrol' || cat === 'fuel' || cat === 'diesel') ? '#EA580C' :
                        cat === 'cng' ? '#0D9488' :
                        cat === 'garage' ? '#7C3AED' :
                        cat === 'hospital' ? '#E11D48' : '#2563EB';

        var iconHtml = '<div class="poi-marker-pin ' + bgClass + '" style="font-weight:900;font-size:12px;color:#FFFFFF;display:flex;align-items:center;justify-content:center;">' + catCode + '</div>';
        var icon = L.divIcon({
          className: '',
          html: iconHtml,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        var marker = L.marker([s.coordinates.latitude, s.coordinates.longitude], {
          icon: icon,
          zIndexOffset: 1000
        });

        var popupHtml = '<div class="poi-popup-card">' +
          '<div class="poi-popup-header">' +
            '<span class="poi-popup-pill" style="background:' + pillColor + ';">' + cat + '</span>' +
            '<span class="poi-popup-dist">' + (s.distance || '') + '</span>' +
          '</div>' +
          '<div class="poi-popup-title">' + s.name + '</div>' +
          '<div class="poi-popup-sub">' + (s.address || 'Verified Spot') + '</div>' +
          (s.status ? '<div class="poi-popup-sub" style="margin-top:3px;color:#10B981;font-weight:700;">' + s.status + '</div>' : '') +
          (s.phone ? '<div class="poi-popup-phone">Tel: ' + s.phone + '</div>' : '') +
        '</div>';

        marker.bindPopup(popupHtml, { offset: [0, -14] });
        marker.on('click', function() {
          sendAppMessage({ type: 'SELECT_SERVICE', service: s });
        });

        serviceLayerGroup.addLayer(marker);
      });
    }

    // Render Incidents / Road Hazards
    function renderIncidents(incidentsList, layersState) {
      var activeLayers = layersState || currentLayers;
      var signature = (incidentsList ? incidentsList.length : 0) + '_' + (activeLayers.incidents ? '1' : '0') + '_' + (incidentsList && incidentsList[0] ? incidentsList[0].id : '');
      if (signature === lastIncidentsSignature) return;
      lastIncidentsSignature = signature;

      incidentLayerGroup.clearLayers();
      if (!activeLayers.incidents || !incidentsList || !incidentsList.length) return;

      incidentsList.forEach(function(inc) {
        if (!inc.coordinates || !inc.coordinates.latitude || !inc.coordinates.longitude) return;
        var iconHtml = '<div class="incident-marker-pin"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>';
        var icon = L.divIcon({
          className: '',
          html: iconHtml,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        var marker = L.marker([inc.coordinates.latitude, inc.coordinates.longitude], {
          icon: icon,
          zIndexOffset: 1100
        });

        // Compute real-time distance between rider's car and incident location
        var vPos = vehicleMarker ? vehicleMarker.getLatLng() : { lat: userCoords[0], lng: userCoords[1] };
        var distM = calcDistanceMeters([vPos.lat, vPos.lng], [inc.coordinates.latitude, inc.coordinates.longitude]);
        var distText = distM < 1000
          ? Math.round(distM) + ' m from your car'
          : (distM / 1000).toFixed(1) + ' km from your car';

        var popupHtml = '<div class="poi-popup-card">' +
          '<div class="poi-popup-header">' +
            '<span class="poi-popup-pill" style="background:#EF4444;">HAZARD</span>' +
            '<span class="poi-popup-dist" style="color:#EF4444;font-weight:800;">' + distText + '</span>' +
          '</div>' +
          '<div class="poi-popup-title">' + inc.title + '</div>' +
          '<div class="poi-popup-sub">' + (inc.location || 'Reported Spot') + '</div>' +
          '<div class="poi-popup-sub" style="margin-top:5px;color:#2563EB;font-weight:700;">' + distText + '</div>' +
          (inc.description ? '<div class="poi-popup-sub" style="margin-top:4px;">' + inc.description + '</div>' : '') +
        '</div>';

        marker.bindPopup(popupHtml, { offset: [0, -14] });
        marker.on('click', function() {
          var curPos = vehicleMarker ? vehicleMarker.getLatLng() : { lat: userCoords[0], lng: userCoords[1] };
          var curDistM = calcDistanceMeters([curPos.lat, curPos.lng], [inc.coordinates.latitude, inc.coordinates.longitude]);
          var curDistText = curDistM < 1000
            ? Math.round(curDistM) + ' m from your car'
            : (curDistM / 1000).toFixed(1) + ' km from your car';
          sendAppMessage({
            type: 'SELECT_INCIDENT',
            incident: inc,
            distanceMeters: curDistM,
            distanceText: curDistText
          });
        });

        incidentLayerGroup.addLayer(marker);
      });
    }

    // Render Route Corridor Services
    function renderCorridorServices(corridorList) {
      corridorServiceLayerGroup.clearLayers();
      if (!corridorList || !corridorList.length) return;

      corridorList.forEach(function(s) {
        if (!s.coordinates || !s.coordinates.latitude || !s.coordinates.longitude) return;
        var catCode = s.category === 'petrol' ? 'P' :
                      s.category === 'cng' ? 'CNG' :
                      s.category === 'diesel' ? 'D' :
                      s.category === 'garage' ? 'G' :
                      s.category === 'hospital' ? '+' :
                      s.category === 'police' ? 'POL' : '*';
        var bg = s.color || '#2563EB';
        var iconHtml = '<div class="corridor-service-marker" style="background:' + bg + ';font-weight:900;font-size:11px;color:#FFFFFF;display:flex;align-items:center;justify-content:center;">' + catCode + '</div>';
        var srvIcon = L.divIcon({
          className: '',
          html: iconHtml,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });
        var marker = L.marker([s.coordinates.latitude, s.coordinates.longitude], {
          icon: srvIcon,
          zIndexOffset: 1100
        });

        var popupHtml = '<div class="poi-popup-card">' +
          '<div class="poi-popup-header">' +
            '<span class="poi-popup-pill" style="background:' + bg + ';">' + s.category + '</span>' +
            '<span class="poi-popup-dist">' + s.distanceFromRouteMeters + 'm off route</span>' +
          '</div>' +
          '<div class="poi-popup-title">' + s.name + '</div>' +
          '<div class="poi-popup-sub">' + (s.operatingHours || 'Open 24/7') + '</div>' +
          (s.fuelTypes && s.fuelTypes.length ? '<div class="poi-popup-sub" style="margin-top:4px;color:#2563EB;font-weight:700;">' + s.fuelTypes.join(' • ') + '</div>' : '') +
        '</div>';

        marker.bindPopup(popupHtml, { offset: [0, -12] });
        corridorServiceLayerGroup.addLayer(marker);
      });
    }

    // Geometry Helpers
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
      return { pt: [a[0] + t * dy, a[1] + t * dx], t: t };
    }

    var totalRouteMeters = 0;
    var cumDistances = [0];

    // Driver Mode Lookahead & Auto-Zoom Helpers
    function getForwardLookaheadPoint(lat, lng, bearingDeg, speedKmh, distToTurn) {
      if (!driverModeEnabled || bearingDeg === null || bearingDeg === undefined || isNaN(bearingDeg)) {
        return [lat, lng];
      }
      var lookaheadMeters = 65;
      if (distToTurn <= 80) {
        lookaheadMeters = 35; // Keep junction centered
      } else if (speedKmh > 65) {
        lookaheadMeters = 110; // Highway cruising view
      } else if (speedKmh > 35) {
        lookaheadMeters = 75; // Normal driving
      } else {
        lookaheadMeters = 50;
      }
      var rad = (bearingDeg * Math.PI) / 180;
      var dLat = (lookaheadMeters * Math.cos(rad)) / 111111;
      var cosLat = Math.cos((lat * Math.PI) / 180);
      var dLng = (lookaheadMeters * Math.sin(rad)) / (111111 * (cosLat === 0 ? 1 : cosLat));
      return [lat + dLat, lng + dLng];
    }

    function computeDriverAutoZoom(distToTurnMeters, currentSpeedKmh) {
      if (!driverAutoZoomEnabled) return map.getZoom();
      if (distToTurnMeters <= 50) {
        return 18.5; // High detail at immediate intersection
      } else if (distToTurnMeters <= 130) {
        return 18.0; // Approaching turn
      } else if (distToTurnMeters <= 300) {
        return 17.5; // Turn preparation
      } else if (distToTurnMeters <= 650) {
        return 17.0; // Standard urban cruising
      } else {
        if (currentSpeedKmh > 75) {
          return 15.5; // Highway wide overview
        } else if (currentSpeedKmh > 50) {
          return 16.0; // Arterial road
        } else {
          return 16.5; // Straight road
        }
      }
    }

    function applyDriverAutoZoom(distToTurnMeters, currentSpeedKmh) {
      if (!driverAutoZoomEnabled || !followCamera || !isNavigating) return;
      var targetZoom = computeDriverAutoZoom(distToTurnMeters, currentSpeedKmh);
      var currentZoom = map.getZoom();
      var now = Date.now();
      if (Math.abs(currentZoom - targetZoom) >= 0.4 && (now - lastAutoZoomTime > 1200)) {
        lastAutoZoomTime = now;
        lastAppliedAutoZoom = targetZoom;
        map.setZoom(targetZoom, { animate: true });
      }
    }

    function speakDirectionPrompt(instructionText, force) {
      if (isNavMuted) return;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          if (force) window.speechSynthesis.cancel();
          var utter = new SpeechSynthesisUtterance(instructionText);
          utter.rate = 1.0;
          utter.pitch = 1.0;
          utter.lang = 'en-US';
          window.speechSynthesis.speak(utter);
        } catch(e) {}
      }
    }

    // Real-Time GPS Movement Engine with Driver Mode Auto-Zoom & Lookahead
    function handleRealGpsUpdate(lat, lng, heading, speedKmh, forceCenter) {
      var realGpsPt = [lat, lng];
      userCoords = realGpsPt;
      lastRecordedSpeedKmh = speedKmh || 0;

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

        if (minDistance <= 45) {
          displayPt = bestProj;
          if (carBearing === null) carBearing = calcBearing(routePoints[bestSegIdx], routePoints[bestSegIdx + 1]);
        } else if (carBearing === null && lastGpsPt) {
          carBearing = calcBearing(lastGpsPt, realGpsPt);
        }
        lastGpsPt = realGpsPt;

        vehicleMarker.setLatLng(displayPt);
        if (carBearing !== null && !isNaN(carBearing)) {
          setVehicleRotation(carBearing);
        }

        var segLen = calcDistanceMeters(routePoints[bestSegIdx], routePoints[bestSegIdx + 1]);
        var covered = (cumDistances[bestSegIdx] || 0) + (bestT * segLen);
        var remaining = Math.max(0, totalRouteMeters - covered);

        if (passedRoutePoly) {
          var passed = routePoints.slice(0, bestSegIdx + 1);
          passed.push(displayPt);
          passedRoutePoly.setLatLngs(passed);
        }

        var distToDest = calcDistanceMeters(displayPt, routePoints[routePoints.length - 1]);
        if (distToDest < 35 || remaining < 30) {
          sendAppMessage({ type: 'ARRIVED' });
          return;
        }

        // 1. Calculate Primary Turn
        var nextTurnType = 'straight';
        var distToTurn = 0;
        var firstTurnIdx = -1;
        for (var j = bestSegIdx; j < Math.min(routePoints.length - 2, bestSegIdx + 16); j++) {
          var b1 = calcBearing(routePoints[j], routePoints[j + 1]);
          var b2 = calcBearing(routePoints[j + 1], routePoints[j + 2]);
          var diff = ((b2 - b1 + 540) % 360) - 180;
          if (Math.abs(diff) >= 20) {
            distToTurn = (cumDistances[j + 1] - covered);
            if (diff > 45) nextTurnType = 'right';
            else if (diff > 20) nextTurnType = 'slight-right';
            else if (diff < -45) nextTurnType = 'left';
            else if (diff < -20) nextTurnType = 'slight-left';
            firstTurnIdx = j;
            break;
          }
        }

        if (distToTurn <= 0) distToTurn = Math.max(50, Math.round(remaining));
        lastRecordedDistToTurn = distToTurn;

        // 2. Calculate Subsequent (Next-After-Current) Turn
        var subsequentTurnType = null;
        var subsequentTurnMeters = null;
        var subsequentInstruction = null;

        if (firstTurnIdx !== -1 && firstTurnIdx < routePoints.length - 3) {
          for (var k = firstTurnIdx + 1; k < Math.min(routePoints.length - 2, firstTurnIdx + 18); k++) {
            var sb1 = calcBearing(routePoints[k], routePoints[k + 1]);
            var sb2 = calcBearing(routePoints[k + 1], routePoints[k + 2]);
            var sdiff = ((sb2 - sb1 + 540) % 360) - 180;
            if (Math.abs(sdiff) >= 20) {
              var distAfter = cumDistances[k + 1] - cumDistances[firstTurnIdx + 1];
              subsequentTurnMeters = Math.max(25, Math.round(distAfter));
              if (sdiff > 45) subsequentTurnType = 'right';
              else if (sdiff > 20) subsequentTurnType = 'slight-right';
              else if (sdiff < -45) subsequentTurnType = 'left';
              else if (sdiff < -20) subsequentTurnType = 'slight-left';

              var dirWord = subsequentTurnType === 'right' ? 'turn right'
                : subsequentTurnType === 'slight-right' ? 'take slight right'
                : subsequentTurnType === 'left' ? 'turn left'
                : 'take slight left';

              if (subsequentTurnMeters >= 1000) {
                subsequentInstruction = 'Then ' + dirWord + ' in ' + (subsequentTurnMeters / 1000).toFixed(1) + ' km';
              } else {
                subsequentInstruction = 'Then ' + dirWord + ' in ' + subsequentTurnMeters + ' m';
              }
              break;
            }
          }
        }

        if (!subsequentTurnType && remaining > 500) {
          var contDist = Math.max(200, Math.round(remaining - distToTurn));
          subsequentTurnType = 'straight';
          subsequentTurnMeters = contDist;
          if (contDist >= 1000) {
            subsequentInstruction = 'Then continue straight for ' + (contDist / 1000).toFixed(1) + ' km';
          } else {
            subsequentInstruction = 'Then continue straight for ' + contDist + ' m';
          }
        }

        // Apply Driver Mode Auto-Zoom
        applyDriverAutoZoom(distToTurn, speedKmh || 0);

        // Position camera with Driver Mode forward lookahead bias (lower third vehicle placement)
        if (followCamera || forceCenter) {
          var camTarget = getForwardLookaheadPoint(displayPt[0], displayPt[1], carBearing, speedKmh || 0, distToTurn);
          map.panTo(camTarget, { animate: true, duration: 0.35 });
        }

        var turnInst = distToTurn < 60
          ? (activeVehicle === 'walk' ? 'Walk ahead' : 'Turn ahead')
          : (nextTurnType === 'right' || nextTurnType === 'slight-right')
          ? 'In ' + Math.round(distToTurn) + ' m, turn right'
          : (nextTurnType === 'left' || nextTurnType === 'slight-left')
          ? 'In ' + Math.round(distToTurn) + ' m, turn left'
          : (activeVehicle === 'walk' ? 'Walk straight along path' : 'Continue straight');

        // Auto Voice Prompts approaching turn
        if (distToTurn <= 300 && distToTurn > 200 && lastSpokenTurnKey !== ('300_' + nextTurnType)) {
          lastSpokenTurnKey = '300_' + nextTurnType;
          speakDirectionPrompt('In 300 meters, ' + (nextTurnType === 'right' ? 'turn right' : nextTurnType === 'left' ? 'turn left' : 'continue straight'), false);
        } else if (distToTurn <= 60 && lastSpokenTurnKey !== ('60_' + nextTurnType)) {
          lastSpokenTurnKey = '60_' + nextTurnType;
          speakDirectionPrompt(nextTurnType === 'right' ? 'Turn right now' : nextTurnType === 'left' ? 'Turn left now' : 'Continue straight', false);
        }

        sendAppMessage({
          type: 'NAV_PROGRESS',
          coveredKm: Math.round((covered / 1000) * 10) / 10,
          remainingKm: Math.round((remaining / 1000) * 10) / 10,
          progress: Math.min(1, covered / Math.max(1, totalRouteMeters)),
          speedKmh: Math.round(speedKmh || 0),
          nextTurnMeters: Math.round(distToTurn),
          turnType: nextTurnType,
          turnInstruction: turnInst,
          subsequentTurnType: subsequentTurnType,
          subsequentTurnMeters: subsequentTurnMeters,
          subsequentInstruction: subsequentInstruction,
          autoZoomLevel: Math.round(map.getZoom() * 10) / 10
        });
      } else {
        vehicleMarker.setLatLng(realGpsPt);
        if (heading !== null && heading !== undefined && !isNaN(heading)) setVehicleRotation(heading);
        if (!window.__hasCenteredInitially || forceCenter) {
          window.__hasCenteredInitially = true;
          map.setView(realGpsPt, 15, { animate: true });
        }
      }
    }

    // Optional Simulation Engine with Driver Mode Auto-Zoom & Lookahead
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

      // 1. Calculate Primary Turn
      var nextTurnType = 'straight';
      var distToTurn = 0;
      var firstTurnIdx = -1;
      for (var j = currSegmentIdx; j < Math.min(routePoints.length - 2, currSegmentIdx + 14); j++) {
        var b1 = calcBearing(routePoints[j], routePoints[j+1]);
        var b2 = calcBearing(routePoints[j+1], routePoints[j+2]);
        var diff = ((b2 - b1 + 540) % 360) - 180;
        if (Math.abs(diff) >= 20) {
          distToTurn = (cumDistances[j+1] - (cumDistances[currSegmentIdx] + segProgress * segLen));
          if (diff > 45) nextTurnType = 'right';
          else if (diff > 20) nextTurnType = 'slight-right';
          else if (diff < -45) nextTurnType = 'left';
          else if (diff < -20) nextTurnType = 'slight-left';
          firstTurnIdx = j;
          break;
        }
      }

      if (distToTurn <= 0) distToTurn = Math.max(50, Math.round(totalRouteMeters - coveredMeters));
      lastRecordedDistToTurn = distToTurn;

      // 2. Calculate Subsequent Turn
      var subsequentTurnType = null;
      var subsequentTurnMeters = null;
      var subsequentInstruction = null;

      if (firstTurnIdx !== -1 && firstTurnIdx < routePoints.length - 3) {
        for (var k = firstTurnIdx + 1; k < Math.min(routePoints.length - 2, firstTurnIdx + 18); k++) {
          var sb1 = calcBearing(routePoints[k], routePoints[k + 1]);
          var sb2 = calcBearing(routePoints[k + 1], routePoints[k + 2]);
          var sdiff = ((sb2 - sb1 + 540) % 360) - 180;
          if (Math.abs(sdiff) >= 20) {
            var distAfter = cumDistances[k + 1] - cumDistances[firstTurnIdx + 1];
            subsequentTurnMeters = Math.max(25, Math.round(distAfter));
            if (sdiff > 45) subsequentTurnType = 'right';
            else if (sdiff > 20) subsequentTurnType = 'slight-right';
            else if (sdiff < -45) subsequentTurnType = 'left';
            else if (sdiff < -20) subsequentTurnType = 'slight-left';

            var dirWord = subsequentTurnType === 'right' ? 'turn right'
              : subsequentTurnType === 'slight-right' ? 'take slight right'
              : subsequentTurnType === 'left' ? 'turn left'
              : 'take slight left';

            if (subsequentTurnMeters >= 1000) {
              subsequentInstruction = 'Then ' + dirWord + ' in ' + (subsequentTurnMeters / 1000).toFixed(1) + ' km';
            } else {
              subsequentInstruction = 'Then ' + dirWord + ' in ' + subsequentTurnMeters + ' m';
            }
            break;
          }
        }
      }

      var remainingMeters = Math.max(0, totalRouteMeters - coveredMeters);
      if (!subsequentTurnType && remainingMeters > 500) {
        var contDist = Math.max(200, Math.round(remainingMeters - distToTurn));
        subsequentTurnType = 'straight';
        subsequentTurnMeters = contDist;
        if (contDist >= 1000) {
          subsequentInstruction = 'Then continue straight for ' + (contDist / 1000).toFixed(1) + ' km';
        } else {
          subsequentInstruction = 'Then continue straight for ' + contDist + ' m';
        }
      }

      var baseSpeedKmh = activeVehicle === 'walk' ? 5 : activeVehicle === 'bike' ? 24 : 42;
      var corneringFactor = (distToTurn < 35 && nextTurnType !== 'straight') ? Math.max(0.48, distToTurn / 35) : 1.0;
      var speedMultiplierFactor = simSpeedMultiplier === 1 ? 1 : simSpeedMultiplier === 2 ? 1.5 : 2.2;
      var speedKmh = Math.max(2, baseSpeedKmh * corneringFactor * speedMultiplierFactor);
      lastRecordedSpeedKmh = speedKmh;
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

      // Apply Driver Mode Auto-Zoom
      applyDriverAutoZoom(distToTurn, speedKmh);

      // Camera Follow with Forward Lookahead
      if (followCamera) {
        var camTarget = getForwardLookaheadPoint(curLat, curLng, bearing, speedKmh, distToTurn);
        map.panTo(camTarget, { animate: true, duration: 0.25 });
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

      // Auto Voice Prompts approaching turn in simulation
      if (distToTurn <= 300 && distToTurn > 200 && lastSpokenTurnKey !== ('300_' + nextTurnType)) {
        lastSpokenTurnKey = '300_' + nextTurnType;
        speakDirectionPrompt('In 300 meters, ' + (nextTurnType === 'right' ? 'turn right' : nextTurnType === 'left' ? 'turn left' : 'continue straight'), false);
      } else if (distToTurn <= 60 && lastSpokenTurnKey !== ('60_' + nextTurnType)) {
        lastSpokenTurnKey = '60_' + nextTurnType;
        speakDirectionPrompt(nextTurnType === 'right' ? 'Turn right now' : nextTurnType === 'left' ? 'Turn left now' : 'Continue straight', false);
      }

      sendAppMessage({
        type: 'NAV_PROGRESS',
        coveredKm: coveredKm,
        remainingKm: remainingKm,
        progress: progressFrac,
        speedKmh: Math.round(speedKmh),
        nextTurnMeters: Math.round(distToTurn),
        turnType: nextTurnType,
        turnInstruction: turnInst,
        subsequentTurnType: subsequentTurnType,
        subsequentTurnMeters: subsequentTurnMeters,
        subsequentInstruction: subsequentInstruction,
        autoZoomLevel: Math.round(map.getZoom() * 10) / 10
      });

      animFrameId = requestAnimationFrame(updateNavigationStep);
    }

    // Inbound Message Listener from React Native
    function handleInboundMessage(raw) {
      try {
        var data = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (!data || !data.type) return;

        if (data.type === 'GPS_UPDATE') {
          handleRealGpsUpdate(data.lat, data.lng, data.heading, data.speedKmh, data.forceCenter);
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
        } else if (data.type === 'SET_SERVICES') {
          currentServices = data.services || [];
          if (data.layers) currentLayers = data.layers;
          renderServices(currentServices, currentLayers);
        } else if (data.type === 'SET_INCIDENTS') {
          currentIncidents = data.incidents || [];
          if (data.layers) currentLayers = data.layers;
          renderIncidents(currentIncidents, currentLayers);
        } else if (data.type === 'SET_CORRIDOR_SERVICES') {
          renderCorridorServices(data.corridorServices || []);
        } else if (data.type === 'SET_NAV_STATE') {
          isNavigating = !!data.isNavigating;
          followCamera = true;
          if (isNavigating) {
            map.setZoom(17.5);
          } else {
            setMapRotation(0);
          }
        } else if (data.type === 'SET_DRIVER_MODE') {
          if (data.enabled !== undefined) driverModeEnabled = !!data.enabled;
          if (data.autoZoom !== undefined) driverAutoZoomEnabled = !!data.autoZoom;
          if (data.muted !== undefined) isNavMuted = !!data.muted;
        } else if (data.type === 'SPEAK') {
          if (data.text) speakDirectionPrompt(data.text, true);
        } else if (data.type === 'SET_COMPASS_MODE') {
          isHeadsUp = !!data.headsUp;
          if (!isHeadsUp) {
            setMapRotation(0);
            if (currentBearing) setVehicleRotation(currentBearing);
          } else {
            if (currentBearing) setMapRotation(currentBearing);
          }
        } else if (data.type === 'RECENTER') {
          followCamera = true;
          var pos = (data.lat && data.lng) ? [data.lat, data.lng] : (vehicleMarker ? vehicleMarker.getLatLng() : userCoords);
          if (vehicleMarker && data.lat && data.lng) {
            vehicleMarker.setLatLng(pos);
          }
          var targetZoom = isNavigating ? (driverAutoZoomEnabled ? computeDriverAutoZoom(lastRecordedDistToTurn, lastRecordedSpeedKmh) : 17.5) : 15;
          var lookTarget = (driverModeEnabled && isNavigating && currentBearing)
            ? getForwardLookaheadPoint(pos[0], pos[1], currentBearing, lastRecordedSpeedKmh, lastRecordedDistToTurn)
            : pos;
          map.flyTo(lookTarget, targetZoom, { animate: true, duration: 0.5 });
        } else if (data.type === 'INVALIDATE_SIZE') {
          forceCompleteMapRender();
        } else if (data.type === 'SET_ROUTE') {
          if (data.routeCoords && data.routeCoords.length >= 2) {
            routePoints = data.routeCoords;
            currSegmentIdx = 0;
            segProgress = 0;
            coveredMeters = 0;
            totalRouteMeters = 0;
            cumDistances = [0];
            for (var r = 0; r < routePoints.length - 1; r++) {
              var segDist = calcDistanceMeters(routePoints[r], routePoints[r+1]);
              totalRouteMeters += segDist;
              cumDistances.push(totalRouteMeters);
            }

            if (mainRoutePoly) {
              mainRoutePoly.setLatLngs(routePoints);
            } else {
              mainRoutePoly = L.polyline(routePoints, {
                color: '#2563EB',
                weight: 6,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round'
              }).addTo(map);
            }

            if (mainRouteGlow) {
              mainRouteGlow.setLatLngs(routePoints);
            } else {
              mainRouteGlow = L.polyline(routePoints, {
                color: '#1D4ED8',
                weight: 10,
                opacity: 0.35,
                lineCap: 'round',
                lineJoin: 'round'
              }).addTo(map);
            }

            if (passedRoutePoly) {
              passedRoutePoly.setLatLngs([]);
            }

            if (data.altCoords && data.altCoords.length >= 2) {
              if (altRoutePoly) {
                altRoutePoly.setLatLngs(data.altCoords);
              } else {
                altRoutePoly = L.polyline(data.altCoords, {
                  color: '#94A3B8',
                  weight: 5,
                  opacity: 0.7,
                  dashArray: '7, 9',
                  lineCap: 'round',
                  lineJoin: 'round'
                }).addTo(map);
              }
            } else if (altRoutePoly) {
              altRoutePoly.setLatLngs([]);
            }

            if (data.fitBounds && mainRoutePoly) {
              try {
                map.fitBounds(mainRoutePoly.getBounds(), { padding: [50, 50], maxZoom: 16, animate: true });
              } catch(e) {}
            }
          }
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

    window.addEventListener('message', function(e) { handleInboundMessage(e.data); });
    document.addEventListener('message', function(e) { handleInboundMessage(e.data); });
  </script>
</body>
</html>`;
  }, [
    destination?.latitude,
    destination?.longitude,
    destination?.name,
    destinationLabel,
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
            if (services.length > 0) {
              postToMap({ type: 'SET_SERVICES', services, layers });
            }
            if (incidents.length > 0) {
              postToMap({ type: 'SET_INCIDENTS', incidents, layers });
            }
            if (currentLocation) {
              postToMap({
                type: 'GPS_UPDATE',
                lat: currentLocation.latitude,
                lng: currentLocation.longitude,
                heading: currentHeading ?? null,
                speedKmh: currentSpeed ?? 0,
                forceCenter: true,
              });
            }
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
          if (services.length > 0) {
            postToMap({ type: 'SET_SERVICES', services, layers });
          }
          if (incidents.length > 0) {
            postToMap({ type: 'SET_INCIDENTS', incidents, layers });
          }
          if (currentLocation) {
            postToMap({
              type: 'GPS_UPDATE',
              lat: currentLocation.latitude,
              lng: currentLocation.longitude,
              heading: currentHeading ?? null,
              speedKmh: currentSpeed ?? 0,
              forceCenter: true,
            });
          }
          setTimeout(() => {
            webViewRef.current?.postMessage(JSON.stringify({ type: 'INVALIDATE_SIZE' }));
            if (currentLocation) {
              postToMap({
                type: 'GPS_UPDATE',
                lat: currentLocation.latitude,
                lng: currentLocation.longitude,
                heading: currentHeading ?? null,
                speedKmh: currentSpeed ?? 0,
                forceCenter: true,
              });
            }
          }, 350);
        }}
      />
    </View>
  );
};

export const InteractiveMap = React.memo(InteractiveMapComponent);

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
