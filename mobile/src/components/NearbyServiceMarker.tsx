import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NearbyService } from '../types';
import { colors } from '../theme/colors';

interface NearbyServiceMarkerProps {
  service: NearbyService;
  onPress: (service: NearbyService) => void;
  selected?: boolean;
}

export const NearbyServiceMarker: React.FC<NearbyServiceMarkerProps> = ({
  service,
  onPress,
  selected = false,
}) => {
  const getServiceConfig = () => {
    const sType = service.type || service.category || 'hospital';
    switch (sType) {
      case 'hospital':
        return { icon: '🏥', bg: colors.hospital, label: 'Hospital' };
      case 'police':
        return { icon: '👮', bg: colors.police, label: 'Police' };
      case 'petrol':
      case 'diesel':
      case 'fuel':
        return { icon: '⛽', bg: colors.fuel, label: 'Fuel' };
      case 'cng':
        return { icon: '🌿', bg: colors.cng, label: 'CNG' };
      case 'garage':
      default:
        return { icon: '🔧', bg: colors.garage, label: 'Garage' };
    }
  };

  const config = getServiceConfig();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(service)}
      style={[
        styles.markerContainer,
        selected && styles.selectedContainer,
      ]}
    >
      <View style={[styles.bubble, { backgroundColor: config.bg }]}>
        <Text style={styles.icon}>{config.icon}</Text>
      </View>
      <View style={styles.labelBubble}>
        <Text style={styles.nameText} numberOfLines={1}>
          {service.name.split(' ')[0]}
        </Text>
        <Text style={styles.distanceText}>{service.distance}</Text>
      </View>
      <View style={[styles.pinTail, { borderTopColor: config.bg }]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    position: 'absolute',
  },
  selectedContainer: {
    transform: [{ scale: 1.15 }],
    zIndex: 99,
  },
  bubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  icon: {
    fontSize: 14,
  },
  labelBubble: {
    backgroundColor: 'rgba(13, 21, 39, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
    alignItems: 'center',
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  distanceText: {
    color: '#93C5FD',
    fontSize: 8,
    fontWeight: '600',
  },
  pinTail: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
