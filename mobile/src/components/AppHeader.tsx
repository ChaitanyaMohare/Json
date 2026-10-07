import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

interface AppHeaderProps {
  onMenuPress?: () => void;
  onProfilePress?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onMenuPress,
  onProfilePress,
}) => {
  const { userProfile } = useApp();

  return (
    <View style={styles.header}>
      {/* Left Hamburger Icon matching Screen 2 */}
      <TouchableOpacity
        onPress={onMenuPress}
        style={styles.menuButton}
        activeOpacity={0.7}
      >
        <Feather name="menu" size={24} color={colors.textPrimary} />
      </TouchableOpacity>

      {/* Right User Avatar matching Screen 2 */}
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
