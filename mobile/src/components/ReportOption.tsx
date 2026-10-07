import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IncidentType } from '../types';
import { colors } from '../theme/colors';

interface ReportOptionProps {
  type: IncidentType;
  title: string;
  icon: string;
  selected: boolean;
  onSelect: (type: IncidentType) => void;
}

export const ReportOption: React.FC<ReportOptionProps> = ({
  type,
  title,
  icon,
  selected,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onSelect(type)}
      style={[
        styles.container,
        selected ? styles.selectedContainer : styles.unselectedContainer,
      ]}
    >
      <View style={[styles.iconBox, selected && styles.selectedIconBox]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text
        style={[
          styles.title,
          selected ? styles.selectedTitle : styles.unselectedTitle,
        ]}
      >
        {title}
      </Text>
      {selected && <View style={styles.checkCircle}><Text style={styles.checkText}>✓</Text></View>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  unselectedContainer: {
    backgroundColor: colors.surface,
    borderColor: colors.divider,
  },
  selectedContainer: {
    backgroundColor: '#EFF6FF',
    borderColor: colors.navBlue,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  selectedIconBox: {
    backgroundColor: '#DBEAFE',
  },
  icon: {
    fontSize: 18,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  unselectedTitle: {
    color: colors.textPrimary,
  },
  selectedTitle: {
    color: colors.navBlueDark,
  },
  checkCircle: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.navBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
});
