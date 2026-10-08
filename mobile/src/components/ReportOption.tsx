import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { IncidentType } from '../types';
import { colors } from '../theme/colors';

interface ReportOptionProps {
  type: IncidentType;
  title: string;
  selected?: boolean;
  onSelect: (type: IncidentType) => void;
}

export const ReportOption: React.FC<ReportOptionProps> = ({
  type,
  title,
  selected = false,
  onSelect,
}) => {
  const getIconAndBg = () => {
    switch (type) {
      case 'accident':
        return {
          bg: '#FEF2F2',
          border: '#FECACA',
          icon: <MaterialCommunityIcons name="car-brake-alert" size={28} color="#EF4444" />,
        };
      case 'road_blockage':
        return {
          bg: '#FFF7ED',
          border: '#FED7AA',
          icon: <MaterialCommunityIcons name="traffic-cone" size={28} color="#F97316" />,
        };
      case 'road_damage':
        return {
          bg: '#FEF3C7',
          border: '#FDE68A',
          icon: <Feather name="alert-triangle" size={26} color="#F59E0B" />,
        };
      case 'heavy_traffic':
        return {
          bg: '#EFF6FF',
          border: '#BFDBFE',
          icon: <MaterialCommunityIcons name="car-multiple" size={28} color="#2563EB" />,
        };
      case 'flooding':
        return {
          bg: '#ECFEFF',
          border: '#A5F3FC',
          icon: <Ionicons name="water-outline" size={28} color="#06B6D4" />,
        };
      case 'other':
      default:
        return {
          bg: '#F3F4F6',
          border: '#E5E7EB',
          icon: <Feather name="more-horizontal" size={26} color="#6B7280" />,
        };
    }
  };

  const { bg, border, icon } = getIconAndBg();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onSelect(type)}
      style={[
        styles.card,
        { backgroundColor: bg, borderColor: selected ? '#0E131F' : border },
        selected && styles.cardSelected,
      ]}
    >
      <View style={styles.iconWrapper}>{icon}</View>
      <Text style={styles.titleText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '30%',
    aspectRatio: 0.95,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginBottom: 14,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#0E131F',
    transform: [{ scale: 1.02 }],
  },
  iconWrapper: {
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
