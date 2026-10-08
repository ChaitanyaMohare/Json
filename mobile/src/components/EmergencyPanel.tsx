import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { BottomSheet } from './BottomSheet';
import { colors } from '../theme/colors';

interface EmergencyPanelProps {
  visible: boolean;
  onClose: () => void;
}

export const EmergencyPanel: React.FC<EmergencyPanelProps> = ({ visible, onClose }) => {
  const [confirmService, setConfirmService] = useState<{
    name: string;
    number: string;
  } | null>(null);

  const emergencyServices = [
    {
      id: 'ambulance',
      name: 'Ambulance',
      subtitle: 'Immediate Medical Support (108)',
      number: '108',
      icon: <MaterialCommunityIcons name="hospital-box" size={24} color={colors.incidentRed} />,
      color: colors.incidentRed,
      bg: colors.incidentRedSoft,
    },
    {
      id: 'police',
      name: 'Police Assistance',
      subtitle: 'Patrol & Law Enforcement (112)',
      number: '112',
      icon: <MaterialCommunityIcons name="shield-account" size={24} color={colors.police} />,
      color: colors.police,
      bg: '#EFF6FF',
    },
    {
      id: 'fire',
      name: 'Fire Brigade',
      subtitle: 'Fire & Disaster Rescue (101)',
      number: '101',
      icon: <Ionicons name="flame-outline" size={24} color="#EA580C" />,
      color: '#EA580C',
      bg: '#FFF7ED',
    },
  ];

  return (
    <>
      <BottomSheet
        visible={visible}
        onClose={onClose}
        title="Emergency Assistance"
        subtitle="Quick access to emergency response units"
      >
        <View style={styles.container}>
          <View style={styles.banner}>
            <Feather name="shield" size={18} color={colors.incidentRed} />
            <Text style={styles.bannerText}>
              Your current GPS location will be shared when contacting emergency dispatch units.
            </Text>
          </View>

          <View style={styles.serviceList}>
            {emergencyServices.map((srv) => (
              <View key={srv.id} style={styles.serviceCard}>
                <View style={[styles.iconWrapper, { backgroundColor: srv.bg }]}>
                  {srv.icon}
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{srv.name}</Text>
                  <Text style={styles.serviceSubtitle}>{srv.subtitle}</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() =>
                    setConfirmService({
                      name: srv.name,
                      number: srv.number,
                    })
                  }
                  style={[styles.callBtn, { backgroundColor: srv.color }]}
                >
                  <Feather name="phone-call" size={14} color="#FFFFFF" />
                  <Text style={styles.callBtnText}>Call</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </BottomSheet>

      {/* Confirmation Modal */}
      {confirmService && (
        <Modal transparent animationType="fade" visible={!!confirmService}>
          <View style={styles.modalOverlay}>
            <View style={styles.confirmModal}>
              <View style={styles.confirmIconBox}>
                <Feather name="phone" size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.confirmTitle}>Call {confirmService.name}?</Text>
              <Text style={styles.confirmDesc}>
                This will place a direct emergency call to {confirmService.number}.
              </Text>
              <View style={styles.confirmActionRow}>
                <TouchableOpacity
                  onPress={() => setConfirmService(null)}
                  style={styles.cancelBtn}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setConfirmService(null)}
                  style={styles.confirmCallBtn}
                >
                  <Text style={styles.confirmCallText}>
                    Call {confirmService.number}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.incidentRedSoft,
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  bannerText: {
    flex: 1,
    fontSize: 12,
    color: colors.incidentRedDark,
    lineHeight: 16,
    fontWeight: '500',
  },
  serviceList: {
    gap: 12,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  serviceSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  confirmModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  confirmIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.incidentRed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  confirmDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  confirmActionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  confirmCallBtn: {
    flex: 1.2,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: colors.incidentRed,
  },
  confirmCallText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
