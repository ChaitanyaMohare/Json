import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
  Share,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { MapboxMap } from '../components/MapboxMap';
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../context/AppContext';

interface ArrivalScreenProps {
  onDone: () => void;
  onReportIssueNearby: () => void;
}

export const ArrivalScreen: React.FC<ArrivalScreenProps> = ({
  onDone,
  onReportIssueNearby,
}) => {
  const { selectedDestination, savePlace } = useApp();
  const [isSaved, setIsSaved] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I have safely arrived at ${selectedDestination.name}, ${selectedDestination.state} via WaySure Safe Navigation!`,
      });
    } catch (error) {
      console.warn('Error sharing trip:', error);
    }
  };

  const handleSave = () => {
    savePlace({
      id: `saved-${Date.now()}`,
      title: selectedDestination.name,
      subtitle: selectedDestination.state,
      address: selectedDestination.address || `${selectedDestination.name}, ${selectedDestination.state}`,
      type: 'favorite',
      destination: selectedDestination,
    });
    setIsSaved(true);
    Alert.alert(
      'Saved to Places',
      `${selectedDestination.name} has been added to your Saved Places.`
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Map showing arrival destination pin matching Screen 11 */}
      <View style={styles.mapContainer}>
        <MapboxMap
          destination={selectedDestination.coordinates}
          destinationLabel={selectedDestination.name}
        />
      </View>

      {/* Arrival Card Sheet matching Screen 11 */}
      <View style={styles.sheetCard}>
        {/* Scenic destination illustration banner */}
        <View style={styles.bannerWrapper}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
            }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </View>

        {/* Title & Subtitle */}
        <Text style={styles.titleText}>You've arrived!</Text>
        <Text style={styles.subtitleText}>
          {selectedDestination.name}, {selectedDestination.state}
        </Text>

        {/* 3 Circular Actions: Share, Save, Report issue nearby */}
        <View style={styles.actionsRow}>
          <View style={styles.actionItem}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleShare}
              style={styles.actionCircleBtn}
            >
              <Feather name="share-2" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>Share</Text>
          </View>

          <View style={styles.actionItem}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSave}
              style={[
                styles.actionCircleBtn,
                isSaved && styles.actionCircleBtnActive,
              ]}
            >
              <Feather
                name="bookmark"
                size={20}
                color={isSaved ? '#10B981' : colors.textPrimary}
              />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>{isSaved ? 'Saved' : 'Save'}</Text>
          </View>

          <View style={styles.actionItem}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onReportIssueNearby}
              style={styles.actionCircleBtn}
            >
              <Feather name="plus" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>Report issue{'\n'}nearby</Text>
          </View>
        </View>

        {/* Bottom CTA: Done matching Screen 11 */}
        <View style={styles.doneBtnWrapper}>
          <PrimaryButton title="Done" onPress={onDone} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E131F',
  },
  mapContainer: {
    flex: 0.52,
  },
  sheetCard: {
    flex: 0.48,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    justifyContent: 'space-between',
  },
  bannerWrapper: {
    width: '100%',
    height: 70,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  titleText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  subtitleText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  actionItem: {
    alignItems: 'center',
    width: 80,
  },
  actionCircleBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionCircleBtnActive: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 14,
  },
  doneBtnWrapper: {
    width: '100%',
  },
});
