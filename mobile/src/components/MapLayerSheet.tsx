import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { MapLayersState } from '../types';

interface MapLayerSheetProps {
  layers: MapLayersState;
  onToggleLayer: (layer: keyof MapLayersState) => void;
  onClose: () => void;
}

export const MapLayerSheet: React.FC<MapLayerSheetProps> = ({
  layers,
  onToggleLayer,
  onClose,
}) => {
  const layerItems: {
    key: keyof MapLayersState;
    label: string;
    icon: (c: string) => React.ReactNode;
  }[] = [
    {
      key: 'incidents',
      label: 'Live Incidents & Hazards',
      icon: (c) => <Feather name="alert-triangle" size={18} color={c} />,
    },
    {
      key: 'hospitals',
      label: 'Hospitals & Emergency Care',
      icon: (c) => <MaterialCommunityIcons name="hospital-box" size={18} color={c} />,
    },
    {
      key: 'police',
      label: 'Police Patrol Stations',
      icon: (c) => <MaterialCommunityIcons name="shield-account" size={18} color={c} />,
    },
    {
      key: 'fuel',
      label: 'Petrol & Diesel Pumps',
      icon: (c) => <MaterialCommunityIcons name="gas-station" size={18} color={c} />,
    },
    {
      key: 'cng',
      label: 'CNG Stations',
      icon: (c) => <Ionicons name="leaf-outline" size={18} color={c} />,
    },
    {
      key: 'garages',
      label: 'Highway Garages & Recovery',
      icon: (c) => <MaterialCommunityIcons name="wrench" size={18} color={c} />,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Map Layers</Text>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeBtn}
          activeOpacity={0.7}
        >
          <Feather name="x" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {layerItems.map((item) => {
          const isEnabled = layers[item.key];
          return (
            <View key={item.key} style={styles.row}>
              <View style={styles.labelCol}>
                <View style={styles.iconBox}>
                  {item.icon(isEnabled ? colors.primaryDark : colors.textMuted)}
                </View>
                <Text style={styles.labelText}>{item.label}</Text>
              </View>
              <Switch
                value={isEnabled}
                onValueChange={() => onToggleLayer(item.key)}
                trackColor={{ false: '#E5E7EB', true: '#0E131F' }}
                thumbColor="#FFFFFF"
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
  },
  headerRow: {
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  labelCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
