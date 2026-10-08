import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import {
  Incident,
  NearbyService,
  RouteOption,
  MapLayersState,
  RouteCorridorService,
} from '../types';
import { InteractiveMap, NavigationProgressData } from './InteractiveMap';
import { VehicleIconType } from '../data/mockData';

interface MapboxMapProps {
  currentLocation?: { latitude: number; longitude: number };
  currentHeading?: number | null;
  currentSpeed?: number;
  destination?: { latitude?: number; longitude?: number; name?: string };
  selectedRoute?: RouteOption;
  availableRoutes?: RouteOption[];
  showAlternativeRoutes?: boolean;
  alternativeRouteType?: 'safer' | 'current' | 'alternate';
  incidents?: Incident[];
  services?: NearbyService[];
  corridorServices?: RouteCorridorService[];
  layers?: MapLayersState;
  showIncidentHotspot?: boolean;
  onSelectIncident?: (inc: Incident) => void;
  onSelectService?: (srv: NearbyService) => void;
  isMinimalNav?: boolean;
  destinationLabel?: string;
  isNavigating?: boolean;
  isDriving?: boolean;
  simulationSpeed?: number;
  vehicleType?: VehicleIconType;
  recenterTrigger?: number;
  restartTrigger?: number;
  driverMode?: boolean;
  driverAutoZoom?: boolean;
  navigationMuted?: boolean;
  onUserPanned?: () => void;
  onNavigationProgress?: (data: NavigationProgressData) => void;
  onArrived?: () => void;
}

export const MapboxMap: React.FC<MapboxMapProps> = ({
  currentLocation = { latitude: 28.6139, longitude: 77.209 },
  currentHeading = null,
  currentSpeed = 0,
  destination,
  selectedRoute,
  availableRoutes = [],
  showAlternativeRoutes = false,
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
  onSelectIncident,
  onSelectService,
  destinationLabel,
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
}) => {
  const activeDestLabel = destinationLabel || destination?.name || 'Destination';

  // Real primary route coordinates from DirectionsService
  const routeCoords = selectedRoute?.coordinates || [];

  // Automatically find distinct alternative route (Recommended vs Fastest) to display simultaneously on map
  const altRoute = availableRoutes.find((r) => r.id !== selectedRoute?.id) || null;
  const altRouteCoords = showAlternativeRoutes ? altRoute?.coordinates || [] : [];

  return (
    <View style={styles.container}>
      {/* High-Performance 60fps Interactive Map Engine */}
      <InteractiveMap
        currentLocation={currentLocation}
        currentHeading={currentHeading}
        currentSpeed={currentSpeed}
        destination={destination}
        routeCoordinates={routeCoords}
        alternativeRouteCoordinates={altRouteCoords}
        incidents={incidents}
        services={services}
        corridorServices={corridorServices}
        layers={layers}
        showIncidentHotspot={showIncidentHotspot}
        destinationLabel={activeDestLabel}
        isNavigating={isNavigating}
        isDriving={isDriving}
        simulationSpeed={simulationSpeed}
        vehicleType={vehicleType}
        recenterTrigger={recenterTrigger}
        restartTrigger={restartTrigger}
        driverMode={driverMode}
        driverAutoZoom={driverAutoZoom}
        navigationMuted={navigationMuted}
        onUserPanned={onUserPanned}
        onNavigationProgress={onNavigationProgress}
        onArrived={onArrived}
        onSelectIncident={onSelectIncident}
        onSelectService={onSelectService}
      />

      {/* Modern UI Overlays for Navigation */}
      <View style={styles.overlayContainer} pointerEvents="box-none">
        {/* Dynamic Road / Destination Label on Route */}
        {activeDestLabel && !isNavigating ? (
          <View style={styles.roadNamePill}>
            <Text style={styles.roadNameText}>
              Towards {activeDestLabel}
            </Text>
          </View>
        ) : null}

        {/* Alternative Route Info Bubbles */}
        {showAlternativeRoutes && (
          <View style={styles.alternativeBubblesRow}>
            <View style={styles.bubbleCurrent}>
              <Text style={styles.bubbleCurrentDuration}>Recommended</Text>
              <Text style={styles.bubbleCurrentLabel}>Fastest highway</Text>
            </View>
            <View style={styles.bubbleSafer}>
              <Text style={styles.bubbleSaferDuration}>Safer route</Text>
              <Text style={styles.bubbleSaferBadge}>+10 min · High trust</Text>
            </View>
          </View>
        )}
      </View>
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
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roadNamePill: {
    position: 'absolute',
    top: 140,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  roadNameText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  alternativeBubblesRow: {
    position: 'absolute',
    top: 190,
    flexDirection: 'row',
    gap: 12,
  },
  bubbleCurrent: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
  },
  bubbleCurrentDuration: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  bubbleCurrentLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
  bubbleSafer: {
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
  },
  bubbleSaferDuration: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  bubbleSaferBadge: {
    color: '#ECFDF5',
    fontSize: 11,
    fontWeight: '600',
  },
});
