import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { AppHeader } from '../components/AppHeader';
import { SearchBar } from '../components/SearchBar';
import { QuickDestinationCard } from '../components/QuickDestinationCard';
import { RecentDestinationRow } from '../components/RecentDestinationRow';
import { DestinationItem } from '../types';
import { GeocodingService, POPULAR_DESTINATIONS } from '../services/geocodingService';
import { useApp } from '../context/AppContext';

interface DestinationScreenProps {
  onSelectDestination: (dest: DestinationItem) => void;
  onOpenMenu: () => void;
  onOpenProfile: () => void;
  onOpenRewards?: () => void;
}

export const DestinationScreen: React.FC<DestinationScreenProps> = ({
  onSelectDestination,
  onOpenMenu,
  onOpenProfile,
  onOpenRewards,
}) => {
  const {
    currentLocation,
    locationLabel,
    setSelectedDestination,
    recalculateRoutes,
    savedPlaces,
  } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DestinationItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    let active = true;
    if (searchQuery.trim().length > 0) {
      setIsSearching(true);
      const timer = setTimeout(async () => {
        const results = await GeocodingService.searchDestinations(
          searchQuery,
          currentLocation
        );
        if (active) {
          setSearchResults(results);
          setIsSearching(false);
        }
      }, 180);

      return () => {
        active = false;
        clearTimeout(timer);
      };
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery, currentLocation]);

  const handleDestinationPicked = async (item?: DestinationItem) => {
    if (!item) return;
    setIsCalculating(true);
    setSelectedDestination(item);
    await recalculateRoutes(item, undefined, currentLocation);
    setIsCalculating(false);
    onSelectDestination(item);
  };

  const handleSearchSubmit = async () => {
    if (searchResults.length > 0) {
      handleDestinationPicked(searchResults[0]);
    } else if (searchQuery.trim().length > 0) {
      setIsSearching(true);
      const geocoded = await GeocodingService.geocodePlaceName(searchQuery.trim(), currentLocation);
      setIsSearching(false);
      if (geocoded) {
        handleDestinationPicked(geocoded);
      }
    }
  };

  // Quick destinations (Home, Work, or Trending)
  const quickItems = [
    {
      id: 'quick-home',
      title: 'Home',
      subtitle: savedPlaces.find((p) => p.type === 'home')?.title || 'Set place',
      icon: 'home' as const,
      destination: savedPlaces.find((p) => p.type === 'home')?.destination || {
        id: 'home-dest',
        name: 'Home',
        state: 'Home Address',
      },
    },
    {
      id: 'quick-work',
      title: 'Work',
      subtitle: savedPlaces.find((p) => p.type === 'work')?.title || 'Set place',
      icon: 'briefcase' as const,
      destination: savedPlaces.find((p) => p.type === 'work')?.destination || {
        id: 'work-dest',
        name: 'Work',
        state: 'Work Address',
      },
    },
    {
      id: 'quick-explore',
      title: 'Trending',
      subtitle: 'Popular',
      icon: 'map-pin' as const,
      destination: POPULAR_DESTINATIONS[0],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header matching Screen 2 */}
          <AppHeader
            onMenuPress={onOpenMenu}
            onProfilePress={onOpenProfile}
            onRewardsPress={onOpenRewards}
          />

          {/* Heading with user current location badge */}
          <View style={styles.headingSection}>
            <View style={styles.currentLocPill}>
              <Ionicons name="navigate" size={14} color={colors.primaryDark} />
              <Text style={styles.currentLocText} numberOfLines={1}>
                {locationLabel || 'Locating current area...'}
              </Text>
            </View>
            <Text style={styles.mainTitle}>
              Where are{'\n'}you going?
            </Text>
          </View>

          {/* Search bar with instant autocomplete */}
          <View style={styles.searchSection}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search city, area, or destination..."
              onSubmitEditing={handleSearchSubmit}
            />
          </View>

          {/* Route Calculation Indicator */}
          {isCalculating && (
            <View style={styles.calcOverlay}>
              <ActivityIndicator size="small" color={colors.primaryDark} />
              <Text style={styles.calcText}>Calculating optimal safe route...</Text>
            </View>
          )}

          {/* If searching: Show Real Search Results Suggestions */}
          {searchQuery.trim().length > 0 ? (
            <View style={styles.searchResultsSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Search Suggestions</Text>
                {isSearching && <ActivityIndicator size="small" color={colors.primaryDark} />}
              </View>

              {/* Direct Navigation to typed place */}
              <TouchableOpacity
                style={styles.directNavRow}
                activeOpacity={0.8}
                onPress={handleSearchSubmit}
              >
                <View style={styles.directNavIcon}>
                  <Ionicons name="navigate-circle" size={24} color="#2563EB" />
                </View>
                <View style={styles.suggestionInfo}>
                  <Text style={styles.directNavTitle}>Navigate to "{searchQuery.trim()}"</Text>
                  <Text style={styles.suggestionState}>Get turn-by-turn safe directions</Text>
                </View>
                <Feather name="arrow-right" size={18} color="#2563EB" />
              </TouchableOpacity>

              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.suggestionRow}
                    activeOpacity={0.7}
                    onPress={() => handleDestinationPicked(item)}
                  >
                    <View style={styles.pinWrapper}>
                      <Feather name="map-pin" size={18} color={colors.primaryDark} />
                    </View>
                    <View style={styles.suggestionInfo}>
                      <Text style={styles.suggestionName}>{item.name}</Text>
                      <Text style={styles.suggestionState} numberOfLines={1}>
                        {item.address || item.state}
                      </Text>
                    </View>
                    {item.state ? (
                      <View style={styles.stateBadge}>
                        <Text style={styles.stateBadgeText}>{item.state}</Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                ))
              ) : !isSearching ? (
                <TouchableOpacity
                  style={styles.directNavRow}
                  activeOpacity={0.8}
                  onPress={handleSearchSubmit}
                >
                  <View style={styles.directNavIcon}>
                    <Ionicons name="location" size={20} color="#2563EB" />
                  </View>
                  <View style={styles.suggestionInfo}>
                    <Text style={styles.directNavTitle}>Route to "{searchQuery.trim()}"</Text>
                    <Text style={styles.suggestionState}>Tap to set this destination and calculate route</Text>
                  </View>
                  <Feather name="arrow-right" size={18} color="#2563EB" />
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <>
              {/* Quick Destination Cards */}
              <View style={styles.quickCardsRow}>
                {quickItems.map((item) => (
                  <QuickDestinationCard
                    key={item.id}
                    title={item.title}
                    subtitle={item.subtitle}
                    icon={item.icon}
                    onPress={() => handleDestinationPicked(item.destination)}
                  />
                ))}
              </View>

              {/* Popular & Local Destinations */}
              <View style={styles.recentSection}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Popular & Local Destinations</Text>
                  <Text style={styles.countryBadge}>Trending</Text>
                </View>

                <View style={styles.recentList}>
                  {POPULAR_DESTINATIONS.slice(0, 10).map((item) => (
                    <RecentDestinationRow
                      key={item.id}
                      item={item}
                      onPress={handleDestinationPicked}
                    />
                  ))}
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headingSection: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 18,
  },
  currentLocPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  currentLocText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#15803D',
    maxWidth: 260,
  },
  mainTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 40,
    letterSpacing: -0.8,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  calcOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#EFF6FF',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  calcText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  quickCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 28,
  },
  recentSection: {
    paddingHorizontal: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  countryBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDark,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  recentList: {
    backgroundColor: '#FFFFFF',
  },
  searchResultsSection: {
    paddingHorizontal: 20,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pinWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  suggestionState: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  stateBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  stateBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  emptyResults: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  directNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
  },
  directNavIcon: {
    marginRight: 10,
  },
  directNavTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1D4ED8',
    marginBottom: 2,
  },
});
