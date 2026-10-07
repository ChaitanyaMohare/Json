import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

interface SlowdownAlertProps {
  title?: string;
  previousSpeed?: number;
  currentSpeed?: number;
  message?: string;
  nearbyIncident?: string;
  onViewIncident?: () => void;
  onFindSaferRoute?: () => void;
  onDismiss: () => void;
}

export const SlowdownAlert: React.FC<SlowdownAlertProps> = ({
  title = 'Unusual Slowdown Detected',
  previousSpeed = 45,
  currentSpeed = 8,
  message = 'Traffic speed has dropped significantly in this area.',
  nearbyIncident = 'Road blockage reported 600 m ahead',
  onViewIncident,
  onFindSaferRoute,
  onDismiss,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>📉</Text>
        </View>
        <View style={styles.headerTitles}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.signalBadge}>AI ROAD SIGNAL</Text>
        </View>
        <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn}>
          <Text style={styles.dismissIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.messageText}>{message}</Text>

      {/* Speed Metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Previous Speed</Text>
          <Text style={styles.previousSpeedValue}>{previousSpeed} km/h</Text>
        </View>

        <Text style={styles.arrowIcon}>➔</Text>

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Current Speed</Text>
          <Text style={styles.currentSpeedValue}>{currentSpeed} km/h</Text>
        </View>
      </View>

      {/* Nearby incident signal */}
      <View style={styles.incidentNotice}>
        <Text style={styles.incidentNoticeIcon}>🚧</Text>
        <Text style={styles.incidentNoticeText}>{nearbyIncident}</Text>
      </View>

      <Text style={styles.disclaimerText}>
        * Slowdown is not automatically assumed to be an accident.
      </Text>

      <View style={styles.buttonsRow}>
        <TouchableOpacity
          onPress={onDismiss}
          style={styles.dismissActionBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.dismissActionText}>Dismiss</Text>
        </TouchableOpacity>

        {onViewIncident && (
          <TouchableOpacity
            onPress={onViewIncident}
            style={styles.viewIncidentBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.viewIncidentText}>View Incident</Text>
          </TouchableOpacity>
        )}

        {onFindSaferRoute && (
          <TouchableOpacity
            onPress={onFindSaferRoute}
            style={styles.saferRouteBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.saferRouteText}>Reroute</Text>
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
    borderColor: '#FDE68A',
    shadowColor: colors.cautionAmber,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.cautionAmberSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  icon: {
    fontSize: 18,
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.navyDark,
  },
  signalBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.cautionAmberDark,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  dismissBtn: {
    padding: 4,
  },
  dismissIcon: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  messageText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  metricsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
  },
  metricBox: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 2,
  },
  previousSpeedValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  arrowIcon: {
    fontSize: 16,
    color: colors.cautionAmber,
  },
  currentSpeedValue: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.incidentRed,
  },
  incidentNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cautionAmberSoft,
    padding: 10,
    borderRadius: 12,
    gap: 8,
    marginBottom: 6,
  },
  incidentNoticeIcon: {
    fontSize: 16,
  },
  incidentNoticeText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: colors.cautionAmberDark,
  },
  disclaimerText: {
    fontSize: 10,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dismissActionBtn: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  viewIncidentBtn: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewIncidentText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  saferRouteBtn: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.navBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saferRouteText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
