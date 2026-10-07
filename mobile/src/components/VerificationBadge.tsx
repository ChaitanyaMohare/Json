import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VerificationStatus } from '../types';
import { colors } from '../theme/colors';

interface VerificationBadgeProps {
  status: VerificationStatus;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'Confirmed':
        return {
          bg: colors.safetyGreenSoft,
          color: colors.safetyGreenDark,
          border: '#A7F3D0',
          symbol: '✓',
        };
      case 'Under Verification':
        return {
          bg: colors.cautionAmberSoft,
          color: colors.cautionAmberDark,
          border: '#FDE68A',
          symbol: '⏳',
        };
      case 'Resolved':
        return {
          bg: '#F3F4F6',
          color: '#4B5563',
          border: '#E5E7EB',
          symbol: '✓',
        };
      case 'Reported':
      default:
        return {
          bg: colors.navBlueSoft,
          color: colors.navBlueDark,
          border: '#BFDBFE',
          symbol: 'ℹ',
        };
    }
  };

  const current = getBadgeStyle();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: current.bg, borderColor: current.border },
      ]}
    >
      <Text style={[styles.symbol, { color: current.color }]}>{current.symbol}</Text>
      <Text style={[styles.text, { color: current.color }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 4,
  },
  symbol: {
    fontSize: 10,
    fontWeight: '700',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
