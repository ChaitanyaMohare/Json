import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { BottomSheet } from './BottomSheet';
import { colors } from '../theme/colors';

export interface MapLayersState {
  incidents: boolean;
  hospitals: boolean;
  police: boolean;
  fuel: boolean;
  cng: boolean;
  garages: boolean;
}

interface MapFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  layers: MapLayersState;
  onToggleLayer: (layer: keyof MapLayersState) => void;
  onSelectAll?: () => void;
}

export const MapFilterSheet: React.FC<MapFilterSheetProps> = ({
  visible,
  onClose,
  layers,
  onToggleLayer,
  onSelectAll,
}) => {
  const layerItems: { key: keyof MapLayersState; label: string; icon: string; color: string }[] = [
    { key: 'incidents', label: 'Road Incidents', icon: '⚠️', color: colors.incidentRed },
    { key: 'hospitals', label: 'Hospitals & Emergency', icon: '🏥', color: colors.hospital },
    { key: 'police', label: 'Police Stations', icon: '👮', color: colors.police },
    { key: 'fuel', label: 'Petrol & Diesel Hubs', icon: '⛽', color: colors.fuel },
    { key: 'cng', label: 'CNG Fuel Pumps', icon: '🌿', color: colors.cng },
    { key: 'garages', label: 'Garages & Towing', icon: '🔧', color: colors.garage },
  ];

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Map Layers"
      subtitle="Customize markers and intelligence layers"
    >
      <View style={styles.container}>
        {layerItems.map((item) => (
          <View key={item.key} style={styles.layerRow}>
            <View style={styles.leftGroup}>
              <View style={[styles.iconBox, { backgroundColor: item.color + '18' }]}>
                <Text style={styles.icon}>{item.icon}</Text>
              </View>
              <Text style={styles.layerLabel}>{item.label}</Text>
            </View>

            <Switch
              value={layers[item.key]}
              onValueChange={() => onToggleLayer(item.key)}
              trackColor={{ false: '#E2E8F0', true: '#93C5FD' }}
              thumbColor={layers[item.key] ? colors.navBlue : '#FFFFFF'}
            />
          </View>
        ))}

        <TouchableOpacity
          onPress={onClose}
          style={styles.doneBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.doneBtnText}>Apply Layers</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 10,
  },
  layerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceMuted,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  layerLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  doneBtn: {
    backgroundColor: colors.navyDark,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
