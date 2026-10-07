import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Image,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export const ProfileScreen: React.FC = () => {
  const [hazardAlerts, setHazardAlerts] = useState(true);
  const [slowdownDetection, setSlowdownDetection] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>Roman Developer</Text>
          <Text style={styles.userSubtitle}>Driver Trust Score: 96 / 100</Text>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Account</Text>

          <TouchableOpacity style={styles.row}>
            <View style={styles.rowIcon}>
              <Feather name="user" size={18} color={colors.textPrimary} />
            </View>
            <Text style={styles.rowLabel}>Personal Information</Text>
            <Feather name="chevron-right" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row}>
            <View style={styles.rowIcon}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.textPrimary} />
            </View>
            <Text style={styles.rowLabel}>Safety Score & Telemetry</Text>
            <Feather name="chevron-right" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Notifications</Text>

          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Feather name="bell" size={18} color={colors.textPrimary} />
            </View>
            <Text style={styles.rowLabel}>Hazard Audio Alerts</Text>
            <Switch
              value={hazardAlerts}
              onValueChange={setHazardAlerts}
              trackColor={{ false: '#E2E8F0', true: '#93C5FD' }}
              thumbColor={hazardAlerts ? colors.primaryDark : '#FFFFFF'}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Feather name="activity" size={18} color={colors.textPrimary} />
            </View>
            <Text style={styles.rowLabel}>Slowdown Sensors</Text>
            <Switch
              value={slowdownDetection}
              onValueChange={setSlowdownDetection}
              trackColor={{ false: '#E2E8F0', true: '#93C5FD' }}
              thumbColor={slowdownDetection ? colors.primaryDark : '#FFFFFF'}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>About Waysure</Text>

          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Feather name="info" size={18} color={colors.textPrimary} />
            </View>
            <Text style={styles.rowLabel}>Version</Text>
            <Text style={styles.rowValue}>1.0.0</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Feather name="award" size={18} color={colors.textPrimary} />
            </View>
            <Text style={styles.rowLabel}>Tagline</Text>
            <Text style={styles.rowValue}>Know the road. Trust your way.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: 18,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  userSubtitle: {
    fontSize: 13,
    color: colors.safetyGreen,
    fontWeight: '600',
    marginTop: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  rowIcon: {
    width: 32,
    alignItems: 'center',
    marginRight: 10,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  rowValue: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
