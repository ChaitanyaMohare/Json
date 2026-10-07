import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface QuickDestinationCardProps {
  title: string;
  subtitle: string;
  icon: 'home' | 'briefcase' | 'map-pin';
  onPress: () => void;
}

export const QuickDestinationCard: React.FC<QuickDestinationCardProps> = ({
  title,
  subtitle,
  icon,
  onPress,
}) => {
  const renderIcon = () => {
    switch (icon) {
      case 'home':
        return <Ionicons name="home" size={22} color={colors.textPrimary} />;
      case 'briefcase':
        return <Feather name="shopping-bag" size={22} color={colors.textPrimary} />;
      case 'map-pin':
        return <Ionicons name="location-outline" size={24} color={colors.textPrimary} />;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.iconContainer}>{renderIcon()}</View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.subtitle} numberOfLines={1}>
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F8F9FA',
  },
  iconContainer: {
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '400',
  },
});
