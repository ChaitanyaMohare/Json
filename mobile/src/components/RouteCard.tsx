import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { RouteOption } from '../types';

interface RouteCardProps {
  route: RouteOption;
  selected: boolean;
  onSelect: (route: RouteOption) => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  route,
  selected,
  onSelect,
}) => {
  const isRecommended = route.type === 'recommended';
  const isFastest = route.type === 'fastest';

  const renderIcon = () => {
    if (isRecommended) {
      return (
        <View style={styles.greenShieldPill}>
          <Ionicons name="shield-checkmark" size={18} color="#10B981" />
        </View>
      );
    }
    const modeIconName =
      route.travelMode === 'walk'
        ? 'walk'
        : route.travelMode === 'bike'
        ? 'bicycle'
        : 'car';

    if (isFastest) {
      return (
        <View style={styles.grayIconPill}>
          <Ionicons name={modeIconName as any} size={18} color="#D97706" />
        </View>
      );
    }
    return (
      <View style={styles.grayIconPill}>
        <Ionicons name={modeIconName as any} size={18} color={colors.textPrimary} />
      </View>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onSelect(route)}
      style={[
        styles.card,
        selected && styles.cardSelected,
        isRecommended && selected && styles.cardRecommendedSelected,
      ]}
    >
      {/* Left Icon Pill */}
      {renderIcon()}

      {/* Middle Text Info */}
      <View style={styles.contentCol}>
        <View style={styles.titleRow}>
          <Text style={styles.categoryTitle}>
            {route.type === 'recommended' && (route.name === 'Recommended' || route.name === 'Recommended Route')
              ? 'Safest Route'
              : route.name}
          </Text>
          {isFastest && (
            <View style={styles.badgeFastest}>
              <Ionicons name="flash" size={10} color="#2563EB" />
              <Text style={styles.badgeFastestText}>FASTEST</Text>
            </View>
          )}
          {isRecommended && (
            <View style={styles.badgeRecommended}>
              <Ionicons name="star" size={10} color="#16A34A" />
              <Text style={styles.badgeRecommendedText}>BEST</Text>
            </View>
          )}
        </View>

        <View style={styles.durationRow}>
          <Text style={styles.durationText}>{route.duration}</Text>
          {route.arrivalTime && (
            <Text style={styles.arrivalText}>· Arr {route.arrivalTime}</Text>
          )}
        </View>

        <Text style={styles.taglineText}>
          {route.distance} · {route.tagline}
        </Text>
      </View>

      {/* Right Radio Indicator */}
      <View style={styles.radioWrapper}>
        <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
          {selected && <View style={styles.radioInner} />}
        </View>
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
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  cardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#FFFFFF',
  },
  cardRecommendedSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#F8FAFF',
  },
  greenShieldPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  grayIconPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  contentCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  badgeFastest: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  badgeFastestText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
  },
  badgeRecommended: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  badgeRecommendedText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 3,
  },
  durationText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  arrivalText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  taglineText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  radioWrapper: {
    marginLeft: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#2563EB',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
});
