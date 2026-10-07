import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// 1. Offline Maps Modal
export const OfflineMapsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onViewLiveMap?: () => void;
}> = ({ visible, onClose, onViewLiveMap }) => {
  const [downloaded, setDownloaded] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
      Alert.alert(
        'Offline Map Ready',
        'Expressway & Regional highway sectors have been downloaded for offline navigation (240 MB).'
      );
    }, 1500);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Offline & Live Maps</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Ionicons name="map-outline" size={22} color={colors.primaryDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>Expressways & Highway Network</Text>
                <Text style={styles.itemSub}>National Expressways & State Connecting Routes</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaText}>Size: 240 MB · Version 2026.4</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleDownload}
              disabled={downloading || downloaded}
              style={[
                styles.primaryBtn,
                downloaded && styles.downloadedBtn,
              ]}
            >
              <Text style={[styles.btnText, downloaded && styles.downloadedBtnText]}>
                {downloaded
                  ? 'Downloaded (Offline Ready)'
                  : downloading
                  ? 'Downloading 184 MB...'
                  : 'Download Region'}
              </Text>
            </TouchableOpacity>

            {onViewLiveMap && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  onClose();
                  onViewLiveMap();
                }}
                style={[styles.primaryBtn, { marginTop: 10, backgroundColor: '#2563EB' }]}
              >
                <Text style={styles.btnText}>Open Live Mapbox Navigation</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// 2. Safety Settings Modal
export const SafetySettingsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const [hazardAlerts, setHazardAlerts] = useState(true);
  const [slowdownDetection, setSlowdownDetection] = useState(true);
  const [rerouteSafety, setRerouteSafety] = useState(true);
  const [speedWarnings, setSpeedWarnings] = useState(false);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Safety Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.settingLabel}>Proactive Hazard Alerts</Text>
              <Text style={styles.settingDesc}>
                Audible chime when accidents or blockages are detected ahead.
              </Text>
            </View>
            <Switch
              value={hazardAlerts}
              onValueChange={setHazardAlerts}
              trackColor={{ false: '#E5E7EB', true: '#0E131F' }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.settingLabel}>AI Slowdown Detection</Text>
              <Text style={styles.settingDesc}>
                Warns when upstream highway traffic experiences rapid deceleration.
              </Text>
            </View>
            <Switch
              value={slowdownDetection}
              onValueChange={setSlowdownDetection}
              trackColor={{ false: '#E5E7EB', true: '#0E131F' }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.settingLabel}>Auto-Suggest Safer Reroutes</Text>
              <Text style={styles.settingDesc}>
                Automatically prompt alternative bypass routes during high-severity events.
              </Text>
            </View>
            <Switch
              value={rerouteSafety}
              onValueChange={setRerouteSafety}
              trackColor={{ false: '#E5E7EB', true: '#0E131F' }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.settingLabel}>Speed Limit Warnings</Text>
              <Text style={styles.settingDesc}>
                Notify when vehicle exceeds highway speed advisories.
              </Text>
            </View>
            <Switch
              value={speedWarnings}
              onValueChange={setSpeedWarnings}
              trackColor={{ false: '#E5E7EB', true: '#0E131F' }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// 3. App Settings Modal
export const AppSettingsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const [metricUnits, setMetricUnits] = useState(true);
  const [nightMode, setNightMode] = useState(false);
  const [voiceGuidance, setVoiceGuidance] = useState(true);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>App Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.settingLabel}>Voice Guidance</Text>
              <Text style={styles.settingDesc}>Spoken turn-by-turn navigation alerts.</Text>
            </View>
            <Switch
              value={voiceGuidance}
              onValueChange={setVoiceGuidance}
              trackColor={{ false: '#E5E7EB', true: '#0E131F' }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.settingLabel}>Distance Units (km / meters)</Text>
              <Text style={styles.settingDesc}>Display kilometers instead of miles.</Text>
            </View>
            <Switch
              value={metricUnits}
              onValueChange={setMetricUnits}
              trackColor={{ false: '#E5E7EB', true: '#0E131F' }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.settingLabel}>Automatic Night Mode</Text>
              <Text style={styles.settingDesc}>Switch map theme after sunset.</Text>
            </View>
            <Switch
              value={nightMode}
              onValueChange={setNightMode}
              trackColor={{ false: '#E5E7EB', true: '#0E131F' }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// 4. Help & Support Modal
export const HelpModal: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.itemTitle}>About WaySure</Text>
            <Text style={styles.helpBody}>
              WaySure is an AI-enhanced road safety navigation platform that aggregates verified community hazard reports and highway telemetry to suggest safer travel routes.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.itemTitle}>How Trust Scores Work</Text>
            <Text style={styles.helpBody}>
              Routes are calculated with a 0 to 100 trust rating. High-risk accident hotspots and active road blockages reduce the score, while real-time sensor verification raises it.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.itemTitle}>Support Contact</Text>
            <Text style={styles.helpBody}>
              support@waysure.app{'\n'}
              Helpline: 1800-WAYSURE
            </Text>
          </View>
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
    gap: 16,
  },
  card: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  itemSub: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  helpBody: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  metaRow: {
    marginVertical: 10,
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: '#0E131F',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadedBtn: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  downloadedBtnText: {
    color: '#10B981',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});
