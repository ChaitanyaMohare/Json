import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

interface NavigationInstructionCardProps {
  distance: string;
  instruction: string;
  turnDirection?: 'right' | 'left' | 'slight-right' | 'slight-left' | 'straight' | 'u-turn';
  subsequentTurnDirection?: 'right' | 'left' | 'slight-right' | 'slight-left' | 'straight' | 'u-turn' | null;
  subsequentInstruction?: string | null;
  subsequentDistance?: string | null;
  nextTurnMeters?: number;
  speedKmh?: number;
  driverModeEnabled?: boolean;
  isMuted?: boolean;
  autoZoomLevel?: number;
  onMicPress?: () => void;
  onToggleDriverMode?: () => void;
}

export const NavigationInstructionCard: React.FC<NavigationInstructionCardProps> = ({
  distance,
  instruction,
  turnDirection = 'right',
  subsequentTurnDirection = null,
  subsequentInstruction = null,
  subsequentDistance = null,
  nextTurnMeters = 300,
  speedKmh = 0,
  driverModeEnabled = true,
  isMuted = false,
  autoZoomLevel,
  onMicPress,
  onToggleDriverMode,
}) => {
  const getTurnIcon = (dir: string) => {
    switch (dir) {
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

  // Turn proximity progress (0 to 1 as vehicle nears turn from 400m away)
  const proximityProgress = Math.max(
    0,
    Math.min(1, 1 - (nextTurnMeters || 300) / 400)
  );
  const isApproachingTurn = nextTurnMeters <= 100;

  return (
    <View style={[styles.card, isApproachingTurn && styles.cardApproaching]}>
      {/* Top Status & Controls Bar */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onToggleDriverMode}
          style={styles.driverModePill}
        >
          <Ionicons
            name={driverModeEnabled ? 'navigate' : 'navigate-outline'}
            size={12}
            color={driverModeEnabled ? '#34D399' : '#94A3B8'}
            style={{ marginRight: 5 }}
          />
          <Text style={styles.driverModePillText}>
            {driverModeEnabled ? 'DRIVER MODE · AUTO-ZOOM ON' : 'DRIVER MODE: OFF'}
          </Text>
        </TouchableOpacity>

        <View style={styles.headerRightGroup}>
          {speedKmh > 0 && (
            <View style={styles.speedChip}>
              <Text style={styles.speedChipText}>{Math.round(speedKmh)} km/h</Text>
            </View>
          )}

          {/* Voice Prompt Speaker Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onMicPress}
            style={[styles.speakerBtn, isMuted && styles.speakerBtnMuted]}
          >
            <Feather
              name={isMuted ? 'volume-x' : 'volume-2'}
              size={18}
              color={isMuted ? '#94A3B8' : '#34D399'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Maneuver & Countdown Section */}
      <View style={styles.mainManeuverRow}>
        {/* Giant Maneuver Direction Arrow */}
        <View style={[styles.arrowWrapper, isApproachingTurn && styles.arrowWrapperApproaching]}>
          <MaterialCommunityIcons
            name={getTurnIcon(turnDirection) as any}
            size={38}
            color="#FFFFFF"
          />
        </View>

        {/* Distance Countdown & Instruction Text */}
        <View style={styles.textWrapper}>
          <View style={styles.distanceBadgeRow}>
            <Text style={styles.distanceText}>{distance}</Text>
            {isApproachingTurn && (
              <View style={styles.turnSoonBadge}>
                <Text style={styles.turnSoonBadgeText}>TURN SOON</Text>
              </View>
            )}
          </View>
          <Text style={styles.instructionText} numberOfLines={2}>
            {instruction}
          </Text>
        </View>
      </View>

      {/* Turn Proximity Meter (Dynamic Progress Bar) */}
      {nextTurnMeters <= 400 && (
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressBar,
              { width: `${Math.round(proximityProgress * 100)}%` },
              isApproachingTurn && styles.progressBarApproaching,
            ]}
          />
        </View>
      )}

      {/* Subsequent Maneuver Preview ("Then" Banner) */}
      {(subsequentInstruction || subsequentTurnDirection) && (
        <View style={styles.subsequentBanner}>
          <View style={styles.subsequentPillTag}>
            <Text style={styles.subsequentTagText}>THEN</Text>
          </View>
          {subsequentTurnDirection && (
            <MaterialCommunityIcons
              name={getTurnIcon(subsequentTurnDirection) as any}
              size={18}
              color="#A7F3D0"
              style={{ marginRight: 6 }}
            />
          )}
          <Text style={styles.subsequentText} numberOfLines={1}>
            {subsequentInstruction ||
              `Continue ${subsequentTurnDirection || 'straight'}${
                subsequentDistance ? ` in ${subsequentDistance}` : ''
              }`}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#07271F',
    borderRadius: 22,
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 16,
    marginHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
    borderWidth: 1.5,
    borderColor: '#059669',
  },
  cardApproaching: {
    borderColor: '#10B981',
    backgroundColor: '#063327',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  driverModePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#94A3B8',
    marginRight: 6,
  },
  pulseDotActive: {
    backgroundColor: '#10B981',
  },
  driverModePillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#D1FAE5',
    letterSpacing: 0.4,
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  speedChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  speedChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  speakerBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.4)',
  },
  speakerBtnMuted: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  mainManeuverRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowWrapper: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  arrowWrapperApproaching: {
    backgroundColor: '#059669',
    borderColor: '#34D399',
  },
  textWrapper: {
    flex: 1,
  },
  distanceBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  distanceText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.6,
  },
  turnSoonBadge: {
    backgroundColor: '#F59E0B',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  turnSoonBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#78350F',
    letterSpacing: 0.5,
  },
  instructionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E6FFFA',
    lineHeight: 18,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  progressBarApproaching: {
    backgroundColor: '#34D399',
  },
  subsequentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    marginTop: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
  },
  subsequentPillTag: {
    backgroundColor: '#10B981',
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 5,
    marginRight: 8,
  },
  subsequentTagText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#062E23',
    letterSpacing: 0.6,
  },
  subsequentText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#D1FAE5',
  },
});
