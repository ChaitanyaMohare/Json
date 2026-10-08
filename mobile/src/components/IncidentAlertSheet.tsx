import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Incident } from '../types';

interface IncidentAlertSheetProps {
  visible: boolean;
  incident?: Incident | null;
  distanceText?: string;
  onKeepRoute: () => void;
  onViewSaferRoute: () => void;
  onClose: () => void;
}

export const IncidentAlertSheet: React.FC<IncidentAlertSheetProps> = ({
  visible,
  incident,
  distanceText,
  onKeepRoute,
  onViewSaferRoute,
  onClose,
}) => {
  if (!visible) return null;

  const title = incident?.title ? `${incident.title} Ahead` : 'Hazard Ahead';
  const displayDist = distanceText || incident?.distance || 'Ahead on route';
  const location = incident?.location || 'Active Route';
  const severity = incident?.severity || 'Caution';
  const desc = incident?.description || 'Active road hazard reported by rider.';
  const photoUri = incident?.photoUri || (incident?.photos && incident.photos[0] ? incident.photos[0].uri : null);

  return (
    <View style={styles.sheetOverlay}>
      <View style={styles.sheetContainer}>
        {/* Top Header Row with Icon, Title, and Close */}
        <View style={styles.headerRow}>
          <View style={styles.crashIconBadge}>
            <MaterialCommunityIcons name="car-brake-alert" size={24} color="#EF4444" />
          </View>
          <View style={styles.titleCol}>
            <Text style={styles.titleText}>{title}</Text>
            <Text style={styles.subtitleText}>{displayDist} · {location}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onClose}
            style={styles.closeBtn}
          >
            <Feather name="x" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Severity Badge & Distance Pill */}
        <View style={styles.badgeRow}>
          <View style={styles.severityBadge}>
            <Text style={styles.severityText}>{severity} Severity</Text>
          </View>
          <View style={styles.distanceBadge}>
            <Ionicons name="navigate" size={12} color="#2563EB" />
            <Text style={styles.distanceBadgeText}>{displayDist}</Text>
          </View>
        </View>

        {/* Optional Incident Photo */}
        {photoUri && (
          <Image
            source={{ uri: photoUri }}
            style={styles.incidentPhoto}
            resizeMode="cover"
          />
        )}

        {/* Incident Description */}
        <Text style={styles.descriptionText}>
          {desc}
        </Text>

        {/* Action Buttons: Keep Route vs View Safer Route */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onKeepRoute}
            style={styles.keepRouteBtn}
          >
            <Text style={styles.keepRouteText}>Keep Route</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onViewSaferRoute}
            style={styles.saferRouteBtn}
          >
            <Text style={styles.saferRouteText}>View Safer Route</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sheetOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 99,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingBottom: 28,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  crashIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  titleCol: {
    flex: 1,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  subtitleText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  severityBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  severityText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  distanceBadgeText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
  incidentPhoto: {
    width: '100%',
    height: 140,
    borderRadius: 14,
    marginBottom: 12,
    backgroundColor: '#F1F5F9',
  },
  descriptionText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  keepRouteBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepRouteText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  saferRouteBtn: {
    flex: 1.2,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0E131F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saferRouteText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
