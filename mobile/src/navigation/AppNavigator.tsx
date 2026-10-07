import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SplashScreen } from '../screens/SplashScreen';
import { DestinationScreen } from '../screens/DestinationScreen';
import { RouteOptionsScreen } from '../screens/RouteOptionsScreen';
import { NavigationScreen } from '../screens/NavigationScreen';
import { AlternativeRouteScreen } from '../screens/AlternativeRouteScreen';
import { ReportIncidentScreen } from '../screens/ReportIncidentScreen';
import { ReportDetailsScreen } from '../screens/ReportDetailsScreen';
import { ReportSubmittedScreen } from '../screens/ReportSubmittedScreen';
import { ArrivalScreen } from '../screens/ArrivalScreen';
import { SavedPlacesScreen } from '../screens/SavedPlacesScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { EmergencyContactsScreen } from '../screens/EmergencyContactsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RewardsScreen } from '../screens/RewardsScreen';
import {
  OfflineMapsModal,
  SafetySettingsModal,
  AppSettingsModal,
  HelpModal,
} from '../screens/DrawerModals';
import { SideMenu } from '../components/SideMenu';
import { useApp } from '../context/AppContext';
import { DestinationItem, RouteOption, IncidentType } from '../types';

type ScreenFlow =
  | 'splash'
  | 'destination'
  | 'route_options'
  | 'navigation'
  | 'alternative_route'
  | 'report_details'
  | 'report_submitted'
  | 'arrival'
  | 'profile'
  | 'rewards';

