import React, { useState, useEffect } from 'react';
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
} from '../types';
import { useApp } from '../context/AppContext';
import { VehicleIconType } from '../data/mockData';
import { NavigationProgressData } from '../components/InteractiveMap';
import { SafetyMonitoringService } from '../services/safetyMonitoringService';

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
  } = useApp();

  const [layersSheetVisible, setLayersSheetVisible] = useState(false);
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleIconType>(
    travelMode === 'walk' ? 'walk' : 'car'
  );

  // Real-time GPS navigation state
  const [isDriving, setIsDriving] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(2);
  const [recenterCount, setRecenterCount] = useState<number>(0);
  const [restartCount, setRestartCount] = useState<number>(0);

  // FEATURE 1: SPEED-DROP ALERT STATE
  const [speedDropEvent, setSpeedDropEvent] = useState<SpeedDropEvent | null>(null);

  // FEATURE 2: IN-NAVIGATION ROUTE SERVICES DRAWER & PROXIMITY ALERT
  const [servicesDrawerVisible, setServicesDrawerVisible] = useState(false);
  const [serviceCategory, setServiceCategory] = useState<CorridorServiceCategory | 'all'>('all');
  const [activeServiceProximity, setActiveServiceProximity] =
    useState<RouteCorridorService | null>(null);

  // FEATURE 3: LONG-ROUTE SAFETY MONITORING & INACTIVITY CHECK-IN
  const [safeCheckInVisible, setSafeCheckInVisible] = useState(false);
  const [safeCheckInStep, setSafeCheckInStep] = useState<'prompt' | 'escalation'>('prompt');
  const [countdownSeconds, setCountdownSeconds] = useState(60);

  // Live Navigation Telemetry
  const [telemetry, setTelemetry] = useState<NavigationProgressData>({
    coveredKm: 0,
    remainingKm: parseFloat(route.distance.replace(/[^\d.]/g, '')) || 12,
    progress: 0,
    speedKmh: 0,
    nextTurnMeters: 450,
    turnType: 'straight',
    turnInstruction:
      travelMode === 'walk'
        ? `Walk towards ${selectedDestination.name}`
        : `Continue towards ${selectedDestination.name}`,
  });

  // Fetch Corridor Services along route
  const corridorServices = SafetyMonitoringService.getRouteCorridorServices(
    currentLocation,
    selectedDestination.coordinates || currentLocation,
    serviceCategory
  );

  // Monitor Speed-Drop on telemetry or GPS updates
  const handleProgressUpdate = (data: NavigationProgressData) => {
    setTelemetry(data);

    // Run speed-drop detection algorithm
    const liveSpeed = isDriving ? data.speedKmh : currentSpeed || 0;
    const drop = SafetyMonitoringService.processSpeedReading(
      liveSpeed,
      currentLocation
    );
    if (drop && !speedDropEvent) {
      setSpeedDropEvent(drop);
    }

    // Check proximity to upcoming services along route
    if (data.coveredKm > 1 && !activeServiceProximity && corridorServices.length > 0) {
      const nearest = corridorServices[0];
      setActiveServiceProximity(nearest);
    }
  };

  // Safe Check-In Countdown Timer
  useEffect(() => {
    let timer: any = null;
    if (safeCheckInVisible && safeCheckInStep === 'prompt' && countdownSeconds > 0) {
      timer = setTimeout(() => {
        setCountdownSeconds((s) => s - 1);
      }, 1000);
    } else if (safeCheckInVisible && safeCheckInStep === 'prompt' && countdownSeconds === 0) {
      // Countdown expired: advance to emergency escalation step
      setSafeCheckInStep('escalation');
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [safeCheckInVisible, safeCheckInStep, countdownSeconds]);

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

    // Submit corresponding incident report
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

  const handleTriggerSafeCheckIn = () => {
    setCountdownSeconds(60);
    setSafeCheckInStep('prompt');
    setSafeCheckInVisible(true);
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
    Alert.alert(
      'Turn Guidance',
      `${telemetry.turnInstruction}. ${telemetry.remainingKm} km remaining, arrival estimated at ${route.arrivalTime || 'schedule'}.`
    );
  };

  const vehicleOptions: {
    type: VehicleIconType;
    label: string;
    icon: string;
    emoji: string;
    desc: string;
  }[] = [
    { type: 'car', label: 'Sedan Car', icon: 'car-side', emoji: '🚗', desc: 'Default blue sports sedan' },
    { type: 'walk', label: 'Walking Pedestrian', icon: 'walk', emoji: '🚶', desc: 'Walking mode with footsteps & 🚶 emoji' },
    { type: 'suv', label: 'City SUV', icon: 'car-estate', emoji: '🚙', desc: 'Amber highway SUV' },
    { type: 'bike', label: 'Motorbike', icon: 'motorbike', emoji: '🏍️', desc: 'Two-wheeler agility mode' },
    { type: 'arrow', label: 'Navigation Dart', icon: 'navigation', emoji: '🧭', desc: 'Google Maps 3D Chevron' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 60fps Navigation Engine */}
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
        isNavigating={true}
        isDriving={isDriving}
        simulationSpeed={simSpeed}
        vehicleType={selectedVehicle}
        recenterTrigger={recenterCount}
        restartTrigger={restartCount}
        onNavigationProgress={handleProgressUpdate}
        onArrived={onArrived}
      />

      {/* Top Turn-by-Turn Instruction Card */}
      <SafeAreaView style={styles.topOverlay} edges={['top']}>
        <NavigationInstructionCard
          instruction={telemetry.turnInstruction}
          distance={
            telemetry.nextTurnMeters > 1000
              ? `${(telemetry.nextTurnMeters / 1000).toFixed(1)} km`
              : `${telemetry.nextTurnMeters} m`
          }
          turnDirection={telemetry.turnType}
          onMicPress={handleVoiceInstruction}
        />

        {/* POWER SAFETY MODE STATUS PILL */}
        {powerSafetyMode && (
          <TouchableOpacity
            style={styles.powerSafetyPill}
            activeOpacity={0.85}
            onPress={handleTriggerSafeCheckIn}
          >
            <Ionicons name="shield-checkmark" size={13} color="#2563EB" />
            <Text style={styles.powerSafetyPillText}>🛡️ Power Safety Active</Text>
            <View style={styles.powerSafetyDot} />
          </TouchableOpacity>
        )}
      </SafeAreaView>

      {/* PERSISTENT HAZARD REPORT BUTTON (ALWAYS VISIBLE DURING ACTIVE NAVIGATION) */}
      <TouchableOpacity
        style={styles.persistentReportBtn}
        activeOpacity={0.9}
        onPress={onOpenReport}
      >
        <View style={styles.persistentReportIconCircle}>
          <Ionicons name="warning" size={18} color="#FFFFFF" />
        </View>
        <View>
          <Text style={styles.persistentReportText}>Report Hazard</Text>
          <Text style={styles.persistentReportSub}>Accident • Pothole • Block</Text>
        </View>
      </TouchableOpacity>

      {/* IN-NAVIGATION UPCOMING SERVICE PROXIMITY BANNER */}
      {activeServiceProximity && (
        <View style={styles.serviceProximityBanner}>
          <View style={[styles.serviceProximityIcon, { backgroundColor: `${activeServiceProximity.color}20` }]}>
            <Ionicons name={activeServiceProximity.iconName as any} size={20} color={activeServiceProximity.color} />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.serviceProximityTitle}>
              {activeServiceProximity.name}
            </Text>
            <Text style={styles.serviceProximitySub}>
              📍 800m ahead along route ({activeServiceProximity.operatingHours})
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

      {/* Right Floating Quick Action Bar */}
      <View style={styles.rightBar}>
        {/* Recenter / Compass Button */}
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.8}
          onPress={() => setRecenterCount((c) => c + 1)}
        >
          <MaterialCommunityIcons name="crosshairs-gps" size={22} color="#1E293B" />
        </TouchableOpacity>

        {/* View Route Corridor Services Button */}
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.8}
          onPress={() => setServicesDrawerVisible(true)}
        >
          <Ionicons name="compass-outline" size={22} color="#2563EB" />
        </TouchableOpacity>

        {/* Long-Route Safe Check-in Test Button */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#EFF6FF', borderColor: '#93C5FD' }]}
          activeOpacity={0.8}
          onPress={handleTriggerSafeCheckIn}
        >
          <Ionicons name="shield-checkmark" size={20} color="#2563EB" />
        </TouchableOpacity>

        {/* Speed-Drop Test Trigger */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}
          activeOpacity={0.8}
          onPress={handleSimulateSpeedDrop}
        >
          <Ionicons name="speedometer-outline" size={20} color="#B45309" />
        </TouchableOpacity>

        {/* Vehicle Avatar Picker */}
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.8}
          onPress={() => setVehicleModalVisible(true)}
        >
          {selectedVehicle === 'walk' ? (
            <Text style={{ fontSize: 18 }}>🚶</Text>
          ) : (
            <MaterialCommunityIcons
              name={
                selectedVehicle === 'car'
                  ? 'car-side'
                  : selectedVehicle === 'suv'
                  ? 'car-estate'
                  : selectedVehicle === 'bike'
                  ? 'motorbike'
                  : 'navigation'
              }
              size={22}
              color="#2563EB"
            />
          )}
        </TouchableOpacity>

        {/* Map Layers */}
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.8}
          onPress={() => setLayersSheetVisible(true)}
        >
          <Ionicons name="layers-outline" size={22} color="#1E293B" />
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
                <Text style={styles.speedDropOptionEmoji}>🚦</Text>
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
                <Text style={styles.speedDropOptionEmoji}>🚧</Text>
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
                <Text style={styles.speedDropOptionEmoji}>⚠️</Text>
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
                <Text style={styles.speedDropOptionEmoji}>☕</Text>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.speedDropOptionTitle}>Normal Stop (Signal / Break)</Text>
                  <Text style={styles.speedDropOptionSub}>Dismiss without false alarm</Text>
                </View>
                <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
              </TouchableOpacity>
            </View>

            <Text style={styles.speedDropPolicyNote}>
              💡 A speed drop is treated as a telemetry signal, never automatically as an accident.
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
                { key: 'all', label: 'All' },
                { key: 'petrol', label: '⛽ Petrol' },
                { key: 'cng', label: '⚡ CNG/Diesel' },
                { key: 'garage', label: '🔧 Garages' },
                { key: 'hospital', label: '🏥 Hospitals' },
                { key: 'police', label: '👮 Police' },
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
                      📍 {service.distanceFromStartKm} km from start • {service.distanceFromRouteMeters}m off highway
                    </Text>
                    <Text style={styles.drawerServiceHours}>🕒 {service.operatingHours}</Text>
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
      {/* FEATURE 3 MODAL: LONG-ROUTE SAFETY INACTIVITY CHECK-IN       */}
      {/* ============================================================ */}
      <Modal
        visible={safeCheckInVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSafeCheckInVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.checkInCard}>
            {safeCheckInStep === 'prompt' ? (
              <>
                <View style={styles.checkInCountdownCircle}>
                  <Text style={styles.checkInCountdownNumber}>{countdownSeconds}</Text>
                  <Text style={styles.checkInCountdownSec}>sec</Text>
                </View>

                <Text style={styles.checkInTitle}>Are you okay?</Text>
                <Text style={styles.checkInSub}>
                  We noticed your vehicle has been stationary for an unusually long period on this route.
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
                  style={styles.needHelpButton}
                  onPress={() => setSafeCheckInStep('escalation')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="alert-circle" size={18} color="#DC2626" />
                  <Text style={styles.needHelpButtonText}>I Need Assistance</Text>
                </TouchableOpacity>

                <Text style={styles.checkInPolicyText}>
                  {SafetyMonitoringService.getSafetyEscalationPolicyText()}
                </Text>
              </>
            ) : (
              <>
                <View style={styles.escalationIconBox}>
                  <Ionicons name="warning" size={32} color="#DC2626" />
                </View>

                <Text style={styles.escalationTitle}>Emergency Contact Alert</Text>
                <Text style={styles.escalationSub}>
                  No response received. Would you like to call or dispatch GPS coordinates to your emergency contact?
                </Text>

                <View style={styles.contactDetailsBox}>
                  <Text style={styles.contactNameText}>
                    {userProfile?.emergencyContactName || 'Saved Emergency Contact'}
                  </Text>
                  <Text style={styles.contactPhoneText}>
                    {userProfile?.emergencyContactPhone || '+91 98765 43210'}
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
                        <Text style={{ fontSize: 22 }}>🚶</Text>
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
});
