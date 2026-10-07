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
import { DestinationItem, RouteOption, TravelMode } from '../types';
import { useApp } from '../context/AppContext';

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
  } = useApp();

  const activeDest = destination || selectedDestination;
  const activeOriginLabel = origin || locationLabel || 'Your location';
  const [currentOrigin, setCurrentOrigin] = useState(activeOriginLabel);
  const [currentDestName, setCurrentDestName] = useState(activeDest.name);
  const [currentDestState, setCurrentDestState] = useState(activeDest.state);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Bar with Back Button matching Screen 3 */}
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

            {/* Divider */}
            <View style={styles.fieldDivider} />

            {/* Destination row */}
            <View style={styles.locationRow}>
              <Ionicons
                name="location"
                size={18}
                color={colors.incidentRed}
                style={styles.destPinIcon}
              />
              <View style={styles.destTextCol}>
                <Text style={styles.destNameText}>{currentDestName}</Text>
                <Text style={styles.destStateText}>{currentDestState}</Text>
              </View>
            </View>
          </View>

          {/* Swap icon on right */}
          <TouchableOpacity
            onPress={handleSwap}
            style={styles.swapBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="swap-vertical" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Transportation modes: Car, Bike, Transit, Walking */}
        <TravelModeSelector
          selectedMode={travelMode}
          onSelectMode={handleSelectMode}
        />

        {/* Live Route & Destination Pin Preview Map */}
        <View style={styles.mapPreviewWrapper}>
          <MapboxMap
            currentLocation={currentLocation}
            destination={activeDest.coordinates}
            destinationLabel={activeDest.name}
            selectedRoute={selectedRoute}
            showAlternativeRoutes={false}
            vehicleType={travelMode === 'walk' ? 'walk' : travelMode === 'bike' ? 'bike' : 'car'}
          />
          {/* Floating Duration / Distance Status Pill */}
          <View style={styles.mapPreviewOverlay}>
            <View style={styles.mapPreviewPill}>
              <Ionicons name="navigate" size={13} color="#2563EB" />
              <Text style={styles.mapPreviewPillText}>
                {selectedRoute?.duration || 'Route'} · {selectedRoute?.distance}
              </Text>
            </View>
          </View>
        </View>

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
      </ScrollView>

      {/* Bottom CTA: Start Navigation matching Screen 3 */}
      <View style={styles.bottomBar}>
        <PrimaryButton
          title="Start Navigation"
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
  fieldDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 28,
    marginVertical: 4,
  },
  destPinIcon: {
    marginRight: 12,
  },
  destTextCol: {
    flex: 1,
  },
  destNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  destStateText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  swapBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  mapPreviewWrapper: {
    height: 190,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    marginVertical: 10,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  mapPreviewOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  mapPreviewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  mapPreviewPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  routesList: {
    marginTop: 6,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
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
