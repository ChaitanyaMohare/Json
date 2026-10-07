import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { PrimaryButton } from '../components/PrimaryButton';

interface ReportSubmittedScreenProps {
  onContinueNavigation: () => void;
}

export const ReportSubmittedScreen: React.FC<ReportSubmittedScreenProps> = ({
  onContinueNavigation,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Main Content matching Screen 9 */}
      <View style={styles.content}>
        {/* Large Green Checkmark Badge */}
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={38} color="#FFFFFF" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Report Submitted</Text>

        {/* Geo-Tag Verification Indicator */}
        <View style={styles.geoTagVerifiedPill}>
          <Ionicons name="shield-checkmark" size={16} color="#15803D" />
          <Text style={styles.geoTagVerifiedText}>GPS Geo-Tagged & Verified Telemetry</Text>
        </View>

        {/* 3 Line Message */}
        <Text style={styles.message}>
          Thank you!{'\n'}
          Your geo-tagged report helps pinpoint{'\n'}
          hazards accurately for everyone.
        </Text>
      </View>

      {/* Bottom CTA: Continue Navigation matching Screen 9 */}
      <View style={styles.bottomBar}>
        <PrimaryButton
          title="Continue Navigation"
          onPress={onContinueNavigation}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  checkCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 10,
    textAlign: 'center',
  },
  geoTagVerifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  geoTagVerifiedText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '700',
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 12,
  },
});
