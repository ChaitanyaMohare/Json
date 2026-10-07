import {
  IncidentSeverityLevel,
  ContributionScoreBreakdown,
  IncidentRewardPool,
  RiderDistributionDetail,
  CoinTransaction,
  RewardCatalogItem,
  RedeemedVoucher,
  UserRewardTier,
} from '../types';

export const REWARD_TIERS: UserRewardTier[] = [
  {
    name: 'Bronze Scout',
    level: 1,
    badgeIcon: 'shield-outline',
    minCoins: 0,
    maxCoins: 150,
    multiplierText: '1.0x Standard Coins',
    color: '#CD7F32',
    perks: ['Basic Hazard Reporting', 'Community Verification Access'],
  },
  {
    name: 'Silver Guardian',
    level: 2,
    badgeIcon: 'shield-checkmark-outline',
    minCoins: 150,
    maxCoins: 400,
    multiplierText: '1.05x (+5% Coin Bonus)',
    color: '#94A3B8',
    perks: ['5% Bonus on High Severity Pools', 'Priority AI Verification', 'Exclusive Partner Vouchers'],
  },
  {
    name: 'Gold Sentinel',
    level: 3,
    badgeIcon: 'shield-sharp',
    minCoins: 400,
    maxCoins: 800,
    multiplierText: '1.10x (+10% Coin Bonus)',
    color: '#EAB308',
    perks: ['10% Bonus on All Verified Reports', 'Early Access to New Safety Gear', 'Direct Admin Review Queue'],
  },
  {
    name: 'Platinum Road Captain',
    level: 4,
    badgeIcon: 'ribbon-outline',
    minCoins: 800,
    maxCoins: 1500,
    multiplierText: '1.15x (+15% Coin Bonus)',
    color: '#06B6D4',
    perks: ['15% Bonus Coins', 'Free Monthly Toll Voucher', 'VIP Roadside Assistance Access'],
  },
  {
    name: 'Diamond Legend',
    level: 5,
    badgeIcon: 'trophy-outline',
    minCoins: 1500,
    maxCoins: 99999,
    multiplierText: '1.25x (+25% Coin Bonus)',
    color: '#8B5CF6',
    perks: ['25% Lifetime Multiplier', 'Free Premium Safety Jacket Voucher', 'Community Moderator Badge'],
  },
];

export const SEVERITY_REWARD_POOLS: Record<IncidentSeverityLevel, number> = {
  LOW: 50,
  MEDIUM: 100,
  HIGH: 200,
  CRITICAL: 300,
};

export const REWARD_CATALOG: RewardCatalogItem[] = [
  {
    id: 'rew-1',
    title: 'Steelbird Air Pro Helmet',
    brand: 'Steelbird',
    category: 'gear',
    coinCost: 120,
    discountText: '25% OFF',
    description: 'DOT & ISI certified dual-visor aerodynamic helmet with anti-fog visor.',
    badge: 'Popular',
    iconName: 'shield',
    accentColor: '#2563EB',
    stockStatus: 'In Stock',
    expiryDays: 30,
  },
  {
    id: 'rew-2',
    title: 'Axor Breeze Riding Gloves',
    brand: 'Axor',
    category: 'gear',
    coinCost: 180,
    discountText: '30% OFF',
    description: 'Armored carbon-fiber knuckle protection with touchscreen fingertips.',
    badge: 'Top Safety',
    iconName: 'hand-right-outline',
    accentColor: '#10B981',
    stockStatus: 'In Stock',
    expiryDays: 45,
  },
  {
    id: 'rew-3',
    title: 'Rynox Stealth Air Jacket',
    brand: 'Rynox Gears',
    category: 'gear',
    coinCost: 250,
    discountText: '₹600 Voucher',
    description: 'Level 2 CE armor with heavy-duty mesh ventilation for hot highway rides.',
    badge: 'Exclusive',
    iconName: 'shirt-outline',
    accentColor: '#8B5CF6',
    stockStatus: 'Limited Stock',
    expiryDays: 60,
  },
  {
    id: 'rew-4',
    title: 'IndianOil Fuel Cashback',
    brand: 'IndianOil XTRAPREMIUM',
    category: 'fuel',
    coinCost: 200,
    discountText: '₹200 Instant Fuel',
    description: 'Direct QR fuel cashback redeemable at any authorized petrol pump.',
    badge: 'Instant Redeem',
    iconName: 'flame-outline',
    accentColor: '#F97316',
    stockStatus: 'In Stock',
    expiryDays: 15,
  },
  {
    id: 'rew-5',
    title: 'Fastag Toll Highway Pass',
    brand: 'National Highway Fastag',
    category: 'toll',
    coinCost: 100,
    discountText: '15% Toll Discount',
    description: 'Automatic toll fee deduction rebate applied to your linked vehicle Fastag.',
    badge: 'Save Daily',
    iconName: 'card-outline',
    accentColor: '#0EA5E9',
    stockStatus: 'In Stock',
    expiryDays: 30,
  },
  {
    id: 'rew-6',
    title: 'Castrol Chain Clean & Lube Kit',
    brand: 'Castrol Lubricants',
    category: 'maintenance',
    coinCost: 150,
    discountText: '40% OFF',
    description: 'Synthetic high-performance chain maintenance kit for bikes and cars.',
    badge: 'Essential',
    iconName: 'construct-outline',
    accentColor: '#10B981',
    stockStatus: 'In Stock',
    expiryDays: 60,
  },
  {
    id: 'rew-7',
    title: '1-Year Roadside Assistance',
    brand: 'WaySure Rescue 24/7',
    category: 'voucher',
    coinCost: 320,
    discountText: '100% Free Plan',
    description: 'Unlimited 24/7 towing, emergency flat-tire repair, battery jumpstart & fuel delivery.',
    badge: 'Guardian Tier',
    iconName: 'medical-outline',
    accentColor: '#EF4444',
    stockStatus: 'Limited Stock',
    expiryDays: 365,
  },
];

