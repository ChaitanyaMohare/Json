import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { MapPlaceholder } from '../components/MapPlaceholder';
import { RouteOption } from '../types';

interface NavigationScreenProps {
  route: RouteOption;
  onEndNavigation: () => void;
  onReportPress: () => void;
}

export const NavigationScreen: React.FC<NavigationScreenProps> = ({
  route,
  onEndNavigation,
  onReportPress,
}) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Map visualization */}
      <MapPlaceholder selectedRouteType={route.type} />

      {/* Top Turn-by-Turn Instruction Banner matching clean reference card style */}
      <SafeAreaView style={styles.topSafeArea}>
        <View style={styles.turnCard}>
          <View style={styles.turnIconWrapper}>
            <Ionicons name="arrow-forward-sharp" size={28} color="#FFFFFF" />
          </View>
          <View style={styles.turnInfo}>
            <Text style={styles.turnDistance}>In 300 m</Text>
            <Text style={styles.turnInstruction}>Turn right onto Rajpur Road</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Bottom Floating Navigation HUD */}
      <View style={styles.bottomHud}>
        <View style={styles.hudCard}>
          <View style={styles.hudHeader}>
            <View>
              <Text style={styles.etaText}>{route.duration}</Text>
              <Text style={styles.subEtaText}>
                {route.distance} • Arrival at 11:45 AM
              </Text>
            </View>

            <View style={styles.trustBadge}>
              <Ionicons name="shield-checkmark" size={16} color={colors.safetyGreen} />
              <Text style={styles.trustText}>{route.trustScore} Trust</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={onReportPress}
              style={styles.hazardBtn}
              activeOpacity={0.8}
            >
              <Feather name="alert-triangle" size={16} color={colors.textPrimary} />
              <Text style={styles.hazardBtnText}>Report Hazard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onEndNavigation}
              style={styles.endBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.endBtnText}>End Navigation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  topSafeArea: {
    paddingHorizontal: 20,
    paddingTop: 12,
    zIndex: 20,
  },
  turnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
    borderRadius: 22,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  turnIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  turnInfo: {
    flex: 1,
  },
  turnDistance: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  turnInstruction: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    fontWeight: '500',
  },
  bottomHud: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    zIndex: 20,
  },
  hudCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  hudHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  etaText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subEtaText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.safetyGreenSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  trustText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.safetyGreen,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F3F5',
    marginVertical: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  hazardBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F3F5',
    height: 48,
    borderRadius: 16,
    gap: 6,
  },
  hazardBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  endBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.incidentRed,
    height: 48,
    borderRadius: 16,
  },
  endBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
