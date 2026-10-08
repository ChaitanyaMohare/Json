import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { DestinationItem } from '../types';

interface SavedPlacesScreenProps {
  visible: boolean;
  onClose: () => void;
  onSelectDestination: (dest: DestinationItem) => void;
}

export const SavedPlacesScreen: React.FC<SavedPlacesScreenProps> = ({
  visible,
  onClose,
  onSelectDestination,
}) => {
  const { savedPlaces } = useApp();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saved Places</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {savedPlaces.map((place) => (
            <TouchableOpacity
              key={place.id}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => {
                onClose();
                onSelectDestination(place.destination);
              }}
            >
              <View style={styles.iconCircle}>
                <Feather
                  name={
                    place.type === 'home'
                      ? 'home'
                      : place.type === 'work'
                      ? 'briefcase'
                      : 'bookmark'
                  }
                  size={20}
                  color={colors.textPrimary}
                />
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.placeTitle}>{place.title}</Text>
                <Text style={styles.placeAddress} numberOfLines={1}>
                  {place.address}
                </Text>
              </View>
              <View style={styles.routePill}>
                <Text style={styles.routePillText}>Route</Text>
                <Feather name="chevron-right" size={16} color={colors.navBlue} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
  backBtn: {
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
  content: {
    padding: 20,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoCol: {
    flex: 1,
  },
  placeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 3,
  },
  placeAddress: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  routePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 2,
  },
  routePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.navBlue,
  },
});
