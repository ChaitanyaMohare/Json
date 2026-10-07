import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { DestinationItem } from '../types';

interface RecentDestinationRowProps {
  item: DestinationItem;
  onPress: (item: DestinationItem) => void;
}

export const RecentDestinationRow: React.FC<RecentDestinationRowProps> = ({
  item,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(item)}
      style={styles.row}
    >
      <View style={styles.iconWrapper}>
        <Feather name="clock" size={18} color={colors.textMuted} />
      </View>
      <View style={styles.infoCol}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.state}>{item.state}</Text>
      </View>
      <Feather name="chevron-right" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoCol: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  state: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
