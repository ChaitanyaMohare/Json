import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { TravelMode } from '../types';

interface TravelModeSelectorProps {
  selectedMode: TravelMode;
  onSelectMode: (mode: TravelMode) => void;
}

export const TravelModeSelector: React.FC<TravelModeSelectorProps> = ({
  selectedMode,
  onSelectMode,
}) => {
  const modes: {
    key: TravelMode;
    label: string;
    icon: (selected: boolean) => React.ReactNode;
  }[] = [
    {
      key: 'car',
      label: 'Car',
      icon: (selected) => (
        <Ionicons
          name="car"
          size={20}
          color={selected ? '#FFFFFF' : colors.textPrimary}
        />
      ),
    },
    {
      key: 'bike',
      label: 'Bike',
      icon: (selected) => (
        <MaterialCommunityIcons
          name="motorbike"
          size={20}
          color={selected ? '#FFFFFF' : colors.textPrimary}
        />
      ),
    },
    {
      key: 'walk',
      label: 'Walk',
      icon: (selected) => (
        <Ionicons
          name="walk"
          size={20}
          color={selected ? '#FFFFFF' : colors.textPrimary}
        />
      ),
    },
  ];

  return (
    <View style={styles.container}>
      {modes.map((m) => {
        const isSelected = selectedMode === m.key;
        return (
          <TouchableOpacity
            key={m.key}
            activeOpacity={0.8}
            onPress={() => onSelectMode(m.key)}
            style={[
              styles.modeButton,
              isSelected ? styles.modeButtonSelected : styles.modeButtonUnselected,
            ]}
          >
            {m.icon(isSelected)}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginVertical: 14,
  },
  modeButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  modeButtonSelected: {
    backgroundColor: '#0E131F',
    borderColor: '#0E131F',
  },
  modeButtonUnselected: {
    backgroundColor: '#F8F9FA',
    borderColor: '#E5E7EB',
  },
});
