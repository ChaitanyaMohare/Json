import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface MapControlButtonProps {
  icon: 'crosshair' | 'layers' | 'rotate-ccw' | 'shield' | 'alert-triangle';
  onPress: () => void;
  active?: boolean;
}

export const MapControlButton: React.FC<MapControlButtonProps> = ({
  icon,
  onPress,
  active = false,
}) => {
  const renderIcon = () => {
    switch (icon) {
      case 'crosshair':
        return <Feather name="crosshair" size={20} color={colors.textPrimary} />;
      case 'layers':
        return <Feather name="layers" size={20} color={colors.textPrimary} />;
      case 'rotate-ccw':
        return <Feather name="rotate-ccw" size={20} color={colors.textPrimary} />;
      case 'shield':
        return <Ionicons name="shield-checkmark-outline" size={20} color={colors.safetyGreen} />;
      case 'alert-triangle':
        return <Feather name="alert-triangle" size={20} color={colors.incidentRed} />;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.button, active && styles.buttonActive]}
    >
      {renderIcon()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  buttonActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
});
