import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { NearbyService } from '../types';
import { colors } from '../theme/colors';

interface NearbyServiceCardProps {
  service: NearbyService;
  onPress: () => void;
}

export const NearbyServiceCard: React.FC<NearbyServiceCardProps> = ({
  service,
  onPress,
}) => {
  const getIcon = () => {
    switch (service.category) {
      case 'hospital':
        return <Ionicons name="medical" size={20} color={colors.incidentRed} />;
      case 'police':
        return <Ionicons name="shield" size={20} color="#2563EB" />;
      case 'fuel':
        return <Ionicons name="color-filter" size={20} color="#D97706" />;
      case 'cng':
        return <Ionicons name="leaf" size={20} color={colors.safetyGreen} />;
      case 'garage':
        return <Feather name="tool" size={18} color="#7C3AED" />;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.iconContainer}>{getIcon()}</View>
      <View style={styles.textContainer}>
        <Text style={styles.name}>{service.name}</Text>
        <Text style={styles.status}>{service.status}</Text>
      </View>
      <View style={styles.distanceBadge}>
        <Text style={styles.distanceText}>{service.distance}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F3F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  status: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  distanceBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
