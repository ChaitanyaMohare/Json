import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RouteOption } from '../types';
import { colors } from '../theme/colors';

interface RouteCardProps {
  route: RouteOption;
  selected: boolean;
  onSelect: () => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  route,
  selected,
  onSelect,
}) => {
  const renderIcon = () => {
    switch (route.type) {
      case 'recommended':
        return (
          <View style={styles.shieldWrapper}>
            <Ionicons name="shield-checkmark" size={28} color={colors.safetyGreen} />
          </View>
        );
      case 'fastest':
        return (
          <View style={styles.vehicleIconWrapper}>
            <Ionicons name="car-outline" size={26} color={colors.textPrimary} />
          </View>
        );
      case 'alternate':
        return (
          <View style={styles.vehicleIconWrapper}>
            <MaterialCommunityIcons name="compass-outline" size={26} color={colors.textPrimary} />
          </View>
        );
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onSelect}
      style={[
        styles.card,
        selected ? styles.selectedCard : styles.unselectedCard,
      ]}
    >
      {/* Left Icon (Shield for recommended, vehicle for others) */}
      <View style={styles.iconColumn}>{renderIcon()}</View>

      {/* Center Details */}
      <View style={styles.infoColumn}>
        <Text style={styles.routeName}>{route.name}</Text>
        <Text style={styles.durationText}>{route.duration}</Text>
        <Text style={styles.metaText}>
          {route.distance} • {route.tagline}
        </Text>
      </View>

      {/* Right Radio Indicator */}
      <View style={styles.radioColumn}>
        {selected ? (
          <View style={styles.radioSelectedOuter}>
            <View style={styles.radioSelectedInner} />
          </View>
        ) : (
          <View style={styles.radioUnselected} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1.5,
  },
  unselectedCard: {
    borderColor: '#F1F3F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  selectedCard: {
    borderColor: colors.routeBlueBorder, // Blue outline matching reference screen 3
    backgroundColor: '#FFFFFF',
    shadowColor: colors.routeBlueBorder,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  iconColumn: {
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoColumn: {
    flex: 1,
  },
  routeName: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 3,
  },
  durationText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  radioColumn: {
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioUnselected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.8,
    borderColor: '#D1D5DB',
  },
  radioSelectedOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.activeRadioBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelectedInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.activeRadioBlue,
  },
});
