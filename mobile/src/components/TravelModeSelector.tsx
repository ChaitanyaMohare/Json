import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { TravelMode } from '../types';
import { colors } from '../theme/colors';

interface TravelModeSelectorProps {
  selectedMode: TravelMode;
  onSelectMode: (mode: TravelMode) => void;
}

export const TravelModeSelector: React.FC<TravelModeSelectorProps> = ({
  selectedMode,
  onSelectMode,
}) => {
  const modes: { mode: TravelMode; icon: (isSelected: boolean) => React.ReactNode }[] = [
    {
      mode: 'car',
      icon: (isSelected) => (
        <Ionicons
          name="car-outline"
          size={24}
          color={isSelected ? colors.textWhite : colors.textPrimary}
        />
      ),
    },
    {
      mode: 'bike',
      icon: (isSelected) => (
        <MaterialCommunityIcons
          name="bicycle"
          size={24}
          color={isSelected ? colors.textWhite : colors.textPrimary}
        />
      ),
    },
    {
      mode: 'transit',
      icon: (isSelected) => (
        <Ionicons
          name="bus-outline"
          size={22}
          color={isSelected ? colors.textWhite : colors.textPrimary}
        />
      ),
    },
    {
      mode: 'walk',
      icon: (isSelected) => (
        <FontAwesome5
          name="walking"
          size={20}
          color={isSelected ? colors.textWhite : colors.textPrimary}
        />
      ),
    },
  ];

  return (
    <View style={styles.container}>
      {modes.map((item) => {
        const isSelected = selectedMode === item.mode;
        return (
          <TouchableOpacity
            key={item.mode}
            activeOpacity={0.7}
            onPress={() => onSelectMode(item.mode)}
            style={[
              styles.pill,
              isSelected ? styles.pillSelected : styles.pillUnselected,
            ]}
          >
            {item.icon(isSelected)}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  pill: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  pillUnselected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  pillSelected: {
    backgroundColor: colors.primaryDark, // Dark navy pill state in Screen 3
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
});
