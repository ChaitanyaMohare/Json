import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
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
  const getIconAndBg = () => {
    switch (service.category || service.type) {
      case 'hospital':
        return {
          icon: <MaterialCommunityIcons name="hospital-box" size={14} color="#FFFFFF" />,
          bg: colors.hospital,
        };
      case 'police':
        return {
          icon: <MaterialCommunityIcons name="shield-account" size={14} color="#FFFFFF" />,
          bg: colors.police,
        };
      case 'petrol':
      case 'diesel':
      case 'fuel':
        return {
          icon: <MaterialCommunityIcons name="gas-station" size={14} color="#FFFFFF" />,
          bg: colors.fuel,
        };
      case 'cng':
        return {
          icon: <Ionicons name="leaf-outline" size={14} color="#FFFFFF" />,
          bg: colors.cng,
        };
      case 'garage':
      default:
        return {
          icon: <MaterialCommunityIcons name="wrench" size={14} color="#FFFFFF" />,
          bg: colors.garage,
        };
    }
  };

  const { icon, bg } = getIconAndBg();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(service)}
      style={[styles.container, selected && styles.containerSelected]}
    >
      <View style={[styles.circle, { backgroundColor: bg }]}>{icon}</View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerSelected: {
    transform: [{ scale: 1.2 }],
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    elevation: 3,
  },
});
