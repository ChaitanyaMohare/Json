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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { PhotoPicker } from '../components/PhotoPicker';
import { PrimaryButton } from '../components/PrimaryButton';
import { IncidentType, GeoTagMetadata } from '../types';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

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
  const { currentLocation, locationLabel, submitNewReport } = useApp();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [geoTag, setGeoTag] = useState<GeoTagMetadata | null>(null);
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const targetLat = geoTag?.latitude || currentLocation.latitude;
    const targetLng = geoTag?.longitude || currentLocation.longitude;
    const targetLabel = geoTag?.addressLabel || locationLabel || 'Reported Location';

    await submitNewReport(
      incidentType,
      description,
      photoUri,
      targetLabel,
      { latitude: targetLat, longitude: targetLng },
      geoTag
    );
    setIsSubmitting(false);
    onSubmitSuccess();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top Header matching Screen 8: back button and title */}
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
          {/* Photo Attachment Container with Live Geo-Tagging */}
          <PhotoPicker
            photoUri={photoUri}
            geoTag={geoTag}
            onPhotoSelected={(uri, tag) => {
              setPhotoUri(uri);
              setGeoTag(tag || null);
            }}
          />

          {/* Description Input Card with 200 Char Limit matching Screen 8 */}
          <View style={styles.descriptionCard}>
            <TextInput
              style={styles.textInput}
              placeholder="Add a short description (optional)"
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={200}
              value={description}
              onChangeText={setDescription}
            />
            <Text style={styles.charCount}>{description.length}/200</Text>
          </View>

          {/* Precision Geo-Tagged Location Card */}
          <View style={[styles.locationCard, geoTag && styles.locationCardGeoTagged]}>
            <View style={styles.locationHeaderRow}>
              <View style={[styles.locationPinBox, geoTag && styles.locationPinBoxGeoTagged]}>
                <Feather
                  name={geoTag ? 'crosshair' : 'map-pin'}
                  size={18}
                  color={geoTag ? '#FFFFFF' : colors.textPrimary}
                />
              </View>
              <View style={styles.locationInfo}>
                <View style={styles.locationTitleRow}>
                  <Text style={styles.locationTitle}>
                    {geoTag ? 'Geo-Tagged Photo Location' : 'Location (auto-detected)'}
                  </Text>
                  {geoTag && (
                    <View style={styles.precisionPill}>
                      <Text style={styles.precisionPillText}>±{geoTag.accuracyMeters || 3}m</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.locationSubtitle} numberOfLines={2}>
                  {geoTag?.addressLabel || locationLabel || 'Live Location'}
                </Text>
              </View>
            </View>

            {/* Coordinates Readout & Confidence Verification */}
            {geoTag ? (
              <View style={styles.geoTagTelemetryBox}>
                <View style={styles.telemetryItem}>
                  <Text style={styles.telemetryLabel}>GPS Coordinates</Text>
                  <Text style={styles.telemetryValue}>
                    {geoTag.latitude}° N, {geoTag.longitude}° E
                  </Text>
                </View>
                <View style={styles.telemetryItem}>
                  <Text style={styles.telemetryLabel}>Confidence</Text>
                  <View style={styles.confidenceRow}>
                    <Ionicons name="shield-checkmark" size={14} color="#15803D" />
                    <Text style={styles.confidenceText}>High Confidence</Text>
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        </ScrollView>

        {/* Bottom CTA: Submit Report matching Screen 8 */}
        <View style={styles.bottomBar}>
          <PrimaryButton
            title={isSubmitting ? 'Submitting...' : 'Submit Report'}
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
  descriptionCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    padding: 16,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  textInput: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
    textAlignVertical: 'top',
    minHeight: 70,
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
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
