import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { PrimaryButton } from '../components/PrimaryButton';
import { GeoTaggedPhotoModal } from '../components/GeoTaggedPhotoModal';
import { useApp } from '../context/AppContext';
import { GeoTaggedPhoto } from '../types';

interface ReportSubmittedScreenProps {
  onContinueNavigation: () => void;
  onViewRewards?: () => void;
}

export const ReportSubmittedScreen: React.FC<ReportSubmittedScreenProps> = ({
  onContinueNavigation,
  onViewRewards,
}) => {
  const { safetyCoins, submittedReports } = useApp();
  const latestReport = submittedReports[0];
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const reportPhotos: GeoTaggedPhoto[] =
    latestReport?.photos && latestReport.photos.length > 0
      ? latestReport.photos
      : latestReport?.photoUri
      ? [
          {
            id: 'latest-1',
            uri: latestReport.photoUri,
            geoTag: latestReport.geoTag || {
              latitude: latestReport.latitude,
              longitude: latestReport.longitude,
              accuracyMeters: 3,
              timestamp: 'Just now',
              addressLabel: latestReport.locationLabel,
            },
          },
        ]
      : [];

  const orderRank = latestReport ? Math.min(5, latestReport.supportingReports || 1) : 1;
  const isCapped = orderRank > 5;
  const coinsAwarded = isCapped
    ? 0
    : orderRank === 1
    ? 75
    : orderRank === 2
    ? 55
    : orderRank === 3
    ? 40
    : orderRank === 4
    ? 30
    : 20;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Main Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Large Green Checkmark Badge */}
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={38} color="#FFFFFF" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Hazard Report Submitted</Text>

        {/* Geo-Tag Verification Indicator */}
        <View style={styles.geoTagVerifiedPill}>
          <Ionicons name="shield-checkmark" size={16} color="#15803D" />
          <Text style={styles.geoTagVerifiedText}>GPS Geo-Tagged & Verified Telemetry</Text>
        </View>

        {/* ATTACHED GEO-TAGGED PHOTOS EVIDENCE CARD */}
        {reportPhotos.length > 0 && (
          <View style={styles.photosCard}>
            <View style={styles.photosCardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="camera" size={16} color="#2563EB" />
                <Text style={styles.photosCardTitle}>
                  Attached Evidence ({reportPhotos.length} {reportPhotos.length === 1 ? 'Photo' : 'Photos'})
                </Text>
              </View>
              <Text style={styles.tapToViewHint}>Tap to view full GPS HUD</Text>
            </View>

            {/* Photos Scroll Strip */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosStrip}>
              {reportPhotos.map((photo, idx) => (
                <TouchableOpacity
                  key={photo.id || idx}
                  onPress={() => {
                    setActivePhotoIdx(idx);
                    setPhotoModalVisible(true);
                  }}
                  activeOpacity={0.8}
                  style={styles.photoThumbCard}
                >
                  <Image source={{ uri: photo.uri }} style={styles.photoThumbImg} />
                  <View style={styles.photoIndexTag}>
                    <Text style={styles.photoIndexTagText}>#{idx + 1}</Text>
                  </View>
                  <View style={styles.photoGpsTag}>
                    <Ionicons name="location-sharp" size={10} color="#34D399" />
                    <Text style={styles.photoGpsTagText}>
                      {photo.geoTag ? `${photo.geoTag.latitude.toFixed(3)}°, ${photo.geoTag.longitude.toFixed(3)}°` : 'Geo-Tagged'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* REWARD ESTIMATION CARD matching Waysure Safety Rewards */}
        <View style={styles.rewardEstimateCard}>
          <View style={styles.rewardCardHeader}>
            <View style={styles.rewardIconBadge}>
              <Text style={styles.rewardCoinEmoji}>🪙</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rewardCardTitle}>
                {isCapped ? 'Report Logged (Points Capped)' : `+${coinsAwarded} Safety Coins Credited`}
              </Text>
              <Text style={styles.rewardCardSubtitle}>
                {isCapped
                  ? 'Hazard corroborated'
                  : `Rank #${orderRank} Reporter • Added to your Waysure Account`}
              </Text>
            </View>
            <View style={[styles.rewardScoreBadge, isCapped && { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }]}>
              <Text style={[styles.rewardScoreText, isCapped && { color: '#64748B' }]}>
                {isCapped ? 'Capped' : `Rank #${orderRank}`}
              </Text>
            </View>
          </View>

          {/* Breakdown Chips */}
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownChip}>
              <Text style={styles.breakdownChipLabel}>
                Rank #{orderRank}: <Text style={{ fontWeight: '800' }}>{isCapped ? '0p' : `+${coinsAwarded - 25}p`}</Text>
              </Text>
            </View>
            <View style={styles.breakdownChip}>
              <Text style={styles.breakdownChipLabel}>Photo Evid: <Text style={{ fontWeight: '800' }}>+{reportPhotos.length > 0 ? '15p' : '0p'}</Text></Text>
            </View>
            <View style={styles.breakdownChip}>
              <Text style={styles.breakdownChipLabel}>GPS &lt;10m: <Text style={{ fontWeight: '800' }}>+15p</Text></Text>
            </View>
          </View>

          <View style={styles.estimatedPayoutRow}>
            <Text style={styles.estimatedPayoutText}>Total Wallet Balance:</Text>
            <Text style={styles.estimatedCoinsValue}>🪙 {safetyCoins} Coins</Text>
          </View>

          {/* Anti-Farming Protection Notice */}
          <View style={styles.antiFarmingNotice}>
            <Ionicons name="shield-outline" size={13} color="#64748B" />
            <Text style={styles.antiFarmingNoticeText}>
              Anti-Farming Rule: Only the first 5 valid reporters earn points per hazard event.
            </Text>
          </View>
        </View>

        {/* Message */}
        <Text style={styles.message}>
          Thank you for protecting fellow riders on Waysure!
        </Text>
      </ScrollView>

      {/* Full-Screen Geo-Tagged Photo Viewer */}
      <GeoTaggedPhotoModal
        visible={photoModalVisible}
        photos={reportPhotos}
        initialIndex={activePhotoIdx}
        onClose={() => setPhotoModalVisible(false)}
        title={latestReport?.title || 'Geo-Tagged Evidence'}
      />

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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  photosCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  photosCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  photosCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  tapToViewHint: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  photosStrip: {
    flexDirection: 'row',
  },
  photoThumbCard: {
    width: 96,
    height: 96,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 10,
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    position: 'relative',
  },
  photoThumbImg: {
    width: '100%',
    height: '100%',
  },
  photoIndexTag: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  photoIndexTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  photoGpsTag: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingVertical: 2,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  photoGpsTagText: {
    color: '#34D399',
    fontSize: 8,
    fontWeight: '700',
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
  antiFarmingNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
  },
  antiFarmingNoticeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    flex: 1,
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
