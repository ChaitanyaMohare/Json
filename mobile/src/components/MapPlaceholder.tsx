import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

interface MapPlaceholderProps {
  showRoute?: boolean;
  selectedRouteType?: 'recommended' | 'fastest' | 'alternate';
}

export const MapPlaceholder: React.FC<MapPlaceholderProps> = ({
  showRoute = true,
  selectedRouteType = 'recommended',
}) => {
  return (
    <View style={styles.container}>
      {/* Background road network lines */}
      <View style={styles.gridLine1} />
      <View style={styles.gridLine2} />
      <View style={styles.gridCurve} />
      <View style={styles.parkBlock} />
      <View style={styles.waterFeature} />

      {/* Simulated Route Line */}
      {showRoute && (
        <>
          <View
            style={[
              styles.routeLineMain,
              selectedRouteType === 'recommended'
                ? styles.routeRecommendedColor
                : styles.routeFastestColor,
            ]}
          />
          <View
            style={[
              styles.routeLineBranch,
              selectedRouteType === 'recommended'
                ? styles.routeRecommendedColor
                : styles.routeFastestColor,
            ]}
          />
        </>
      )}

      {/* Current location pin */}
      <View style={styles.currentLocationWrapper}>
        <View style={styles.currentLocationHalo} />
        <View style={styles.currentLocationDot} />
        <View style={styles.locationLabel}>
          <Text style={styles.locationLabelText}>Your location</Text>
        </View>
      </View>

      {/* Destination Pin */}
      <View style={styles.destinationPinWrapper}>
        <Ionicons name="location-sharp" size={32} color={colors.incidentRed} />
        <View style={styles.destPinLabel}>
          <Text style={styles.destPinText}>Dehradun</Text>
        </View>
      </View>

      {/* Subtle Incident Marker */}
      <View style={styles.incidentMarker}>
        <Feather name="alert-triangle" size={16} color="#DC2626" />
      </View>

      {/* Future Mapbox Integration Watermark */}
      <View style={styles.watermark}>
        <Text style={styles.watermarkText}>Waysure Map Engine (Ready for Mapbox SDK)</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  gridLine1: {
    position: 'absolute',
    top: '30%',
    left: -50,
    right: -50,
    height: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    transform: [{ rotate: '12deg' }],
  },
  gridLine2: {
    position: 'absolute',
    top: '60%',
    left: -50,
    right: -50,
    height: 18,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    transform: [{ rotate: '-18deg' }],
  },
  gridCurve: {
    position: 'absolute',
    top: '20%',
    left: width * 0.4,
    width: 22,
    bottom: -50,
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  parkBlock: {
    position: 'absolute',
    top: '15%',
    left: 20,
    width: 110,
    height: 90,
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  waterFeature: {
    position: 'absolute',
    bottom: '12%',
    right: 20,
    width: 140,
    height: 100,
    backgroundColor: '#E1F5FE',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#B3E5FC',
  },
  routeLineMain: {
    position: 'absolute',
    top: '42%',
    left: width * 0.35,
    width: 160,
    height: 6,
    borderRadius: 3,
    transform: [{ rotate: '-35deg' }],
  },
  routeLineBranch: {
    position: 'absolute',
    top: '28%',
    left: width * 0.46,
    width: 140,
    height: 6,
    borderRadius: 3,
    transform: [{ rotate: '20deg' }],
  },
  routeRecommendedColor: {
    backgroundColor: '#10B981',
  },
  routeFastestColor: {
    backgroundColor: '#F59E0B',
  },
  currentLocationWrapper: {
    position: 'absolute',
    top: '52%',
    left: width * 0.32,
    alignItems: 'center',
  },
  currentLocationHalo: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    top: -6,
  },
  currentLocationDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  locationLabel: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  locationLabelText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  destinationPinWrapper: {
    position: 'absolute',
    top: '22%',
    right: width * 0.22,
    alignItems: 'center',
  },
  destPinLabel: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: -4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  destPinText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  incidentMarker: {
    position: 'absolute',
    top: '38%',
    left: width * 0.52,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  watermark: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  watermarkText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
