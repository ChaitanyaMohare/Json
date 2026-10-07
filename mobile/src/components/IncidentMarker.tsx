import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
  const renderIcon = () => {
    switch (incident.type) {
      case 'accident':
        return <MaterialCommunityIcons name="car-brake-alert" size={14} color="#FFFFFF" />;
      case 'road_blockage':
        return <MaterialCommunityIcons name="traffic-cone" size={14} color="#FFFFFF" />;
      case 'road_damage':
        return <Feather name="alert-triangle" size={12} color="#FFFFFF" />;
      case 'flooding':
        return <Ionicons name="water-outline" size={14} color="#FFFFFF" />;
      case 'heavy_traffic':
        return <MaterialCommunityIcons name="car-multiple" size={14} color="#FFFFFF" />;
      default:
        return <Feather name="alert-triangle" size={12} color="#FFFFFF" />;
    }
  };

  const getMarkerColor = () => {
    if (incident.severity === 'High') return colors.incidentRed;
    if (incident.severity === 'Medium') return colors.cautionAmber;
    return colors.navBlue;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(incident)}
      style={[styles.container, selected && styles.containerSelected]}
    >
      <View style={[styles.halo, { backgroundColor: getMarkerColor() + '33' }]} />
      <View style={[styles.pin, { backgroundColor: getMarkerColor() }]}>
        {renderIcon()}
      </View>
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
  halo: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  pin: {
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
