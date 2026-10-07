import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { TravelModeSelector } from '../components/TravelModeSelector';
import { RouteCard } from '../components/RouteCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { mockRoutes } from '../data/mockData';
import { DestinationItem, RouteOption, TravelMode } from '../types';

interface RouteOptionsScreenProps {
  destination?: DestinationItem;
  origin?: string;
  onBack: () => void;
  onStartNavigation: (selectedRoute: RouteOption) => void;
}

export const RouteOptionsScreen: React.FC<RouteOptionsScreenProps> = ({
  destination = { id: 'd-1', name: 'Dehradun', state: 'Uttarakhand' },
  origin = 'Your location',
  onBack,
  onStartNavigation,
}) => {
  const [currentOrigin, setCurrentOrigin] = useState(origin);
  const [currentDestination, setCurrentDestination] = useState(destination);
  const [travelMode, setTravelMode] = useState<TravelMode>('bike'); // Bike selected as in reference Screen 3
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-recommended');

  const handleSwap = () => {
    const tempName = currentOrigin;
    setCurrentOrigin(currentDestination.name);
    setCurrentDestination({
      ...currentDestination,
      name: tempName,
      state: 'Selected location',
    });
  };

  const selectedRoute =
    mockRoutes.find((r) => r.id === selectedRouteId) || mockRoutes[0];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Bar with Back Button */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Origin & Destination Card matching Screen 3 */}
        <View style={styles.routeInputCard}>
          <View style={styles.inputsColumn}>
            {/* Origin row */}
            <View style={styles.locationRow}>
              <View style={styles.originDotOuter}>
                <View style={styles.originDotInner} />
              </View>
              <Text style={styles.originText}>{currentOrigin}</Text>
            </View>

            {/* Divider */}
            <View style={styles.fieldDivider} />

            {/* Destination row */}
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={20} color={colors.incidentRed} style={styles.pinIcon} />
              <View>
                <Text style={styles.destName}>{currentDestination.name}</Text>
                <Text style={styles.destState}>{currentDestination.state}</Text>
              </View>
            </View>
          </View>

          {/* Swap route icon on right matching Screen 3 */}
          <TouchableOpacity onPress={handleSwap} style={styles.swapButton} activeOpacity={0.7}>
            <Ionicons name="swap-vertical" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Travel Mode Row with Car, Bike, Transit, Walking matching Screen 3 */}
        <View style={styles.modeSection}>
          <TravelModeSelector
            selectedMode={travelMode}
            onSelectMode={setTravelMode}
          />
        </View>

        {/* Route Option Cards (Recommended, Fastest, Alternate) matching Screen 3 */}
        <View style={styles.routesList}>
          {mockRoutes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              selected={selectedRouteId === route.id}
              onSelect={() => setSelectedRouteId(route.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Fixed Bottom Button matching Screen 3 */}
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    padding: 4,
    alignSelf: 'flex-start',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  routeInputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  inputsColumn: {
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  originDotOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  originDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
  },
  pinIcon: {
    marginRight: 10,
    marginLeft: -1,
  },
  originText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  destName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  destState: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  fieldDivider: {
    height: 1,
    backgroundColor: '#F1F3F5',
    marginVertical: 8,
    marginLeft: 30,
  },
  swapButton: {
    padding: 8,
    marginLeft: 10,
  },
  modeSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  routesList: {
    marginTop: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
  },
});
