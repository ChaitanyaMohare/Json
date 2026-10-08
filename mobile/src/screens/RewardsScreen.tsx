import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  StatusBar,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import {
  REWARD_TIERS,
  REWARD_CATALOG,
  SEVERITY_REWARD_POOLS,
  RewardService,
} from '../services/rewardService';
import {
  IncidentSeverityLevel,
  RewardCatalogItem,
  RedeemedVoucher,
  RiderDistributionDetail,
} from '../types';

interface RewardsScreenProps {
  onBack: () => void;
}

type TabType = 'simulator' | 'redeem' | 'earnings' | 'leaderboard';

export const RewardsScreen: React.FC<RewardsScreenProps> = ({ onBack }) => {
  const {
    safetyCoins,
    lifetimeCoins,
    coinTransactions,
    rewardPools,
    redeemedVouchers,
    userRewardTier,
    redeemRewardVoucher,
    simulateVerifyReport,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('simulator');

  // Simulator State
  const [simSeverity, setSimSeverity] = useState<IncidentSeverityLevel>('HIGH');
  const [simOrderRank, setSimOrderRank] = useState<number>(1);
  const [simHasDesc, setSimHasDesc] = useState<boolean>(true);
  const [simHasPhoto, setSimHasPhoto] = useState<boolean>(true);
  const [simHasVideo, setSimHasVideo] = useState<boolean>(false);
  const [simGpsQuality, setSimGpsQuality] = useState<'high' | 'medium' | 'poor'>('high');

  // Modal State for Redemption
  const [selectedReward, setSelectedReward] = useState<RewardCatalogItem | null>(null);
  const [redeemSuccessVoucher, setRedeemSuccessVoucher] = useState<RedeemedVoucher | null>(null);
  const [isRedeeming, setIsRedeeming] = useState<boolean>(false);
  const [storeCategoryFilter, setStoreCategoryFilter] = useState<string>('all');

  // Calculate live simulator score
  const simGpsAccuracy = simGpsQuality === 'high' ? 6 : simGpsQuality === 'medium' ? 20 : 50;
  const simBreakdown = RewardService.calculateContributionScore({
    orderRank: simOrderRank,
    hasDescription: simHasDesc,
    hasPhoto: simHasPhoto,
    hasVideo: simHasVideo,
    gpsAccuracyMeters: simGpsAccuracy,
  });

  const simPoolTotal = SEVERITY_REWARD_POOLS[simSeverity];
  // Multi-rider simulation based on example in infographic
  const simDistributed = RewardService.distributePoolCoins(simSeverity, [
    {
      riderId: 'self',
      riderName: 'You',
      isCurrentUser: true,
      score: simBreakdown.totalScore,
      orderRank: simOrderRank,
      orderPoints: simBreakdown.orderPoints,
      evidencePoints: simBreakdown.evidenceTotalPoints,
      gpsPoints: simBreakdown.gpsPoints,
    },
    {
      riderId: 'corrob-1',
      riderName: 'Rider B (Corroborator)',
      isCurrentUser: false,
      score: 60,
      orderRank: 2,
      orderPoints: 35,
      evidencePoints: 10,
      gpsPoints: 15,
    },
    {
      riderId: 'corrob-2',
      riderName: 'Rider C (Corroborator)',
      isCurrentUser: false,
      score: 55,
      orderRank: 3,
      orderPoints: 25,
      evidencePoints: 15,
      gpsPoints: 15,
    },
  ]);

  const userSimResult = simDistributed.find((r) => r.isCurrentUser) || simDistributed[0];

  const handleRedeemConfirm = async () => {
    if (!selectedReward) return;
    setIsRedeeming(true);
    const result = await redeemRewardVoucher(selectedReward);
    setIsRedeeming(false);
    if (result.success && result.voucher) {
      setSelectedReward(null);
      setRedeemSuccessVoucher(result.voucher);
    } else {
      Alert.alert('Redemption Failed', result.error || 'Could not redeem voucher.');
    }
  };

  const handleShareVoucher = async (voucher: RedeemedVoucher) => {
    try {
      await Share.share({
        message: `Use code ${voucher.code} to get ${voucher.discountText} on ${voucher.title} with WaySure Safety Rewards!`,
      });
    } catch {}
  };

  const filteredRewards =
    storeCategoryFilter === 'all'
      ? REWARD_CATALOG
      : REWARD_CATALOG.filter((r) => r.category === storeCategoryFilter);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Top Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>Waysure Safety Rewards</Text>
          <Text style={styles.headerSubtitle}>Safety Contributions & Coin Pool</Text>
        </View>

        {/* Coin Balance Pill */}
        <View style={styles.coinPill}>
          <Text style={styles.coinPillIcon}>🪙</Text>
          <Text style={styles.coinPillText}>{safetyCoins}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* HERO WALLET & TIER CARD */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroLabel}>AVAILABLE SAFETY COINS</Text>
              <View style={styles.heroBalanceRow}>
                <Text style={styles.heroCoinSymbol}>🪙</Text>
                <Text style={styles.heroBalanceText}>{safetyCoins}</Text>
                <View style={styles.heroTierBadge}>
                  <Ionicons name={userRewardTier.badgeIcon as any} size={13} color="#EAB308" />
                  <Text style={styles.heroTierText}>{userRewardTier.name}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.heroQuickRedeemBtn}
              activeOpacity={0.8}
              onPress={() => setActiveTab('redeem')}
            >
              <Feather name="gift" size={14} color="#0F172A" />
              <Text style={styles.heroQuickRedeemText}>Redeem</Text>
            </TouchableOpacity>
          </View>

          {/* Tier Progress Bar */}
          <View style={styles.tierProgressContainer}>
            <View style={styles.tierProgressLabelRow}>
              <Text style={styles.tierProgressLabel}>
                Lifetime: <Text style={{ color: '#FCD34D', fontWeight: '700' }}>{lifetimeCoins} Coins</Text>
              </Text>
              <Text style={styles.tierMultiplierText}>{userRewardTier.multiplierText}</Text>
            </View>

            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(
                      100,
                      Math.max(
                        10,
                        ((lifetimeCoins - userRewardTier.minCoins) /
                          Math.max(1, userRewardTier.maxCoins - userRewardTier.minCoins)) *
                          100
                      )
                    )}%`,
                  },
                ]}
              />
            </View>
          </View>

          {/* Key Stats Pill Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Verified Reports</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₹4,800</Text>
              <Text style={styles.statLabel}>Gear Saved Value</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Top 5%</Text>
              <Text style={styles.statLabel}>Road Guardian</Text>
            </View>
          </View>
        </View>

        {/* NAVIGATION TABS */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'simulator' && styles.tabButtonActive]}
            onPress={() => setActiveTab('simulator')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="calculator-variant-outline"
              size={18}
              color={activeTab === 'simulator' ? '#2563EB' : '#64748B'}
            />
            <Text style={[styles.tabText, activeTab === 'simulator' && styles.tabTextActive]}>
              Rules & Simulator
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'redeem' && styles.tabButtonActive]}
            onPress={() => setActiveTab('redeem')}
            activeOpacity={0.8}
          >
            <Feather
              name="shopping-bag"
              size={17}
              color={activeTab === 'redeem' ? '#2563EB' : '#64748B'}
            />
            <Text style={[styles.tabText, activeTab === 'redeem' && styles.tabTextActive]}>
              Store ({REWARD_CATALOG.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'earnings' && styles.tabButtonActive]}
            onPress={() => setActiveTab('earnings')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color={activeTab === 'earnings' ? '#2563EB' : '#64748B'}
            />
            <Text style={[styles.tabText, activeTab === 'earnings' && styles.tabTextActive]}>
              Pools & History
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'leaderboard' && styles.tabButtonActive]}
            onPress={() => setActiveTab('leaderboard')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="trophy-outline"
              size={18}
              color={activeTab === 'leaderboard' ? '#2563EB' : '#64748B'}
            />
            <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.tabTextActive]}>
              Leaders
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: RULES & INTERACTIVE SIMULATOR */}
        {activeTab === 'simulator' && (
          <View style={styles.tabContent}>
            {/* Infographic Banner */}
            <View style={styles.infoBanner}>
              <View style={styles.infoBannerIcon}>
                <Ionicons name="sparkles" size={20} color="#F59E0B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoBannerTitle}>Waysure Safety Coin System</Text>
                <Text style={styles.infoBannerSubtitle}>
                  Rewarding verified safety contributions to make roads safer with proportional pool distribution.
                </Text>
              </View>
            </View>

            {/* Section 1: Contribution Scoring Rules Table */}
            <View style={styles.cardSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionNumberBadge}>
                  <Text style={styles.sectionNumberText}>1</Text>
                </View>
                <Text style={styles.sectionTitle}>Contribution Scoring Rules</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Each valid report receives points based on 3 verifiable factors:
              </Text>

              {/* Factor A: Reporting Order */}
              <View style={styles.ruleGroup}>
                <View style={styles.ruleGroupHeader}>
                  <View style={[styles.badgeLetter, { backgroundColor: '#DBEAFE' }]}>
                    <Text style={[styles.badgeLetterText, { color: '#1D4ED8' }]}>A</Text>
                  </View>
                  <Ionicons name="time-outline" size={16} color="#2563EB" />
                  <Text style={styles.ruleGroupTitle}>Reporting Order</Text>
                  <Text style={styles.ruleGroupPointsHeader}>Points</Text>
                </View>

                <View style={styles.ruleRow}>
                  <View style={styles.ruleOrderBadge}>
                    <Text style={styles.ruleOrderText}>1</Text>
                  </View>
                  <Text style={styles.ruleLabel}>1st valid report (Early Alert)</Text>
                  <Text style={styles.rulePoints}>50 pts</Text>
                </View>
                <View style={styles.ruleRow}>
                  <View style={[styles.ruleOrderBadge, { backgroundColor: '#E2E8F0' }]}>
                    <Text style={[styles.ruleOrderText, { color: '#475569' }]}>2</Text>
                  </View>
                  <Text style={styles.ruleLabel}>2nd valid report (Corroborator)</Text>
                  <Text style={styles.rulePoints}>35 pts</Text>
                </View>
                <View style={styles.ruleRow}>
                  <View style={[styles.ruleOrderBadge, { backgroundColor: '#E2E8F0' }]}>
                    <Text style={[styles.ruleOrderText, { color: '#475569' }]}>3</Text>
                  </View>
                  <Text style={styles.ruleLabel}>3rd valid report</Text>
                  <Text style={styles.rulePoints}>25 pts</Text>
                </View>
                <View style={styles.ruleRow}>
                  <View style={[styles.ruleOrderBadge, { backgroundColor: '#E2E8F0' }]}>
                    <Text style={[styles.ruleOrderText, { color: '#475569' }]}>4</Text>
                  </View>
                  <Text style={styles.ruleLabel}>4th valid report</Text>
                  <Text style={styles.rulePoints}>15 pts</Text>
                </View>
                <View style={styles.ruleRow}>
                  <View style={[styles.ruleOrderBadge, { backgroundColor: '#E2E8F0' }]}>
                    <Text style={[styles.ruleOrderText, { color: '#475569' }]}>5+</Text>
                  </View>
                  <Text style={styles.ruleLabel}>5th+ valid report</Text>
                  <Text style={styles.rulePoints}>10 pts</Text>
                </View>
              </View>

              {/* Factor B: Evidence Quality */}
              <View style={[styles.ruleGroup, { marginTop: 12 }]}>
                <View style={styles.ruleGroupHeader}>
                  <View style={[styles.badgeLetter, { backgroundColor: '#DCFCE7' }]}>
                    <Text style={[styles.badgeLetterText, { color: '#15803D' }]}>B</Text>
                  </View>
                  <Ionicons name="images-outline" size={16} color="#16A34A" />
                  <Text style={styles.ruleGroupTitle}>Evidence Quality</Text>
                  <Text style={styles.ruleGroupPointsHeader}>Points</Text>
                </View>

                <View style={styles.ruleRow}>
                  <Feather name="file-text" size={14} color="#16A34A" style={{ marginRight: 8 }} />
                  <Text style={styles.ruleLabel}>Useful detailed description</Text>
                  <Text style={styles.rulePoints}>+5 pts</Text>
                </View>
                <View style={styles.ruleRow}>
                  <Feather name="camera" size={14} color="#16A34A" style={{ marginRight: 8 }} />
                  <Text style={styles.ruleLabel}>Photo evidence</Text>
                  <Text style={styles.rulePoints}>+10 pts</Text>
                </View>
                <View style={styles.ruleRow}>
                  <Feather name="video" size={14} color="#16A34A" style={{ marginRight: 8 }} />
                  <Text style={styles.ruleLabel}>Video evidence</Text>
                  <Text style={styles.rulePoints}>+15 pts</Text>
                </View>
                <View style={styles.maxEvidencePill}>
                  <Ionicons name="star" size={13} color="#16A34A" />
                  <Text style={styles.maxEvidenceText}>Maximum evidence points: 25 pts (cap)</Text>
                </View>
              </View>

              {/* Factor C: Location Accuracy */}
              <View style={[styles.ruleGroup, { marginTop: 12 }]}>
                <View style={styles.ruleGroupHeader}>
                  <View style={[styles.badgeLetter, { backgroundColor: '#F3E8FF' }]}>
                    <Text style={[styles.badgeLetterText, { color: '#7E22CE' }]}>C</Text>
                  </View>
                  <Ionicons name="location-outline" size={16} color="#9333EA" />
                  <Text style={styles.ruleGroupTitle}>Location Accuracy</Text>
                  <Text style={styles.ruleGroupPointsHeader}>Points</Text>
                </View>

                <View style={styles.ruleRow}>
                  <Ionicons name="radio-button-on" size={14} color="#16A34A" style={{ marginRight: 8 }} />
                  <Text style={styles.ruleLabel}>Highly accurate GPS (&lt; 10m)</Text>
                  <Text style={styles.rulePoints}>+15 pts</Text>
                </View>
                <View style={styles.ruleRow}>
                  <Ionicons name="radio-button-on" size={14} color="#EAB308" style={{ marginRight: 8 }} />
                  <Text style={styles.ruleLabel}>Reasonably accurate GPS (10m - 30m)</Text>
                  <Text style={styles.rulePoints}>+10 pts</Text>
                </View>
                <View style={styles.ruleRow}>
                  <Ionicons name="radio-button-off" size={14} color="#94A3B8" style={{ marginRight: 8 }} />
                  <Text style={styles.ruleLabel}>Poor / uncertain GPS (&gt; 30m)</Text>
                  <Text style={styles.rulePoints}>+0 pts</Text>
                </View>
              </View>

              {/* Factor D: Verification */}
              <View style={styles.verificationNoteRow}>
                <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                <Text style={styles.verificationNoteText}>
                  <Text style={{ fontWeight: '700' }}>Verified by System & Community:</Text> Eligible for Safety Coins.{'\n'}
                  <Text style={{ color: '#EF4444', fontWeight: '700' }}>Rejected / Spam:</Text> 0 coins distributed.
                </Text>
              </View>
            </View>

            {/* Section 2: Incident Reward Pools */}
            <View style={styles.cardSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionNumberBadge}>
                  <Text style={styles.sectionNumberText}>2</Text>
                </View>
                <Text style={styles.sectionTitle}>Incident Reward Pool</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Each verified incident unlocks a fixed Safety Coin pool based on verified severity:
              </Text>

              <View style={styles.poolGrid}>
                <View style={[styles.poolCard, { borderColor: '#86EFAC', backgroundColor: '#F0FDF4' }]}>
                  <View style={styles.poolCardTop}>
                    <Ionicons name="stats-chart" size={16} color="#15803D" />
                    <Text style={[styles.poolCardSeverity, { color: '#15803D' }]}>LOW</Text>
                  </View>
                  <Text style={styles.poolCardCoins}>50</Text>
                  <Text style={styles.poolCardCoinsLabel}>Total Coins</Text>
                </View>

                <View style={[styles.poolCard, { borderColor: '#FDE047', backgroundColor: '#FEFCE8' }]}>
                  <View style={styles.poolCardTop}>
                    <Ionicons name="warning-outline" size={16} color="#A16207" />
                    <Text style={[styles.poolCardSeverity, { color: '#A16207' }]}>MEDIUM</Text>
                  </View>
                  <Text style={styles.poolCardCoins}>100</Text>
                  <Text style={styles.poolCardCoinsLabel}>Total Coins</Text>
                </View>

                <View style={[styles.poolCard, { borderColor: '#FDBA74', backgroundColor: '#FFF7ED' }]}>
                  <View style={styles.poolCardTop}>
                    <Ionicons name="flame-outline" size={16} color="#C2410C" />
                    <Text style={[styles.poolCardSeverity, { color: '#C2410C' }]}>HIGH</Text>
                  </View>
                  <Text style={styles.poolCardCoins}>200</Text>
                  <Text style={styles.poolCardCoinsLabel}>Total Coins</Text>
                </View>

                <View style={[styles.poolCard, { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }]}>
                  <View style={styles.poolCardTop}>
                    <Ionicons name="alert-circle-outline" size={16} color="#B91C1C" />
                    <Text style={[styles.poolCardSeverity, { color: '#B91C1C' }]}>CRITICAL</Text>
                  </View>
                  <Text style={styles.poolCardCoins}>300</Text>
                  <Text style={styles.poolCardCoinsLabel}>Total Coins</Text>
                </View>
              </View>
            </View>

            {/* Section 3 & 4: Interactive Live Simulator */}
            <View style={[styles.cardSection, { borderColor: '#93C5FD', backgroundColor: '#F8FAFC' }]}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.sectionNumberBadge, { backgroundColor: '#2563EB' }]}>
                  <Text style={[styles.sectionNumberText, { color: '#FFFFFF' }]}>3</Text>
                </View>
                <Text style={styles.sectionTitle}>Interactive Reward Simulator</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Adjust parameters to calculate live score and estimated coin payout:
              </Text>

              {/* Severity Selector */}
              <Text style={styles.simFieldLabel}>Verified Severity Pool:</Text>
              <View style={styles.simPillsRow}>
                {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as IncidentSeverityLevel[]).map((sev) => (
                  <TouchableOpacity
                    key={sev}
                    style={[
                      styles.simPill,
                      simSeverity === sev && styles.simPillActive,
                      simSeverity === sev && {
                        backgroundColor:
                          sev === 'LOW'
                            ? '#10B981'
                            : sev === 'MEDIUM'
                            ? '#F59E0B'
                            : sev === 'HIGH'
                            ? '#EA580C'
                            : '#DC2626',
                      },
                    ]}
                    onPress={() => setSimSeverity(sev)}
                  >
                    <Text
                      style={[
                        styles.simPillText,
                        simSeverity === sev && { color: '#FFFFFF', fontWeight: '800' },
                      ]}
                    >
                      {sev} ({SEVERITY_REWARD_POOLS[sev]}c)
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Order Rank Selector */}
              <Text style={[styles.simFieldLabel, { marginTop: 14 }]}>Your Reporting Order:</Text>
              <View style={styles.simPillsRow}>
                {[1, 2, 3, 4, 5].map((rank) => (
                  <TouchableOpacity
                    key={rank}
                    style={[
                      styles.simPill,
                      simOrderRank === rank && styles.simPillActive,
                    ]}
                    onPress={() => setSimOrderRank(rank)}
                  >
                    <Text
                      style={[
                        styles.simPillText,
                        simOrderRank === rank && { color: '#FFFFFF', fontWeight: '800' },
                      ]}
                    >
                      {rank === 1 ? '1st (50p)' : rank === 2 ? '2nd (35p)' : rank === 3 ? '3rd (25p)' : rank === 4 ? '4th (15p)' : '5th+ (10p)'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Evidence Checklist */}
              <Text style={[styles.simFieldLabel, { marginTop: 14 }]}>Evidence Submitted:</Text>
              <View style={styles.evidenceToggleRow}>
                <TouchableOpacity
                  style={[styles.evidenceToggle, simHasDesc && styles.evidenceToggleActive]}
                  onPress={() => setSimHasDesc(!simHasDesc)}
                >
                  <Ionicons
                    name={simHasDesc ? 'checkbox' : 'square-outline'}
                    size={18}
                    color={simHasDesc ? '#2563EB' : '#94A3B8'}
                  />
                  <Text style={[styles.evidenceToggleText, simHasDesc && { color: '#1E40AF', fontWeight: '700' }]}>
                    Description (+5)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.evidenceToggle, simHasPhoto && styles.evidenceToggleActive]}
                  onPress={() => setSimHasPhoto(!simHasPhoto)}
                >
                  <Ionicons
                    name={simHasPhoto ? 'checkbox' : 'square-outline'}
                    size={18}
                    color={simHasPhoto ? '#2563EB' : '#94A3B8'}
                  />
                  <Text style={[styles.evidenceToggleText, simHasPhoto && { color: '#1E40AF', fontWeight: '700' }]}>
                    Photo (+10)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.evidenceToggle, simHasVideo && styles.evidenceToggleActive]}
                  onPress={() => setSimHasVideo(!simHasVideo)}
                >
                  <Ionicons
                    name={simHasVideo ? 'checkbox' : 'square-outline'}
                    size={18}
                    color={simHasVideo ? '#2563EB' : '#94A3B8'}
                  />
                  <Text style={[styles.evidenceToggleText, simHasVideo && { color: '#1E40AF', fontWeight: '700' }]}>
                    Video (+15)
                  </Text>
                </TouchableOpacity>
              </View>

              {/* GPS Accuracy */}
              <Text style={[styles.simFieldLabel, { marginTop: 14 }]}>GPS Accuracy Tier:</Text>
              <View style={styles.simPillsRow}>
                <TouchableOpacity
                  style={[styles.simPill, simGpsQuality === 'high' && styles.simPillActive]}
                  onPress={() => setSimGpsQuality('high')}
                >
                  <Text style={[styles.simPillText, simGpsQuality === 'high' && { color: '#FFFFFF', fontWeight: '800' }]}>
                    High &lt;10m (+15)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.simPill, simGpsQuality === 'medium' && styles.simPillActive]}
                  onPress={() => setSimGpsQuality('medium')}
                >
                  <Text style={[styles.simPillText, simGpsQuality === 'medium' && { color: '#FFFFFF', fontWeight: '800' }]}>
                    Med 10-30m (+10)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.simPill, simGpsQuality === 'poor' && styles.simPillActive]}
                  onPress={() => setSimGpsQuality('poor')}
                >
                  <Text style={[styles.simPillText, simGpsQuality === 'poor' && { color: '#FFFFFF', fontWeight: '800' }]}>
                    Poor &gt;30m (+0)
                  </Text>
                </TouchableOpacity>
              </View>

              {/* CALCULATION RESULT CARD matching Infographic Section 4 */}
              <View style={styles.simResultCard}>
                <View style={styles.simResultTop}>
                  <Text style={styles.simResultTitle}>LIVE CALCULATION RESULT</Text>
                  <View style={styles.simResultPoolBadge}>
                    <Text style={styles.simResultPoolText}>{simSeverity} Pool: {simPoolTotal}c</Text>
                  </View>
                </View>

                {/* Score Breakdown Table */}
                <View style={styles.simBreakdownTable}>
                  <View style={styles.simTableRow}>
                    <Text style={styles.simTableCol1}>Order Points (Rank #{simOrderRank}):</Text>
                    <Text style={styles.simTableCol2}>+{simBreakdown.orderPoints} pts</Text>
                  </View>
                  <View style={styles.simTableRow}>
                    <Text style={styles.simTableCol1}>Evidence Points ({simBreakdown.hasPhoto ? 'Photo' : ''} {simBreakdown.hasVideo ? 'Video' : ''}):</Text>
                    <Text style={styles.simTableCol2}>+{simBreakdown.evidenceTotalPoints} pts</Text>
                  </View>
                  <View style={styles.simTableRow}>
                    <Text style={styles.simTableCol1}>GPS Telemetry Accuracy:</Text>
                    <Text style={styles.simTableCol2}>+{simBreakdown.gpsPoints} pts</Text>
                  </View>
                  <View style={[styles.simTableRow, styles.simTableTotalRow]}>
                    <Text style={styles.simTableTotalLabel}>Your Total Contribution Score:</Text>
                    <Text style={styles.simTableTotalValue}>{simBreakdown.totalScore} pts</Text>
                  </View>
                </View>

                {/* Final Coin Calculation */}
                <View style={styles.simCoinsPayoutBox}>
                  <View>
                    <Text style={styles.simPayoutLabel}>Your Proportional Share:</Text>
                    <Text style={styles.simFormulaText}>
                      ({simBreakdown.totalScore} / {simDistributed.reduce((s, r) => s + r.totalScore, 0)} pts) × {simPoolTotal} coins
                    </Text>
                  </View>
                  <View style={styles.simFinalCoinsPill}>
                    <Text style={styles.simFinalCoinsIcon}>🪙</Text>
                    <Text style={styles.simFinalCoinsValue}>~{userSimResult.finalCoins}</Text>
                    <Text style={styles.simFinalCoinsUnit}>coins</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Section 5: Complete 5-Step Lifecycle Flow */}
            <View style={styles.cardSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionNumberBadge}>
                  <Text style={styles.sectionNumberText}>5</Text>
                </View>
                <Text style={styles.sectionTitle}>Complete Reward Flow</Text>
              </View>

              <View style={styles.flowList}>
                <View style={styles.flowItem}>
                  <View style={styles.flowNumber}>
                    <Text style={styles.flowNumberText}>1</Text>
                  </View>
                  <View style={styles.flowContent}>
                    <Text style={styles.flowItemTitle}>Rider Reports Hazard</Text>
                    <Text style={styles.flowItemDesc}>Capture photo/video + GPS telemetry + hazard details</Text>
                  </View>
                </View>

                <View style={styles.flowItem}>
                  <View style={styles.flowNumber}>
                    <Text style={styles.flowNumberText}>2</Text>
                  </View>
                  <View style={styles.flowContent}>
                    <Text style={styles.flowItemTitle}>AI Analysis & Spam Filter</Text>
                    <Text style={styles.flowItemDesc}>Validates photo context, severity detection & duplicate scan</Text>
                  </View>
                </View>

                <View style={styles.flowItem}>
                  <View style={styles.flowNumber}>
                    <Text style={styles.flowNumberText}>3</Text>
                  </View>
                  <View style={styles.flowContent}>
                    <Text style={styles.flowItemTitle}>Corroboration & Verification</Text>
                    <Text style={styles.flowItemDesc}>Matches nearby rider reports and determines final severity</Text>
                  </View>
                </View>

                <View style={styles.flowItem}>
                  <View style={styles.flowNumber}>
                    <Text style={styles.flowNumberText}>4</Text>
                  </View>
                  <View style={styles.flowContent}>
                    <Text style={styles.flowItemTitle}>Pool Distribution to Wallet</Text>
                    <Text style={styles.flowItemDesc}>Calculates proportional scores and credits Safety Coins</Text>
                  </View>
                </View>

                <View style={styles.flowItem}>
                  <View style={[styles.flowNumber, { backgroundColor: '#10B981' }]}>
                    <Text style={[styles.flowNumberText, { color: '#FFFFFF' }]}>5</Text>
                  </View>
                  <View style={styles.flowContent}>
                    <Text style={[styles.flowItemTitle, { color: '#15803D' }]}>Redeem in Store</Text>
                    <Text style={styles.flowItemDesc}>Get discounts on helmets, jackets, gloves, toll passes & fuel!</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* TAB 2: REDEEM STORE */}
        {activeTab === 'redeem' && (
          <View style={styles.tabContent}>
            {/* Category Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {[
                { key: 'all', label: 'All Rewards' },
                { key: 'gear', label: 'Riding Gear' },
                { key: 'fuel', label: 'Fuel Cashback' },
                { key: 'toll', label: 'Toll Passes' },
                { key: 'maintenance', label: 'Maintenance' },
                { key: 'voucher', label: 'Roadside Assist' },
              ].map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.categoryPill,
                    storeCategoryFilter === cat.key && styles.categoryPillActive,
                  ]}
                  onPress={() => setStoreCategoryFilter(cat.key)}
                >
                  <Text
                    style={[
                      styles.categoryPillText,
                      storeCategoryFilter === cat.key && styles.categoryPillTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Active Vouchers Section (if user already redeemed vouchers) */}
            {redeemedVouchers.length > 0 && (
              <View style={styles.vouchersSection}>
                <Text style={styles.vouchersSectionTitle}>YOUR ACTIVE REDEEMED VOUCHERS</Text>
                {redeemedVouchers.map((v) => (
                  <View key={v.id} style={styles.activeVoucherCard}>
                    <View style={styles.activeVoucherLeft}>
                      <Text style={styles.activeVoucherBrand}>{v.brand}</Text>
                      <Text style={styles.activeVoucherTitle}>{v.title}</Text>
                      <View style={styles.codeBox}>
                        <Text style={styles.codeText}>{v.code}</Text>
                      </View>
                      <Text style={styles.voucherExpiryText}>Expires: {v.expiresAt}</Text>
                    </View>
                    <View style={styles.activeVoucherRight}>
                      <Text style={styles.activeVoucherDiscount}>{v.discountText}</Text>
                      <TouchableOpacity
                        style={styles.shareCodeBtn}
                        onPress={() => handleShareVoucher(v)}
                      >
                        <Feather name="share-2" size={14} color="#2563EB" />
                        <Text style={styles.shareCodeText}>Share</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Reward Catalog Items Grid */}
            <View style={styles.catalogList}>
              {filteredRewards.map((item) => {
                const canAfford = safetyCoins >= item.coinCost;
                return (
                  <View key={item.id} style={styles.catalogCard}>
                    <View style={styles.catalogCardHeader}>
                      <View style={[styles.catalogIconWrapper, { backgroundColor: `${item.accentColor}15` }]}>
                        <Ionicons name={item.iconName as any} size={24} color={item.accentColor} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.catalogBrand}>{item.brand}</Text>
                        <Text style={styles.catalogTitle}>{item.title}</Text>
                      </View>
                      <View style={[styles.catalogBadge, { backgroundColor: `${item.accentColor}20` }]}>
                        <Text style={[styles.catalogBadgeText, { color: item.accentColor }]}>
                          {item.discountText}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.catalogDesc}>{item.description}</Text>

                    <View style={styles.catalogFooter}>
                      <View style={styles.catalogCostGroup}>
                        <Text style={styles.catalogCostIcon}>🪙</Text>
                        <Text style={styles.catalogCostValue}>{item.coinCost}</Text>
                        <Text style={styles.catalogCostLabel}>Coins</Text>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.catalogRedeemBtn,
                          !canAfford && styles.catalogRedeemBtnDisabled,
                        ]}
                        disabled={!canAfford}
                        onPress={() => setSelectedReward(item)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.catalogRedeemBtnText,
                            !canAfford && styles.catalogRedeemBtnTextDisabled,
                          ]}
                        >
                          {canAfford ? 'Redeem Voucher' : `Need ${item.coinCost - safetyCoins} more`}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* TAB 3: EARNINGS & VERIFIED POOLS */}
        {activeTab === 'earnings' && (
          <View style={styles.tabContent}>
            {/* Quick action: Simulate Admin Verification on pending report */}
            <View style={styles.verifySimBanner}>
              <View style={{ flex: 1 }}>
                <Text style={styles.verifySimTitle}>Interactive Verification Engine</Text>
                <Text style={styles.verifySimDesc}>
                  Simulate live community corroboration and admin verification on pending reports:
                </Text>
              </View>
              <TouchableOpacity
                style={styles.simulateVerifyBtn}
                onPress={async () => {
                  const earned = await simulateVerifyReport('pool-sim');
                  Alert.alert('Coins Credited!', `Report verified! +${earned} Safety Coins credited to your wallet.`);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="flash" size={14} color="#FFFFFF" />
                <Text style={styles.simulateVerifyBtnText}>Verify Report</Text>
              </TouchableOpacity>
            </View>

            {/* List of Verified Pools with Multi-Rider Proportional Distribution */}
            <Text style={styles.sectionHeaderLabel}>INCIDENT REWARD POOLS & DISTRIBUTIONS</Text>
            {rewardPools.map((pool) => (
              <View key={pool.id} style={styles.poolDetailCard}>
                <View style={styles.poolDetailHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.poolDetailTitle}>{pool.incidentTitle}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 }}>
                      <Ionicons name="location-outline" size={12} color="#64748B" />
                      <Text style={styles.poolDetailLocation}>{pool.locationLabel}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.poolStatusBadge,
                      pool.status === 'verified_distributed'
                        ? { backgroundColor: '#DCFCE7' }
                        : { backgroundColor: '#FEF3C7' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.poolStatusText,
                        pool.status === 'verified_distributed'
                          ? { color: '#15803D' }
                          : { color: '#B45309' },
                      ]}
                    >
                      {pool.status === 'verified_distributed' ? 'Verified' : 'Pending'}
                    </Text>
                  </View>
                </View>

                {/* Pool Stats */}
                <View style={styles.poolStatsBanner}>
                  <Text style={styles.poolStatsText}>
                    Severity: <Text style={{ fontWeight: '700' }}>{pool.severity}</Text> • Pool:{' '}
                    <Text style={{ fontWeight: '700', color: '#B45309' }}>🪙 {pool.totalPoolCoins} coins</Text>
                  </Text>
                  <Text style={styles.poolStatsScore}>
                    Total Scores: {pool.totalContributionScore} pts
                  </Text>
                </View>

                {/* Rider Distribution Breakdown Table */}
                <View style={styles.riderDistributionTable}>
                  <View style={styles.riderTableHeader}>
                    <Text style={[styles.riderTableCol, { flex: 2 }]}>Rider</Text>
                    <Text style={styles.riderTableCol}>Order</Text>
                    <Text style={styles.riderTableCol}>Evid</Text>
                    <Text style={styles.riderTableCol}>GPS</Text>
                    <Text style={styles.riderTableCol}>Score</Text>
                    <Text style={[styles.riderTableCol, { fontWeight: '800', color: '#1E293B' }]}>Coins</Text>
                  </View>

                  {pool.riders.map((r: RiderDistributionDetail, idx: number) => (
                    <View
                      key={idx}
                      style={[
                        styles.riderTableRow,
                        r.isCurrentUser && { backgroundColor: '#EFF6FF' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.riderTableCell,
                          { flex: 2 },
                          r.isCurrentUser && { fontWeight: '700', color: '#1D4ED8' },
                        ]}
                      >
                        {r.riderName}
                      </Text>
                      <Text style={styles.riderTableCell}>{r.orderPoints}</Text>
                      <Text style={styles.riderTableCell}>{r.evidencePoints}</Text>
                      <Text style={styles.riderTableCell}>{r.gpsPoints}</Text>
                      <Text style={[styles.riderTableCell, { fontWeight: '700' }]}>{r.totalScore}</Text>
                      <Text style={[styles.riderTableCell, { fontWeight: '800', color: '#16A34A' }]}>
                        +{r.finalCoins}c
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}

            {/* Full Transaction History */}
            <Text style={[styles.sectionHeaderLabel, { marginTop: 20 }]}>TRANSACTIONS & COIN LOG</Text>
            {coinTransactions.map((tx) => (
              <View key={tx.id} style={styles.txRow}>
                <View
                  style={[
                    styles.txIconBox,
                    tx.amount > 0 ? { backgroundColor: '#DCFCE7' } : { backgroundColor: '#FEE2E2' },
                  ]}
                >
                  <Ionicons
                    name={tx.amount > 0 ? 'arrow-down-circle' : 'arrow-up-circle'}
                    size={20}
                    color={tx.amount > 0 ? '#16A34A' : '#DC2626'}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.txTitle}>{tx.title}</Text>
                  <Text style={styles.txSubtitle}>{tx.subtitle}</Text>
                  <Text style={styles.txTime}>{tx.timestamp}</Text>
                </View>
                <Text
                  style={[
                    styles.txAmount,
                    tx.amount > 0 ? { color: '#16A34A' } : { color: '#DC2626' },
                  ]}
                >
                  {tx.amount > 0 ? `+${tx.amount}` : tx.amount}c
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* TAB 4: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <View style={styles.tabContent}>
            <View style={styles.leaderHero}>
              <Ionicons name="trophy" size={36} color="#EAB308" />
              <Text style={styles.leaderHeroTitle}>Road Safety Guardians</Text>
              <Text style={styles.leaderHeroSubtitle}>
                Top community contributors making our daily routes and highways accident-free.
              </Text>
            </View>

            {[
              { rank: 1, name: 'Aditya Bagale', coins: 1840, reports: 42, tier: 'Diamond Legend', isYou: false },
              { rank: 2, name: 'Chaitanya Mohare', coins: 1420, reports: 31, tier: 'Platinum Captain', isYou: false },
              { rank: 3, name: 'Soham K.', coins: 480, reports: 12, tier: 'Gold Sentinel', isYou: true },
              { rank: 4, name: 'Neha Deshmukh', coins: 390, reports: 9, tier: 'Silver Guardian', isYou: false },
              { rank: 5, name: 'Rohan Joshi', coins: 280, reports: 7, tier: 'Silver Guardian', isYou: false },
              { rank: 6, name: 'Vikram Singh', coins: 160, reports: 4, tier: 'Silver Guardian', isYou: false },
            ].map((user) => (
              <View
                key={user.rank}
                style={[
                  styles.leaderRow,
                  user.isYou && { borderColor: '#3B82F6', borderWidth: 1.5, backgroundColor: '#EFF6FF' },
                ]}
              >
                <View
                  style={[
                    styles.leaderRankCircle,
                    user.rank === 1
                      ? { backgroundColor: '#FEF08A' }
                      : user.rank === 2
                      ? { backgroundColor: '#E2E8F0' }
                      : user.rank === 3
                      ? { backgroundColor: '#FED7AA' }
                      : { backgroundColor: '#F1F5F9' },
                  ]}
                >
                  <Text
                    style={[
                      styles.leaderRankText,
                      user.rank === 1
                        ? { color: '#854D0E' }
                        : user.rank === 2
                        ? { color: '#334155' }
                        : user.rank === 3
                        ? { color: '#9A3412' }
                        : { color: '#64748B' },
                    ]}
                  >
                    #{user.rank}
                  </Text>
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.leaderName}>
                    {user.name} {user.isYou ? '(You)' : ''}
                  </Text>
                  <Text style={styles.leaderTier}>
                    {user.tier} • {user.reports} Verified Reports
                  </Text>
                </View>

                <View style={styles.leaderCoinsPill}>
                  <Text style={styles.leaderCoinsIcon}>🪙</Text>
                  <Text style={styles.leaderCoinsValue}>{user.coins}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* CONFIRMATION MODAL TO REDEEM */}
      <Modal
        visible={Boolean(selectedReward)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedReward(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Redemption</Text>
              <TouchableOpacity onPress={() => setSelectedReward(null)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {selectedReward && (
              <View style={styles.modalBody}>
                <View style={[styles.modalIconBox, { backgroundColor: `${selectedReward.accentColor}15` }]}>
                  <Ionicons name={selectedReward.iconName as any} size={32} color={selectedReward.accentColor} />
                </View>
                <Text style={styles.modalItemTitle}>{selectedReward.title}</Text>
                <Text style={styles.modalItemBrand}>{selectedReward.brand}</Text>
                <Text style={styles.modalItemDiscount}>{selectedReward.discountText}</Text>
                <Text style={styles.modalItemDesc}>{selectedReward.description}</Text>

                <View style={styles.modalPriceSummary}>
                  <Text style={styles.modalPriceLabel}>Cost:</Text>
                  <Text style={styles.modalPriceValue}>🪙 {selectedReward.coinCost} Safety Coins</Text>
                </View>
                <View style={styles.modalPriceSummary}>
                  <Text style={styles.modalPriceLabel}>Your Remaining Balance:</Text>
                  <Text style={styles.modalPriceRemaining}>
                    🪙 {safetyCoins - selectedReward.coinCost} Coins
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.modalConfirmBtn}
                  onPress={handleRedeemConfirm}
                  disabled={isRedeeming}
                >
                  <Text style={styles.modalConfirmBtnText}>
                    {isRedeeming ? 'Redeeming...' : 'Confirm & Generate Promo Code'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* SUCCESS REDEEMED VOUCHER POPUP */}
      <Modal
        visible={Boolean(redeemSuccessVoucher)}
        transparent
        animationType="slide"
        onRequestClose={() => setRedeemSuccessVoucher(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: '#FFFFFF' }]}>
            <View style={styles.successCheckCircle}>
              <Ionicons name="checkmark" size={32} color="#FFFFFF" />
            </View>

            <Text style={styles.successTitle}>Voucher Redeemed!</Text>
            <Text style={styles.successSubtitle}>
              Your discount promo code has been generated and added to your Safety Wallet:
            </Text>

            {redeemSuccessVoucher && (
              <View style={styles.voucherCodeCard}>
                <Text style={styles.voucherCardBrand}>{redeemSuccessVoucher.brand}</Text>
                <Text style={styles.voucherCardTitle}>{redeemSuccessVoucher.title}</Text>
                <Text style={styles.voucherCardDiscount}>{redeemSuccessVoucher.discountText}</Text>

                <View style={styles.promoCodeBox}>
                  <Text style={styles.promoCodeText}>{redeemSuccessVoucher.code}</Text>
                </View>

                <Text style={styles.promoCodeExpiry}>
                  Valid until {redeemSuccessVoucher.expiresAt}
                </Text>
              </View>
            )}

            <View style={styles.successActions}>
              {redeemSuccessVoucher && (
                <TouchableOpacity
                  style={styles.shareBtn}
                  onPress={() => handleShareVoucher(redeemSuccessVoucher)}
                >
                  <Feather name="share-2" size={16} color="#2563EB" />
                  <Text style={styles.shareBtnText}>Share Code</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.doneBtn}
                onPress={() => setRedeemSuccessVoucher(null)}
              >
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleGroup: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
    gap: 4,
  },
  coinPillIcon: {
    fontSize: 14,
  },
  coinPillText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FCD34D',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroCard: {
    margin: 16,
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  heroBalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  heroCoinSymbol: {
    fontSize: 28,
  },
  heroBalanceText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroTierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  heroTierText: {
    color: '#FCD34D',
    fontSize: 11,
    fontWeight: '700',
  },
  heroQuickRedeemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCD34D',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  heroQuickRedeemText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  tierProgressContainer: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  tierProgressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tierProgressLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  tierMultiplierText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38BDF8',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#334155',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
  },
  tabButtonActive: {
    backgroundColor: '#EFF6FF',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  tabContent: {
    paddingHorizontal: 16,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  infoBannerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    lineHeight: 16,
  },
  cardSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 18,
  },
  ruleGroup: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ruleGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  badgeLetter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLetterText: {
    fontSize: 11,
    fontWeight: '800',
  },
  ruleGroupTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  ruleGroupPointsHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  ruleOrderBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FEF08A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  ruleOrderText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#854D0E',
  },
  ruleLabel: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  rulePoints: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  maxEvidencePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  maxEvidenceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  verificationNoteRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  verificationNoteText: {
    flex: 1,
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
  },
  poolGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  poolCard: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  poolCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  poolCardIcon: {
    fontSize: 12,
  },
  poolCardSeverity: {
    fontSize: 10,
    fontWeight: '800',
  },
  poolCardCoins: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  poolCardCoinsLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  simFieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  simPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  simPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  simPillActive: {
    backgroundColor: '#2563EB',
  },
  simPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  evidenceToggleRow: {
    flexDirection: 'row',
    gap: 6,
  },
  evidenceToggle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  evidenceToggleActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  evidenceToggleText: {
    fontSize: 11,
    color: '#64748B',
  },
  simResultCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
  },
  simResultTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  simResultTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  simResultPoolBadge: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  simResultPoolText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  simBreakdownTable: {
    marginBottom: 12,
  },
  simTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  simTableCol1: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  simTableCol2: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  simTableTotalRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  simTableTotalLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FCD34D',
  },
  simTableTotalValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FCD34D',
  },
  simCoinsPayoutBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  simPayoutLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  simFormulaText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  simFinalCoinsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  simFinalCoinsIcon: {
    fontSize: 14,
  },
  simFinalCoinsValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  simFinalCoinsUnit: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DCFCE7',
  },
  flowList: {
    gap: 10,
  },
  flowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flowNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  flowContent: {
    flex: 1,
  },
  flowItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  flowItemDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  vouchersSection: {
    marginBottom: 16,
  },
  vouchersSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FCD34D',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  activeVoucherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  activeVoucherLeft: {
    flex: 1,
  },
  activeVoucherBrand: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  activeVoucherTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  codeBox: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  codeText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#2563EB',
    letterSpacing: 1,
  },
  voucherExpiryText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
  activeVoucherRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  activeVoucherDiscount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16A34A',
  },
  shareCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  shareCodeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  catalogList: {
    gap: 12,
  },
  catalogCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  catalogCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catalogIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catalogBrand: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  catalogTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  catalogBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  catalogBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  catalogDesc: {
    fontSize: 12,
    color: '#475569',
    marginTop: 8,
    lineHeight: 16,
  },
  catalogFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  catalogCostGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  catalogCostIcon: {
    fontSize: 16,
  },
  catalogCostValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  catalogCostLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  catalogRedeemBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  catalogRedeemBtnDisabled: {
    backgroundColor: '#E2E8F0',
  },
  catalogRedeemBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  catalogRedeemBtnTextDisabled: {
    color: '#94A3B8',
  },
  verifySimBanner: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  verifySimTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  verifySimDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    lineHeight: 14,
  },
  simulateVerifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  simulateVerifyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  sectionHeaderLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  poolDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  poolDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  poolDetailTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  poolDetailLocation: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  poolStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  poolStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  poolStatsBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginVertical: 10,
  },
  poolStatsText: {
    fontSize: 11,
    color: '#78350F',
  },
  poolStatsScore: {
    fontSize: 11,
    fontWeight: '700',
    color: '#78350F',
  },
  riderDistributionTable: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    overflow: 'hidden',
  },
  riderTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  riderTableCol: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
  riderTableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  riderTableCell: {
    flex: 1,
    fontSize: 11,
    color: '#334155',
    textAlign: 'center',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  txIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  txSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  txTime: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  leaderHero: {
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  leaderHeroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 6,
  },
  leaderHeroSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  leaderRankCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderRankText: {
    fontSize: 13,
    fontWeight: '900',
  },
  leaderName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  leaderTier: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  leaderCoinsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 2,
  },
  leaderCoinsIcon: {
    fontSize: 12,
  },
  leaderCoinsValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#78350F',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalBody: {
    alignItems: 'center',
  },
  modalIconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  modalItemBrand: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  modalItemDiscount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#16A34A',
    marginTop: 4,
  },
  modalItemDesc: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
  },
  modalPriceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 8,
  },
  modalPriceLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  modalPriceValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalPriceRemaining: {
    fontSize: 13,
    fontWeight: '800',
    color: '#16A34A',
  },
  modalConfirmBtn: {
    backgroundColor: '#2563EB',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  modalConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  successCheckCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  voucherCodeCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  voucherCardBrand: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  voucherCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  voucherCardDiscount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#16A34A',
    marginTop: 4,
  },
  promoCodeBox: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#2563EB',
    borderStyle: 'dashed',
    marginTop: 12,
  },
  promoCodeText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2563EB',
    letterSpacing: 2,
  },
  promoCodeExpiry: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 8,
  },
  successActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  doneBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 12,
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
