import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

interface NavigationInstructionCardProps {
  distance: string;
  instruction: string;
  turnDirection?: 'right' | 'left' | 'slight-right' | 'slight-left' | 'straight' | 'u-turn';
  onMicPress?: () => void;
}

export const NavigationInstructionCard: React.FC<NavigationInstructionCardProps> = ({
  distance,
  instruction,
  turnDirection = 'right',
  onMicPress,
}) => {
  const getTurnIcon = () => {
    switch (turnDirection) {
      case 'left':
        return 'arrow-top-left';
      case 'slight-left':
        return 'arrow-left-top';
      case 'right':
        return 'arrow-top-right';
      case 'slight-right':
        return 'arrow-right-top';
      case 'u-turn':
        return 'arrow-u-down-left';
      case 'straight':
      default:
        return 'arrow-up-bold';
    }
  };

  return (
    <View style={styles.card}>
      {/* Left Turn Direction Arrow */}
      <View style={styles.arrowWrapper}>
        <MaterialCommunityIcons
          name={getTurnIcon() as any}
          size={32}
          color="#FFFFFF"
        />
      </View>

      {/* Center Distance and Instruction Text */}
      <View style={styles.textWrapper}>
        <Text style={styles.distanceText}>{distance}</Text>
        <Text style={styles.instructionText} numberOfLines={2}>
          {instruction}
        </Text>
      </View>

      {/* Right Microphone / Speaker Icon */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onMicPress}
        style={styles.micButton}
      >
        <Feather name="volume-2" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A3D2F',
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  arrowWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textWrapper: {
    flex: 1,
  },
  distanceText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  instructionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D1FAE5',
    lineHeight: 17,
  },
  micButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
});
