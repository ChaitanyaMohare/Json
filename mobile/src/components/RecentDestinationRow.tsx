import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface RecentDestinationRowProps {
  name: string;
  state: string;
  onPress: () => void;
}

export const RecentDestinationRow: React.FC<RecentDestinationRowProps> = ({
  name,
  state,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.row}
    >
      {/* Clock / History icon on left matching Screen 2 */}
      <View style={styles.iconWrapper}>
        <Feather name="clock" size={20} color={colors.textPrimary} />
      </View>

      {/* Destination text */}
      <View style={styles.textContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.state}>{state}</Text>
      </View>

      {/* Right chevron matching Screen 2 */}
      <Feather name="chevron-right" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  iconWrapper: {
    marginRight: 16,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  state: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '400',
  },
});
