import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { VerificationBadge } from './VerificationBadge';
import { PrimaryButton } from './PrimaryButton';

interface IncidentAlertCardProps {
  title?: string;
  distance?: string;
  severity?: 'High' | 'Medium' | 'Low';
  confidence?: number;
  status?: 'Confirmed' | 'Under Verification' | 'Reported' | 'Resolved';
  onView?: () => void;
  onFindSaferRoute?: () => void;
  onDismiss?: () => void;
}

export const IncidentAlertCard: React.FC<IncidentAlertCardProps> = ({
  title = 'Accident Ahead',
  distance = '1.4 km away',
  severity = 'High',
  confidence = 92,
  status = 'Confirmed',
  onView,
  onFindSaferRoute,
  onDismiss,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.alertIconBadge}>
          <Text style={styles.alertIcon}>⚠️</Text>
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.distance}>{distance}</Text>
        </View>

        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn}>
            <Text style={styles.dismissText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Severity</Text>
          <View style={styles.severityPill}>
            <View style={[styles.sevDot, { backgroundColor: colors.incidentRed }]} />
            <Text style={styles.sevText}>{severity}</Text>
          </View>
        </View>

        <View style={styles.metaDivider} />

        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Confidence</Text>
          <Text style={styles.confidenceText}>{confidence}%</Text>
        </View>

        <View style={styles.metaDivider} />

        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Status</Text>
          <VerificationBadge status={status} />
        </View>
      </View>

      <View style={styles.actionRow}>
        {onView && (
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={onView}
            activeOpacity={0.7}
          >
            <Text style={styles.viewBtnText}>View</Text>
          </TouchableOpacity>
        )}
        {onFindSaferRoute && (
          <TouchableOpacity
            style={styles.saferRouteBtn}
            onPress={onFindSaferRoute}
            activeOpacity={0.8}
          >
            <Text style={styles.saferRouteBtnText}>🛡️ Find Safer Route</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    shadowColor: colors.incidentRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.incidentRedSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertIcon: {
    fontSize: 20,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.incidentRedDark,
  },
  distance: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  dismissBtn: {
    padding: 6,
  },
  dismissText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  severityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sevDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sevText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.incidentRedDark,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.navyDark,
  },
  metaDivider: {
    width: 1,
    height: 22,
    backgroundColor: colors.divider,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  viewBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  saferRouteBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.navBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saferRouteBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textWhite,
  },
});
