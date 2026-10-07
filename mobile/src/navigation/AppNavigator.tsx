import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { DestinationScreen } from '../screens/DestinationScreen';
import { RouteOptionsScreen } from '../screens/RouteOptionsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { NavigationScreen } from '../screens/NavigationScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { TripsScreen } from '../screens/TripsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { BottomSheet } from '../components/BottomSheet';
import { EmergencyPanel } from '../components/EmergencyPanel';
import { ReportOption } from '../components/ReportOption';
import { PrimaryButton } from '../components/PrimaryButton';
import { DestinationItem, RouteOption } from '../types';

type FlowScreen =
  | 'splash'
  | 'onboarding'
  | 'destination'   // Screen 2 in Reference
  | 'route_options' // Screen 3 in Reference
  | 'navigation'
  | 'live_map';     // Secondary map view

type BottomTab = 'destination' | 'map' | 'reports' | 'trips' | 'profile';

export const AppNavigator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<FlowScreen>('splash');
  const [activeTab, setActiveTab] = useState<BottomTab>('destination');
  const [selectedDestination, setSelectedDestination] = useState<DestinationItem>({
    id: 'dest-1',
    name: 'Dehradun',
    state: 'Uttarakhand',
  });
  const [activeNavigationRoute, setActiveNavigationRoute] = useState<RouteOption | null>(null);

  // Global report & emergency sheets
  const [reportSheetVisible, setReportSheetVisible] = useState(false);
  const [emergencyVisible, setEmergencyVisible] = useState(false);
  const [reportType, setReportType] = useState<string>('road_blockage');
  const [reportPhotoAttached, setReportPhotoAttached] = useState(false);
  const [reportSubmittedModal, setReportSubmittedModal] = useState(false);

  // 1. Splash Screen matching Reference Screen 1
  if (currentScreen === 'splash') {
    return (
      <SplashScreen
        onFinish={() => setCurrentScreen('destination')}
      />
    );
  }

  // 2. Onboarding Screen
  if (currentScreen === 'onboarding') {
    return (
      <OnboardingScreen
        onFinish={() => setCurrentScreen('destination')}
      />
    );
  }

  // 3. Route Options Screen matching Reference Screen 3
  if (currentScreen === 'route_options') {
    return (
      <RouteOptionsScreen
        destination={selectedDestination}
        origin="Your location"
        onBack={() => setCurrentScreen('destination')}
        onStartNavigation={(route) => {
          setActiveNavigationRoute(route);
          setCurrentScreen('navigation');
        }}
      />
    );
  }

  // 4. Turn-by-Turn Navigation Screen
  if (currentScreen === 'navigation' && activeNavigationRoute) {
    return (
      <NavigationScreen
        route={activeNavigationRoute}
        onEndNavigation={() => setCurrentScreen('destination')}
        onReportPress={() => setReportSheetVisible(true)}
      />
    );
  }

  // Tab content switching
  const renderTabContent = () => {
    switch (activeTab) {
      case 'map':
        return (
          <HomeScreen
            onSearchPress={() => {
              setActiveTab('destination');
              setCurrentScreen('destination');
            }}
            onOpenReport={() => setReportSheetVisible(true)}
            onOpenEmergency={() => setEmergencyVisible(true)}
          />
        );
      case 'reports':
        return <ReportsScreen />;
      case 'trips':
        return <TripsScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'destination':
      default:
        // Set Destination Screen matching Reference Screen 2
        return (
          <DestinationScreen
            onSelectDestination={(dest) => {
              setSelectedDestination(dest);
              setCurrentScreen('route_options');
            }}
            onOpenMenu={() => setActiveTab('map')}
            onOpenProfile={() => setActiveTab('profile')}
          />
        );
    }
  };

  const tabs: { key: BottomTab; label: string; icon: (active: boolean) => React.ReactNode }[] = [
    {
      key: 'destination',
      label: 'Search',
      icon: (active) => (
        <Ionicons
          name={active ? 'search' : 'search-outline'}
          size={22}
          color={active ? colors.primaryDark : colors.textMuted}
        />
      ),
    },
    {
      key: 'map',
      label: 'Live Map',
      icon: (active) => (
        <Ionicons
          name={active ? 'navigate' : 'navigate-outline'}
          size={22}
          color={active ? colors.primaryDark : colors.textMuted}
        />
      ),
    },
    {
      key: 'reports',
      label: 'Reports',
      icon: (active) => (
        <Feather
          name="alert-circle"
          size={22}
          color={active ? colors.primaryDark : colors.textMuted}
        />
      ),
    },
    {
      key: 'trips',
      label: 'Trips',
      icon: (active) => (
        <Ionicons
          name={active ? 'map' : 'map-outline'}
          size={22}
          color={active ? colors.primaryDark : colors.textMuted}
        />
      ),
    },
    {
      key: 'profile',
      label: 'Profile',
      icon: (active) => (
        <Feather
          name="user"
          size={22}
          color={active ? colors.primaryDark : colors.textMuted}
        />
      ),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Active Screen Content */}
      <View style={styles.content}>{renderTabContent()}</View>

      {/* Clean White Bottom Navigation Bar matching reference style */}
      <SafeAreaView style={styles.tabBarWrapper}>
        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.7}
                onPress={() => {
                  setActiveTab(tab.key);
                  if (tab.key === 'destination') {
                    setCurrentScreen('destination');
                  }
                }}
                style={styles.tabButton}
              >
                {tab.icon(isActive)}
                <Text
                  style={[
                    styles.tabLabel,
                    isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>

      {/* Report Incident Bottom Sheet */}
      <BottomSheet
        visible={reportSheetVisible}
        onClose={() => setReportSheetVisible(false)}
        title="What's happening?"
        subtitle="Current location: Rajpur Road, Dehradun"
      >
        <View style={styles.reportSheetContent}>
          <View style={styles.reportGrid}>
            <ReportOption
              type="accident"
              title="Accident"
              icon="💥"
              selected={reportType === 'accident'}
              onSelect={setReportType}
            />
            <ReportOption
              type="road_blockage"
              title="Road Blockage"
              icon="🚧"
              selected={reportType === 'road_blockage'}
              onSelect={setReportType}
            />
            <ReportOption
              type="road_damage"
              title="Road Damage"
              icon="⚠️"
              selected={reportType === 'road_damage'}
              onSelect={setReportType}
            />
            <ReportOption
              type="flooding"
              title="Flooding"
              icon="🌊"
              selected={reportType === 'flooding'}
              onSelect={setReportType}
            />
          </View>

          <TouchableOpacity
            onPress={() => setReportPhotoAttached(!reportPhotoAttached)}
            style={[
              styles.photoAttachBtn,
              reportPhotoAttached && styles.photoAttachBtnActive,
            ]}
          >
            <Feather name="camera" size={18} color={colors.textPrimary} />
            <Text style={styles.photoAttachText}>
              {reportPhotoAttached ? 'Photo Attached (1) ✓' : 'Add Photo'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.gpsAutoNotice}>
            📍 Current location will be attached automatically.
          </Text>

          <PrimaryButton
            title="Submit Report"
            onPress={() => {
              setReportSheetVisible(false);
              setReportSubmittedModal(true);
            }}
          />
        </View>
      </BottomSheet>

      {/* Emergency Assistance Panel */}
      <EmergencyPanel
        visible={emergencyVisible}
        onClose={() => setEmergencyVisible(false)}
      />

      {/* Report Success Feedback Sheet */}
      <BottomSheet
        visible={reportSubmittedModal}
        onClose={() => setReportSubmittedModal(false)}
        title="Report Submitted"
      >
        <View style={styles.successSheetContent}>
          <View style={styles.successIconBadge}>
            <Ionicons name="checkmark" size={32} color={colors.safetyGreen} />
          </View>
          <Text style={styles.successTitle}>Report submitted successfully.</Text>
          <View style={styles.verificationBadge}>
            <Text style={styles.verificationBadgeText}>Status: Under Verification</Text>
          </View>
          <Text style={styles.verificationDesc}>
            Our AI trust system is cross-checking traffic sensors and nearby reports before confirming.
          </Text>

          <PrimaryButton
            title="Done"
            onPress={() => setReportSubmittedModal(false)}
            style={{ width: '100%', marginTop: 20 }}
          />
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
  },
  tabBar: {
    flexDirection: 'row',
    height: 58,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },
  tabLabelActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: colors.textMuted,
  },
  reportSheetContent: {
    paddingBottom: 20,
  },
  reportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  photoAttachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    gap: 8,
    marginBottom: 12,
  },
  photoAttachBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  photoAttachText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  gpsAutoNotice: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  successSheetContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  successIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.safetyGreenSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  verificationBadge: {
    backgroundColor: colors.cautionAmberSoft,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    marginBottom: 12,
  },
  verificationBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.cautionAmber,
  },
  verificationDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});
