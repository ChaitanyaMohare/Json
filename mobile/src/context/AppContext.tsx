import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Coordinates,
  DestinationItem,
  RouteOption,
  TravelMode,
  IncidentType,
  Report,
  SavedPlace,
  MapLayersState,
  UserProfile,
  GeoTagMetadata,
  CoinTransaction,
  IncidentRewardPool,
  RedeemedVoucher,
  UserRewardTier,
  IncidentSeverityLevel,
  RewardCatalogItem,
  RiderDistributionDetail,
} from '../types';
import {
  mockRoutes,
  DEFAULT_COORDS,
  DEFAULT_USER_PROFILE,
} from '../data/mockData';
import { LocationService } from '../services/locationService';
import { ReportService } from '../services/reportService';
import { DirectionsService } from '../services/directionsService';
import {
  RewardService,
  INITIAL_TRANSACTIONS,
  INITIAL_POOLS,
} from '../services/rewardService';

const STORAGE_KEY_SAVED_PLACES = '@waysure_saved_places_v2';
const STORAGE_KEY_USER_PROFILE = '@waysure_user_profile_v2';
const STORAGE_KEY_SAFETY_COINS = '@waysure_safety_coins_v2';
const STORAGE_KEY_LIFETIME_COINS = '@waysure_lifetime_coins_v2';
const STORAGE_KEY_COIN_TXS = '@waysure_coin_txs_v2';
const STORAGE_KEY_POOLS = '@waysure_reward_pools_v2';
const STORAGE_KEY_VOUCHERS = '@waysure_vouchers_v2';

export interface AppContextType {
  // Location
  currentLocation: Coordinates;
  currentHeading: number | null;
  locationLabel: string;
  locationPermissionGranted: boolean;
  requestLocation: () => Promise<void>;

  // Destination & Routes
  selectedDestination: DestinationItem;
  setSelectedDestination: (dest: DestinationItem) => void;
  travelMode: TravelMode;
  setTravelMode: (mode: TravelMode) => void;
  availableRoutes: RouteOption[];
  selectedRoute: RouteOption;
  setSelectedRoute: (route: RouteOption) => void;
  recalculateRoutes: (
    dest?: DestinationItem,
    mode?: TravelMode,
    origin?: Coordinates
  ) => Promise<void>;

  // Navigation State
  isNavigating: boolean;
  startNavigation: (route?: RouteOption) => void;
  endNavigation: () => void;
  navigationMuted: boolean;
  setNavigationMuted: (muted: boolean) => void;
  currentSpeed: number;

  // Safety & Power Safety Mode
  powerSafetyMode: boolean;
  setPowerSafetyMode: (enabled: boolean) => void;

  // Modals & Sheets
  incidentAlertVisible: boolean;
  setIncidentAlertVisible: (visible: boolean) => void;
  alternativeRouteVisible: boolean;
  setAlternativeRouteVisible: (visible: boolean) => void;
  reportQuickSheetVisible: boolean;
  setReportQuickSheetVisible: (visible: boolean) => void;
  selectedIncidentType: IncidentType;
  setSelectedIncidentType: (type: IncidentType) => void;

  // Map Layers
  mapLayers: MapLayersState;
  toggleMapLayer: (layer: keyof MapLayersState) => void;

  // Reports
  submittedReports: Report[];
  submitNewReport: (
    incidentType: IncidentType,
    description: string,
    photoUri: string | null,
    locationLabel: string,
    customCoords?: Coordinates,
    geoTag?: GeoTagMetadata | null
  ) => Promise<Report>;

  // Saved Places
  savedPlaces: SavedPlace[];
  savePlace: (place: SavedPlace) => void;

  // Side Menu & Sub-screens
  sideMenuOpen: boolean;
  setSideMenuOpen: (open: boolean) => void;
  activeDrawerModal:
    | null
    | 'saved_places'
    | 'safety_rewards'
    | 'offline_maps'
    | 'safety_settings'
    | 'emergency_contacts'
    | 'your_reports'
    | 'app_settings'
    | 'help';
  setActiveDrawerModal: (
    modal:
      | null
      | 'saved_places'
      | 'safety_rewards'
      | 'offline_maps'
      | 'safety_settings'
      | 'emergency_contacts'
      | 'your_reports'
      | 'app_settings'
      | 'help'
  ) => void;

