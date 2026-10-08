import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { VerificationBadge } from '../components/VerificationBadge';
import { GeoTaggedPhotoModal } from '../components/GeoTaggedPhotoModal';
import { useApp } from '../context/AppContext';
import { IncidentType, GeoTaggedPhoto } from '../types';

interface ReportsScreenProps {
  visible?: boolean;
  onClose?: () => void;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  visible = true,
  onClose,
}) => {
  const { submittedReports } = useApp();
  const [photoViewerVisible, setPhotoViewerVisible] = useState(false);
  const [activePhotos, setActivePhotos] = useState<GeoTaggedPhoto[]>([]);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [viewerTitle, setViewerTitle] = useState('');

  const openPhotoViewer = (photos: GeoTaggedPhoto[], initialIdx: number, title: string) => {
    setActivePhotos(photos);
    setActivePhotoIdx(initialIdx);
    setViewerTitle(title);
    setPhotoViewerVisible(true);
  };

  const getIncidentIcon = (type: IncidentType) => {
    switch (type) {
      case 'accident':
        return <MaterialCommunityIcons name="car-brake-alert" size={20} color="#EF4444" />;
      case 'road_blockage':
        return <MaterialCommunityIcons name="traffic-cone" size={20} color="#F97316" />;
      case 'road_damage':
        return <Feather name="alert-triangle" size={18} color="#F59E0B" />;
      case 'heavy_traffic':
        return <MaterialCommunityIcons name="car-multiple" size={20} color="#2563EB" />;
      case 'flooding':
        return <Feather name="droplet" size={18} color="#06B6D4" />;
      case 'other':
      default:
        return <Feather name="alert-circle" size={18} color="#6B7280" />;
    }
  };

  const content = (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>Your Reports & Evidence</Text>
        {onClose && <View style={{ width: 40 }} />}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {submittedReports.length === 0 ? (
          <View style={styles.emptyBox}>
            <Feather name="shield" size={40} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No reports submitted yet</Text>
            <Text style={styles.emptySub}>
              When you report road hazards during navigation, they and their geo-tagged camera photos will appear here.
            </Text>
          </View>
        ) : (
          submittedReports.map((inc) => {
            const photosList: GeoTaggedPhoto[] =
              inc.photos && inc.photos.length > 0
                ? inc.photos
                : inc.photoUri
                ? [
                    {
                      id: `p-${inc.id}`,
                      uri: inc.photoUri,
                      geoTag: inc.geoTag || {
                        latitude: inc.latitude,
                        longitude: inc.longitude,
                        accuracyMeters: 3,
                        timestamp: inc.createdAt,
                        addressLabel: inc.locationLabel,
                      },
                    },
                  ]
                : [];

            return (
              <View key={inc.id} style={styles.card}>
                <View style={styles.headerRow}>
                  <View style={styles.iconCircle}>
                    {getIncidentIcon(inc.incidentType)}
                  </View>
                  <View style={styles.titleCol}>
                    <Text style={styles.incidentTitle}>{inc.title}</Text>
                    <Text style={styles.locationText}>{inc.locationLabel}</Text>
                  </View>
                  {photosList.length > 0 && (
                    <View style={styles.photoCountBadge}>
                      <Ionicons name="camera" size={12} color="#2563EB" />
                      <Text style={styles.photoCountBadgeText}>
                        {photosList.length} {photosList.length === 1 ? 'Photo' : 'Photos'}
                      </Text>
                    </View>
                  )}
                </View>

                {inc.description ? (
                  <Text style={styles.descText}>{inc.description}</Text>
                ) : null}

                {/* Geo-Tagged Photos Gallery Strip */}
                {photosList.length > 0 && (
                  <View style={styles.reportPhotosContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {photosList.map((photo, pIdx) => (
                        <TouchableOpacity
                          key={photo.id || pIdx}
                          onPress={() => openPhotoViewer(photosList, pIdx, inc.title)}
                          activeOpacity={0.8}
                          style={styles.reportThumbWrapper}
                        >
                          <Image source={{ uri: photo.uri }} style={styles.reportThumbImg} />
                          <View style={styles.reportThumbTag}>
                            <Text style={styles.reportThumbTagText}>#{pIdx + 1}</Text>
                          </View>
                          <View style={styles.reportThumbGpsBar}>
                            <Ionicons name="location-sharp" size={9} color="#34D399" />
                            <Text style={styles.reportThumbGpsText}>
                              {photo.geoTag ? `±${photo.geoTag.accuracyMeters || 3}m` : 'GPS'}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {inc.geoTag ? (
                  <View style={styles.geoTagBadgeRow}>
                    <Ionicons name="location" size={13} color="#15803D" />
                    <Text style={styles.geoTagBadgeText}>
                      Geo-Tagged (±{inc.geoTag.accuracyMeters || 3}m GPS) · {inc.latitude.toFixed(4)}°, {inc.longitude.toFixed(4)}°
                    </Text>
                  </View>
                ) : null}

                <View style={styles.badgeRow}>
                  <VerificationBadge status={inc.status} />
                  <Text style={styles.timeText}>{inc.createdAt}</Text>
                </View>

                <View style={styles.footerRow}>
                  <Text style={styles.supportText}>
                    {inc.supportingReports} community verification confirmation{inc.supportingReports !== 1 ? 's' : ''}
                  </Text>
                  {inc.coinsAwarded ? (
                    <Text style={styles.coinsAwardedText}>+{inc.coinsAwarded} 🪙 Awarded</Text>
                  ) : null}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Multi-Photo Viewer Modal */}
      <GeoTaggedPhotoModal
        visible={photoViewerVisible}
        photos={activePhotos}
        initialIndex={activePhotoIdx}
        onClose={() => setPhotoViewerVisible(false)}
        title={viewerTitle}
      />
    </SafeAreaView>
  );

  if (onClose) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        {content}
      </Modal>
    );
  }

  return content;
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  titleCol: {
    flex: 1,
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  locationText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  descText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 10,
    lineHeight: 18,
  },
  photoCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  photoCountBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
  },
  reportPhotosContainer: {
    marginBottom: 10,
    marginTop: 2,
  },
  reportThumbWrapper: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 8,
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  reportThumbImg: {
    width: '100%',
    height: '100%',
  },
  reportThumbTag: {
    position: 'absolute',
    top: 3,
    left: 3,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  reportThumbTagText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  reportThumbGpsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingVertical: 2,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  reportThumbGpsText: {
    color: '#34D399',
    fontSize: 8,
    fontWeight: '700',
  },
  geoTagBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  geoTagBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  timeText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  footerRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  supportText: {
    fontSize: 11,
    color: colors.navBlue,
    fontWeight: '600',
  },
  coinsAwardedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  emptyBox: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