export const INITIAL_TRANSACTIONS: CoinTransaction[] = [
  {
    id: 'tx-1',
    type: 'earned_report',
    amount: 73,
    title: 'High Severity Pothole Verified',
    subtitle: '1st Report (50) + Photo (10) + GPS (15) = 75 Score',
    timestamp: '2 hours ago',
    severity: 'HIGH',
    breakdown: {
      orderRank: 1,
      orderPoints: 50,
      hasDescription: true,
      descriptionPoints: 5,
      hasPhoto: true,
      photoPoints: 10,
      hasVideo: false,
      videoPoints: 0,
      evidenceTotalPoints: 10,
      gpsAccuracyMeters: 6,
      gpsQuality: 'high',
      gpsPoints: 15,
      totalScore: 75,
    },
  },
  {
    id: 'tx-2',
    type: 'earned_report',
    amount: 58,
    title: 'Heavy Traffic Block Corroborated',
    subtitle: '2nd Report (35) + Photo (10) + GPS (15) = 60 Score',
    timestamp: 'Yesterday',
    severity: 'HIGH',
    breakdown: {
      orderRank: 2,
      orderPoints: 35,
      hasDescription: true,
      descriptionPoints: 5,
      hasPhoto: true,
      photoPoints: 10,
      hasVideo: false,
      videoPoints: 0,
      evidenceTotalPoints: 10,
      gpsAccuracyMeters: 8,
      gpsQuality: 'high',
      gpsPoints: 15,
      totalScore: 60,
    },
  },
  {
    id: 'tx-3',
    type: 'earned_report',
    amount: 85,
    title: 'Road Blockage Hazard Verified',
    subtitle: '1st Report (50) + Video (15) + GPS (15) = 80 Score',
    timestamp: '3 days ago',
    severity: 'MEDIUM',
    breakdown: {
      orderRank: 1,
      orderPoints: 50,
      hasDescription: true,
      descriptionPoints: 5,
      hasPhoto: false,
      photoPoints: 0,
      hasVideo: true,
      videoPoints: 15,
      evidenceTotalPoints: 15,
      gpsAccuracyMeters: 5,
      gpsQuality: 'high',
      gpsPoints: 15,
      totalScore: 80,
    },
  },
  {
    id: 'tx-4',
    type: 'tier_bonus',
    amount: 25,
    title: 'Gold Sentinel Tier Level-Up Bonus',
    subtitle: 'Reached 400+ Safety Coins milestone',
    timestamp: '4 days ago',
  },
];

