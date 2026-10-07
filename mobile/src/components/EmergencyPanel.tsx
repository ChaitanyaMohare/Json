import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
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
    icon: string;
  } | null>(null);

  const emergencyServices = [
    {
      id: 'ambulance',
      name: 'Ambulance',
      subtitle: 'Immediate Medical Support (108)',
      number: '108',
      icon: '🚑',
      color: colors.incidentRed,
      bg: colors.incidentRedSoft,
    },
    {
      id: 'police',
      name: 'Police Assistance',
      subtitle: 'Patrol & Law Enforcement (112)',
      number: '112',
      icon: '🚓',
      color: colors.police,
      bg: '#EFF6FF',
    },
    {
      id: 'fire',
      name: 'Fire Brigade',
      subtitle: 'Fire & Disaster Rescue (101)',
      number: '101',
      icon: '🚒',
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
            <Text style={styles.bannerIcon}>🚨</Text>
            <Text style={styles.bannerText}>
              Your current GPS location (FC Road, Pune) will be made available when contacting emergency units.
            </Text>
          </View>

          {emergencyServices.map((service) => (
            <View key={service.id} style={styles.serviceCard}>
              <View style={[styles.iconBox, { backgroundColor: service.bg }]}>
                <Text style={styles.icon}>{service.icon}</Text>
              </View>

              <View style={styles.infoCol}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceSub}>{service.subtitle}</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  setConfirmService({
                    name: service.name,
                    number: service.number,
                    icon: service.icon,
                  })
                }
                style={[styles.callBtn, { backgroundColor: service.color }]}
              >
                <Text style={styles.callBtnText}>Call</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </BottomSheet>

      {/* Confirmation Modal */}
      <Modal
        transparent
        visible={!!confirmService}
        animationType="fade"
        onRequestClose={() => setConfirmService(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalIcon}>{confirmService?.icon}</Text>
            <Text style={styles.modalTitle}>Call {confirmService?.name}?</Text>
            <Text style={styles.modalSubtitle}>
              This will simulate initiating a prompt distress call to {confirmService?.number}.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setConfirmService(null)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setConfirmService(null);
                  onClose();
                }}
                style={styles.continueBtn}
              >
                <Text style={styles.continueBtnText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  bannerIcon: {
    fontSize: 20,
  },
  bannerText: {
    flex: 1,
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 16,
    fontWeight: '500',
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.divider,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 22,
  },
  infoCol: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  serviceSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  callBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.navyDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  continueBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.incidentRed,
    alignItems: 'center',
  },
  continueBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
