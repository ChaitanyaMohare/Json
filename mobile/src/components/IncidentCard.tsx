import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Incident } from '../types';
import { colors } from '../theme/colors';
import { VerificationBadge } from './VerificationBadge';
import { ReportReliabilityBadge } from './ReportReliabilityBadge';

interface IncidentCardProps {
  incident: Incident;
  onPress?: (incident: Incident) => void;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onPress }) => {
  const renderIcon = () => {
    switch (incident.type) {
      case 'accident':
        return <MaterialCommunityIcons name="car-brake-alert" size={22} color="#EF4444" />;
      case 'road_blockage':
        return <MaterialCommunityIcons name="traffic-cone" size={22} color="#F97316" />;
      case 'road_damage':
        return <Feather name="alert-triangle" size={20} color="#F59E0B" />;
      case 'flooding':
        return <Ionicons name="water-outline" size={22} color="#06B6D4" />;
      case 'heavy_traffic':
        return <MaterialCommunityIcons name="car-multiple" size={22} color="#2563EB" />;
      default:
        return <Feather name="alert-triangle" size={20} color="#EF4444" />;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.8 : 1}
      onPress={() => onPress && onPress(incident)}
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <View style={styles.iconContainer}>{renderIcon()}</View>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {incident.title}
          </Text>
          <Text style={styles.subInfo}>
            {incident.distance} away • {incident.timeAgo || 'Recent'}
          </Text>
        </View>
      </View>

      {incident.description && (
        <Text style={styles.description} numberOfLines={2}>
          {incident.description}
        </Text>
      )}

      <View style={styles.badgesRow}>
        <VerificationBadge status={incident.status || 'Reported'} />
        {incident.supportingReports !== undefined && (
          <View style={styles.upvotesChip}>
            <Feather name="check" size={12} color={colors.textSecondary} />
            <Text style={styles.upvotesText}>{incident.supportingReports} reports</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  subInfo: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
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
    gap: 8,
  },
  upvotesChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  upvotesText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
