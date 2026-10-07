import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Incident } from '../types';
import { colors } from '../theme/colors';
import { VerificationBadge } from './VerificationBadge';
import { ReportReliabilityBadge } from './ReportReliabilityBadge';

interface IncidentCardProps {
  incident: Incident;
  onPress?: (incident: Incident) => void;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onPress }) => {
  const getIcon = () => {
    switch (incident.type) {
      case 'accident':
        return '💥';
      case 'road_blockage':
        return '🚧';
      case 'road_damage':
        return '⚠️';
      case 'flooding':
        return '🌊';
      case 'vehicle_breakdown':
        return '🚗';
      default:
        return '⚠️';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.8 : 1}
      onPress={() => onPress && onPress(incident)}
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{getIcon()}</Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {incident.title}
          </Text>
          <Text style={styles.subInfo}>
            {incident.distance} away • {incident.reportedTimeAgo || incident.timeAgo || 'Recent'}
          </Text>
        </View>
      </View>

      {incident.description && (
        <Text style={styles.description} numberOfLines={2}>
          {incident.description}
        </Text>
      )}

      <View style={styles.badgesRow}>
        <VerificationBadge status={incident.verificationStatus || incident.status || 'Reported'} />
        {incident.reliability && (
          <ReportReliabilityBadge
            reliability={incident.reliability}
            confidence={incident.confidence}
          />
        )}
        {incident.upvotes !== undefined && (
          <View style={styles.upvotesChip}>
            <Text style={styles.upvotesText}>👍 {incident.upvotes}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.divider,
    shadowColor: '#0D1527',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  icon: {
    fontSize: 18,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subInfo: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  upvotesChip: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  upvotesText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
