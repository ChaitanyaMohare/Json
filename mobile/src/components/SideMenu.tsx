import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { WaysureLogo } from './WaysureLogo';
import { useApp } from '../context/AppContext';

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  onOpenProfile?: () => void;
  onSelectMenuItem: (
    item:
      | 'saved_places'
      | 'safety_rewards'
      | 'report_hazard'
      | 'offline_maps'
      | 'safety_settings'
      | 'emergency_contacts'
      | 'your_reports'
      | 'app_settings'
      | 'help'
  ) => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({
  visible,
  onClose,
  onOpenProfile,
  onSelectMenuItem,
}) => {
  const { userProfile, safetyCoins } = useApp();
  const menuItems: {
    key:
      | 'saved_places'
      | 'safety_rewards'
      | 'report_hazard'
      | 'offline_maps'
      | 'safety_settings'
      | 'emergency_contacts'
      | 'your_reports'
      | 'app_settings'
      | 'help';
    label: string;
    icon: (color: string) => React.ReactNode;
    badge?: string;
  }[] = [
    {
      key: 'safety_rewards',
      label: 'Safety Coin Rewards',
      icon: () => <Ionicons name="sparkles" size={20} color="#EAB308" />,
      badge: `🪙 ${safetyCoins} Coins`,
    },
    {
      key: 'report_hazard',
      label: 'Report Road Hazard',
      icon: () => <Ionicons name="warning-outline" size={20} color="#EA580C" />,
      badge: '+50 Coins',
    },
    {
      key: 'saved_places',
      label: 'Saved Places',
      icon: (c) => <Feather name="bookmark" size={20} color={c} />,
    },
    {
      key: 'offline_maps',
      label: 'Offline Maps',
      icon: (c) => <Ionicons name="map-outline" size={20} color={c} />,
      badge: 'New',
    },
    {
      key: 'safety_settings',
      label: 'Safety Settings',
      icon: (c) => <Ionicons name="shield-checkmark-outline" size={20} color={c} />,
    },
    {
      key: 'emergency_contacts',
      label: 'Emergency Contacts',
      icon: (c) => <Feather name="phone" size={20} color={c} />,
    },
    {
      key: 'your_reports',
      label: 'Your Reports',
      icon: (c) => <Feather name="alert-circle" size={20} color={c} />,
    },
    {
      key: 'app_settings',
      label: 'App Settings',
      icon: (c) => <Feather name="settings" size={20} color={c} />,
    },
    {
      key: 'help',
      label: 'Help & Support',
      icon: (c) => <Feather name="help-circle" size={20} color={c} />,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.drawer}>
          <SafeAreaView style={{ flex: 1 }}>
            {/* Top Header: Logo + Brand + Close Button */}
            <View style={styles.header}>
              <View style={styles.brandRow}>
                <WaysureLogo size={32} />
                <Text style={styles.brandTitle}>WaySure</Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                activeOpacity={0.7}
              >
                <Feather name="x" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* User Profile Section matching Screen 12 (Tapping opens Profile Update Screen) */}
            <TouchableOpacity
              style={styles.userSection}
              activeOpacity={0.7}
              onPress={() => {
                onClose();
                if (onOpenProfile) onOpenProfile();
              }}
            >
              <Image
                source={{
                  uri:
                    userProfile?.avatarUri ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
                }}
                style={styles.userAvatar}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{userProfile?.name || 'Roman Developer'}</Text>
                <Text style={styles.userPhone}>{userProfile?.phone || '+91 98765 43210'}</Text>
                <View style={styles.editProfilePill}>
                  <Feather name="edit-2" size={11} color="#2563EB" />
                  <Text style={styles.editProfileText}>Edit Profile</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color="#94A3B8" />
            </TouchableOpacity>

            {/* Menu List matching Screen 12 */}
            <ScrollView
              style={styles.menuList}
              showsVerticalScrollIndicator={false}
            >
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={styles.menuItem}
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    onSelectMenuItem(item.key);
                  }}
                >
                  <View style={styles.itemIconWrapper}>
                    {item.icon(colors.textPrimary)}
                  </View>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  {item.badge && (
                    <View style={styles.badgeWrapper}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  backdrop: {
    width: '18%',
    height: '100%',
  },
  drawer: {
    width: '82%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  editProfilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  editProfileText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  menuList: {
    flex: 1,
    paddingTop: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  itemIconWrapper: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  itemLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  badgeWrapper: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  badgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
});
