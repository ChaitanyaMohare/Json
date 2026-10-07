import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
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
          icon: <Ionicons name="checkmark-circle" size={12} color={colors.safetyGreenDark} />,
        };
      case 'Under Verification':
        return {
          bg: colors.cautionAmberSoft,
          color: colors.cautionAmberDark,
          border: '#FDE68A',
          icon: <Feather name="clock" size={11} color={colors.cautionAmberDark} />,
        };
      case 'Resolved':
        return {
          bg: '#F3F4F6',
          color: '#4B5563',
          border: '#E5E7EB',
          icon: <Ionicons name="checkmark-done" size={12} color="#4B5563" />,
        };
      case 'Reported':
      default:
        return {
          bg: colors.navBlueSoft,
          color: colors.navBlueDark,
          border: '#BFDBFE',
          icon: <Feather name="info" size={11} color={colors.navBlueDark} />,
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
      {current.icon}
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
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
