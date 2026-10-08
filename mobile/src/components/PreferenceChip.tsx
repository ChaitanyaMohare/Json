import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { TravelPreference } from '../types';
import { colors } from '../theme/colors';

interface PreferenceChipProps {
  label: TravelPreference;
  selected: boolean;
  onSelect: (pref: TravelPreference) => void;
}

export const PreferenceChip: React.FC<PreferenceChipProps> = ({
  label,
  selected,
  onSelect,
}) => {
  const renderIcon = () => {
    switch (label) {
      case 'Fastest':
        return <Feather name="zap" size={14} color={selected ? '#FFFFFF' : colors.textPrimary} />;
      case 'Balanced':
        return <Feather name="sliders" size={14} color={selected ? '#FFFFFF' : colors.textPrimary} />;
      case 'Safety First':
        return <Ionicons name="shield-checkmark" size={14} color={selected ? '#FFFFFF' : colors.safetyGreen} />;
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onSelect(label)}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      {renderIcon()}
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipSelected: {
    backgroundColor: '#0E131F',
    borderColor: '#0E131F',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  labelSelected: {
    color: '#FFFFFF',
  },
});
