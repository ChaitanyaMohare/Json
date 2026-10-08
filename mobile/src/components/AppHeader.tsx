import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

interface AppHeaderProps {
  onMenuPress?: () => void;
  onProfilePress?: () => void;
  onRewardsPress?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onMenuPress,
  onProfilePress,
  onRewardsPress,
}) => {
  const { userProfile, safetyCoins } = useApp();

  return (
    <View style={styles.header}>
      {/* Left Hamburger Icon */}
      <TouchableOpacity
        onPress={onMenuPress}
        style={styles.menuButton}
        activeOpacity={0.7}
      >
        <Feather name="menu" size={24} color={colors.textPrimary} />
      </TouchableOpacity>

      {/* Center Brand Logo */}
      <View style={styles.brandCenter}>
        <Image
          source={require('../../assets/waysure_logo.png')}
          style={styles.brandLogo}
          resizeMode="contain"
        />
        <View style={styles.brandTextCol}>
          <Text style={styles.brandTitle}>
            <Text style={{ color: '#0F172A' }}>Way</Text>
            <Text style={{ color: '#DC2626' }}>Sure</Text>
          </Text>
        </View>
      </View>

      {/* Center/Right Coin Balance Pill */}
      <View style={styles.rightGroup}>
        {onRewardsPress && (
          <TouchableOpacity
            onPress={onRewardsPress}
            style={styles.coinPill}
            activeOpacity={0.8}
          >
            <Text style={styles.coinIcon}>🪙</Text>
            <Text style={styles.coinBalance}>{safetyCoins}</Text>
            <Ionicons name="sparkles" size={12} color="#F59E0B" />
          </TouchableOpacity>
        )}

        {/* Right User Avatar */}
        <TouchableOpacity
          onPress={onProfilePress}
          style={styles.avatarButton}
          activeOpacity={0.8}
        >
          <Image
            source={{
              uri:
                userProfile?.avatarUri ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
            }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  brandTextCol: {
    flexDirection: 'column',
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 4,
  },
  coinIcon: {
    fontSize: 13,
  },
  coinBalance: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B45309',
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
});
