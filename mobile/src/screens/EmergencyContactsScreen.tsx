import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface EmergencyContactsScreenProps {
  visible: boolean;
  onClose: () => void;
}

export const EmergencyContactsScreen: React.FC<EmergencyContactsScreenProps> = ({
  visible,
  onClose,
}) => {
  const handleConfirmCall = (title: string, number: string) => {
    Alert.alert(
      `Emergency Call: ${title}`,
      `Are you sure you want to dial ${number}?\nThis connects to national emergency services.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Call ${number}`,
          onPress: () => {
            Alert.alert(
              'Call Initiated',
              `Connecting to ${title} (${number})...`
            );
          },
        },
      ]
    );
  };

  const services = [
    {
      id: 'amb',
      title: 'Ambulance & Medical',
      number: '108',
      desc: 'Immediate emergency medical response & trauma care',
      icon: (
        <MaterialCommunityIcons name="hospital-box" size={26} color="#EF4444" />
      ),
      borderColor: '#FECACA',
      bgColor: '#FEF2F2',
    },
    {
      id: 'pol',
      title: 'Police Assistance',
      number: '112',
      desc: 'National emergency helpline & highway patrol',
      icon: (
        <MaterialCommunityIcons name="shield-account" size={26} color="#3B82F6" />
      ),
      borderColor: '#BFDBFE',
      bgColor: '#EFF6FF',
    },
    {
      id: 'fire',
      title: 'Fire Brigade',
      number: '101',
      desc: 'Vehicle fire, hazard response & rescue operations',
      icon: (
        <Ionicons name="flame-outline" size={26} color="#F97316" />
      ),
      borderColor: '#FED7AA',
      bgColor: '#FFF7ED',
    },
    {
      id: 'tow',
      title: 'Highway Roadside Assistance',
      number: '1033',
      desc: 'NHAI 24x7 highway towing, breakdown & recovery',
      icon: (
        <MaterialCommunityIcons name="tow-truck" size={26} color="#8B5CF6" />
      ),
      borderColor: '#DDD6FE',
      bgColor: '#F5F3FF',
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Emergency Contacts</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.noticeText}>
            Tap any contact below to initiate emergency dispatch.
          </Text>

          {services.map((item) => (
            <View
              key={item.id}
              style={[
                styles.serviceCard,
                { borderColor: item.borderColor, backgroundColor: item.bgColor },
              ]}
            >
              <View style={styles.iconCircle}>{item.icon}</View>
              <View style={styles.infoCol}>
                <Text style={styles.serviceTitle}>{item.title}</Text>
                <Text style={styles.serviceDesc}>{item.desc}</Text>
                <Text style={styles.serviceNumber}>Toll-Free: {item.number}</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleConfirmCall(item.title, item.number)}
                style={styles.callBtn}
              >
                <Feather name="phone-call" size={16} color="#FFFFFF" />
                <Text style={styles.callBtnText}>Call</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
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
    gap: 14,
  },
  noticeText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  infoCol: {
    flex: 1,
    marginRight: 10,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  serviceDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
    lineHeight: 15,
  },
  serviceNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E131F',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
  },
  callBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
