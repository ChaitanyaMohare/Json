import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface SlowdownAlertProps {
  onDismiss: () => void;
  onViewIncident: () => void;
}

export const SlowdownAlert: React.FC<SlowdownAlertProps> = ({
  onDismiss,
  onViewIncident,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="car-brake-alert" size={20} color="#EF4444" />
        </View>
        <View style={styles.textCol}>
          <Text style={styles.title}>Traffic Slowdown Detected Ahead</Text>
          <Text style={styles.subtitle}>Average speed dropped to 12 km/h</Text>
        </View>
        <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn}>
          <Feather name="x" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onViewIncident}
        style={styles.actionBtn}
      >
        <Text style={styles.actionText}>View Incident Details</Text>
        <Feather name="chevron-right" size={16} color={colors.navBlue} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  dismissBtn: {
    padding: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.navBlue,
  },
});
