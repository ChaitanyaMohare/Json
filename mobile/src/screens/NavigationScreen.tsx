import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { MapboxMap } from '../components/MapboxMap';
import { NavigationInstructionCard } from '../components/NavigationInstructionCard';
import { NavigationStatusSheet } from '../components/NavigationStatusSheet';
import { IncidentAlertSheet } from '../components/IncidentAlertSheet';
import { BottomSheet } from '../components/BottomSheet';
import { MapLayerSheet } from '../components/MapLayerSheet';
import {
  RouteOption,
  SpeedDropEvent,
  RouteCorridorService,
  CorridorServiceCategory,
  Incident,
} from '../types';
import { useApp } from '../context/AppContext';
import { VehicleIconType } from '../data/mockData';
import { NavigationProgressData } from '../components/InteractiveMap';
import { SafetyMonitoringService } from '../services/safetyMonitoringService';
import { calculateHaversineDistanceMeters } from '../services/locationService';

interface NavigationScreenProps {
  route: RouteOption;
  onEndNavigation: () => void;
  onOpenReport: () => void;
  onOpenAlternativeRoute: () => void;
  onArrived: () => void;
}

export const NavigationScreen: React.FC<NavigationScreenProps> = ({
  route,
  onEndNavigation,
  onOpenReport,
  onOpenAlternativeRoute,
  onArrived,
}) => {
  const {
    currentLocation,
    currentHeading,
    currentSpeed,
    selectedDestination,
    travelMode,
    navigationMuted,
    setNavigationMuted,
    mapLayers,
    toggleMapLayer,
    incidentAlertVisible,
    setIncidentAlertVisible,
    userProfile,
    submitNewReport,
    powerSafetyMode,
    setPowerSafetyMode,
    incidents,
  } = useApp();

  const [layersSheetVisible, setLayersSheetVisible] = useState(false);
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [dismissedIncidentIds, setDismissedIncidentIds] = useState<string[]>([]);
  
  // Auto-sync selected vehicle icon with selected travel mode
  const effectiveMode = route?.travelMode || travelMode;
  const initialVehicle: VehicleIconType =
    effectiveMode === 'walk'
      ? 'walk'
      : effectiveMode === 'bike'
      ? 'bike'
      : 'car';

  const [selectedVehicle, setSelectedVehicle] = useState<VehicleIconType>(initialVehicle);

  useEffect(() => {
    const activeMode = route?.travelMode || travelMode;
    if (activeMode === 'walk') {
      setSelectedVehicle('walk');
    } else if (activeMode === 'bike') {
      setSelectedVehicle('bike');
    } else {
      setSelectedVehicle('car');
    }
  }, [travelMode, route?.travelMode]);

  // Real-time GPS navigation state
  const [isDriving, setIsDriving] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(2);
  const [recenterCount, setRecenterCount] = useState<number>(0);
  const [restartCount, setRestartCount] = useState<number>(0);

  // Driver Mode & Auto-Zoom State
  const [driverMode, setDriverMode] = useState<boolean>(true);
  const [driverAutoZoom, setDriverAutoZoom] = useState<boolean>(true);
  const [userHasPanned, setUserHasPanned] = useState<boolean>(false);

  // FEATURE 1: SPEED-DROP ALERT STATE
  const [speedDropEvent, setSpeedDropEvent] = useState<SpeedDropEvent | null>(null);

  // FEATURE 2: IN-NAVIGATION ROUTE SERVICES DRAWER & PROXIMITY ALERT
  const [servicesDrawerVisible, setServicesDrawerVisible] = useState(false);
  const [serviceCategory, setServiceCategory] = useState<CorridorServiceCategory | 'all'>('all');
  const [activeServiceProximity, setActiveServiceProximity] =
    useState<RouteCorridorService | null>(null);

  // FEATURE 3: POWER SAFETY MODE - CUSTOMIZABLE PLANNED HALT (DAYS, HOURS, MINS)
  const [isPlannedHalt, setIsPlannedHalt] = useState(false);
  const [plannedHaltReason, setPlannedHaltReason] = useState('Tea / Coffee Break');
  const [plannedHaltDays, setPlannedHaltDays] = useState(0);
  const [plannedHaltHours, setPlannedHaltHours] = useState(0);
  const [plannedHaltMins, setPlannedHaltMins] = useState(30);
  const [plannedHaltRemainingSec, setPlannedHaltRemainingSec] = useState(1800);
  const [plannedHaltTotalSec, setPlannedHaltTotalSec] = useState(1800);
  const [plannedHaltModalVisible, setPlannedHaltModalVisible] = useState(false);

  // FEATURE 4: POWER SAFETY MODE - 4-STAGE UNEXPECTED STOPPAGE CHECK-IN & ESCALATION
  const [safeCheckInVisible, setSafeCheckInVisible] = useState(false);
  const [safeCheckInStage, setSafeCheckInStage] = useState<
    'stage1_inquiry' | 'stage2_second_checkin' | 'stage3_emergency_contact' | 'stage4_assistance'
  >('stage1_inquiry');
  const [countdownSeconds, setCountdownSeconds] = useState(45);
  const [stoppedSeconds, setStoppedSeconds] = useState(0);

  // Live Navigation Telemetry
  const [telemetry, setTelemetry] = useState<NavigationProgressData>({
    coveredKm: 0,
    remainingKm: parseFloat(route.distance.replace(/[^\d.]/g, '')) || 12,
    progress: 0,
    speedKmh: 0,
    nextTurnMeters: 450,
    turnType: 'straight',
    turnInstruction:
      effectiveMode === 'walk'
        ? `Walk towards ${selectedDestination.name}`
        : effectiveMode === 'bike'
        ? `Ride towards ${selectedDestination.name}`
        : `Drive towards ${selectedDestination.name}`,
  });

  // REAL-TIME DISTANCE TRACKING: Computes distance between rider's car and active reported incidents
  const nearestIncidentAlert = useMemo(() => {
    if (!incidents || incidents.length === 0 || !currentLocation) return null;
    let closest: {
      incident: Incident;
      distanceMeters: number;
      distanceText: string;
    } | null = null;

    for (const inc of incidents) {
      if (!inc.coordinates || !inc.coordinates.latitude || !inc.coordinates.longitude) continue;
      const d = calculateHaversineDistanceMeters(
        currentLocation.latitude,
        currentLocation.longitude,
        inc.coordinates.latitude,
        inc.coordinates.longitude
      );
      if (!closest || d < closest.distanceMeters) {
        const dText =
          d < 1000 ? `${Math.round(d)} m from your car` : `${(d / 1000).toFixed(1)} km from your car`;
        closest = { incident: inc, distanceMeters: d, distanceText: dText };
      }
    }
    return closest;
  }, [incidents, currentLocation?.latitude, currentLocation?.longitude]);

  // Fetch Corridor Services distributed along route
  const corridorServices = SafetyMonitoringService.getRouteCorridorServices(
    currentLocation,
    selectedDestination.coordinates || currentLocation,
    serviceCategory,
    route.type,
    travelMode,
    route.coordinates
  );

  // Format remaining seconds into clean Days / Hours / Mins / Secs
  const formatHaltRemainingTime = (totalSec: number): string => {
    if (totalSec <= 0) return '0m 00s';
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${mins}m`;
    }
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  // Get Target Resume Date & Time label for custom duration
  const getHaltTargetTimeLabel = (days: number, hours: number, mins: number): string => {
    const totalMs = (days * 86400 + hours * 3600 + mins * 60) * 1000;
    if (totalMs <= 0) return 'Immediate resume';
    const target = new Date(Date.now() + totalMs);
    const timeStr = target.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    if (days === 0) {
      return `Today, ${timeStr}`;
    }
    if (days === 1) {
      return `Tomorrow, ${timeStr}`;
    }
    return `${target.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}, ${timeStr}`;
  };

  // Planned Halt Countdown Timer
  useEffect(() => {
    let timer: any = null;
    if (isPlannedHalt && plannedHaltRemainingSec > 0) {
      timer = setTimeout(() => {
        setPlannedHaltRemainingSec((sec) => sec - 1);
      }, 1000);
    } else if (isPlannedHalt && plannedHaltRemainingSec === 0) {
      setIsPlannedHalt(false);
      Alert.alert(
        'Planned Break Concluded',
        'Your planned halt duration has ended. Navigation and safety monitoring have resumed.',
        [{ text: 'OK' }]
      );
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlannedHalt, plannedHaltRemainingSec]);

  // Multi-Stage Safe Check-In Countdown Progression
  useEffect(() => {
    let timer: any = null;
    if (safeCheckInVisible && countdownSeconds > 0) {
      timer = setTimeout(() => {
        setCountdownSeconds((s) => s - 1);
      }, 1000);
    } else if (safeCheckInVisible && countdownSeconds === 0) {
      // Advance stages automatically on timeout
      if (safeCheckInStage === 'stage1_inquiry') {
        // Stage 1 -> Stage 2: Second check-in
        setSafeCheckInStage('stage2_second_checkin');
        setCountdownSeconds(30);
      } else if (safeCheckInStage === 'stage2_second_checkin') {
        // Stage 2 -> Stage 3: Contact emergency contact with GPS coords
        setSafeCheckInStage('stage3_emergency_contact');
        setCountdownSeconds(20);
      } else if (safeCheckInStage === 'stage3_emergency_contact') {
        // Stage 3 -> Stage 4: Escalate to emergency services
        setSafeCheckInStage('stage4_assistance');
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [safeCheckInVisible, safeCheckInStage, countdownSeconds]);

  // Monitor Speed-Drop on telemetry or GPS updates & Stoppage Monitor
  const handleProgressUpdate = (data: NavigationProgressData) => {
    setTelemetry(data);

    // Run speed-drop detection algorithm
    const liveSpeed = isDriving ? data.speedKmh : currentSpeed || 0;
    const drop = SafetyMonitoringService.processSpeedReading(
      liveSpeed,
      currentLocation
    );
    if (drop && !speedDropEvent && !isPlannedHalt) {
      setSpeedDropEvent(drop);
    }

    // Check proximity to upcoming services along route
    if (data.coveredKm > 1 && !activeServiceProximity && corridorServices.length > 0) {
      const nearest = corridorServices[0];
      setActiveServiceProximity(nearest);
    }
  };

  // Planned Halt Handlers with Days, Hours, and Minutes
  const handleStartPlannedHalt = (
    days: number,
    hours: number,
    mins: number,
    reason: string
  ) => {
    const totalSec = (days * 86400 + hours * 3600 + mins * 60);
    const effectiveSec = Math.max(60, totalSec); // At least 1 minute
    setIsPlannedHalt(true);
    setPlannedHaltReason(reason);
    setPlannedHaltDays(days);
    setPlannedHaltHours(hours);
    setPlannedHaltMins(mins);
    setPlannedHaltTotalSec(effectiveSec);
    setPlannedHaltRemainingSec(effectiveSec);
    setPlannedHaltModalVisible(false);
    if (safeCheckInVisible) {
      setSafeCheckInVisible(false);
    }
  };

  const handleResumeFromPlannedHalt = () => {
    setIsPlannedHalt(false);
    Alert.alert('Resuming Trip', 'Planned halt ended. Active route safety protection is resumed.');
  };

  const handleTriggerSafeCheckIn = () => {
    setCountdownSeconds(45);
    setSafeCheckInStage('stage1_inquiry');
    setSafeCheckInVisible(true);
  };

  // Handle Speed-Drop User Responses
  const handleSpeedDropResponse = async (
    type: 'traffic' | 'blockage' | 'accident' | 'normal_stop'
  ) => {
    if (type === 'normal_stop') {
      setSpeedDropEvent(null);
      Alert.alert(
        'Normal Stop Noted',
        'Have a safe break! Your stop is not recorded as any hazard or accident.'
      );
      return;
    }

    const incidentType =
      type === 'traffic'
        ? 'heavy_traffic'
        : type === 'blockage'
        ? 'road_blockage'
        : 'accident';

    const desc =
      type === 'traffic'
        ? 'Sudden deceleration caused by heavy traffic buildup.'
        : type === 'blockage'
        ? 'Vehicle stopped due to road construction / obstruction.'
        : 'Hazard or emergency stop on active route.';

    await submitNewReport(
      incidentType,
      desc,
      null,
      selectedDestination.name,
      currentLocation,
      {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        timestamp: new Date().toISOString(),
        addressLabel: selectedDestination.name,
        accuracyMeters: 6,
      }
    );

    setSpeedDropEvent(null);
    Alert.alert(
      'Hazard Signal Registered',
      'Thank you! Your verified signal helps warn oncoming riders and credits Safety Coins to your wallet upon verification.'
    );
  };

  const handleSimulateSpeedDrop = () => {
    setSpeedDropEvent({
      id: `sim-drop-${Date.now()}`,
      previousSpeedKmh: 54,
      currentSpeedKmh: 8,
      deltaKmh: 46,
      timestamp: Date.now(),
      coordinates: currentLocation,
      status: 'detected',
    });
  };

  const handleCallEmergencyContact = () => {
    const phone = userProfile?.emergencyContactPhone || '112';
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Emergency Dispatch', `Calling ${phone}...`);
    });
  };

  const handleEndNavigationPrompt = () => {
    Alert.alert(
      'End Navigation?',
      `Are you sure you want to stop navigating to ${selectedDestination.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Arrived at Destination',
          onPress: onArrived,
        },
        {
          text: 'Exit Navigation',
          style: 'destructive',
          onPress: onEndNavigation,
        },
      ]
    );
  };

  const handleVoiceInstruction = () => {
    const speechText = `${telemetry.turnInstruction}. ${
      telemetry.subsequentInstruction ? telemetry.subsequentInstruction + '.' : ''
    } ${telemetry.remainingKm} km remaining, arrival estimated at ${route.arrivalTime || 'schedule'}.`;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(speechText);
        utter.rate = 1.0;
        utter.pitch = 1.0;
        window.speechSynthesis.speak(utter);
      } catch (e) {}
    }

    Alert.alert('Turn Guidance', speechText);
  };

  const vehicleOptions: {
    type: VehicleIconType;
    label: string;
    icon: string;
    desc: string;
  }[] = [
    { type: 'car', label: 'Sedan Car', icon: 'car-side', desc: 'Default blue sports sedan' },
    { type: 'walk', label: 'Walking Pedestrian', icon: 'walk', desc: 'Walking mode with steps & pedestrian routing' },
    { type: 'suv', label: 'City SUV', icon: 'car-estate', desc: 'Amber highway SUV' },
    { type: 'bike', label: 'Motorbike', icon: 'motorbike', desc: 'Two-wheeler agility mode' },
    { type: 'arrow', label: 'Navigation Dart', icon: 'navigation', desc: 'Minimal 3D navigation chevron' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 60fps Navigation Engine with Driver Mode Auto-Zoom */}
      <MapboxMap
        currentLocation={currentLocation}
        currentHeading={currentHeading}
        currentSpeed={currentSpeed}
        selectedRoute={route}
        destination={{
          latitude: selectedDestination?.coordinates?.latitude,
          longitude: selectedDestination?.coordinates?.longitude,
          name: selectedDestination?.name,
        }}
        destinationLabel={selectedDestination?.name}
        corridorServices={corridorServices}
        incidents={incidents}
        onSelectIncident={(inc) => {
          setSelectedIncident(inc);
          setIncidentAlertVisible(true);
        }}
        isNavigating={true}
        isDriving={isDriving}
        simulationSpeed={simSpeed}
        vehicleType={selectedVehicle}
        recenterTrigger={recenterCount}
        restartTrigger={restartCount}
        driverMode={driverMode}
        driverAutoZoom={driverAutoZoom}
        navigationMuted={navigationMuted}
        onUserPanned={() => setUserHasPanned(true)}
        onNavigationProgress={handleProgressUpdate}
        onArrived={onArrived}
      />

      {/* Top Turn-by-Turn Instruction Card (Driver HUD) */}
      <SafeAreaView style={styles.topOverlay} edges={['top']}>
        <NavigationInstructionCard
          instruction={telemetry.turnInstruction}
          distance={
            telemetry.nextTurnMeters > 1000
              ? `${(telemetry.nextTurnMeters / 1000).toFixed(1)} km`
              : `${telemetry.nextTurnMeters} m`
          }
          turnDirection={telemetry.turnType}
          subsequentTurnDirection={telemetry.subsequentTurnType}
          subsequentInstruction={telemetry.subsequentInstruction}
          subsequentDistance={
            telemetry.subsequentTurnMeters
              ? telemetry.subsequentTurnMeters >= 1000
                ? `${(telemetry.subsequentTurnMeters / 1000).toFixed(1)} km`
                : `${telemetry.subsequentTurnMeters} m`
              : null
          }
          nextTurnMeters={telemetry.nextTurnMeters}
          speedKmh={isDriving ? telemetry.speedKmh : currentSpeed || 0}
          driverModeEnabled={driverMode}
          isMuted={navigationMuted}
          autoZoomLevel={telemetry.autoZoomLevel}
          onMicPress={handleVoiceInstruction}
          onToggleDriverMode={() => setDriverMode((prev) => !prev)}
        />

        {/* PLANNED HALT ACTIVE BANNER */}
        {isPlannedHalt && (
          <View style={styles.plannedHaltBanner}>
            <View style={styles.plannedHaltBannerIconBox}>
              <Ionicons name="cafe" size={16} color="#D97706" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.plannedHaltBannerTitle}>Planned Halt Active · {plannedHaltReason}</Text>
              <Text style={styles.plannedHaltBannerSub}>
                {formatHaltRemainingTime(plannedHaltRemainingSec)} left · Safety alerts paused
              </Text>
            </View>
            <TouchableOpacity
              style={styles.resumeTripBtn}
              onPress={handleResumeFromPlannedHalt}
              activeOpacity={0.8}
            >
              <Ionicons name="play" size={14} color="#FFFFFF" />
              <Text style={styles.resumeTripBtnText}>Resume</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>

      {/* IN-NAVIGATION LIVE HAZARD PROXIMITY BANNER (TELLS DISTANCE TO RIDER'S CAR) */}
      {nearestIncidentAlert &&
        nearestIncidentAlert.distanceMeters <= 3000 &&
        !dismissedIncidentIds.includes(nearestIncidentAlert.incident.id) && (
          <View style={styles.hazardProximityBanner}>
            <View style={styles.hazardProximityIconBox}>
              <Ionicons name="warning" size={18} color="#DC2626" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.hazardProximityTitle}>
                  {nearestIncidentAlert.incident.title} Ahead
                </Text>
                <View style={styles.hazardSeverityBadge}>
                  <Text style={styles.hazardSeverityText}>
                    {nearestIncidentAlert.incident.severity || 'Caution'}
                  </Text>
                </View>
              </View>
              <Text style={styles.hazardProximitySub}>
                {nearestIncidentAlert.distanceText} · {nearestIncidentAlert.incident.location}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.hazardProximityViewBtn}
              onPress={() => {
                setSelectedIncident(nearestIncidentAlert.incident);
                setIncidentAlertVisible(true);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.hazardProximityViewBtnText}>View</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                setDismissedIncidentIds((prev) => [...prev, nearestIncidentAlert.incident.id])
              }
              style={{ padding: 4 }}
            >
              <Feather name="x" size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        )}

      {/* IN-NAVIGATION UPCOMING SERVICE PROXIMITY BANNER */}
      {activeServiceProximity && !nearestIncidentAlert && (
        <View style={styles.serviceProximityBanner}>
          <View style={[styles.serviceProximityIcon, { backgroundColor: `${activeServiceProximity.color}20` }]}>
            <Ionicons name={activeServiceProximity.iconName as any} size={20} color={activeServiceProximity.color} />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.serviceProximityTitle}>
              {activeServiceProximity.name}
            </Text>
            <Text style={styles.serviceProximitySub}>
              800m ahead along route ({activeServiceProximity.operatingHours})
            </Text>
          </View>
          <TouchableOpacity
            style={styles.serviceProximityViewBtn}
            onPress={() => setServicesDrawerVisible(true)}
          >
            <Text style={styles.serviceProximityViewBtnText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveServiceProximity(null)}
            style={{ padding: 4 }}
          >
            <Feather name="x" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      )}

      {/* Minimal Right Floating Controls Stack */}
      <View style={styles.rightBar}>
        {/* Report Hazard (High-visibility Safety Action) */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnHazard]}
          activeOpacity={0.8}
          onPress={onOpenReport}
        >
          <Ionicons name="warning" size={20} color="#DC2626" />
        </TouchableOpacity>

        {/* Take a Halt Quick Trigger */}
        <TouchableOpacity
          style={[styles.actionBtn, isPlannedHalt && { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}
          activeOpacity={0.8}
          onPress={() => {
            if (isPlannedHalt) {
              handleResumeFromPlannedHalt();
            } else {
              setPlannedHaltModalVisible(true);
            }
          }}
        >
          <Ionicons name={isPlannedHalt ? 'play' : 'cafe'} size={18} color={isPlannedHalt ? '#059669' : '#D97706'} />
        </TouchableOpacity>

        {/* View Route Corridor Services Button */}
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.8}
          onPress={() => setServicesDrawerVisible(true)}
        >
          <Ionicons name="compass-outline" size={20} color="#2563EB" />
        </TouchableOpacity>

        {/* Map Layers */}
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.8}
          onPress={() => setLayersSheetVisible(true)}
        >
          <Ionicons name="layers-outline" size={20} color="#1E293B" />
        </TouchableOpacity>
      </View>

      {/* Speedometer HUD */}
      {(() => {
        const advisorySpeedLimit =
          selectedVehicle === 'walk' ? 6 : selectedVehicle === 'bike' ? 35 : 60;
        const liveSpeed = isDriving
          ? telemetry.speedKmh
          : Math.max(0, Math.round(currentSpeed || 0));
        const isOverSpeed = liveSpeed > advisorySpeedLimit;

        return (
          <View style={styles.speedometerContainer}>
            <View
              style={[
                styles.speedometerHUD,
                isOverSpeed && styles.speedometerHUDOverSpeed,
              ]}
            >
              <Text
                style={[
                  styles.speedValue,
                  isOverSpeed && styles.speedValueOverSpeed,
                ]}
              >
                {liveSpeed}
              </Text>
              <Text style={styles.speedUnit}>km/h</Text>
            </View>

            {selectedVehicle !== 'walk' && (
              <View style={styles.speedLimitSign}>
                <Text style={styles.speedLimitSignNumber}>{advisorySpeedLimit}</Text>
                <Text style={styles.speedLimitSignLabel}>LIMIT</Text>
              </View>
            )}
          </View>
        );
      })()}

      {/* Bottom Floating Navigation Status Sheet */}
      <View style={styles.bottomSheetWrapper}>
        <NavigationStatusSheet
          duration={route.duration || 'Calculating...'}
          distance={route.distance || 'Calculating...'}
          coveredDistance={`${telemetry.coveredKm} km covered`}
          remainingDistance={`${telemetry.remainingKm} km left`}
          progress={telemetry.progress}
          arrivalTime={route.arrivalTime || '--:--'}
          onClose={handleEndNavigationPrompt}
          onSwitchRoute={onOpenAlternativeRoute}
        />
      </View>

      {/* ============================================================ */}
      {/* FEATURE 1 MODAL: SPEED-DROP ALERT (SIGNAL-BASED INQUIRY)      */}
      {/* ============================================================ */}
      <Modal
        visible={Boolean(speedDropEvent)}
        transparent
        animationType="slide"
        onRequestClose={() => setSpeedDropEvent(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.speedDropCard}>
            <View style={styles.speedDropHeader}>
              <View style={styles.speedDropIconBox}>
                <Ionicons name="speedometer" size={26} color="#DC2626" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.speedDropTitle}>Sudden Slowdown Detected</Text>
                <Text style={styles.speedDropSub}>
                  Speed dropped from {speedDropEvent?.previousSpeedKmh} km/h to {speedDropEvent?.currentSpeedKmh} km/h
                </Text>
              </View>
            </View>

            <Text style={styles.speedDropQuestion}>
              Are you encountering traffic, road blockage, or another hazard ahead?
            </Text>

            {/* Quick-Response Options */}
            <View style={styles.speedDropOptions}>
              <TouchableOpacity
                style={styles.speedDropOptionBtn}
                onPress={() => handleSpeedDropResponse('traffic')}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="traffic-light" size={24} color="#D97706" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.speedDropOptionTitle}>Heavy Traffic / Sudden Jam</Text>
                  <Text style={styles.speedDropOptionSub}>Alerts oncoming riders behind you</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.speedDropOptionBtn}
                onPress={() => handleSpeedDropResponse('blockage')}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="road-variant" size={24} color="#DC2626" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.speedDropOptionTitle}>Road Blockage / Work</Text>
                  <Text style={styles.speedDropOptionSub}>Logs lane obstruction notice</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.speedDropOptionBtn}
                onPress={() => handleSpeedDropResponse('accident')}
                activeOpacity={0.8}
              >
                <Ionicons name="warning" size={24} color="#DC2626" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.speedDropOptionTitle}>Hazard / Accident Ahead</Text>
                  <Text style={styles.speedDropOptionSub}>Emergency safety alert</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.speedDropOptionBtn, { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' }]}
                onPress={() => handleSpeedDropResponse('normal_stop')}
                activeOpacity={0.8}
              >
                <Ionicons name="cafe" size={22} color="#475569" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.speedDropOptionTitle}>Normal Stop (Signal / Break)</Text>
                  <Text style={styles.speedDropOptionSub}>Dismiss without false alarm</Text>
                </View>
                <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
              </TouchableOpacity>
            </View>

            <Text style={styles.speedDropPolicyNote}>
              Note: A speed drop is treated as a telemetry signal, never automatically as an accident.
            </Text>
          </View>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* FEATURE 2 MODAL: ROUTE CORRIDOR SERVICES DRAWER              */}
      {/* ============================================================ */}
      <Modal
        visible={servicesDrawerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setServicesDrawerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.servicesDrawerCard}>
            <View style={styles.drawerHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="compass" size={22} color="#2563EB" />
                <Text style={styles.drawerTitle}>Services Along Route</Text>
              </View>
              <TouchableOpacity onPress={() => setServicesDrawerVisible(false)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.drawerFilterScroll}>
              {[
                { key: 'all', label: 'All Services' },
                { key: 'petrol', label: 'Petrol' },
                { key: 'cng', label: 'CNG / EV' },
                { key: 'garage', label: 'Garages' },
                { key: 'hospital', label: 'Hospitals' },
                { key: 'police', label: 'Police' },
              ].map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.drawerFilterPill,
                    serviceCategory === cat.key && styles.drawerFilterPillActive,
                  ]}
                  onPress={() => setServiceCategory(cat.key as any)}
                >
                  <Text
                    style={[
                      styles.drawerFilterText,
                      serviceCategory === cat.key && styles.drawerFilterTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {corridorServices.map((service) => (
                <View key={service.id} style={styles.drawerServiceCard}>
                  <View style={[styles.drawerServiceIconBox, { backgroundColor: `${service.color}15` }]}>
                    <Ionicons name={service.iconName as any} size={22} color={service.color} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.drawerServiceName}>{service.name}</Text>
                    <Text style={styles.drawerServiceDist}>
                      {service.distanceFromStartKm} km from start • {service.distanceFromRouteMeters}m off highway
                    </Text>
                    <Text style={styles.drawerServiceHours}>Hours: {service.operatingHours}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.drawerCallBtn}
                    onPress={() => {
                      if (service.phone) {
                        Linking.openURL(`tel:${service.phone}`);
                      } else {
                        Alert.alert(service.name, service.address);
                      }
                    }}
                  >
                    <Feather name="phone" size={16} color="#2563EB" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* FEATURE 3: CUSTOMIZABLE PLANNED HALT (DAYS, HOURS, MINS)     */}
      {/* ============================================================ */}
      <Modal
        visible={plannedHaltModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPlannedHaltModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.haltModalCard}>
            <View style={styles.haltModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={styles.haltIconBox}>
                  <Ionicons name="cafe" size={20} color="#D97706" />
                </View>
                <View>
                  <Text style={styles.haltModalTitle}>Customize Planned Halt</Text>
                  <Text style={styles.haltModalSub}>Set stopping time & days for road trips or breaks</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setPlannedHaltModalVisible(false)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 480 }} showsVerticalScrollIndicator={false}>
              {/* Select Reason */}
              <Text style={styles.haltSectionHeading}>1. Select Break Reason:</Text>
              <View style={styles.haltReasonsGrid}>
                {[
                  { label: 'Tea / Coffee Break', key: 'Tea / Refreshment' },
                  { label: 'Food & Meal Stop', key: 'Meal Break' },
                  { label: 'Hotel / Overnight Stay', key: 'Overnight Stay' },
                  { label: 'Multi-Day Trip / Layover', key: 'Multi-Day Trip' },
                  { label: 'Fuel / Charging Station', key: 'Fuel & Maintenance' },
                  { label: 'Garage / Vehicle Check', key: 'Vehicle Check' },
                  { label: 'Rest / Power Nap', key: 'Rest Stop' },
                  { label: 'Planned Delay', key: 'Planned Delay' },
                ].map((r) => {
                  const isSelected = plannedHaltReason === r.label;
                  return (
                    <TouchableOpacity
                      key={r.key}
                      style={[styles.haltReasonChip, isSelected && styles.haltReasonChipSelected]}
                      onPress={() => setPlannedHaltReason(r.label)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[styles.haltReasonText, isSelected && styles.haltReasonTextSelected]}
                        numberOfLines={1}
                      >
                        {r.label}
                      </Text>
                      {isSelected && <Ionicons name="checkmark-circle" size={15} color="#2563EB" />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Quick Presets */}
              <Text style={styles.haltSectionHeading}>2. Quick Presets:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.haltPresetsScroll}>
                {[
                  { label: '15m (Tea)', d: 0, h: 0, m: 15 },
                  { label: '30m (Meal)', d: 0, h: 0, m: 30 },
                  { label: '1h (Rest)', d: 0, h: 1, m: 0 },
                  { label: '4h (Sleep)', d: 0, h: 4, m: 0 },
                  { label: '8h (Night)', d: 0, h: 8, m: 0 },
                  { label: '1 Day', d: 1, h: 0, m: 0 },
                  { label: '2 Days', d: 2, h: 0, m: 0 },
                  { label: '3 Days', d: 3, h: 0, m: 0 },
                ].map((preset) => {
                  const isMatch =
                    plannedHaltDays === preset.d &&
                    plannedHaltHours === preset.h &&
                    plannedHaltMins === preset.m;
                  return (
                    <TouchableOpacity
                      key={preset.label}
                      style={[styles.haltPresetPill, isMatch && styles.haltPresetPillSelected]}
                      onPress={() => {
                        setPlannedHaltDays(preset.d);
                        setPlannedHaltHours(preset.h);
                        setPlannedHaltMins(preset.m);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[styles.haltPresetText, isMatch && styles.haltPresetTextSelected]}
                      >
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Custom Stopping Time & Days Stepper System */}
              <Text style={styles.haltSectionHeading}>3. Custom Stopping Duration (Days & Time):</Text>
              
              {/* DAYS ROW */}
              <View style={styles.stepperContainer}>
                <View style={styles.stepperLabelBox}>
                  <Text style={styles.stepperLabelText}>Days</Text>
                  <Text style={styles.stepperSubText}>Multi-day halt</Text>
                </View>
                <View style={styles.stepperControls}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setPlannedHaltDays((d) => Math.max(0, d - 1))}
                    activeOpacity={0.7}
                  >
                    <Feather name="minus" size={16} color="#1E293B" />
                  </TouchableOpacity>
                  <View style={styles.stepperValueBox}>
                    <Text style={styles.stepperValueNum}>{plannedHaltDays}</Text>
                    <Text style={styles.stepperValueUnit}>{plannedHaltDays === 1 ? 'day' : 'days'}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setPlannedHaltDays((d) => Math.min(14, d + 1))}
                    activeOpacity={0.7}
                  >
                    <Feather name="plus" size={16} color="#1E293B" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* HOURS ROW */}
              <View style={styles.stepperContainer}>
                <View style={styles.stepperLabelBox}>
                  <Text style={styles.stepperLabelText}>Hours</Text>
                  <Text style={styles.stepperSubText}>0 to 23 hrs</Text>
                </View>
                <View style={styles.stepperControls}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setPlannedHaltHours((h) => Math.max(0, h - 1))}
                    activeOpacity={0.7}
                  >
                    <Feather name="minus" size={16} color="#1E293B" />
                  </TouchableOpacity>
                  <View style={styles.stepperValueBox}>
                    <Text style={styles.stepperValueNum}>{plannedHaltHours}</Text>
                    <Text style={styles.stepperValueUnit}>{plannedHaltHours === 1 ? 'hour' : 'hours'}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setPlannedHaltHours((h) => Math.min(23, h + 1))}
                    activeOpacity={0.7}
                  >
                    <Feather name="plus" size={16} color="#1E293B" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* MINUTES ROW */}
              <View style={styles.stepperContainer}>
                <View style={styles.stepperLabelBox}>
                  <Text style={styles.stepperLabelText}>Minutes</Text>
                  <Text style={styles.stepperSubText}>0 to 55 mins</Text>
                </View>
                <View style={styles.stepperControls}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setPlannedHaltMins((m) => Math.max(0, m - 5))}
                    activeOpacity={0.7}
                  >
                    <Feather name="minus" size={16} color="#1E293B" />
                  </TouchableOpacity>
                  <View style={styles.stepperValueBox}>
                    <Text style={styles.stepperValueNum}>{plannedHaltMins}</Text>
                    <Text style={styles.stepperValueUnit}>mins</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setPlannedHaltMins((m) => Math.min(55, m + 5))}
                    activeOpacity={0.7}
                  >
                    <Feather name="plus" size={16} color="#1E293B" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* LIVE DURATION & TARGET TIME SUMMARY CARD */}
              <View style={styles.haltSummaryCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={styles.haltSummaryHeading}>Planned Break Protection</Text>
                  <View style={styles.haltSummaryTag}>
                    <Text style={styles.haltSummaryTagText}>
                      {plannedHaltDays > 0 ? `${plannedHaltDays}d ` : ''}
                      {plannedHaltHours > 0 ? `${plannedHaltHours}h ` : ''}
                      {plannedHaltMins}m
                    </Text>
                  </View>
                </View>
                <Text style={styles.haltSummaryResumeText}>
                  Safe Until: <Text style={{ fontWeight: '800', color: '#1D4ED8' }}>{getHaltTargetTimeLabel(plannedHaltDays, plannedHaltHours, plannedHaltMins)}</Text>
                </Text>
                <Text style={styles.haltSummaryDescText}>
                  Stoppage inquiries, false accident alarms, and emergency escalations will remain paused until this time.
                </Text>
              </View>

              {/* Confirm Button */}
              <TouchableOpacity
                style={styles.confirmHaltBtn}
                onPress={() =>
                  handleStartPlannedHalt(
                    plannedHaltDays,
                    plannedHaltHours,
                    plannedHaltMins,
                    plannedHaltReason
                  )
                }
                activeOpacity={0.85}
              >
                <Ionicons name="cafe" size={18} color="#FFFFFF" />
                <Text style={styles.confirmHaltBtnText}>
                  Confirm{' '}
                  {plannedHaltDays > 0 ? `${plannedHaltDays} Day(s) ` : ''}
                  {plannedHaltHours > 0 ? `${plannedHaltHours} Hr ` : ''}
                  {plannedHaltMins} Min Halt
                </Text>
              </TouchableOpacity>

              <Text style={styles.haltPolicyNote}>
                You can tap "Resume" anytime when you restart moving to reactivate live stoppage safety alerts immediately.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* FEATURE 4: 4-STAGE UNEXPECTED STOPPAGE SAFETY ESCALATION     */}
      {/* ============================================================ */}
      <Modal
        visible={safeCheckInVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSafeCheckInVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.checkInCard}>
            {/* STAGE 1: INITIAL INQUIRY */}
            {safeCheckInStage === 'stage1_inquiry' && (
              <>
                <View style={styles.checkInCountdownCircle}>
                  <Text style={styles.checkInCountdownNumber}>{countdownSeconds}</Text>
                  <Text style={styles.checkInCountdownSec}>sec</Text>
                </View>

                <Text style={styles.checkInTitle}>Are you okay?</Text>
                <Text style={styles.checkInSub}>
                  We noticed your vehicle has been stationary for an unusually long period on this active route.
                </Text>

                <TouchableOpacity
                  style={styles.imOkButton}
                  onPress={() => setSafeCheckInVisible(false)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.imOkButtonText}>I'm OK & Safe</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.plannedHaltAltButton}
                  onPress={() => {
                    setSafeCheckInVisible(false);
                    setPlannedHaltModalVisible(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="cafe-outline" size={18} color="#D97706" style={{ marginRight: 6 }} />
                  <Text style={styles.plannedHaltAltButtonText}>This is a Planned Break</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.needHelpButton}
                  onPress={() => {
                    setSafeCheckInStage('stage3_emergency_contact');
                    setCountdownSeconds(20);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="alert-circle" size={18} color="#DC2626" />
                  <Text style={styles.needHelpButtonText}>I Need Assistance</Text>
                </TouchableOpacity>

                <Text style={styles.checkInPolicyText}>
                  {SafetyMonitoringService.getSafetyEscalationPolicyText()}
                </Text>
              </>
            )}

            {/* STAGE 2: SECOND SAFETY CHECK-IN */}
            {safeCheckInStage === 'stage2_second_checkin' && (
              <>
                <View style={[styles.checkInCountdownCircle, { borderColor: '#EA580C', backgroundColor: '#FFF7ED' }]}>
                  <Text style={[styles.checkInCountdownNumber, { color: '#EA580C' }]}>{countdownSeconds}</Text>
                  <Text style={[styles.checkInCountdownSec, { color: '#EA580C' }]}>sec</Text>
                </View>

                <Text style={[styles.checkInTitle, { color: '#EA580C' }]}>Second Safety Check</Text>
                <Text style={styles.checkInSub}>
                  No response was received from the first check. Please confirm you are safe within {countdownSeconds}s before your emergency contact is alerted.
                </Text>

                <TouchableOpacity
                  style={styles.imOkButton}
                  onPress={() => setSafeCheckInVisible(false)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.imOkButtonText}>I'm Safe - Dismiss Alert</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.callContactBtn}
                  onPress={() => {
                    setSafeCheckInStage('stage3_emergency_contact');
                    setCountdownSeconds(20);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="warning" size={18} color="#FFFFFF" />
                  <Text style={styles.callContactBtnText}>Alert Emergency Contact Now</Text>
                </TouchableOpacity>

                <Text style={styles.checkInPolicyText}>
                  {SafetyMonitoringService.getSafetyEscalationPolicyText()}
                </Text>
              </>
            )}

            {/* STAGE 3: CONTACTING EMERGENCY CONTACT */}
            {safeCheckInStage === 'stage3_emergency_contact' && (
              <>
                <View style={styles.escalationIconBox}>
                  <Ionicons name="warning" size={32} color="#DC2626" />
                </View>

                <Text style={styles.escalationTitle}>Alerting Emergency Contact</Text>
                <Text style={styles.escalationSub}>
                  Live coordinates dispatched. Contacting your registered emergency contact:
                </Text>

                <View style={styles.contactDetailsBox}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.contactNameText}>
                      {userProfile?.emergencyContactName || 'Designated Contact'}
                    </Text>
                    <View style={styles.gpsSentBadge}>
                      <Text style={styles.gpsSentText}>GPS Sent</Text>
                    </View>
                  </View>
                  <Text style={styles.contactPhoneText}>
                    {userProfile?.emergencyContactPhone || '+91 98765 43210'}
                  </Text>
                  <Text style={styles.contactGpsCoordText}>
                    Lat: {currentLocation.latitude.toFixed(4)}, Lng: {currentLocation.longitude.toFixed(4)} ({selectedDestination.name} Corridor)
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.callContactBtn}
                  onPress={handleCallEmergencyContact}
                  activeOpacity={0.8}
                >
                  <Feather name="phone-call" size={18} color="#FFFFFF" />
                  <Text style={styles.callContactBtnText}>Call Emergency Contact</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.escalateFurtherBtn}
                  onPress={() => setSafeCheckInStage('stage4_assistance')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="shield" size={18} color="#DC2626" />
                  <Text style={styles.escalateFurtherBtnText}>Offer Emergency Assistance Services</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dismissEscalationBtn}
                  onPress={() => setSafeCheckInVisible(false)}
                >
                  <Text style={styles.dismissEscalationBtnText}>I'm Safe - Cancel Alert</Text>
                </TouchableOpacity>

                <Text style={styles.checkInPolicyText}>
                  {SafetyMonitoringService.getSafetyEscalationPolicyText()}
                </Text>
              </>
            )}

            {/* STAGE 4: EMERGENCY ASSISTANCE SERVICES */}
            {safeCheckInStage === 'stage4_assistance' && (
              <>
                <View style={[styles.escalationIconBox, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="medical" size={32} color="#DC2626" />
                </View>

                <Text style={styles.escalationTitle}>Emergency Assistance Services</Text>
                <Text style={styles.escalationSub}>
                  Direct line to national emergency, medical trauma and highway police dispatch:
                </Text>

                <View style={styles.emergencyHelplinesContainer}>
                  <TouchableOpacity
                    style={styles.helplineOptionBtn}
                    onPress={() => Linking.openURL('tel:112')}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.helplineIconBox, { backgroundColor: '#DC2626' }]}>
                      <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 13 }}>112</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.helplineName}>National Emergency Helpline (112)</Text>
                      <Text style={styles.helplineDesc}>All-in-one emergency dispatch & rescue</Text>
                    </View>
                    <Feather name="phone" size={18} color="#DC2626" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.helplineOptionBtn}
                    onPress={() => Linking.openURL('tel:108')}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.helplineIconBox, { backgroundColor: '#0284C7' }]}>
                      <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 13 }}>108</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.helplineName}>Ambulance & Trauma Care (108)</Text>
                      <Text style={styles.helplineDesc}>Highway medical emergency unit</Text>
                    </View>
                    <Feather name="phone" size={18} color="#0284C7" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.helplineOptionBtn}
                    onPress={() => Linking.openURL('tel:100')}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.helplineIconBox, { backgroundColor: '#1E3A8A' }]}>
                      <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 13 }}>100</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.helplineName}>Highway Police Patrol (100)</Text>
                      <Text style={styles.helplineDesc}>Inter-state security & traffic aid</Text>
                    </View>
                    <Feather name="phone" size={18} color="#1E3A8A" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.dismissEscalationBtn}
                  onPress={() => setSafeCheckInVisible(false)}
                >
                  <Text style={styles.dismissEscalationBtnText}>I'm Safe - Dismiss Assistance</Text>
                </TouchableOpacity>

                <Text style={styles.checkInPolicyText}>
                  {SafetyMonitoringService.getSafetyEscalationPolicyText()}
                </Text>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Vehicle Picker Modal */}
      <Modal
        visible={vehicleModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setVehicleModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setVehicleModalVisible(false)}
        >
          <View style={styles.vehiclePickerCard}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Choose Travel Avatar</Text>
              <TouchableOpacity onPress={() => setVehicleModalVisible(false)}>
                <Feather name="x" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.pickerSub}>
              Select your customized icon & navigation avatar
            </Text>

            <View style={styles.optionsList}>
              {vehicleOptions.map((opt) => {
                const isSelected = selectedVehicle === opt.type;
                return (
                  <TouchableOpacity
                    key={opt.type}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedVehicle(opt.type);
                      setVehicleModalVisible(false);
                    }}
                    style={[
                      styles.vehicleRow,
                      isSelected && styles.vehicleRowSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.vehicleIconCircle,
                        isSelected && styles.vehicleIconCircleSelected,
                        opt.type === 'walk' && { backgroundColor: isSelected ? '#10B981' : '#D1FAE5' },
                      ]}
                    >
                      {opt.type === 'walk' ? (
                        <MaterialCommunityIcons
                          name="walk"
                          size={24}
                          color={isSelected ? '#FFFFFF' : '#10B981'}
                        />
                      ) : (
                        <MaterialCommunityIcons
                          name={opt.icon as any}
                          size={24}
                          color={isSelected ? '#FFFFFF' : '#2563EB'}
                        />
                      )}
                    </View>
                    <View style={styles.vehicleInfo}>
                      <Text style={[styles.vehicleLabel, isSelected && styles.vehicleLabelSelected]}>
                        {opt.label}
                      </Text>
                      <Text style={styles.vehicleDesc}>{opt.desc}</Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={22} color="#2563EB" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Incident Alert Bottom Sheet */}
      <IncidentAlertSheet
        visible={incidentAlertVisible}
        incident={selectedIncident || nearestIncidentAlert?.incident}
        distanceText={
          nearestIncidentAlert?.incident.id === selectedIncident?.id
            ? nearestIncidentAlert?.distanceText
            : selectedIncident?.distance
        }
        onKeepRoute={() => setIncidentAlertVisible(false)}
        onViewSaferRoute={() => {
          setIncidentAlertVisible(false);
          onOpenAlternativeRoute();
        }}
        onClose={() => setIncidentAlertVisible(false)}
      />

      {/* Map Layers Modal */}
      <BottomSheet
        visible={layersSheetVisible}
        onClose={() => setLayersSheetVisible(false)}
        title="Map Options"
      >
        <MapLayerSheet
          layers={mapLayers}
          onToggleLayer={toggleMapLayer}
          onClose={() => setLayersSheetVisible(false)}
        />
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  floatingRecenterPill: {
    position: 'absolute',
    top: 154,
    alignSelf: 'center',
    backgroundColor: '#059669',
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    zIndex: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 9,
    borderWidth: 1.5,
    borderColor: '#34D399',
    gap: 8,
  },
  floatingRecenterText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.6,
  },
  driverModeFloatingChip: {
    position: 'absolute',
    top: 154,
    left: 16,
    backgroundColor: 'rgba(7, 39, 31, 0.94)',
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 25,
    borderWidth: 1,
    borderColor: '#10B981',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  driverModeFloatingChipText: {
    color: '#D1FAE5',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.3,
  },
  hazardProximityBanner: {
    position: 'absolute',
    top: 130,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  hazardProximityIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hazardProximityTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  hazardSeverityBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  hazardSeverityText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#DC2626',
  },
  hazardProximitySub: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
    marginTop: 2,
  },
  hazardProximityViewBtn: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  hazardProximityViewBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },
  serviceProximityBanner: {
    position: 'absolute',
    top: 130,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 15,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  serviceProximityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceProximityTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  serviceProximitySub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  serviceProximityViewBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
  },
  serviceProximityViewBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  rightBar: {
    position: 'absolute',
    top: 190,
    right: 16,
    zIndex: 10,
    gap: 10,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionBtnHazard: {
    backgroundColor: 'rgba(254, 242, 242, 0.95)',
    borderColor: '#FECACA',
  },
  speedometerContainer: {
    position: 'absolute',
    bottom: 140,
    left: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    zIndex: 10,
  },
  speedometerHUD: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 72,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  speedometerHUDOverSpeed: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(220, 38, 38, 0.95)',
  },
  speedValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  speedValueOverSpeed: {
    color: '#FFFFFF',
  },
  speedUnit: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: -2,
    letterSpacing: 0.5,
  },
  speedLimitSign: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  speedLimitSignNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000000',
    lineHeight: 18,
  },
  speedLimitSignLabel: {
    fontSize: 7,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.3,
  },
  bottomSheetWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  speedDropCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  speedDropHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  speedDropIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedDropTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  speedDropSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  speedDropQuestion: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 14,
    fontWeight: '600',
  },
  speedDropOptions: {
    gap: 8,
  },
  speedDropOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  speedDropOptionEmoji: {
    fontSize: 22,
  },
  speedDropOptionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  speedDropOptionSub: {
    fontSize: 11,
    color: '#64748B',
  },
  speedDropPolicyNote: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  servicesDrawerCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    maxHeight: '80%',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  drawerFilterScroll: {
    marginBottom: 12,
  },
  drawerFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    marginRight: 6,
  },
  drawerFilterPillActive: {
    backgroundColor: '#2563EB',
  },
  drawerFilterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  drawerFilterTextActive: {
    color: '#FFFFFF',
  },
  drawerServiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  drawerServiceIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerServiceName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  drawerServiceDist: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 2,
  },
  drawerServiceHours: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  drawerCallBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  checkInCountdownCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#2563EB',
    marginBottom: 12,
  },
  checkInCountdownNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: '#2563EB',
  },
  checkInCountdownSec: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginTop: -4,
  },
  checkInTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  checkInSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 18,
  },
  imOkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 10,
  },
  imOkButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  needHelpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  needHelpButtonText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '800',
  },
  checkInPolicyText: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 14,
  },
  escalationIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  escalationTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#DC2626',
  },
  escalationSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
    marginBottom: 14,
  },
  contactDetailsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contactNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  contactPhoneText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 2,
  },
  callContactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 8,
  },
  callContactBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  dismissEscalationBtn: {
    paddingVertical: 8,
  },
  dismissEscalationBtnText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  vehiclePickerCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  pickerSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  optionsList: {
    gap: 10,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  vehicleRowSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  vehicleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  vehicleIconCircleSelected: {
    backgroundColor: '#2563EB',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  vehicleLabelSelected: {
    color: '#2563EB',
  },
  vehicleDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  powerSafetyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    alignSelf: 'flex-start',
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  powerSafetyPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  powerSafetyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  plannedHaltBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  plannedHaltBannerIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plannedHaltBannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  plannedHaltBannerSub: {
    fontSize: 10,
    color: '#B45309',
    marginTop: 1,
  },
  resumeTripBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resumeTripBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  floatingActionRow: {
    position: 'absolute',
    bottom: 210,
    left: 14,
    right: 70,
    flexDirection: 'row',
    gap: 8,
    zIndex: 999,
  },
  actionChipBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  actionChipBtnHaltActive: {
    backgroundColor: 'rgba(6, 78, 59, 0.95)',
    borderColor: '#34D399',
  },
  actionChipIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  actionChipSub: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 1,
  },
  persistentReportBtn: {
    position: 'absolute',
    bottom: 210,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EA580C',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
    borderWidth: 1.5,
    borderColor: '#FDBA74',
  },
  persistentReportIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  persistentReportText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  persistentReportSub: {
    color: '#FFEDD5',
    fontSize: 10,
    fontWeight: '600',
  },
  haltModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  haltModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  haltIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  haltModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  haltModalSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  haltSectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    marginTop: 6,
  },
  haltReasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  haltReasonChip: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  haltReasonChipSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  haltReasonText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  haltReasonTextSelected: {
    color: '#2563EB',
    fontWeight: '800',
  },
  haltPresetsScroll: {
    marginBottom: 14,
  },
  haltPresetPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginRight: 6,
  },
  haltPresetPillSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  haltPresetText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  haltPresetTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  stepperLabelBox: {
    flex: 1,
  },
  stepperLabelText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  stepperSubText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValueBox: {
    minWidth: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValueNum: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  stepperValueUnit: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    marginTop: -2,
  },
  haltSummaryCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    marginTop: 8,
    marginBottom: 12,
  },
  haltSummaryHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E40AF',
  },
  haltSummaryTag: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  haltSummaryTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  haltSummaryResumeText: {
    fontSize: 12,
    color: '#334155',
    marginTop: 4,
  },
  haltSummaryDescText: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 14,
    marginTop: 3,
  },
  confirmHaltBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D97706',
    paddingVertical: 13,
    borderRadius: 14,
    marginBottom: 10,
  },
  confirmHaltBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  haltPolicyNote: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: 8,
  },
  plannedHaltAltButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  plannedHaltAltButtonText: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '800',
  },
  gpsSentBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gpsSentText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  contactGpsCoordText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600',
  },
  escalateFurtherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    width: '100%',
    paddingVertical: 11,
    borderRadius: 12,
    marginBottom: 8,
  },
  escalateFurtherBtnText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '800',
  },
  emergencyHelplinesContainer: {
    width: '100%',
    gap: 8,
    marginBottom: 14,
  },
  helplineOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
  },
  helplineIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helplineName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  helplineDesc: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
});
