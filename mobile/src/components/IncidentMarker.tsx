import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Incident } from '../types';
import { colors } from '../theme/colors';

interface IncidentMarkerProps {
  incident: Incident;
  onPress: (incident: Incident) => void;
  selected?: boolean;
}

export const IncidentMarker: React.FC<IncidentMarkerProps> = ({
  incident,
  onPress,
  selected = false,
}) => {
  const getIncidentIcon = () => {
    switch (incident.type) {
      case 'accident':
        return '💥';
      case 'road_blockage':
        return '🚧';
      case 'road_damage':
        return '⚠️';
      case 'flooding':
        return '🌊';
      case 'vehicle_breakdown':
        return '🚗';
      default:
        return '⚠️';
    }
  };

  const getSeverityColor = () => {
    switch (incident.severity) {
      case 'High':
        return colors.incidentRed;
      case 'Medium':
        return colors.cautionAmber;
      case 'Low':
      default:
        return '#64748B';
    }
  };

  const sevColor = getSeverityColor();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(incident)}
      style={[
        styles.container,
        selected && styles.selectedContainer,
      ]}
    >
      <View style={[styles.halo, { borderColor: sevColor }]} />
      <View style={[styles.pin, { backgroundColor: sevColor }]}>
        <Text style={styles.icon}>{getIncidentIcon()}</Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.distanceText}>{incident.distance}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'absolute',
  },
  selectedContainer: {
    transform: [{ scale: 1.2 }],
    zIndex: 100,
  },
  halo: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    opacity: 0.35,
    top: -4,
  },
  pin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  icon: {
    fontSize: 16,
  },
  badge: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginTop: 2,
  },
  distanceText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});
