import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { AppHeader } from '../components/AppHeader';
import { SearchBar } from '../components/SearchBar';
import { QuickDestinationCard } from '../components/QuickDestinationCard';
import { RecentDestinationRow } from '../components/RecentDestinationRow';
import { mockQuickDestinations, mockRecentDestinations } from '../data/mockData';
import { DestinationItem } from '../types';

interface DestinationScreenProps {
  onSelectDestination: (dest: DestinationItem) => void;
  onOpenMenu?: () => void;
  onOpenProfile?: () => void;
}

export const DestinationScreen: React.FC<DestinationScreenProps> = ({
  onSelectDestination,
  onOpenMenu,
  onOpenProfile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecent = mockRecentDestinations.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          {/* Header with hamburger on left & avatar on right matching Screen 2 */}
          <AppHeader onMenuPress={onOpenMenu} onProfilePress={onOpenProfile} />

          {/* Heading matching Screen 2 */}
          <View style={styles.headingSection}>
            <Text style={styles.mainTitle}>
              Where are{'\n'}you going?
            </Text>
          </View>

          {/* Search bar matching Screen 2 */}
          <View style={styles.searchSection}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search destination..."
              onSubmitEditing={() => {
                if (filteredRecent.length > 0) {
                  onSelectDestination(filteredRecent[0]);
                }
              }}
            />
          </View>

          {/* 3 Quick Destination Cards: Home, Work, Dehradun matching Screen 2 */}
          <View style={styles.quickCardsRow}>
            {mockQuickDestinations.map((item) => (
              <QuickDestinationCard
                key={item.id}
                title={item.title}
                subtitle={item.subtitle}
                icon={item.icon}
                onPress={() => onSelectDestination(item.destination)}
              />
            ))}
          </View>

          {/* Recent Destinations Title matching Screen 2 */}
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recent destinations</Text>

            {/* List Rows matching Screen 2 */}
            <View style={styles.recentList}>
              {filteredRecent.map((item) => (
                <RecentDestinationRow
                  key={item.id}
                  name={item.name}
                  state={item.state}
                  onPress={() => onSelectDestination(item)}
                />
              ))}
            </View>
          </View>
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
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quickCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  recentSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  recentList: {
    marginTop: 4,
  },
});
