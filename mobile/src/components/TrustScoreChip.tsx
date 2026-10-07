import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { getTrustScoreConfig } from '../utils/trustScore';

interface TrustScoreChipProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const TrustScoreChip: React.FC<TrustScoreChipProps> = ({
  score,
  size = 'md',
  showLabel = true,
}) => {
  const config = getTrustScoreConfig(score);

  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
          paddingVertical: isSmall ? 3 : isLarge ? 6 : 4,
          paddingHorizontal: isSmall ? 8 : isLarge ? 12 : 10,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text
        style={[
          styles.scoreText,
          {
            color: config.color,
            fontSize: isSmall ? 12 : isLarge ? 16 : 13,
          },
        ]}
      >
        {score}
      </Text>
      {showLabel && (
        <Text
          style={[
            styles.labelText,
            {
              color: config.color,
              fontSize: isSmall ? 10 : isLarge ? 13 : 11,
            },
          ]}
        >
          {config.label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  scoreText: {
    fontWeight: '800',
  },
  labelText: {
    fontWeight: '600',
    opacity: 0.9,
  },
});
