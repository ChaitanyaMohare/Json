import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { TravelPreference } from '../types';
import { colors } from '../theme/colors';

interface PreferenceChipProps {
  label: TravelPreference;
  selected: boolean;
  onSelect: (label: TravelPreference) => void;
  icon?: string;
}

export const PreferenceChip: React.FC<PreferenceChipProps> = ({
  label,
  selected,
  onSelect,
  icon,
}) => {
  const getDefaultIcon = () => {
    switch (label) {
      case 'Fastest':
        return '⚡';
      case 'Balanced':
        return '⚖️';
      case 'Safety First':
        return '🛡️';
    }
  };

  const displayIcon = icon || getDefaultIcon();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onSelect(label)}
      style={[
        styles.chip,
        selected ? styles.selectedChip : styles.unselectedChip,
      ]}
    >
      <Text style={styles.icon}>{displayIcon}</Text>
      <Text
        style={[
          styles.labelText,
          selected ? styles.selectedText : styles.unselectedText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
    gap: 6,
  },
  unselectedChip: {
    backgroundColor: colors.surface,
    borderColor: colors.divider,
  },
  selectedChip: {
    backgroundColor: colors.navyDark,
    borderColor: colors.navyDark,
    shadowColor: colors.navyDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  icon: {
    fontSize: 14,
  },
  labelText: {
    fontSize: 13,
    fontWeight: '700',
  },
  unselectedText: {
    color: colors.textSecondary,
  },
  selectedText: {
    color: colors.textWhite,
  },
});
