import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface NavigationStatusSheetProps {
  duration: string;
  distance: string;
  arrivalTime: string;
  coveredDistance?: string;
  remainingDistance?: string;
  progress?: number;
  onClose: () => void;
  onSwitchRoute: () => void;
}

export const NavigationStatusSheet: React.FC<NavigationStatusSheetProps> = ({
  duration,
  distance,
  arrivalTime,
  coveredDistance,
  remainingDistance,
  progress = 0,
  onClose,
  onSwitchRoute,
}) => {
  return (
    <View style={styles.container}>
      {/* Live Route Progress Bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%` }]} />
      </View>

      <View style={styles.contentRow}>
        {/* Left Close Navigation Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onClose}
          style={styles.circleBtn}
        >
          <Feather name="x" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        {/* Center ETA, Covered & Remaining Distance Info */}
        <View style={styles.centerInfo}>
          <View style={styles.topStatsRow}>
            <Text style={styles.durationText}>{duration}</Text>
            <View style={styles.etaBadge}>
              <Text style={styles.etaText}>Arrive {arrivalTime}</Text>
            </View>
          </View>

          <View style={styles.distanceStatsRow}>
            <Text style={styles.remainingText}>
              {remainingDistance || distance}
            </Text>
            {coveredDistance ? (
              <>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.coveredText}>{coveredDistance}</Text>
              </>
            ) : null}
          </View>
        </View>

        {/* Right Route Switch / Alternate Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onSwitchRoute}
          style={styles.circleBtn}
        >
          <Ionicons name="swap-vertical" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#E2E8F0',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  centerInfo: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  topStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  durationText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  etaBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  etaText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  distanceStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  remainingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  dotSeparator: {
    fontSize: 12,
    color: '#94A3B8',
  },
  coveredText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
});
