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
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { mockIncidents } from '../data/mockData';
import { VerificationBadge } from '../components/VerificationBadge';

export const ReportsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Incident Reports</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {mockIncidents.map((inc) => (
          <View key={inc.id} style={styles.card}>
            <View style={styles.headerRow}>
              <View style={styles.iconCircle}>
                <Feather name="alert-triangle" size={18} color={colors.textPrimary} />
              </View>
              <View style={styles.titleCol}>
                <Text style={styles.incidentTitle}>{inc.title}</Text>
                <Text style={styles.locationText}>{inc.location}</Text>
              </View>
            </View>

            <View style={styles.badgeRow}>
              <VerificationBadge status={inc.status} />
              <Text style={styles.timeText}>{inc.timeAgo}</Text>
            </View>

            <View style={styles.footerRow}>
              <Text style={styles.supportText}>
                {inc.supportingReports} supporting reports
              </Text>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleCol: {
    flex: 1,
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  locationText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  timeText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  footerRow: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8F9FA',
  },
  supportText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
