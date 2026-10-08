import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { PhotoPicker } from '../components/PhotoPicker';
import { PrimaryButton } from '../components/PrimaryButton';
import { IncidentType, GeoTagMetadata, GeoTaggedPhoto } from '../types';
import { useApp } from '../context/AppContext';

interface ReportDetailsScreenProps {
  incidentType: IncidentType;
  onBack: () => void;
  onSubmitSuccess: () => void;
}

export const ReportDetailsScreen: React.FC<ReportDetailsScreenProps> = ({
  incidentType,
  onBack,
  onSubmitSuccess,
}) => {
  const { currentLocation, locationLabel, submitNewReport, getIncidentReportThresholdInfo } = useApp();
  const [photos, setPhotos] = useState<GeoTaggedPhoto[]>([]);
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const getTitle = () => {
    switch (incidentType) {
      case 'accident':
        return 'Accident';
      case 'road_blockage':
        return 'Road Block';
      case 'road_damage':
        return 'Road Damage';
      case 'heavy_traffic':
        return 'Heavy Traffic';
      case 'flooding':
        return 'Flooding';
      case 'other':
      default:
        return 'Other Issue';
    }
  };

  const primaryGeoTag: GeoTagMetadata | null =
    photos.length > 0 ? photos[0].geoTag : null;

  const targetCoords = {
    latitude: primaryGeoTag?.latitude || currentLocation.latitude,
    longitude: primaryGeoTag?.longitude || currentLocation.longitude,
  };

  const thresholdInfo = getIncidentReportThresholdInfo(incidentType, targetCoords);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const targetLabel = primaryGeoTag?.addressLabel || locationLabel || 'Reported Location';

    const submitted = await submitNewReport(
      incidentType,
      description,
      photos.length > 0 ? photos[0].uri : null,
      targetLabel,
      targetCoords,
      primaryGeoTag,
      photos
    );

    setIsSubmitting(false);

    if (submitted.isThresholdCapped) {
      Alert.alert(
        'Hazard Report Registered',
        `Thank you! This hazard already has ${thresholdInfo.thresholdCap} verified reports (Max Reward Threshold Cap Reached). Your report helps corroborate current road status, but no Safety Coins are awarded to prevent farming.`,
        [{ text: 'OK', onPress: onSubmitSuccess }]
      );
    } else {
      Alert.alert(
        'Safety Report Submitted!',
        `Awesome! You are Reporter #${submitted.reporterRank || 1} of 5 for this hazard. +${submitted.coinsAwarded || 50} Waysure Safety Coins have been credited to your rewards account!`,
        [{ text: 'View Rewards', onPress: onSubmitSuccess }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getTitle()}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Multiple Geo-Tagged Camera Photos (No Gallery) */}
          <PhotoPicker
            photos={photos}
            onPhotosChange={setPhotos}
            maxPhotos={5}
          />

          {/* REPORT REWARD THRESHOLD & ANTI-FARMING STATUS CARD */}
          <View
            style={[
              styles.thresholdCard,
              thresholdInfo.isThresholdCapped && styles.thresholdCardCapped,
            ]}
          >
            <View style={styles.thresholdHeaderRow}>
              <View style={styles.thresholdIconBox}>
                <Ionicons
                  name={thresholdInfo.isThresholdCapped ? 'alert-circle' : 'gift'}
                  size={18}
                  color={thresholdInfo.isThresholdCapped ? '#D97706' : '#2563EB'}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.thresholdTitle}>
                  {thresholdInfo.isThresholdCapped
                    ? 'Report Threshold Cap Reached (5/5)'
                    : `Reporter Rank #${thresholdInfo.projectedRank} of 5 Eligible`}
                </Text>
                <Text style={styles.thresholdSub}>
                  {thresholdInfo.isThresholdCapped
                    ? 'Anti-farming rule: Only first 5 valid reporters receive Safety Coins.'
                    : `Eligible for ~${thresholdInfo.estimatedCoins} Waysure Safety Coins upon verification!`}
                </Text>
              </View>
              {!thresholdInfo.isThresholdCapped && (
                <View style={styles.coinsBadge}>
                  <Text style={styles.coinsBadgeText}>+{thresholdInfo.estimatedCoins} Coins</Text>
                </View>
              )}
            </View>

            {/* Visual 5-Reporter Progress Bar */}
            <View style={styles.thresholdProgressBar}>
              {[1, 2, 3, 4, 5].map((rank) => {
                const isFilled = rank <= thresholdInfo.existingCount;
                const isCurrent = rank === thresholdInfo.projectedRank;
                return (
                  <View
                    key={rank}
                    style={[
                      styles.thresholdProgressStep,
                      isFilled && styles.thresholdStepFilled,
                      isCurrent && styles.thresholdStepCurrent,
                    ]}
                  >
                    <Text
                      style={[
                        styles.thresholdStepText,
                        (isFilled || isCurrent) && styles.thresholdStepTextActive,
                      ]}
                    >
                      #{rank}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Description Input Card with 200 Char Limit */}
          <View style={styles.descriptionCard}>
            <TextInput
              style={styles.textInput}
              placeholder="Add a short description of the road hazard..."
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={200}
              value={description}
              onChangeText={setDescription}
            />
            <Text style={styles.charCount}>{description.length}/200</Text>
          </View>

          {/* Precision Geo-Tagged Location Card */}
          <View style={[styles.locationCard, primaryGeoTag && styles.locationCardGeoTagged]}>
            <View style={styles.locationHeaderRow}>
              <View style={[styles.locationPinBox, primaryGeoTag && styles.locationPinBoxGeoTagged]}>
                <Feather
                  name={primaryGeoTag ? 'crosshair' : 'map-pin'}
                  size={18}
                  color={primaryGeoTag ? '#FFFFFF' : colors.textPrimary}
                />
              </View>
              <View style={styles.locationInfo}>
                <View style={styles.locationTitleRow}>
                  <Text style={styles.locationTitle}>
                    {primaryGeoTag ? 'Geo-Tagged Photo Location' : 'Location (auto-detected)'}
                  </Text>
                  {primaryGeoTag && (
                    <View style={styles.precisionPill}>
                      <Text style={styles.precisionPillText}>±{primaryGeoTag.accuracyMeters || 3}m</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.locationSubtitle} numberOfLines={2}>
                  {primaryGeoTag?.addressLabel || locationLabel || 'Live Location'}
                </Text>
              </View>
            </View>

            {/* Coordinates Readout & Confidence Verification */}
            {primaryGeoTag ? (
              <View style={styles.geoTagTelemetryBox}>
                <View style={styles.telemetryItem}>
                  <Text style={styles.telemetryLabel}>GPS Coordinates</Text>
                  <Text style={styles.telemetryValue}>
                    {primaryGeoTag.latitude}° N, {primaryGeoTag.longitude}° E
                  </Text>
                </View>
                <View style={styles.telemetryItem}>
                  <Text style={styles.telemetryLabel}>Confidence</Text>
                  <View style={styles.confidenceRow}>
                    <Ionicons name="shield-checkmark" size={14} color="#15803D" />
                    <Text style={styles.confidenceText}>Live Geotagged</Text>
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        </ScrollView>

        {/* Bottom CTA: Submit Report */}
        <View style={styles.bottomBar}>
          <PrimaryButton
            title={
              isSubmitting
                ? 'Submitting...'
                : thresholdInfo.isThresholdCapped
                ? 'Submit Hazard Update (0 Coins)'
                : `Submit Report (+${thresholdInfo.estimatedCoins} Coins)`
            }
            onPress={handleSubmit}
            disabled={isSubmitting}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  thresholdCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    marginBottom: 16,
  },
  thresholdCardCapped: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  thresholdHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thresholdIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thresholdTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  thresholdSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 14,
  },
  coinsBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  coinsBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  thresholdProgressBar: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  thresholdProgressStep: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  thresholdStepFilled: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  thresholdStepCurrent: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
  },
  thresholdStepText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  thresholdStepTextActive: {
    color: '#FFFFFF',
  },
  descriptionCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 18,
    padding: 14,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  textInput: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    textAlignVertical: 'top',
    minHeight: 60,
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  locationCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  locationCardGeoTagged: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  locationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationPinBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationPinBoxGeoTagged: {
    backgroundColor: '#16A34A',
  },
  locationInfo: {
    flex: 1,
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  precisionPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  precisionPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  locationSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  geoTagTelemetryBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(22, 163, 74, 0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  telemetryItem: {
    gap: 2,
  },
  telemetryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  telemetryValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
});
