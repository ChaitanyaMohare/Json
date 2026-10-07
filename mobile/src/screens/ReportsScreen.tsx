import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { VerificationBadge } from '../components/VerificationBadge';
import { useApp } from '../context/AppContext';
import { IncidentType } from '../types';

interface ReportsScreenProps {
  visible?: boolean;
  onClose?: () => void;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  visible = true,
  onClose,
}) => {
  const { submittedReports } = useApp();

  const getIncidentIcon = (type: IncidentType) => {
    switch (type) {
      case 'accident':
        return <MaterialCommunityIcons name="car-brake-alert" size={20} color="#EF4444" />;
      case 'road_blockage':
        return <MaterialCommunityIcons name="traffic-cone" size={20} color="#F97316" />;
      case 'road_damage':
        return <Feather name="alert-triangle" size={18} color="#F59E0B" />;
      case 'heavy_traffic':
        return <MaterialCommunityIcons name="car-multiple" size={20} color="#2563EB" />;
      case 'flooding':
        return <Feather name="droplet" size={18} color="#06B6D4" />;
      case 'other':
      default:
        return <Feather name="alert-circle" size={18} color="#6B7280" />;
    }
  };

  const content = (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>Your Reports</Text>
        {onClose && <View style={{ width: 40 }} />}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {submittedReports.length === 0 ? (
          <View style={styles.emptyBox}>
            <Feather name="shield" size={40} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No reports submitted yet</Text>
            <Text style={styles.emptySub}>
              When you report road hazards during navigation, they will appear here.
            </Text>
          </View>
        ) : (
          submittedReports.map((inc) => (
            <View key={inc.id} style={styles.card}>
              <View style={styles.headerRow}>
                <View style={styles.iconCircle}>
                  {getIncidentIcon(inc.incidentType)}
                </View>
                <View style={styles.titleCol}>
                  <Text style={styles.incidentTitle}>{inc.title}</Text>
                  <Text style={styles.locationText}>{inc.locationLabel}</Text>
                </View>
              </View>

              {inc.description ? (
                <Text style={styles.descText}>{inc.description}</Text>
              ) : null}

              {inc.geoTag ? (
                <View style={styles.geoTagBadgeRow}>
                  <Ionicons name="location" size={13} color="#15803D" />
                  <Text style={styles.geoTagBadgeText}>
                    Geo-Tagged (±{inc.geoTag.accuracyMeters || 3}m GPS) · {inc.latitude.toFixed(4)}°, {inc.longitude.toFixed(4)}°
                  </Text>
                </View>
              ) : null}

              <View style={styles.badgeRow}>
                <VerificationBadge status={inc.status} />
                <Text style={styles.timeText}>{inc.createdAt}</Text>
              </View>

              <View style={styles.footerRow}>
                <Text style={styles.supportText}>
                  {inc.supportingReports} community verification confirmation{inc.supportingReports !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );

  if (onClose) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        {content}
      </Modal>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  titleCol: {
    flex: 1,
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  locationText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  descText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 10,
    lineHeight: 18,
  },
  geoTagBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  geoTagBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  timeText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  footerRow: {
    marginTop: 8,
  },
  supportText: {
    fontSize: 12,
    color: colors.navBlue,
    fontWeight: '600',
  },
  emptyBox: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