export const INITIAL_POOLS: IncidentRewardPool[] = [
  {
    id: 'pool-1',
    incidentTitle: 'Deep Pothole on Express Highway',
    locationLabel: 'Outer Ring Road, Km 14',
    severity: 'HIGH',
    totalPoolCoins: 200,
    totalContributionScore: 190,
    status: 'verified_distributed',
    verifiedAt: '2 hours ago',
    riders: [
      {
        riderId: 'rider-self',
        riderName: 'You (1st Rider)',
        isCurrentUser: true,
        orderRank: 1,
        orderPoints: 50,
        evidencePoints: 10,
        gpsPoints: 15,
        totalScore: 75,
        finalCoins: 73,
      },
      {
        riderId: 'rider-2',
        riderName: 'Rider B (2nd Corroborator)',
        isCurrentUser: false,
        orderRank: 2,
        orderPoints: 35,
        evidencePoints: 10,
        gpsPoints: 15,
        totalScore: 60,
        finalCoins: 58,
      },
      {
        riderId: 'rider-3',
        riderName: 'Rider C (3rd Corroborator)',
        isCurrentUser: false,
        orderRank: 3,
        orderPoints: 25,
        evidencePoints: 15,
        gpsPoints: 15,
        totalScore: 55,
        finalCoins: 54,
      },
    ],
  },
  {
    id: 'pool-2',
    incidentTitle: 'Overturned Vehicle on Flyover',
    locationLabel: 'Sector 62 Flyover',
    severity: 'CRITICAL',
    totalPoolCoins: 300,
    totalContributionScore: 245,
    status: 'verified_distributed',
    verifiedAt: 'Yesterday',
    riders: [
      {
        riderId: 'rider-self',
        riderName: 'You (1st Reporter)',
        isCurrentUser: true,
        orderRank: 1,
        orderPoints: 50,
        evidencePoints: 25,
        gpsPoints: 15,
        totalScore: 90,
        finalCoins: 110,
      },
      {
        riderId: 'rider-4',
        riderName: 'Aarav Sharma',
        isCurrentUser: false,
        orderRank: 2,
        orderPoints: 35,
        evidencePoints: 20,
        gpsPoints: 15,
        totalScore: 70,
        finalCoins: 86,
      },
      {
        riderId: 'rider-5',
        riderName: 'Pooja Verma',
        isCurrentUser: false,
        orderRank: 3,
        orderPoints: 25,
        evidencePoints: 15,
        gpsPoints: 15,
        totalScore: 55,
        finalCoins: 67,
      },
      {
        riderId: 'rider-6',
        riderName: 'Kunal Patel',
        isCurrentUser: false,
        orderRank: 4,
        orderPoints: 15,
        evidencePoints: 10,
        gpsPoints: 10,
        totalScore: 35,
        finalCoins: 37,
      },
    ],
  },
  {
    id: 'pool-3',
    incidentTitle: 'Fallen Tree Branch on Lane 2',
    locationLabel: 'Greenwood Avenue',
    severity: 'MEDIUM',
    totalPoolCoins: 100,
    totalContributionScore: 135,
    status: 'pending_verification',
    riders: [
      {
        riderId: 'rider-self',
        riderName: 'You (1st Reporter)',
        isCurrentUser: true,
        orderRank: 1,
        orderPoints: 50,
        evidencePoints: 15,
        gpsPoints: 15,
        totalScore: 80,
        finalCoins: 59,
      },
      {
        riderId: 'rider-7',
        riderName: 'Devansh K.',
        isCurrentUser: false,
        orderRank: 2,
        orderPoints: 35,
        evidencePoints: 10,
        gpsPoints: 10,
        totalScore: 55,
        finalCoins: 41,
      },
    ],
  },
];

export class RewardService {
  /**
   * 1. Get Reporting Order Points
   * 1st valid report = 50 pts
   * 2nd valid report = 35 pts
   * 3rd valid report = 25 pts
   * 4th valid report = 15 pts
   * 5th+ valid report = 10 pts
   */
  static getOrderPoints(orderRank: number): number {
    if (orderRank <= 1) return 50;
    if (orderRank === 2) return 35;
    if (orderRank === 3) return 25;
    if (orderRank === 4) return 15;
    return 10;
  }

  /**
   * 2. Evidence Quality Points
   * Useful description = +5
   * Photo evidence = +10
   * Video evidence = +15
   * Max evidence points = 25 (max)
   */
  static getEvidencePoints(
    hasDescription: boolean,
    hasPhoto: boolean,
    hasVideo: boolean
  ): {
    descriptionPoints: number;
    photoPoints: number;
    videoPoints: number;
    totalEvidencePoints: number;
  } {
    const descriptionPoints = hasDescription ? 5 : 0;
    const photoPoints = hasPhoto ? 10 : 0;
    const videoPoints = hasVideo ? 15 : 0;
    const rawTotal = descriptionPoints + photoPoints + videoPoints;
    const totalEvidencePoints = Math.min(25, rawTotal);

    return {
      descriptionPoints,
      photoPoints,
      videoPoints,
      totalEvidencePoints,
    };
  }