export const AppNavigator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenFlow>('splash');
  const [reportOrigin, setReportOrigin] = useState<'destination' | 'navigation' | 'arrival'>('destination');
  const [reportDetailsType, setReportDetailsType] =
    useState<IncidentType>('accident');

  const {
    selectedDestination,
    setSelectedDestination,
    selectedRoute,
    setSelectedRoute,
    reportQuickSheetVisible,
    setReportQuickSheetVisible,
    sideMenuOpen,
    setSideMenuOpen,
    activeDrawerModal,
    setActiveDrawerModal,
  } = useApp();

  // Screen 1: Splash Screen
  if (currentScreen === 'splash') {
    return (
      <SplashScreen onFinish={() => setCurrentScreen('destination')} />
    );
  }

  // Screen 3: Route Options
  if (currentScreen === 'route_options') {
    return (
      <RouteOptionsScreen
        destination={selectedDestination}
        origin="Your location"
        onBack={() => setCurrentScreen('destination')}
        onStartNavigation={(route) => {
          setSelectedRoute(route);
          setCurrentScreen('navigation');
        }}
      />
    );
  }

  // Screen 4 & Screen 10: Navigation (Full Map & Minimal)
  if (currentScreen === 'navigation') {
    return (
      <View style={styles.fullContainer}>
        <NavigationScreen
          route={selectedRoute}
          onEndNavigation={() => setCurrentScreen('destination')}
          onOpenReport={() => {
            setReportOrigin('navigation');
            setReportQuickSheetVisible(true);
          }}
          onOpenAlternativeRoute={() => setCurrentScreen('alternative_route')}
          onArrived={() => setCurrentScreen('arrival')}
        />

        {/* Screen 7: Report Incident Quick Sheet */}
        <ReportIncidentScreen
          visible={reportQuickSheetVisible}
          onClose={() => setReportQuickSheetVisible(false)}
          onSelectType={(type) => {
            setReportQuickSheetVisible(false);
            setReportDetailsType(type);
            setCurrentScreen('report_details');
          }}
        />
      </View>
    );
  }

  // Screen 6: Alternative Route Screen
  if (currentScreen === 'alternative_route') {
    return (
      <AlternativeRouteScreen
        onStayOnCurrent={() => setCurrentScreen('navigation')}
        onSwitchToSaferRoute={() => setCurrentScreen('navigation')}
      />
    );
  }

  // Screen 8: Report with Photo Screen
  if (currentScreen === 'report_details') {
    return (
      <ReportDetailsScreen
        incidentType={reportDetailsType}
        onBack={() => setCurrentScreen(reportOrigin)}
        onSubmitSuccess={() => setCurrentScreen('report_submitted')}
      />
    );
  }

  // Screen 9: Report Submitted Confirmation Screen
  if (currentScreen === 'report_submitted') {
    return (
      <ReportSubmittedScreen
        onContinueNavigation={() => setCurrentScreen(reportOrigin)}
        onViewRewards={() => setCurrentScreen('rewards')}
      />
    );
  }

  // Screen 11: Arrival Screen
  if (currentScreen === 'arrival') {
    return (
      <View style={styles.fullContainer}>
        <ArrivalScreen
          onDone={() => setCurrentScreen('destination')}
          onReportIssueNearby={() => {
            setReportOrigin('arrival');
            setReportQuickSheetVisible(true);
          }}
        />

        <ReportIncidentScreen
          visible={reportQuickSheetVisible}
          onClose={() => setReportQuickSheetVisible(false)}
          onSelectType={(type) => {
            setReportQuickSheetVisible(false);
            setReportDetailsType(type);
            setCurrentScreen('report_details');
          }}
        />
      </View>
    );
  }

  // Screen: User Profile & Update Screen
  if (currentScreen === 'profile') {
    return (
      <View style={styles.fullContainer}>
        <ProfileScreen
          onBack={() => setCurrentScreen('destination')}
          onOpenRewards={() => setCurrentScreen('rewards')}
        />
      </View>
    );
  }

  // Screen: RouteGuard Safety Coin Rewards & Store
  if (currentScreen === 'rewards') {
    return (
      <View style={styles.fullContainer}>
        <RewardsScreen onBack={() => setCurrentScreen('destination')} />
      </View>
    );
  }

  // Screen 2: Set Destination (Default Home Flow)
  return (
    <View style={styles.fullContainer}>
      <DestinationScreen
        onSelectDestination={(dest: DestinationItem) => {
          setSelectedDestination(dest);
          setCurrentScreen('route_options');
        }}
        onOpenMenu={() => setSideMenuOpen(true)}
        onOpenProfile={() => setCurrentScreen('profile')}
        onOpenRewards={() => setCurrentScreen('rewards')}
        onOpenReport={() => {
          setReportOrigin('destination');
          setReportQuickSheetVisible(true);
        }}
      />

      {/* Screen 7: Report Incident Quick Sheet from Home */}
      <ReportIncidentScreen
        visible={reportQuickSheetVisible}
        onClose={() => setReportQuickSheetVisible(false)}
        onSelectType={(type) => {
          setReportQuickSheetVisible(false);
          setReportDetailsType(type);
          setCurrentScreen('report_details');
        }}
      />

      {/* Screen 12: SideMenu Drawer */}
      <SideMenu
        visible={sideMenuOpen}
        onClose={() => setSideMenuOpen(false)}
        onOpenProfile={() => {
          setSideMenuOpen(false);
          setCurrentScreen('profile');
        }}
        onSelectMenuItem={(item) => {
          if (item === 'safety_rewards') {
            setActiveDrawerModal(null);
            setCurrentScreen('rewards');
          } else if (item === 'report_hazard') {
            setSideMenuOpen(false);
            setReportOrigin('destination');
            setReportQuickSheetVisible(true);
          } else {
            setActiveDrawerModal(item);
          }
        }}
      />

      {/* Drawer Action Modals */}
      <SavedPlacesScreen
        visible={activeDrawerModal === 'saved_places'}
        onClose={() => setActiveDrawerModal(null)}
        onSelectDestination={(dest) => {
          setActiveDrawerModal(null);
          setSelectedDestination(dest);
          setCurrentScreen('route_options');
        }}
      />

      <ReportsScreen
        visible={activeDrawerModal === 'your_reports'}
        onClose={() => setActiveDrawerModal(null)}
      />

      <EmergencyContactsScreen
        visible={activeDrawerModal === 'emergency_contacts'}
        onClose={() => setActiveDrawerModal(null)}
      />

      <OfflineMapsModal
        visible={activeDrawerModal === 'offline_maps'}
        onClose={() => setActiveDrawerModal(null)}
        onViewLiveMap={() => {
          setActiveDrawerModal(null);
          setCurrentScreen('navigation');
        }}
      />

      <SafetySettingsModal
        visible={activeDrawerModal === 'safety_settings'}
        onClose={() => setActiveDrawerModal(null)}
      />

      <AppSettingsModal
        visible={activeDrawerModal === 'app_settings'}
        onClose={() => setActiveDrawerModal(null)}
      />

      <HelpModal
        visible={activeDrawerModal === 'help'}
        onClose={() => setActiveDrawerModal(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
