import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Incident, GeoTaggedPhoto } from '../types';
import { colors } from '../theme/colors';
import { GeoTaggedPhotoModal } from './GeoTaggedPhotoModal';

interface IncidentAlertCardProps {
  incident: Incident;
  onDismiss: () => void;
  onFindSaferRoute: () => void;
}

export const IncidentAlertCard: React.FC<IncidentAlertCardProps> = ({
  incident,
  onDismiss,
  onFindSaferRoute,
}) => {
  const [photoViewerVisible, setPhotoViewerVisible] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const photosList: GeoTaggedPhoto[] =
    incident.photos && incident.photos.length > 0
      ? incident.photos
      : incident.photoUri
      ? [
          {
            id: `inc-p-${incident.id}`,
            uri: incident.photoUri,
            geoTag: incident.geoTag || {
              latitude: incident.coordinates?.latitude || 28.6139,
              longitude: incident.coordinates?.longitude || 77.209,
              accuracyMeters: 3,
              timestamp: incident.timeAgo || 'Recently',
              addressLabel: incident.location,
            },
          },
        ]
      : [];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="car-brake-alert" size={22} color="#EF4444" />
        </View>
        <View style={styles.titleInfo}>
          <Text style={styles.title}>{incident.title}</Text>
          <Text style={styles.location}>{incident.location}</Text>
        </View>
        {photosList.length > 0 && (
          <View style={styles.photosBadge}>
            <Ionicons name="camera" size={11} color="#2563EB" />
            <Text style={styles.photosBadgeText}>{photosList.length} Photos</Text>
          </View>
        )}
        <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn}>
          <Feather name="x" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.desc}>
        {incident.description || 'Hazard reported on current navigation route.'}
      </Text>

      {/* Uploaded Geo-Tagged Photos Evidence Strip */}
      {photosList.length > 0 && (
        <View style={styles.photosStripContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {photosList.map((photo, idx) => (
              <TouchableOpacity
                key={photo.id || idx}
                onPress={() => {
                  setActivePhotoIdx(idx);
                  setPhotoViewerVisible(true);
                }}
                activeOpacity={0.8}
                style={styles.photoThumbCard}
              >
                <Image source={{ uri: photo.uri }} style={styles.photoThumbImg} />
                <View style={styles.thumbBadge}>
                  <Text style={styles.thumbBadgeText}>#{idx + 1}</Text>
                </View>
                <View style={styles.gpsWatermarkTag}>
                  <Ionicons name="location-sharp" size={8} color="#34D399" />
                  <Text style={styles.gpsWatermarkText}>Live GPS</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.actionRow}>
        <TouchableOpacity onPress={onDismiss} style={styles.secondaryBtn}>
          <Text style={styles.secondaryText}>Keep Route</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onFindSaferRoute} style={styles.primaryBtn}>
          <Text style={styles.primaryText}>Find Safer Route</Text>
        </TouchableOpacity>
      </View>

      {/* Photo Viewer Modal */}
      <GeoTaggedPhotoModal
        visible={photoViewerVisible}
        photos={photosList}
        initialIndex={activePhotoIdx}
        onClose={() => setPhotoViewerVisible(false)}
        title={incident.title}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  titleInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  location: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  photosBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  photosBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
  },
  dismissBtn: {
    padding: 4,
  },
  desc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  photosStripContainer: {
    marginBottom: 12,
  },
  photoThumbCard: {
    width: 68,
    height: 68,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 8,
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  photoThumbImg: {
    width: '100%',
    height: '100%',
  },
  thumbBadge: {
    position: 'absolute',
    top: 3,
    left: 3,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  thumbBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  gpsWatermarkTag: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingVertical: 2,
    paddingHorizontal: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  gpsWatermarkText: {
    color: '#34D399',
    fontSize: 8,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  primaryBtn: {
    flex: 1.2,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#0E131F',
    alignItems: 'center',
  },
  primaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

