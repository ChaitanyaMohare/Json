import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
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
  visible?: boolean;
  layers: MapLayersState;
  onToggleLayer: (layer: keyof MapLayersState) => void;
  onClose: () => void;
}

export const MapFilterSheet: React.FC<MapFilterSheetProps> = ({
  visible = true,
  layers,
  onToggleLayer,
  onClose,
}) => {
  if (visible === false) return null;
  const layerItems: {
    key: keyof MapLayersState;
    label: string;
    icon: (c: string) => React.ReactNode;
    color: string;
  }[] = [
    {
      key: 'incidents',
      label: 'Road Incidents',
      icon: (c) => <Feather name="alert-triangle" size={18} color={c} />,
      color: colors.incidentRed,
    },
    {
      key: 'hospitals',
      label: 'Hospitals & Emergency',
      icon: (c) => <MaterialCommunityIcons name="hospital-box" size={18} color={c} />,
      color: colors.hospital,
    },
    {
      key: 'police',
      label: 'Police Stations',
      icon: (c) => <MaterialCommunityIcons name="shield-account" size={18} color={c} />,
      color: colors.police,
    },
    {
      key: 'fuel',
      label: 'Petrol & Diesel Hubs',
      icon: (c) => <MaterialCommunityIcons name="gas-station" size={18} color={c} />,
      color: colors.fuel,
    },
    {
      key: 'cng',
      label: 'CNG Fuel Pumps',
      icon: (c) => <Ionicons name="leaf-outline" size={18} color={c} />,
      color: colors.cng,
    },
    {
      key: 'garages',
      label: 'Garages & Towing',
      icon: (c) => <MaterialCommunityIcons name="wrench" size={18} color={c} />,
      color: colors.garage,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Map Filters</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Feather name="x" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {layerItems.map((item) => {
          const isEnabled = layers[item.key];
          return (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.8}
              onPress={() => onToggleLayer(item.key)}
              style={[
                styles.filterBtn,
                isEnabled && styles.filterBtnActive,
              ]}
            >
              <View style={styles.iconBox}>
                {item.icon(isEnabled ? item.color : colors.textMuted)}
              </View>
              <Text
                style={[
                  styles.filterLabel,
                  isEnabled ? styles.filterLabelActive : styles.filterLabelInactive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: 6,
  },
  grid: {
    gap: 10,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterBtnActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#0E131F',
  },
  iconBox: {
    marginRight: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterLabelActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  filterLabelInactive: {
    color: colors.textMuted,
  },
});
