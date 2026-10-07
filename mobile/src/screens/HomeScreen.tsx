import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { MapContainer } from '../components/MapContainer';
import { MapControlButton } from '../components/MapControlButton';
import { MapFilterSheet, MapLayersState } from '../components/MapFilterSheet';
import { BottomSheet } from '../components/BottomSheet';
import { NearbyServiceCard } from '../components/NearbyServiceCard';
import { SlowdownAlert } from '../components/SlowdownAlert';
import { IncidentAlertCard } from '../components/IncidentAlertCard';
import { mockNearbyServices, mockIncidents } from '../data/mockData';
import { Incident, NearbyService } from '../types';

interface HomeScreenProps {
  onSearchPress: () => void;
  onOpenReport: () => void;
  onOpenEmergency: () => void;
}

const defaultLayers: MapLayersState = {
  incidents: true,
  hospitals: true,
  police: true,
  fuel: true,
  cng: true,
  garages: true,
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSearchPress,
  onOpenReport,
  onOpenEmergency,
}) => {
  const [servicesSheetVisible, setServicesSheetVisible] = useState(false);
  const [filtersSheetVisible, setFiltersSheetVisible] = useState(false);
  const [serviceCategory, setServiceCategory] = useState<string>('all');
  const [layers, setLayers] = useState<MapLayersState>(defaultLayers);
  const [showSlowdownAlert, setShowSlowdownAlert] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const filteredServices = mockNearbyServices.filter((s) => {
    if (serviceCategory === 'all') return true;
    return s.category === serviceCategory;
  });

  const handleToggleLayer = (layer: keyof MapLayersState) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleSelectIncident = (incident: Incident) => {
    setSelectedIncident(incident);
  };

  const handleSelectService = (service: NearbyService) => {
    Alert.alert(service.name, `${service.status ?? ''}\nDistance: ${service.distance}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Live Intelligence Map with incident & service markers */}
      <MapContainer
        incidents={mockIncidents}
        services={mockNearbyServices}
        layers={layers}
        onSelectIncident={handleSelectIncident}
        onSelectService={handleSelectService}
        selectedIncidentId={selectedIncident?.id ?? null}
      />

      {/* Floating Top Search Bar */}
      <SafeAreaView style={styles.topSafeArea}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onSearchPress}
          style={styles.floatingSearchCard}
        >
          <Feather name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Where are you going?</Text>
          <View style={styles.micButton}>
            <Feather name="mic" size={18} color={colors.textPrimary} />
          </View>
        </TouchableOpacity>

        {/* AI Slowdown Alert */}
        {showSlowdownAlert && (
          <View style={styles.alertWrapper}>
            <SlowdownAlert
              onDismiss={() => setShowSlowdownAlert(false)}
              onViewIncident={() => {
                setShowSlowdownAlert(false);
                setSelectedIncident(mockIncidents[0]);
              }}
              onFindSaferRoute={() =>
                Alert.alert('Rerouting', 'Finding a safer route around the slowdown area.')
              }
            />
          </View>
        )}

        {/* Selected Incident Detail Card */}
        {selectedIncident && (
          <View style={styles.alertWrapper}>
            <IncidentAlertCard
              title={selectedIncident.title}
              distance={selectedIncident.distance}
              severity={selectedIncident.severity}
              confidence={selectedIncident.confidence}
              status={selectedIncident.status}
              onDismiss={() => setSelectedIncident(null)}
              onView={() =>
                Alert.alert(selectedIncident.title, selectedIncident.location ?? '')
              }
              onFindSaferRoute={() =>
                Alert.alert('Rerouting', 'Finding a safer route around this incident.')
              }
            />
          </View>
        )}
      </SafeAreaView>

      {/* Floating Map Controls on right side */}
      <View style={styles.controlsColumn}>
        <MapControlButton
          icon="shield"
          onPress={() => setServicesSheetVisible(true)}
        />
        <MapControlButton
          icon="layers"
          onPress={() => setFiltersSheetVisible(true)}
        />
        <MapControlButton
          icon="crosshair"
          onPress={() =>
            Alert.alert('GPS Calibrated', 'Centered on your current location.')
          }
        />
        <MapControlButton
          icon="rotate-ccw"
          onPress={() =>
            Alert.alert('Map Refreshed', 'Refetched live telemetry and road conditions.')
          }
        />
      </View>

      {/* Floating Emergency & Report action buttons on bottom */}
      <View style={styles.bottomActionsRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onOpenEmergency}
          style={styles.sosButton}
        >
          <Ionicons name="call-outline" size={18} color="#DC2626" />
          <Text style={styles.sosButtonText}>Emergency</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onOpenReport}
          style={styles.reportButton}
        >
          <Feather name="alert-triangle" size={18} color="#FFFFFF" />
          <Text style={styles.reportButtonText}>Report</Text>
        </TouchableOpacity>
      </View>

      {/* Map Layers Filter Sheet */}
      <MapFilterSheet
        visible={filtersSheetVisible}
        onClose={() => setFiltersSheetVisible(false)}
        layers={layers}
        onToggleLayer={handleToggleLayer}
      />

      {/* Nearby Services Bottom Sheet */}
      <BottomSheet
        visible={servicesSheetVisible}
        onClose={() => setServicesSheetVisible(false)}
        title="Nearby Services"
        subtitle="Hospitals, Police, Fuel & Assistance"
      >
        <View style={styles.filterPillsRow}>
          {['all', 'hospital', 'police', 'fuel', 'cng', 'garage'].map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setServiceCategory(cat)}
              style={[
                styles.categoryPill,
                serviceCategory === cat && styles.categoryPillActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  serviceCategory === cat && styles.categoryTextActive,
                ]}
              >
                {cat === 'all'
                  ? 'All'
                  : cat === 'cng'
                  ? 'CNG'
                  : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.servicesList}>
          {filteredServices.map((service) => (
            <NearbyServiceCard
              key={service.id}
              service={service}
              onPress={() =>
                Alert.alert(service.name, `${service.status}\nDistance: ${service.distance}`)
              }
            />
          ))}
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  topSafeArea: {
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 20,
  },
  floatingSearchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  micButton: {
    padding: 2,
    marginLeft: 8,
  },
  alertWrapper: {
    marginTop: 12,
  },
  controlsColumn: {
    position: 'absolute',
    right: 20,
    top: 150,
    zIndex: 10,
    alignItems: 'center',
  },
  bottomActionsRow: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 15,
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 6,
  },
  sosButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 22,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    gap: 6,
  },
  reportButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  filterPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#F1F3F5',
  },
  categoryPillActive: {
    backgroundColor: colors.primaryDark,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  servicesList: {
    marginTop: 4,
  },
});
