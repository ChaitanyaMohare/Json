import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ReliabilityConfidence } from '../types';
import { colors } from '../theme/colors';

interface ReportReliabilityBadgeProps {
  reliability: ReliabilityConfidence;
  confidence?: number;
}

export const ReportReliabilityBadge: React.FC<ReportReliabilityBadgeProps> = ({
  reliability,
  confidence,
}) => {
  const getConfig = () => {
    switch (reliability) {
      case 'High Confidence':
        return {
          bg: colors.safetyGreenSoft,
          color: colors.safetyGreenDark,
          border: '#A7F3D0',
          dot: colors.safetyGreen,
        };
      case 'Needs Verification':
        return {
          bg: colors.cautionAmberSoft,
          color: colors.cautionAmberDark,
          border: '#FDE68A',
          dot: colors.cautionAmber,
        };
      case 'Suspicious':
        return {
          bg: colors.incidentRedSoft,
          color: colors.incidentRedDark,
          border: '#FECACA',
          dot: colors.incidentRed,
        };
    }
  };

  const config = getConfig();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg, borderColor: config.border },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.dot }]} />
      <Text style={[styles.text, { color: config.color }]}>
        {reliability}
        {confidence ? ` (${confidence}%)` : ''}
      </Text>
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
    gap: 5,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