  /**
   * 3. Location Accuracy Points
   * Highly accurate GPS (< 10m) = +15
   * Reasonably accurate GPS (10m - 30m) = +10
   * Poor / uncertain GPS (> 30m) = +0
   */
  static getGpsPoints(accuracyMeters?: number): {
    gpsPoints: number;
    gpsQuality: 'high' | 'medium' | 'poor';
  } {
    if (accuracyMeters === undefined || accuracyMeters === null) {
      return { gpsPoints: 15, gpsQuality: 'high' }; // default live high accuracy
    }
    if (accuracyMeters <= 10) {
      return { gpsPoints: 15, gpsQuality: 'high' };
    }
    if (accuracyMeters <= 30) {
      return { gpsPoints: 10, gpsQuality: 'medium' };
    }
    return { gpsPoints: 0, gpsQuality: 'poor' };
  }

  /**
   * Full Contribution Score Calculation:
   * Contribution Score = Reporting Order Points + Evidence Quality Points + Location Accuracy Points
   */
  static calculateContributionScore(params: {
    orderRank?: number;
    hasDescription?: boolean;
    hasPhoto?: boolean;
    hasVideo?: boolean;
    gpsAccuracyMeters?: number;
  }): ContributionScoreBreakdown {
    const orderRank = Math.max(1, params.orderRank || 1);
    const orderPoints = this.getOrderPoints(orderRank);

    const hasDescription = Boolean(params.hasDescription);
    const hasPhoto = Boolean(params.hasPhoto);
    const hasVideo = Boolean(params.hasVideo);

    const evidence = this.getEvidencePoints(
      hasDescription,
      hasPhoto,
      hasVideo
    );

    const gps = this.getGpsPoints(params.gpsAccuracyMeters);

    const totalScore =
      orderPoints + evidence.totalEvidencePoints + gps.gpsPoints;

    return {
      orderRank,
      orderPoints,
      hasDescription,
      descriptionPoints: evidence.descriptionPoints,
      hasPhoto,
      photoPoints: evidence.photoPoints,
      hasVideo,
      videoPoints: evidence.videoPoints,
      evidenceTotalPoints: evidence.totalEvidencePoints,
      gpsAccuracyMeters: params.gpsAccuracyMeters,
      gpsQuality: gps.gpsQuality,
      gpsPoints: gps.gpsPoints,
      totalScore,
    };
  }

  /**
   * Proportional Reward Distribution Formula:
   * Rider Coins = Incident Reward Pool * (Rider Contribution Score / Total Contribution Scores)
   */
  static distributePoolCoins(
    severity: IncidentSeverityLevel,
    riders: Array<{
      riderId: string;
      riderName: string;
      isCurrentUser: boolean;
      score: number;
      orderRank: number;
      orderPoints: number;
      evidencePoints: number;
      gpsPoints: number;
    }>
  ): RiderDistributionDetail[] {
    const totalPool = SEVERITY_REWARD_POOLS[severity] || 100;
    const totalScore = riders.reduce((sum, r) => sum + r.score, 0);

    if (totalScore === 0) {
      return riders.map((r) => ({
        riderId: r.riderId,
        riderName: r.riderName,
        isCurrentUser: r.isCurrentUser,
        orderRank: r.orderRank,
        orderPoints: r.orderPoints,
        evidencePoints: r.evidencePoints,
        gpsPoints: r.gpsPoints,
        totalScore: r.score,
        finalCoins: 0,
      }));
    }

    let distributedSum = 0;
    const results: RiderDistributionDetail[] = riders.map((r) => {
      const exactCoins = (totalPool * r.score) / totalScore;
      const roundedCoins = Math.round(exactCoins);
      distributedSum += roundedCoins;
      return {
        riderId: r.riderId,
        riderName: r.riderName,
        isCurrentUser: r.isCurrentUser,
        orderRank: r.orderRank,
        orderPoints: r.orderPoints,
        evidencePoints: r.evidencePoints,
        gpsPoints: r.gpsPoints,
        totalScore: r.score,
        finalCoins: roundedCoins,
      };
    });

    // Reconcile rounding difference so sum equals exact pool
    const diff = totalPool - distributedSum;
    if (diff !== 0 && results.length > 0) {
      results[0].finalCoins += diff;
    }

    return results;
  }

  /**
   * Helper to determine User Tier based on lifetime coins earned
   */
  static getUserTier(lifetimeCoins: number): UserRewardTier {
    for (let i = REWARD_TIERS.length - 1; i >= 0; i--) {
      if (lifetimeCoins >= REWARD_TIERS[i].minCoins) {
        return REWARD_TIERS[i];
      }
    }
    return REWARD_TIERS[0];
  }

  /**
   * Generate a unique promotional code for voucher redemption
   */
  static generateVoucherCode(brand: string): string {
    const prefix = brand.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'WAY';
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const randChars = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${randNum}-${randChars}`;
  }
}
