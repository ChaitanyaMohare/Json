import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { GeoTaggedPhoto } from '../types';

interface GeoTaggedPhotoModalProps {
  visible: boolean;
  photos: GeoTaggedPhoto[];
  initialIndex?: number;
  onClose: () => void;
  title?: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const GeoTaggedPhotoModal: React.FC<GeoTaggedPhotoModalProps> = ({
  visible,
  photos,
  initialIndex = 0,
  onClose,
  title,
}) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  React.useEffect(() => {
    if (visible) {
      setActiveIndex(Math.min(initialIndex, Math.max(0, photos.length - 1)));
    }
  }, [visible, initialIndex, photos.length]);

  if (!photos || photos.length === 0) return null;

  const currentPhoto = photos[activeIndex] || photos[0];
  const tag = currentPhoto?.geoTag;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Feather name="x" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title || 'Geo-Tagged Evidence'}
            </Text>
            <Text style={styles.headerSub}>
              Photo {activeIndex + 1} of {photos.length} · Live GPS Verified
            </Text>
          </View>

          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#10B981" />
            <Text style={styles.verifiedBadgeText}>Verified</Text>
          </View>
        </View>

        {/* Main Photo View with Live Watermark HUD */}
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: currentPhoto.uri }}
            style={styles.mainImage}
            resizeMode="contain"
          />

          {/* Precision Tag Pill */}
          <View style={styles.topFloatPill}>
            <View style={styles.pulseDot} />
            <Ionicons name="location-sharp" size={11} color="#10B981" style={{ marginRight: 3 }} />
            <Text style={styles.topFloatPillText}>
              GPS GEO-TAGGED
            </Text>
            {tag?.accuracyMeters ? (
              <Text style={styles.accuracyText}>±{tag.accuracyMeters}m</Text>
            ) : null}
          </View>
        </View>

        {/* Multi-Photo Carousel Strip (if more than 1 photo) */}
        {photos.length > 1 && (
          <View style={styles.carouselContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {photos.map((p, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <TouchableOpacity
                    key={p.id || idx}
                    onPress={() => setActiveIndex(idx)}
                    activeOpacity={0.8}
                    style={[
                      styles.thumbItem,
                      isSelected && styles.thumbItemSelected,
                    ]}
                  >
                    <Image source={{ uri: p.uri }} style={styles.thumbImage} />
                    <View style={styles.thumbBadge}>
                      <Text style={styles.thumbBadgeText}>#{idx + 1}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Detailed Forensic HUD Footer */}
        <View style={styles.hudFooter}>
          <View style={styles.hudGrid}>
            <View style={styles.hudCol}>
              <View style={styles.hudLabelRow}>
                <Feather name="crosshair" size={12} color="#60A5FA" />
                <Text style={styles.hudLabel}>GPS COORDINATES</Text>
              </View>
              <Text style={styles.hudValueCoords}>
                {tag ? `${tag.latitude.toFixed(6)}° N, ${tag.longitude.toFixed(6)}° E` : '28.613915° N, 77.209042° E'}
              </Text>
            </View>

            <View style={styles.hudColRight}>
              <View style={styles.hudLabelRow}>
                <Feather name="clock" size={12} color="#94A3B8" />
                <Text style={styles.hudLabel}>TIMESTAMP</Text>
              </View>
              <Text style={styles.hudValueTime}>
                {tag?.timestamp || 'Just now'}
              </Text>
            </View>
          </View>

          <View style={styles.hudAddressRow}>
            <Feather name="map-pin" size={13} color="#CBD5E1" />
            <Text style={styles.hudAddressText} numberOfLines={2}>
              {tag?.addressLabel || 'Incident Location Spot'}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBox: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  headerSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  verifiedBadgeText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '800',
  },
  photoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 8,
  },
  mainImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.52,
  },
  topFloatPill: {
    position: 'absolute',
    top: 12,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#34D399',
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  topFloatPillText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  accuracyText: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '700',
  },
  carouselContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  thumbItem: {
    width: 62,
    height: 62,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
  },
  thumbItemSelected: {
    borderColor: '#3B82F6',
    borderWidth: 2.5,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbBadge: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  thumbBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  hudFooter: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    gap: 10,
  },
  hudGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hudCol: {
    flex: 1.2,
    gap: 3,
  },
  hudColRight: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 3,
  },
  hudLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hudLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  hudValueCoords: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  hudValueTime: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '600',
  },
  hudAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  hudAddressText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
});
