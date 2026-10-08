import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { TravelModeSelector } from '../components/TravelModeSelector';
import { RouteCard } from '../components/RouteCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { MapboxMap } from '../components/MapboxMap';
import {
  DestinationItem,
  RouteOption,
  TravelMode,
  CorridorServiceCategory,
} from '../types';
import { useApp } from '../context/AppContext';
import { SafetyMonitoringService } from '../services/safetyMonitoringService';

interface RouteOptionsScreenProps {
  destination?: DestinationItem;
  origin?: string;
  onBack: () => void;
  onStartNavigation: (selectedRoute: RouteOption) => void;
}

export const RouteOptionsScreen: React.FC<RouteOptionsScreenProps> = ({
  destination,
  origin,
  onBack,
  onStartNavigation,
}) => {
  const {
    currentLocation,
    locationLabel,
    selectedDestination,
    travelMode,
    setTravelMode,
    availableRoutes,
    selectedRoute,
    setSelectedRoute,
    recalculateRoutes,
    powerSafetyMode,
    setPowerSafetyMode,
  } = useApp();

  const activeDest = destination || selectedDestination;
  const activeOriginLabel = origin || locationLabel || 'Your location';
  const [currentOrigin, setCurrentOrigin] = useState(activeOriginLabel);
  const [currentDestName, setCurrentDestName] = useState(activeDest.name);
  const [currentDestState, setCurrentDestState] = useState(activeDest.state);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);

  // Route-based services filter & state
  const [serviceCategory, setServiceCategory] = useState<CorridorServiceCategory | 'all'>('all');
  const [selectedServiceStops, setSelectedServiceStops] = useState<string[]>([]);
  const [longRouteSafetyEnabled, setLongRouteSafetyEnabled] = useState<boolean>(true);

  // Evaluate historical risk for selected route
  const historicalRisk = SafetyMonitoringService.evaluateHistoricalRisk(
    selectedRoute,
    availableRoutes
  );

  // Fetch corridor services distributed along this specific selected route
  const corridorServices = SafetyMonitoringService.getRouteCorridorServices(
    currentLocation,
    activeDest.coordinates || currentLocation,
    serviceCategory,
    selectedRoute.type,
    travelMode,
    selectedRoute.coordinates
  );

  // Fetch route-specific incidents and safety status for the selected route
  const routeSpecificIncidents = SafetyMonitoringService.getRouteSpecificIncidents(selectedRoute.type);

  useEffect(() => {
    setCurrentOrigin(activeOriginLabel);
    setCurrentDestName(activeDest.name);
    setCurrentDestState(activeDest.state);
  }, [activeOriginLabel, activeDest]);

  const handleSwap = () => {
    const tempOrigin = currentOrigin;
    setCurrentOrigin(currentDestName);
    setCurrentDestName(tempOrigin);
    setCurrentDestState('Origin location');
  };

  const handleSelectMode = async (mode: TravelMode) => {
    setTravelMode(mode);
    setIsLoadingRoutes(true);
    await recalculateRoutes(activeDest, mode, currentLocation);
    setIsLoadingRoutes(false);
  };

  const handleSwitchToSaferAlternative = (altRouteId: string) => {
    const alt = availableRoutes.find((r) => r.id === altRouteId);
    if (alt) {
      setSelectedRoute(alt);
    }
  };

  const toggleServiceStop = (serviceId: string) => {
    setSelectedServiceStops((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Bar with Back Button */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Route Options</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Origin & Destination Card */}
        <View style={styles.routeInputCard}>
          <View style={styles.inputsColumn}>
            {/* Origin row */}
            <View style={styles.locationRow}>
              <View style={styles.originDotOuter}>
                <View style={styles.originDotInner} />
              </View>
              <Text style={styles.originText} numberOfLines={1}>
                {currentOrigin}
              </Text>
            </View>

            {/* Destination row */}
            <View style={styles.locationRow}>
              <View style={styles.destPinOuter}>
                <Ionicons name="location" size={12} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.destNameText} numberOfLines={1}>
                  {currentDestName}
                </Text>
                {currentDestState ? (
                  <Text style={styles.destStateText} numberOfLines={1}>
                    {currentDestState}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          {/* Swap Button */}
          <TouchableOpacity
            onPress={handleSwap}
            style={styles.swapButton}
            activeOpacity={0.7}
          >
            <Feather name="repeat" size={18} color="#2563EB" />
          </TouchableOpacity>
        </View>

        {/* Travel Mode Selector: Car, Bike, Transit, Walk */}
        <View style={styles.modeSection}>
          <TravelModeSelector
            selectedMode={travelMode}
            onSelectMode={handleSelectMode}
          />
        </View>

        {/* Live Interactive Route Preview Map with Corridor Services */}
        <View style={styles.mapPreviewContainer}>
          <MapboxMap
            selectedRoute={selectedRoute}
            availableRoutes={availableRoutes}
            showAlternativeRoutes={true}
            currentLocation={currentLocation}
            destination={{
              latitude: activeDest.coordinates?.latitude,
              longitude: activeDest.coordinates?.longitude,
              name: activeDest.name,
            }}
            destinationLabel={activeDest.name}
            corridorServices={corridorServices}
            isNavigating={false}
            vehicleType={travelMode === 'walk' ? 'walk' : travelMode === 'bike' ? 'bike' : 'car'}
          />
          {/* Floating Duration / Distance Status Pill */}
          <View style={styles.mapPreviewOverlay}>
            <View style={styles.mapPreviewPill}>
              <Ionicons name="navigate" size={13} color="#2563EB" />
              <Text style={styles.mapPreviewPillText}>
                {selectedRoute?.duration || 'Route'} · {selectedRoute?.distance} ({selectedRoute?.name})
              </Text>
            </View>
          </View>
        </View>

        {/* FEATURE: ROUTE-SPECIFIC LIVE INCIDENTS & SAFETY STATUS */}
        <View style={styles.routeIncidentsCard}>
          <View style={styles.routeIncidentsHeader}>
            <Ionicons
              name={selectedRoute.type === 'fastest' ? 'speedometer' : 'shield-checkmark'}
              size={18}
              color={selectedRoute.type === 'fastest' ? '#D97706' : '#10B981'}
            />
            <Text style={styles.routeIncidentsTitle}>
              {selectedRoute.name} Safety & Live Status
            </Text>
            <View
              style={[
                styles.trustBadge,
                selectedRoute.type === 'recommended'
                  ? { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }
                  : { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
              ]}
            >
              <Text
                style={[
                  styles.trustBadgeText,
                  selectedRoute.type === 'recommended' ? { color: '#047857' } : { color: '#B45309' },
                ]}
              >
                {selectedRoute.trustScore}% Trust
              </Text>
            </View>
          </View>

          {routeSpecificIncidents.map((inc, i) => (
            <View key={i} style={styles.routeIncidentRow}>
              <Ionicons
                name={
                  inc.type === 'verified_safe'
                    ? 'checkmark-circle'
                    : inc.type === 'heavy_traffic'
                    ? 'car'
                    : 'warning'
                }
                size={16}
                color={
                  inc.type === 'verified_safe'
                    ? '#10B981'
                    : inc.type === 'heavy_traffic'
                    ? '#EA580C'
                    : '#DC2626'
                }
              />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.routeIncidentTitleText}>{inc.title}</Text>
                <Text style={styles.routeIncidentSubText}>{inc.note}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* FEATURE 4: HISTORICAL RISK PREDICTION ADVISORY */}
        {historicalRisk && (
          <View style={styles.historicalRiskCard}>
            <View style={styles.riskCardHeader}>
              <View style={styles.riskIconBadge}>
                <Ionicons name="warning" size={18} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.riskTitleRow}>
                  <Text style={styles.riskCardTitle}>{historicalRisk.title}</Text>
                  <View style={styles.riskLevelBadge}>
                    <Text style={styles.riskLevelText}>{historicalRisk.riskLevel} Risk</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <Feather name="calendar" size={12} color="#94A3B8" />
                  <Text style={styles.riskPeriodText}>{historicalRisk.seasonalPeriod}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.riskWarningText}>
              “{historicalRisk.warningText}”
            </Text>
            <Text style={styles.riskDetailText}>
              Historical records note {historicalRisk.historicalIncidentCount} incidents logged on {historicalRisk.affectedSegment}.
            </Text>

            {/* Recommended Alternative Route Suggestion */}
            <View style={styles.altSuggestionBox}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                  <Ionicons name="bulb-outline" size={14} color="#2563EB" />
                  <Text style={styles.altSuggestionHeading}>Suggested Alternative Route:</Text>
                </View>
                <Text style={styles.altSuggestionTitle}>
                  {historicalRisk.alternativeRouteSuggestion.title} ({historicalRisk.alternativeRouteSuggestion.extraDuration})
                </Text>
                <Text style={styles.altSuggestionBenefit}>
                  {historicalRisk.alternativeRouteSuggestion.safetyBenefit}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.switchRouteBtn}
                onPress={() =>
                  handleSwitchToSaferAlternative(
                    historicalRisk.alternativeRouteSuggestion.alternativeRouteId
                  )
                }
                activeOpacity={0.8}
              >
                <Text style={styles.switchRouteBtnText}>Switch</Text>
                <Feather name="arrow-right" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Route Cards: Fastest Route, Recommended Route, Alternate Route */}
        <View style={styles.routesList}>
          {isLoadingRoutes ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={colors.primaryDark} />
              <Text style={styles.loadingText}>Recalculating routes...</Text>
            </View>
          ) : (
            availableRoutes.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                selected={selectedRoute.id === route.id}
                onSelect={setSelectedRoute}
              />
            ))
          )}
        </View>

        {/* FEATURE 2: ROUTE-BASED NEARBY SERVICES BEFORE NAVIGATION STARTS */}
        <View style={styles.corridorServicesSection}>
          <View style={styles.corridorSectionHeader}>
            <View style={styles.corridorTitleGroup}>
              <Ionicons name="compass-outline" size={18} color="#2563EB" />
              <Text style={styles.corridorSectionTitle}>Useful Services Along Selected Route</Text>
            </View>
            <Text style={styles.corridorSubtitle}>
              Petrol pumps, CNG/diesel, 24/7 garages, hospitals & police patrol stations on route
            </Text>
          </View>

          {/* Service Category Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.corridorFilterScroll}
          >
            {[
              { key: 'all', label: 'All Services' },
              { key: 'petrol', label: 'Petrol Pumps' },
              { key: 'cng', label: 'CNG / Diesel' },
              { key: 'garage', label: 'Garages (24/7)' },
              { key: 'hospital', label: 'Hospitals' },
              { key: 'police', label: 'Police Patrol' },
            ].map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.corridorFilterPill,
                  serviceCategory === cat.key && styles.corridorFilterPillActive,
                ]}
                onPress={() => setServiceCategory(cat.key as any)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.corridorFilterPillText,
                    serviceCategory === cat.key && styles.corridorFilterPillTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Corridor Services List */}
          <View style={styles.corridorList}>
            {corridorServices.map((service) => {
              const isAdded = selectedServiceStops.includes(service.id);
              return (
                <View key={service.id} style={styles.serviceItemCard}>
                  <View style={[styles.serviceItemIconBox, { backgroundColor: `${service.color}15` }]}>
                    <Ionicons name={service.iconName as any} size={22} color={service.color} />
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={styles.serviceItemTitleRow}>
                      <Text style={styles.serviceItemName}>{service.name}</Text>
                      <View style={styles.serviceRatingPill}>
                        <Ionicons name="star" size={11} color="#EAB308" />
                        <Text style={styles.serviceRatingText}>{service.rating}</Text>
                      </View>
                    </View>

                    <Text style={styles.serviceItemDistText}>
                      {service.distanceFromStartKm} km along route ({service.distanceFromRouteMeters}m off highway)
                    </Text>

                    <View style={styles.serviceTagsRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        <Ionicons name="time-outline" size={12} color="#64748B" />
                        <Text style={styles.serviceHoursText}>{service.operatingHours}</Text>
                      </View>
                      {service.fuelTypes && service.fuelTypes[0] && (
                        <View style={styles.serviceFuelTag}>
                          <Text style={styles.serviceFuelTagText}>{service.fuelTypes[0]}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Add Stop Button */}
                  <TouchableOpacity
                    style={[styles.addStopBtn, isAdded && styles.addStopBtnActive]}
                    onPress={() => toggleServiceStop(service.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={isAdded ? 'checkmark-circle' : 'add-circle-outline'}
                      size={18}
                      color={isAdded ? '#15803D' : '#2563EB'}
                    />
                    <Text style={[styles.addStopBtnText, isAdded && { color: '#15803D' }]}>
                      {isAdded ? 'Added' : '+ Stop'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        {/* POWER SAFETY MODE (FOR LONG JOURNEYS & RISKY AREAS) */}
        <View style={styles.longRouteToggleCard}>
          <View style={[styles.longRouteIconCircle, powerSafetyMode && { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="shield-checkmark" size={22} color={powerSafetyMode ? '#2563EB' : '#94A3B8'} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.longRouteTitle}>Power Safety Mode</Text>
              <View style={[styles.safetyActiveBadge, powerSafetyMode && { backgroundColor: '#DCFCE7' }]}>
                <Text style={[styles.safetyActiveText, powerSafetyMode && { color: '#15803D' }]}>
                  {powerSafetyMode ? 'Active Protection' : 'Disabled'}
                </Text>
              </View>
            </View>
            <Text style={styles.longRouteDesc}>
              Dedicated safety mode for long journeys or risky areas. If stopped unusually long, triggers a safety check-in before any emergency escalation.
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.toggleCheckbox, powerSafetyMode && styles.toggleCheckboxActive]}
            onPress={() => setPowerSafetyMode(!powerSafetyMode)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={powerSafetyMode ? 'checkmark' : 'close'}
              size={16}
              color={powerSafetyMode ? '#FFFFFF' : '#94A3B8'}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom CTA: Start Navigation matching Screen 3 */}
      <View style={styles.bottomBar}>
        <PrimaryButton
          title={
            selectedServiceStops.length > 0
              ? `Start Navigation (${selectedServiceStops.length} Stop${selectedServiceStops.length > 1 ? 's' : ''} Added)`
              : 'Start Navigation'
          }
          onPress={() => onStartNavigation(selectedRoute)}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  routeInputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  inputsColumn: {
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  originDotOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#93C5FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  originDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  originText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  destPinOuter: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  destNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  destStateText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  swapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  modeSection: {
    marginBottom: 12,
  },
  mapPreviewContainer: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F1F5F9',
  },
  mapPreview: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mapPreviewOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    zIndex: 10,
  },
  mapPreviewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
    gap: 4,
  },
  mapPreviewPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E40AF',
  },
  historicalRiskCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  riskCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  riskIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  riskTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  riskCardTitle: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '800',
    color: '#92400E',
    lineHeight: 18,
    paddingRight: 4,
  },
  riskLevelBadge: {
    backgroundColor: '#FEF08A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    flexShrink: 0,
    alignSelf: 'flex-start',
  },
  riskLevelText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#854D0E',
  },
  riskPeriodText: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 1,
  },
  riskWarningText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#78350F',
    lineHeight: 18,
    marginBottom: 4,
  },
  riskDetailText: {
    fontSize: 11,
    color: '#92400E',
    lineHeight: 15,
    marginBottom: 10,
  },
  altSuggestionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#FCD34D',
    gap: 10,
  },
  altSuggestionHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E40AF',
  },
  altSuggestionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  altSuggestionBenefit: {
    fontSize: 10,
    color: '#16A34A',
    fontWeight: '600',
    marginTop: 1,
  },
  switchRouteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  switchRouteBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  routesList: {
    gap: 10,
    marginBottom: 16,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  corridorServicesSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  corridorSectionHeader: {
    marginBottom: 12,
  },
  corridorTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  corridorSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  corridorSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 15,
  },
  corridorFilterScroll: {
    marginBottom: 12,
  },
  corridorFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 6,
  },
  corridorFilterPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  corridorFilterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  corridorFilterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  corridorList: {
    gap: 8,
  },
  serviceItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  serviceItemIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 6,
  },
  serviceItemName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  serviceRatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  serviceRatingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#854D0E',
  },
  serviceItemDistText: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 2,
  },
  serviceTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  serviceHoursText: {
    fontSize: 10,
    color: '#64748B',
  },
  serviceFuelTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  serviceFuelTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
  },
  addStopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addStopBtnActive: {
    backgroundColor: '#DCFCE7',
  },
  addStopBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  longRouteToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  longRouteIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  longRouteTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  safetyActiveBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  safetyActiveText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },
  longRouteDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  toggleCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  toggleCheckboxActive: {
    backgroundColor: '#2563EB',
  },
  routeIncidentsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  routeIncidentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  routeIncidentsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  trustBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  trustBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  routeIncidentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  routeIncidentTitleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  routeIncidentSubText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 14,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
});
