import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../theme/colors';
import { MapboxMap } from '../components/MapboxMap';
import { useApp } from '../context/AppContext';
import { mockAlternativeRoutes } from '../data/mockData';

interface AlternativeRouteScreenProps {
  onStayOnCurrent: () => void;
  onSwitchToSaferRoute: () => void;
}

export const AlternativeRouteScreen: React.FC<AlternativeRouteScreenProps> = ({
  onStayOnCurrent,
  onSwitchToSaferRoute,
}) => {
  const { currentLocation, selectedDestination, setSelectedRoute } = useApp();

  const handleSwitch = () => {
    setSelectedRoute(mockAlternativeRoutes.saferRoute);
    onSwitchToSaferRoute();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Map showing alternative routes and 3 duration bubbles matching Screen 6 */}
      <MapboxMap
        currentLocation={currentLocation}
        destination={selectedDestination.coordinates}
        showAlternativeRoutes={true}
        alternativeRouteType="safer"
        showIncidentHotspot={true}
        destinationLabel={selectedDestination.name}
      />

      {/* Bottom Sheet Card matching Screen 6 */}
      <View style={styles.bottomCardWrapper}>
        <View style={styles.bottomCard}>
          <Text style={styles.titleText}>A safer route is available</Text>
          <Text style={styles.subtitleText}>
            Avoid the incident and save time.
          </Text>

          {/* Action Buttons: Stay on current vs Switch to safer route */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onStayOnCurrent}
              style={styles.stayBtn}
            >
              <Text style={styles.stayBtnText}>Stay on current</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSwitch}
              style={styles.switchBtn}
            >
              <Text style={styles.switchBtnText}>Switch to safer route</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E131F',
  },
  bottomCardWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  bottomCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stayBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stayBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  switchBtn: {
    flex: 1.3,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0E131F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