  // User Profile
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;

  // RouteGuard Safety Coin Reward System
  safetyCoins: number;
  lifetimeCoins: number;
  coinTransactions: CoinTransaction[];
  rewardPools: IncidentRewardPool[];
  redeemedVouchers: RedeemedVoucher[];
  userRewardTier: UserRewardTier;
  claimIncidentReward: (
    poolId: string,
    overrideSeverity?: IncidentSeverityLevel
  ) => Promise<{ coinsEarned: number; newBalance: number }>;
  redeemRewardVoucher: (
    rewardItem: RewardCatalogItem
  ) => Promise<{ success: boolean; voucher?: RedeemedVoucher; error?: string }>;
  simulateVerifyReport: (
    reportId: string,
    severity?: IncidentSeverityLevel
  ) => Promise<number>;
}

const defaultLayers: MapLayersState = {
  incidents: true,
  hospitals: true,
  police: true,
  fuel: true,
  cng: true,
  garages: true,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Location state
  const [currentLocation, setCurrentLocation] =
    useState<Coordinates>(DEFAULT_COORDS);
  const [currentHeading, setCurrentHeading] = useState<number | null>(null);
  const [locationLabel, setLocationLabel] = useState<string>('Locating...');
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState<boolean>(false);
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);

  // Destination & Route state
  const [selectedDestination, setSelectedDestination] =
    useState<DestinationItem>({
      id: 'dest-initial',
      name: 'Select Destination',
      state: 'Destination',
      address: 'Choose your destination',
    });
  const [travelMode, setTravelMode] = useState<TravelMode>('car');
  const [availableRoutes, setAvailableRoutes] =
    useState<RouteOption[]>(mockRoutes);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption>(
    mockRoutes[0]
  );

  // Navigation status
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [navigationMuted, setNavigationMuted] = useState<boolean>(false);

  // Sheet & alert visibility
  const [incidentAlertVisible, setIncidentAlertVisible] =
    useState<boolean>(false);
  const [alternativeRouteVisible, setAlternativeRouteVisible] =
    useState<boolean>(false);
  const [reportQuickSheetVisible, setReportQuickSheetVisible] =
    useState<boolean>(false);
  const [selectedIncidentType, setSelectedIncidentType] =
    useState<IncidentType>('accident');

  const [powerSafetyMode, setPowerSafetyMode] = useState<boolean>(true);

  // Map layers
  const [mapLayers, setMapLayers] = useState<MapLayersState>(defaultLayers);

  // Reports (clean initial state)
  const [submittedReports, setSubmittedReports] = useState<Report[]>([]);

  // Saved Places (clean initial state)
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);

  // Drawer / Side Menu
  const [sideMenuOpen, setSideMenuOpen] = useState<boolean>(false);
  const [activeDrawerModal, setActiveDrawerModal] = useState<
    | null
    | 'saved_places'
    | 'safety_rewards'
    | 'offline_maps'
    | 'safety_settings'
    | 'emergency_contacts'
    | 'your_reports'
    | 'app_settings'
    | 'help'
  >(null);

  // User Profile State
  const [userProfile, setUserProfile] =
    useState<UserProfile>(DEFAULT_USER_PROFILE);

  // RouteGuard Safety Coins State
  const [safetyCoins, setSafetyCoins] = useState<number>(340);
  const [lifetimeCoins, setLifetimeCoins] = useState<number>(480);
  const [coinTransactions, setCoinTransactions] = useState<CoinTransaction[]>(
    INITIAL_TRANSACTIONS
  );
  const [rewardPools, setRewardPools] =
    useState<IncidentRewardPool[]>(INITIAL_POOLS);
  const [redeemedVouchers, setRedeemedVouchers] = useState<RedeemedVoucher[]>([]);

  const userRewardTier = RewardService.getUserTier(lifetimeCoins);

  // Init location, reports, profile, and rewards
  useEffect(() => {
    requestLocation();
    loadReports();
    loadSavedPlaces();
    loadUserProfile();
    loadRewardData();
  }, []);

  const loadRewardData = async () => {
    try {
      const [savedCoins, savedLifetime, savedTxs, savedPools, savedVouchers] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_SAFETY_COINS),
          AsyncStorage.getItem(STORAGE_KEY_LIFETIME_COINS),
          AsyncStorage.getItem(STORAGE_KEY_COIN_TXS),
          AsyncStorage.getItem(STORAGE_KEY_POOLS),
          AsyncStorage.getItem(STORAGE_KEY_VOUCHERS),
        ]);

      if (savedCoins) setSafetyCoins(Number(savedCoins));
      if (savedLifetime) setLifetimeCoins(Number(savedLifetime));
      if (savedTxs) setCoinTransactions(JSON.parse(savedTxs));
      if (savedPools) setRewardPools(JSON.parse(savedPools));
      if (savedVouchers) setRedeemedVouchers(JSON.parse(savedVouchers));
    } catch (e) {
      console.warn('Failed to load reward data from storage:', e);
    }
  };

  const saveRewardsToStorage = async (
    coins: number,
    lifetime: number,
    txs: CoinTransaction[],
    pools: IncidentRewardPool[],
    vouchers: RedeemedVoucher[]
  ) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEY_SAFETY_COINS, String(coins)),
        AsyncStorage.setItem(STORAGE_KEY_LIFETIME_COINS, String(lifetime)),
        AsyncStorage.setItem(STORAGE_KEY_COIN_TXS, JSON.stringify(txs)),
        AsyncStorage.setItem(STORAGE_KEY_POOLS, JSON.stringify(pools)),
        AsyncStorage.setItem(STORAGE_KEY_VOUCHERS, JSON.stringify(vouchers)),
      ]);
    } catch (e) {
      console.warn('Failed to save reward data:', e);
    }
  };

  const requestLocation = async () => {
    try {
      const locResult = await LocationService.getCurrentLocation();
      setLocationPermissionGranted(locResult.granted);
      setCurrentLocation(locResult.coordinates);
      if (locResult.label) {
        setLocationLabel(locResult.label);
      }
      if (locResult.speedKmh) {
        setCurrentSpeed(locResult.speedKmh);
      }
      if (locResult.heading !== undefined && locResult.heading !== null) {
        setCurrentHeading(locResult.heading);
      }

      if (locResult.granted) {
        LocationService.watchLocation((coords, speed, heading) => {
          setCurrentLocation(coords);
          if (speed !== undefined && speed >= 0) setCurrentSpeed(speed);
          if (heading !== undefined && heading !== null) setCurrentHeading(heading);
        });
      }
    } catch (e) {
      console.warn('Failed in requestLocation:', e);
    }
  };

  const loadReports = async () => {
    const reps = await ReportService.getReports();
    setSubmittedReports(reps);
  };

  const loadSavedPlaces = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY_SAVED_PLACES);
      if (data) {
        setSavedPlaces(JSON.parse(data));
      } else {
        setSavedPlaces([]);
      }
    } catch {
      setSavedPlaces([]);
    }
  };

  const loadUserProfile = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY_USER_PROFILE);
      if (data) {
        setUserProfile((prev) => ({ ...prev, ...JSON.parse(data) }));
      }
    } catch (e) {
      console.warn('Failed to load user profile:', e);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    try {
      setUserProfile((prev) => {
        const next = { ...prev, ...updates };
        AsyncStorage.setItem(STORAGE_KEY_USER_PROFILE, JSON.stringify(next)).catch(() => {});
        return next;
      });
    } catch (e) {
      console.warn('Failed to update user profile:', e);
    }
  };

  const recalculateRoutes = async (
    dest: DestinationItem = selectedDestination,
    mode: TravelMode = travelMode,
    originCoords: Coordinates = currentLocation
  ) => {
    if (dest.coordinates) {
      const routes = await DirectionsService.calculateRoutes(
        originCoords,
        dest.coordinates,
        mode
      );
      setAvailableRoutes(routes);
      if (routes.length > 0) {
        setSelectedRoute(routes[0]);
      }
    }
  };

  const startNavigation = (route?: RouteOption) => {
    if (route) {
      setSelectedRoute(route);
    }
    LocationService.resetSpeed();
    setCurrentSpeed(0);
    setIsNavigating(true);
  };

  const endNavigation = () => {
    setIsNavigating(false);
    setIncidentAlertVisible(false);
    setAlternativeRouteVisible(false);
    LocationService.resetSpeed();
    setCurrentSpeed(0);
  };

  const toggleMapLayer = (layer: keyof MapLayersState) => {
    setMapLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  };

  const submitNewReport = async (
    incidentType: IncidentType,
    description: string,
    photoUri: string | null,
    locLabel: string,
    customCoords?: Coordinates,
    geoTag?: GeoTagMetadata | null
  ): Promise<Report> => {
    const title =
      incidentType === 'accident'
        ? 'Accident'
        : incidentType === 'road_blockage'
        ? 'Road Block'
        : incidentType === 'road_damage'
        ? 'Road Damage'
        : incidentType === 'heavy_traffic'
        ? 'Heavy Traffic'
        : incidentType === 'flooding'
        ? 'Flooding'
        : 'Hazard Alert';

    const targetLat =
      customCoords?.latitude ||
      geoTag?.latitude ||
      currentLocation.latitude;
    const targetLng =
      customCoords?.longitude ||
      geoTag?.longitude ||
      currentLocation.longitude;
    const targetLabel =
      locLabel || geoTag?.addressLabel || locationLabel || 'Live Location';

    const reportId = `rep-${Date.now()}`;
    const newReport: Report = {
      id: reportId,
      incidentType,
      title,
      description,
      photoUri,
      latitude: targetLat,
      longitude: targetLng,
      locationLabel: targetLabel,
      createdAt: 'Just now',
      status: geoTag ? 'Confirmed' : 'Under Verification',
      reliability: geoTag ? 'High Confidence' : 'Needs Verification',
      supportingReports: geoTag ? 3 : 1,
      geoTag: geoTag || undefined,
    };

    // Determine reporter rank (1st to 5th earn reward points; 6th+ are capped by anti-farming protection)
    const existingSimilarReports = submittedReports.filter(
      (r) =>
        r.incidentType === incidentType &&
        Math.abs(r.latitude - targetLat) < 0.003 &&
        Math.abs(r.longitude - targetLng) < 0.003
    );
    const orderRank = existingSimilarReports.length + 1;

    // Create a corresponding Incident Reward Pool entry
    const breakdown = RewardService.calculateContributionScore({
      orderRank,
      hasDescription: Boolean(description && description.trim().length > 0),
      hasPhoto: Boolean(photoUri),
      hasVideo: false,
      gpsAccuracyMeters: geoTag?.accuracyMeters || 8,
    });

    const poolSeverity: IncidentSeverityLevel =
      incidentType === 'accident' || incidentType === 'flooding'
        ? 'HIGH'
        : incidentType === 'road_blockage' || incidentType === 'road_damage'
        ? 'MEDIUM'
        : 'LOW';

    const isEligible = orderRank <= RewardService.MAX_REPORTERS_ELIGIBLE_FOR_POINTS;
    const coinsEarned = isEligible
      ? orderRank === 1
        ? 75
        : orderRank === 2
        ? 55
        : orderRank === 3
        ? 40
        : orderRank === 4
        ? 30
        : 20
      : 0;

    const distributed = RewardService.distributePoolCoins(poolSeverity, [
      {
        riderId: 'rider-self',
        riderName: `You (${orderRank === 1 ? '1st' : orderRank === 2 ? '2nd' : orderRank === 3 ? '3rd' : orderRank === 4 ? '4th' : orderRank === 5 ? '5th' : `${orderRank}th`} Reporter)`,
        isCurrentUser: true,
        score: breakdown.totalScore,
        orderRank,
        orderPoints: breakdown.orderPoints,
        evidencePoints: breakdown.evidenceTotalPoints,
        gpsPoints: breakdown.gpsPoints,
      },
    ]);

    const newPool: IncidentRewardPool = {
      id: `pool-${reportId}`,
      incidentTitle: title,
      locationLabel: targetLabel,
      severity: poolSeverity,
      totalPoolCoins: distributed.reduce((s, r) => s + r.finalCoins, 0),
      totalContributionScore: breakdown.totalScore,
      riders: distributed,
      status: 'pending_verification',
      verifiedAt: undefined,
    };

    const nextPools = [newPool, ...rewardPools];

    // Immediately update user's safety reward account with earned points
    let nextBalance = safetyCoins;
    let nextLifetime = lifetimeCoins;
    let nextTxs = coinTransactions;

    if (isEligible && coinsEarned > 0) {
      nextBalance = safetyCoins + coinsEarned;
      nextLifetime = lifetimeCoins + coinsEarned;
      const newTx: CoinTransaction = {
        id: `tx-${Date.now()}`,
        type: 'earned_report',
        amount: coinsEarned,
        title: `${title} Verified`,
        subtitle: `Rank #${orderRank} Reporter (+${coinsEarned} Safety Coins credited)`,
        timestamp: 'Just now',
        severity: poolSeverity,
        breakdown,
      };
      nextTxs = [newTx, ...coinTransactions];
      setSafetyCoins(nextBalance);
      setLifetimeCoins(nextLifetime);
      setCoinTransactions(nextTxs);
    }

    setRewardPools(nextPools);
    saveRewardsToStorage(
      nextBalance,
      nextLifetime,
      nextTxs,
      nextPools,
      redeemedVouchers
    );

    return newReport;
  };

  const simulateVerifyReport = async (
    reportId: string,
    overrideSeverity?: IncidentSeverityLevel
  ): Promise<number> => {
    const poolIndex = rewardPools.findIndex(
      (p) => p.id === `pool-${reportId}` || p.id === reportId
    );

    if (poolIndex === -1) {
      // Create and verify on the fly
      const coinsEarned = 73;
      const newBalance = safetyCoins + coinsEarned;
      const newLifetime = lifetimeCoins + coinsEarned;
      const newTx: CoinTransaction = {
        id: `tx-${Date.now()}`,
        type: 'earned_report',
        amount: coinsEarned,
        title: 'Road Hazard Verified',
        subtitle: '1st Report (50) + Photo (10) + GPS (15) = 75 Score',
        timestamp: 'Just now',
        severity: 'HIGH',
      };
      const nextTxs = [newTx, ...coinTransactions];
      setSafetyCoins(newBalance);
      setLifetimeCoins(newLifetime);
      setCoinTransactions(nextTxs);
      saveRewardsToStorage(
        newBalance,
        newLifetime,
        nextTxs,
        rewardPools,
        redeemedVouchers
      );
      return coinsEarned;
    }

    const targetPool = rewardPools[poolIndex];
    const severity = overrideSeverity || targetPool.severity;

    // Simulate multi-rider corroboration if only 1 rider existed
    const ridersToDistribute =
      targetPool.riders.length > 1
        ? targetPool.riders.map((r: RiderDistributionDetail) => ({
            ...r,
            score: r.totalScore,
          }))
        : [
            {
              riderId: 'rider-self',
              riderName: 'You (1st Reporter)',
              isCurrentUser: true,
              score: targetPool.riders[0]?.totalScore || 75,
              orderRank: 1,
              orderPoints: 50,
              evidencePoints: 10,
              gpsPoints: 15,
            },
            {
              riderId: 'rider-corrob-1',
              riderName: 'Rider B (2nd Corroborator)',
              isCurrentUser: false,
              score: 60,
              orderRank: 2,
              orderPoints: 35,
              evidencePoints: 10,
              gpsPoints: 15,
            },
          ];

    const distributed = RewardService.distributePoolCoins(
      severity,
      ridersToDistribute
    );
    const userRider = distributed.find((r) => r.isCurrentUser) || distributed[0];
    const coinsEarned = userRider ? userRider.finalCoins : 50;

    const updatedPool: IncidentRewardPool = {
      ...targetPool,
      severity,
      status: 'verified_distributed',
      verifiedAt: 'Just now',
      riders: distributed,
      totalContributionScore: distributed.reduce((s, r) => s + r.totalScore, 0),
    };

    const nextPools = [...rewardPools];
    nextPools[poolIndex] = updatedPool;

    const newBalance = safetyCoins + coinsEarned;
    const newLifetime = lifetimeCoins + coinsEarned;

    const newTx: CoinTransaction = {
      id: `tx-${Date.now()}`,
      type: 'earned_report',
      amount: coinsEarned,
      title: `${targetPool.incidentTitle} Verified`,
      subtitle: `${userRider.orderRank === 1 ? '1st' : 'Corroborating'} Report • Score: ${userRider.totalScore}`,
      timestamp: 'Just now',
      severity,
      breakdown: {
        orderRank: userRider.orderRank,
        orderPoints: userRider.orderPoints,
        hasDescription: true,
        descriptionPoints: 5,
        hasPhoto: true,
        photoPoints: 10,
        hasVideo: false,
        videoPoints: 0,
        evidenceTotalPoints: userRider.evidencePoints,
        gpsAccuracyMeters: 6,
        gpsQuality: 'high',
        gpsPoints: userRider.gpsPoints,
        totalScore: userRider.totalScore,
      },
    };

    const nextTxs = [newTx, ...coinTransactions];

    setSafetyCoins(newBalance);
    setLifetimeCoins(newLifetime);
    setCoinTransactions(nextTxs);
    setRewardPools(nextPools);

    saveRewardsToStorage(
      newBalance,
      newLifetime,
      nextTxs,
      nextPools,
      redeemedVouchers
    );

    return coinsEarned;
  };

  const claimIncidentReward = async (
    poolId: string,
    overrideSeverity?: IncidentSeverityLevel
  ): Promise<{ coinsEarned: number; newBalance: number }> => {
    const coins = await simulateVerifyReport(poolId, overrideSeverity);
    return { coinsEarned: coins, newBalance: safetyCoins + coins };
  };

  const redeemRewardVoucher = async (
    rewardItem: RewardCatalogItem
  ): Promise<{ success: boolean; voucher?: RedeemedVoucher; error?: string }> => {
    if (safetyCoins < rewardItem.coinCost) {
      return {
        success: false,
        error: `Insufficient coins. You need ${rewardItem.coinCost} Safety Coins (Current: ${safetyCoins}).`,
      };
    }

    const code = RewardService.generateVoucherCode(rewardItem.brand);
    const newBalance = safetyCoins - rewardItem.coinCost;

    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + rewardItem.expiryDays);

    const newVoucher: RedeemedVoucher = {
      id: `vouch-${Date.now()}`,
      rewardId: rewardItem.id,
      title: rewardItem.title,
      brand: rewardItem.brand,
      discountText: rewardItem.discountText,
      code,
      redeemedAt: 'Just now',
      expiresAt: expireDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      coinSpent: rewardItem.coinCost,
      isUsed: false,
      category: rewardItem.category,
    };

    const newTx: CoinTransaction = {
      id: `tx-${Date.now()}`,
      type: 'redeemed_voucher',
      amount: -rewardItem.coinCost,
      title: `Redeemed: ${rewardItem.title}`,
      subtitle: `Promo Code: ${code}`,
      timestamp: 'Just now',
      voucherCode: code,
    };

    const nextVouchers = [newVoucher, ...redeemedVouchers];
    const nextTxs = [newTx, ...coinTransactions];

    setSafetyCoins(newBalance);
    setRedeemedVouchers(nextVouchers);
    setCoinTransactions(nextTxs);

    saveRewardsToStorage(
      newBalance,
      lifetimeCoins,
      nextTxs,
      rewardPools,
      nextVouchers
    );

    return {
      success: true,
      voucher: newVoucher,
    };
  };

  const savePlace = async (place: SavedPlace) => {
    const updated = [place, ...savedPlaces.filter((p) => p.id !== place.id)];
    setSavedPlaces(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_SAVED_PLACES, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving place to storage:', e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentLocation,
        currentHeading,
        locationLabel,
        locationPermissionGranted,
        requestLocation,
        selectedDestination,
        setSelectedDestination,
        travelMode,
        setTravelMode,
        availableRoutes,
        selectedRoute,
        setSelectedRoute,
        recalculateRoutes,
        isNavigating,
        startNavigation,
        endNavigation,
        navigationMuted,
        setNavigationMuted,
        currentSpeed,
        powerSafetyMode,
        setPowerSafetyMode,
        incidentAlertVisible,
        setIncidentAlertVisible,
        alternativeRouteVisible,
        setAlternativeRouteVisible,
        reportQuickSheetVisible,
        setReportQuickSheetVisible,
        selectedIncidentType,
        setSelectedIncidentType,
        mapLayers,
        toggleMapLayer,
        submittedReports,
        submitNewReport,
        savedPlaces,
        savePlace,
        sideMenuOpen,
        setSideMenuOpen,
        activeDrawerModal,
        setActiveDrawerModal,
        userProfile,
        updateUserProfile,
        safetyCoins,
        lifetimeCoins,
        coinTransactions,
        rewardPools,
        redeemedVouchers,
        userRewardTier,
        claimIncidentReward,
        redeemRewardVoucher,
        simulateVerifyReport,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
