import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { mockRecentDestinations } from '../data/mockData';

export const TripsScreen: React.FC = () => {
  const trips = [
    {
      id: 't-1',
      from: 'Your location',
      to: 'Dehradun, Uttarakhand',
      duration: '2 hr 42 min',
      distance: '96 km',
      trustScore: 94,
      date: 'Today, 8:30 AM',
      status: 'Completed',
    },
    {
      id: 't-2',
      from: 'Dehradun',
      to: 'Haridwar, Uttarakhand',
      duration: '1 hr 14 min',
      distance: '52 km',
      trustScore: 88,
      date: 'Yesterday, 4:15 PM',
      status: 'Completed',
    },
    {
      id: 't-3',
      from: 'Delhi',
      to: 'Mussoorie, Uttarakhand',
      duration: '5 hr 48 min',
      distance: '280 km',
      trustScore: 91,
      date: '3 Oct 2026',
      status: 'Completed',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Recent Trips</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {trips.map((trip) => (
          <View key={trip.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.routeCol}>
                <Text style={styles.destText}>{trip.to}</Text>
                <Text style={styles.fromText}>From {trip.from}</Text>
              </View>

              <View style={styles.trustPill}>
                <Ionicons name="shield-checkmark" size={14} color={colors.safetyGreen} />
                <Text style={styles.trustText}>{trip.trustScore}</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.metaText}>
                {trip.duration} • {trip.distance}
              </Text>
              <Text style={styles.dateText}>{trip.date}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#F1F3F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  routeCol: {
    flex: 1,
  },
  destText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  fromText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  trustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.safetyGreenSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  trustText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.safetyGreen,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8F9FA',
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
