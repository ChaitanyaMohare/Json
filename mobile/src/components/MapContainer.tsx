import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../theme/colors';
import { Incident, NearbyService } from '../types';
import { IncidentMarker } from './IncidentMarker';
import { NearbyServiceMarker } from './NearbyServiceMarker';
import { MapLayersState } from './MapFilterSheet';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MapContainerProps {
  incidents: Incident[];
  services: NearbyService[];
  layers: MapLayersState;
  onSelectIncident: (inc: Incident) => void;
  onSelectService: (srv: NearbyService) => void;
  selectedIncidentId?: string | null;
  selectedServiceId?: string | null;
  showRoutePolyline?: boolean;
  selectedRouteType?: 'Fastest' | 'Recommended' | null;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  incidents,
  services,
  layers,
  onSelectIncident,
  onSelectService,
  selectedIncidentId,
  selectedServiceId,
  showRoutePolyline = false,
  selectedRouteType = 'Recommended',
}) => {
  const filteredServices = services.filter((srv) => {
    if (srv.type === 'hospital' && !layers.hospitals) return false;
    if (srv.type === 'police' && !layers.police) return false;
    if (srv.type === 'petrol' && !layers.fuel) return false;
    if (srv.type === 'diesel' && !layers.fuel) return false;
    if (srv.type === 'cng' && !layers.cng) return false;
    if (srv.type === 'garage' && !layers.garages) return false;
    return true;
  });

  return (
    <View style={styles.mapContainer}>
      {/* Background Map Simulation: Roads, green spaces, water */}
      <View style={styles.mapBackground}>
        {/* River */}
        <View style={styles.river} />

        {/* Major Arterial Roads */}
        <View style={styles.highwayHorizontal} />
        <View style={styles.highwayVertical} />
        <View style={styles.diagonalRoad1} />
        <View style={styles.diagonalRoad2} />
        <View style={styles.roadRing} />

        {/* City Blocks & Parks */}
        <View style={[styles.park, { top: 90, left: 30, width: 80, height: 70 }]} />
        <View style={[styles.park, { top: 380, right: 40, width: 90, height: 80 }]} />
        <View style={[styles.urbanBlock, { top: 160, right: 30, width: 95, height: 75 }]} />
        <View style={[styles.urbanBlock, { bottom: 210, left: 50, width: 90, height: 60 }]} />

        {/* Route visualization preview when searching */}
        {showRoutePolyline && (
          <>
            {/* Route path glow and line */}
            <View
              style={[
                styles.routePath1,
                selectedRouteType === 'Recommended' ? styles.routeSafeColor : styles.routeFastColor,
              ]}
            />
            <View
              style={[
                styles.routePath2,
                selectedRouteType === 'Recommended' ? styles.routeSafeColor : styles.routeFastColor,
              ]}
            />
            {selectedRouteType === 'Fastest' && (
              <View style={styles.routeCongestionBadge}>
                <Text style={styles.routeBadgeText}>⚠️ Slowdown (8 km/h)</Text>
              </View>
            )}
            {selectedRouteType === 'Recommended' && (
              <View style={styles.routeSafeBadge}>
                <Text style={styles.routeSafeBadgeText}>🛡️ High Trust Route (94)</Text>
              </View>
            )}
          </>
        )}

        {/* Current User Location Marker */}
        <View style={styles.userLocationMarker}>
          <View style={styles.userLocationPulse} />
          <View style={styles.userLocationDot} />
          <View style={styles.userLocationLabel}>
            <Text style={styles.userLocationText}>You (FC Road)</Text>
          </View>
        </View>

        {/* Incident Markers */}
        {layers.incidents &&
          incidents.map((incident, idx) => {
            // Coordinate mock offsets on screen
            const offsets = [
              { top: 220, left: SCREEN_WIDTH * 0.28 },
              { top: 330, right: SCREEN_WIDTH * 0.22 },
              { top: 440, left: SCREEN_WIDTH * 0.45 },
              { top: 180, right: SCREEN_WIDTH * 0.28 },
              { top: 390, left: SCREEN_WIDTH * 0.18 },
            ];
            const pos = offsets[idx % offsets.length];

            return (
              <View key={incident.id} style={[styles.markerWrapper, pos]}>
                <IncidentMarker
                  incident={incident}
                  selected={incident.id === selectedIncidentId}
                  onPress={onSelectIncident}
                />
              </View>
            );
          })}

        {/* Nearby Services Markers */}
        {filteredServices.map((service, idx) => {
          const offsets = [
            { top: 120, right: SCREEN_WIDTH * 0.22 },
            { top: 260, right: SCREEN_WIDTH * 0.12 },
            { top: 290, left: SCREEN_WIDTH * 0.18 },
            { top: 160, left: SCREEN_WIDTH * 0.55 },
            { top: 480, right: SCREEN_WIDTH * 0.35 },
            { top: 420, left: SCREEN_WIDTH * 0.68 },
          ];
          const pos = offsets[idx % offsets.length];

          return (
            <View key={service.id} style={[styles.markerWrapper, pos]}>
              <NearbyServiceMarker
                service={service}
                selected={service.id === selectedServiceId}
                onPress={onSelectService}
              />
            </View>
          );
        })}

        {/* Mapbox Future-Proof Watermark badge */}
        <View style={styles.mockWatermark}>
          <Text style={styles.mockWatermarkText}>Waysure Live Intelligence Map</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#EAEFF5',
    overflow: 'hidden',
  },
  mapBackground: {
    ...StyleSheet.absoluteFill,
  },
  river: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 80,
    width: 32,
    backgroundColor: '#CFE6F8',
    opacity: 0.8,
    transform: [{ rotate: '18deg' }, { skewX: '-10deg' }],
  },
  highwayHorizontal: {
    position: 'absolute',
    top: 280,
    left: -50,
    right: -50,
    height: 18,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#D1DCE8',
  },
  highwayVertical: {
    position: 'absolute',
    top: -50,
    bottom: -50,
    left: SCREEN_WIDTH * 0.42,
    width: 20,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: '#D1DCE8',
  },
  diagonalRoad1: {
    position: 'absolute',
    top: 80,
    left: -50,
    width: SCREEN_WIDTH * 1.4,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    transform: [{ rotate: '32deg' }],
  },
  diagonalRoad2: {
    position: 'absolute',
    top: 360,
    left: -50,
    width: SCREEN_WIDTH * 1.4,
    height: 10,
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    transform: [{ rotate: '-28deg' }],
  },
  roadRing: {
    position: 'absolute',
    top: 240,
    left: SCREEN_WIDTH * 0.3,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 12,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  park: {
    position: 'absolute',
    backgroundColor: '#D9EDDF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C2E2CB',
  },
  urbanBlock: {
    position: 'absolute',
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  markerWrapper: {
    position: 'absolute',
    zIndex: 10,
  },
  userLocationMarker: {
    position: 'absolute',
    top: 280,
    left: SCREEN_WIDTH * 0.42 - 4,
    alignItems: 'center',
    zIndex: 30,
  },
  userLocationPulse: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    top: -8,
  },
  userLocationDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.navBlue,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  userLocationLabel: {
    backgroundColor: 'rgba(13, 21, 39, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 4,
  },
  userLocationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  routePath1: {
    position: 'absolute',
    top: 285,
    left: SCREEN_WIDTH * 0.42,
    width: 130,
    height: 8,
    borderRadius: 4,
    transform: [{ rotate: '25deg' }],
    zIndex: 15,
  },
  routePath2: {
    position: 'absolute',
    top: 330,
    left: SCREEN_WIDTH * 0.52,
    width: 140,
    height: 8,
    borderRadius: 4,
    transform: [{ rotate: '-35deg' }],
    zIndex: 15,
  },
  routeSafeColor: {
    backgroundColor: colors.safetyGreen,
    shadowColor: colors.safetyGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  routeFastColor: {
    backgroundColor: colors.cautionAmber,
    shadowColor: colors.cautionAmber,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  routeCongestionBadge: {
    position: 'absolute',
    top: 310,
    left: SCREEN_WIDTH * 0.55,
    backgroundColor: colors.incidentRedSoft,
    borderColor: colors.incidentRed,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 20,
  },
  routeBadgeText: {
    color: colors.incidentRedDark,
    fontSize: 10,
    fontWeight: '800',
  },
  routeSafeBadge: {
    position: 'absolute',
    top: 310,
    left: SCREEN_WIDTH * 0.52,
    backgroundColor: colors.safetyGreenSoft,
    borderColor: colors.safetyGreen,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 20,
  },
  routeSafeBadgeText: {
    color: colors.safetyGreenDark,
    fontSize: 10,
    fontWeight: '800',
  },
  mockWatermark: {
    position: 'absolute',
    bottom: 95,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.6)',
  },
  mockWatermarkText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
});
