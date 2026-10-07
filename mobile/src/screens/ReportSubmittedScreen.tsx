import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { PrimaryButton } from '../components/PrimaryButton';

interface ReportSubmittedScreenProps {
  onContinueNavigation: () => void;
  onViewRewards?: () => void;
}

export const ReportSubmittedScreen: React.FC<ReportSubmittedScreenProps> = ({
  onContinueNavigation,
  onViewRewards,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Large Green Checkmark Badge */}
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={38} color="#FFFFFF" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Report Submitted</Text>

        {/* Geo-Tag Verification Indicator */}
        <View style={styles.geoTagVerifiedPill}>
          <Ionicons name="shield-checkmark" size={16} color="#15803D" />
          <Text style={styles.geoTagVerifiedText}>GPS Geo-Tagged & Verified Telemetry</Text>
        </View>

        {/* REWARD ESTIMATION CARD matching RouteGuard Safety Coin System */}
        <View style={styles.rewardEstimateCard}>
          <View style={styles.rewardCardHeader}>
            <View style={styles.rewardIconBadge}>
              <Text style={styles.rewardCoinEmoji}>🪙</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rewardCardTitle}>Safety Coin Pool Reward</Text>
              <Text style={styles.rewardCardSubtitle}>Proportional Pool Distribution</Text>
            </View>
            <View style={styles.rewardScoreBadge}>
              <Text style={styles.rewardScoreText}>75 Score</Text>
            </View>
          </View>

          {/* Breakdown Chips */}
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownChip}>
              <Text style={styles.breakdownChipLabel}>1st Alert: <Text style={{ fontWeight: '800' }}>+50p</Text></Text>
            </View>
            <View style={styles.breakdownChip}>
              <Text style={styles.breakdownChipLabel}>Photo Evid: <Text style={{ fontWeight: '800' }}>+10p</Text></Text>
            </View>
            <View style={styles.breakdownChip}>
              <Text style={styles.breakdownChipLabel}>GPS &lt;10m: <Text style={{ fontWeight: '800' }}>+15p</Text></Text>
            </View>
          </View>

          <View style={styles.estimatedPayoutRow}>
            <Text style={styles.estimatedPayoutText}>Estimated Reward:</Text>
            <Text style={styles.estimatedCoinsValue}>+50 to +200 Coins</Text>
          </View>
        </View>

        {/* 3 Line Message */}
        <Text style={styles.message}>
          Thank you! Your verified report will be credited with Safety Coins once community and AI validation completes.
        </Text>
      </View>

      {/* Bottom CTAs */}
      <View style={styles.bottomBar}>
        {onViewRewards && (
          <TouchableOpacity
            style={styles.rewardsWalletBtn}
            onPress={onViewRewards}
            activeOpacity={0.8}
          >
            <Text style={styles.rewardsWalletBtnIcon}>🪙</Text>
            <Text style={styles.rewardsWalletBtnText}>View Safety Wallet & Store</Text>
          </TouchableOpacity>
        )}

        <PrimaryButton
          title="Continue Navigation"
          onPress={onContinueNavigation}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  checkCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 10,
    textAlign: 'center',
  },
  geoTagVerifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  geoTagVerifiedText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '700',
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
    marginTop: 14,
  },
  rewardEstimateCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 6,
  },
  rewardCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rewardCoinEmoji: {
    fontSize: 18,
  },
  rewardCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  rewardCardSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  rewardScoreBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  rewardScoreText: {
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '800',
  },
  breakdownRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  breakdownChip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  breakdownChipLabel: {
    fontSize: 10,
    color: '#334155',
  },
  estimatedPayoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  estimatedPayoutText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  estimatedCoinsValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#059669',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 12,
    gap: 10,
  },
  rewardsWalletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  rewardsWalletBtnIcon: {
    fontSize: 16,
  },
  rewardsWalletBtnText: {
    color: '#FCD34D',
    fontSize: 14,
    fontWeight: '800',
  },
});
