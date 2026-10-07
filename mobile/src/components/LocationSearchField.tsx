import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { colors } from '../theme/colors';

interface LocationSearchFieldProps {
  originValue: string;
  destinationValue: string;
  onOriginChange?: (text: string) => void;
  onDestinationChange?: (text: string) => void;
  onSwap?: () => void;
  onDestinationFocus?: () => void;
}

export const LocationSearchField: React.FC<LocationSearchFieldProps> = ({
  originValue,
  destinationValue,
  onOriginChange,
  onDestinationChange,
  onSwap,
  onDestinationFocus,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.indicatorColumn}>
        <View style={styles.originDot} />
        <View style={styles.dottedLine} />
        <View style={styles.destinationPin}>
          <View style={styles.destinationInnerDot} />
        </View>
      </View>

      <View style={styles.inputsColumn}>
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>FROM</Text>
          <TextInput
            value={originValue}
            onChangeText={onOriginChange}
            placeholder="Your location"
            placeholderTextColor={colors.textMuted}
            style={styles.textInput}
            returnKeyType="next"
          />
        </View>

        <View style={styles.dividerLine} />

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>TO</Text>
          <TextInput
            value={destinationValue}
            onChangeText={onDestinationChange}
            onFocus={onDestinationFocus}
            placeholder="Where are you going?"
            placeholderTextColor={colors.textMuted}
            style={[styles.textInput, styles.destinationInputText]}
            returnKeyType="search"
          />
        </View>
      </View>

      {onSwap && (
        <TouchableOpacity
          onPress={onSwap}
          activeOpacity={0.7}
          style={styles.swapButton}
          accessibilityLabel="Swap origin and destination"
        >
          <Text style={styles.swapIcon}>⇅</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0D1527',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  indicatorColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    marginRight: 10,
    height: 72,
  },
  originDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.navBlue,
    borderWidth: 2,
    borderColor: '#93C5FD',
  },
  dottedLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 4,
  },
  destinationPin: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.incidentRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destinationInnerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  inputsColumn: {
    flex: 1,
  },
  inputWrapper: {
    paddingVertical: 3,
  },
  label: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  textInput: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    paddingVertical: 2,
    paddingHorizontal: 0,
  },
  destinationInputText: {
    color: colors.navyDark,
  },
  dividerLine: {
    height: 1,
    backgroundColor: colors.surfaceMuted,
    marginVertical: 4,
  },
  swapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  swapIcon: {
    fontSize: 18,
    color: colors.navBlue,
    fontWeight: 'bold',
  },
});
