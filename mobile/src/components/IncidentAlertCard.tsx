import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Incident } from '../types';
import { colors } from '../theme/colors';

interface IncidentAlertCardProps {
  incident: Incident;
  onDismiss: () => void;
  onFindSaferRoute: () => void;
}

export const IncidentAlertCard: React.FC<IncidentAlertCardProps> = ({
  incident,
  onDismiss,
  onFindSaferRoute,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="car-brake-alert" size={22} color="#EF4444" />
        </View>
        <View style={styles.titleInfo}>
          <Text style={styles.title}>{incident.title}</Text>
          <Text style={styles.location}>{incident.location}</Text>
        </View>
        <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn}>
          <Feather name="x" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.desc}>
        {incident.description || 'Hazard reported on current navigation route.'}
      </Text>

      <View style={styles.actionRow}>
        <TouchableOpacity onPress={onDismiss} style={styles.secondaryBtn}>
          <Text style={styles.secondaryText}>Keep Route</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onFindSaferRoute} style={styles.primaryBtn}>
          <Text style={styles.primaryText}>Find Safer Route</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  titleInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  location: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  dismissBtn: {
    padding: 4,
  },
  desc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  primaryBtn: {
    flex: 1.2,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#0E131F',
    alignItems: 'center',
  },
  primaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
