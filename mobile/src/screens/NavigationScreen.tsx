import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
  Modal,
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
import { RouteOption } from '../types';
import { useApp } from '../context/AppContext';
import { VehicleIconType } from '../data/mockData';
import { NavigationProgressData } from '../components/InteractiveMap';

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
  } = useApp();

  const [layersSheetVisible, setLayersSheetVisible] = useState(false);
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
  // Default to walk mode if walking travel mode was selected
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleIconType>(
    travelMode === 'walk' ? 'walk' : 'car'
  );
  // Real-time GPS navigation is active by default (auto simulation is OFF)
  const [isDriving, setIsDriving] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(2);
  const [recenterCount, setRecenterCount] = useState<number>(0);
  const [restartCount, setRestartCount] = useState<number>(0);

  // Live Navigation Telemetry from Map Engine (0 km/h initial real-time speed)
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

  const handleProgressUpdate = (data: NavigationProgressData) => {
    setTelemetry(data);
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

  const handleToggleDriving = () => {
    setIsDriving((prev) => !prev);
  };

  const handleRestartRoute = () => {
    setRestartCount((c) => c + 1);
    setIsDriving(true);
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

      {/* 60fps Google Maps Navigation Engine with Real Road Polyline & Butter-Smooth Motion */}
      <MapboxMap
        currentLocation={currentLocation}
        currentHeading={currentHeading}
        currentSpeed={currentSpeed}
        destination={selectedDestination.coordinates}
        selectedRoute={route}
        incidents={[]}
        services={[]}
        layers={mapLayers}
        showIncidentHotspot={false}
        destinationLabel={selectedDestination.name}
        isNavigating={true}
        isDriving={isDriving}
        simulationSpeed={simSpeed}
        vehicleType={selectedVehicle}
        recenterTrigger={recenterCount}
        restartTrigger={restartCount}
        onNavigationProgress={handleProgressUpdate}
        onArrived={onArrived}
      />

      {/* Top Turn Instruction Card (Dynamic Distance & Directions) */}
      <SafeAreaView style={styles.topSafeArea}>
        <View style={styles.topHeaderWrapper}>
          <NavigationInstructionCard
            distance={
              telemetry.nextTurnMeters < 60
                ? (selectedVehicle === 'walk' ? 'Walk ahead' : 'Turn ahead')
                : telemetry.nextTurnMeters >= 1000
                ? `${(telemetry.nextTurnMeters / 1000).toFixed(1)} km`
                : `${telemetry.nextTurnMeters} m`
            }
            instruction={telemetry.turnInstruction}
            turnDirection={telemetry.turnType}
            onMicPress={handleVoiceInstruction}
          />

          {/* Navigation Mode Indicator Pill (Active Status, Real GPS vs Demo Simulation) */}
          <View style={styles.navModeBar}>
            <View style={[styles.navModeDot, isDriving ? styles.simDot : styles.liveGpsDot]} />
            <Text style={styles.navModeText}>
              {isDriving
                ? `${selectedVehicle === 'walk' ? '🚶 Demo Walk' : '🚘 Demo Simulation'} (${simSpeed}x)`
                : (selectedVehicle === 'walk' ? '🚶 Real GPS Walk' : '🛰️ Real-Time GPS')}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleToggleDriving}
              style={[styles.switchModeBtn, isDriving && styles.switchModeBtnActive]}
            >
              <Text style={styles.switchModeBtnText}>
                {isDriving ? 'Live GPS' : 'Simulate'}
              </Text>
            </TouchableOpacity>
            {isDriving && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleRestartRoute}
                style={styles.switchModeBtn}
              >
                <Text style={styles.switchModeBtnText}>Restart</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>

      {/* Right Floating Control Column: Vehicle Picker, Recenter, Play/Pause, Speed, Layers, Mute, Hazard */}
      <View style={styles.rightControlsCol}>
        {/* Change Vehicle Icon Button (shows 🚶 if walk mode) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setVehicleModalVisible(true)}
          style={[
            styles.floatingRoundBtn,
            styles.vehicleBtn,
            selectedVehicle === 'walk' && styles.walkVehicleBtn,
          ]}
        >
          {selectedVehicle === 'walk' ? (
            <Text style={styles.walkIconText}>🚶</Text>
          ) : (
            <MaterialCommunityIcons
              name={
                selectedVehicle === 'bike'
                  ? 'motorbike'
                  : selectedVehicle === 'suv'
                  ? 'car-estate'
                  : selectedVehicle === 'arrow'
                  ? 'navigation'
                  : 'car-side'
              }
              size={22}
              color="#2563EB"
            />
          )}
        </TouchableOpacity>

        {/* Recenter on Vehicle */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setRecenterCount((c) => c + 1)}
          style={styles.floatingRoundBtn}
        >
          <Feather name="crosshair" size={18} color="#2563EB" />
        </TouchableOpacity>

        {/* Play / Pause Forward Progression or Demo Simulation */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleToggleDriving}
          style={[
            styles.floatingRoundBtn,
            isDriving ? styles.drivingActiveBtn : styles.gpsLiveBtn,
          ]}
        >
          <Feather
            name={isDriving ? 'pause' : 'play'}
            size={18}
            color={isDriving ? '#F59E0B' : '#2563EB'}
          />
        </TouchableOpacity>

        {/* Speed Pill Toggle (1x, 2x, 4x) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSimSpeed((prev) => (prev === 1 ? 2 : prev === 2 ? 4 : 1))}
          style={[styles.floatingRoundBtn, styles.speedPillBtn]}
        >
          <Text style={styles.speedPillText}>{simSpeed}x</Text>
        </TouchableOpacity>

        {/* Map Layers toggle */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setLayersSheetVisible(true)}
          style={styles.floatingRoundBtn}
        >
          <Feather name="layers" size={18} color={colors.textPrimary} />
        </TouchableOpacity>

        {/* Mute audio button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setNavigationMuted(!navigationMuted)}
          style={styles.floatingRoundBtn}
        >
          <Feather
            name={navigationMuted ? 'volume-x' : 'volume-2'}
            size={18}
            color={colors.textPrimary}
          />
        </TouchableOpacity>

        {/* Hazard report button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onOpenReport}
          style={[styles.floatingRoundBtn, styles.hazardRoundBtn]}
        >
          <Feather name="alert-triangle" size={18} color={colors.incidentRed} />
        </TouchableOpacity>
      </View>

      {/* Bottom Left Real-Time Speedometer & Advisory Speed Limit HUD */}
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

            {/* Advisory Speed Limit Road Sign */}
            {selectedVehicle !== 'walk' && (
              <View style={styles.speedLimitSign}>
                <Text style={styles.speedLimitSignNumber}>{advisorySpeedLimit}</Text>
                <Text style={styles.speedLimitSignLabel}>LIMIT</Text>
              </View>
            )}
          </View>
        );
      })()}

      {/* Bottom Floating Navigation Status Sheet with Covered Distance & Live Progress */}
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

      {/* Vehicle Icon Picker Modal */}
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
    backgroundColor: '#0E131F',
  },
  topSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  topHeaderWrapper: {
    paddingTop: 10,
    alignItems: 'center',
  },
  navModeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    marginTop: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  navModeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveGpsDot: {
    backgroundColor: '#10B981',
  },
  simDot: {
    backgroundColor: '#F59E0B',
  },
  liveDot: {
    backgroundColor: '#10B981',
  },
  pausedDot: {
    backgroundColor: '#EF4444',
  },
  navModeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  switchModeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  switchModeBtnActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.35)',
  },
  switchModeBtnText: {
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: '700',
  },
  rightControlsCol: {
    position: 'absolute',
    top: '23%',
    right: 16,
    zIndex: 25,
    gap: 10,
  },
  floatingRoundBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  vehicleBtn: {
    borderColor: '#93C5FD',
    backgroundColor: '#EFF6FF',
  },
  walkVehicleBtn: {
    borderColor: '#6EE7B7',
    backgroundColor: '#ECFDF5',
  },
  walkIconText: {
    fontSize: 20,
    lineHeight: 22,
  },
  drivingActiveBtn: {
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
  },
  gpsLiveBtn: {
    borderColor: '#93C5FD',
    backgroundColor: '#EFF6FF',
  },
  speedPillBtn: {
    backgroundColor: '#F8FAFC',
  },
  speedPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  hazardRoundBtn: {
    borderColor: '#FECACA',
    backgroundColor: '#FFFFFF',
  },
  speedometerContainer: {
    position: 'absolute',
    bottom: 125,
    left: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 22,
  },
  speedometerHUD: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 2.5,
    borderColor: '#2563EB',
  },
  speedometerHUDOverSpeed: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF1F2',
  },
  speedValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 24,
    letterSpacing: -0.5,
  },
  speedValueOverSpeed: {
    color: '#DC2626',
  },
  speedUnit: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    marginTop: -1,
    letterSpacing: 0.2,
  },
  speedLimitSign: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  speedLimitSignNumber: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111827',
    lineHeight: 14,
  },
  speedLimitSignLabel: {
    fontSize: 6,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.3,
  },
  bottomSheetWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  vehiclePickerCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
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
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  vehicleRowSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  vehicleIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
    color: '#1D4ED8',
  },
  vehicleDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
