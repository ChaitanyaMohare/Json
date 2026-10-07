import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { ReportOption } from '../components/ReportOption';
import { IncidentType } from '../types';
import { useApp } from '../context/AppContext';

interface ReportIncidentScreenProps {
  visible: boolean;
  onClose: () => void;
  onSelectType: (type: IncidentType) => void;
}

export const ReportIncidentScreen: React.FC<ReportIncidentScreenProps> = ({
  visible,
  onClose,
  onSelectType,
}) => {
  const { selectedIncidentType, setSelectedIncidentType } = useApp();

  const handleSelect = (type: IncidentType) => {
    setSelectedIncidentType(type);
    onSelectType(type);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Bottom Sheet Card matching Screen 7 */}
        <View style={styles.sheetCard}>
          <View style={styles.headerRow}>
            <Text style={styles.titleText}>Report an Issue</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <Feather name="x" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* 6 Category Grid: 2 rows of 3 matching Screen 7 */}
          <View style={styles.grid}>
            <ReportOption
              type="accident"
              title="Accident"
              selected={selectedIncidentType === 'accident'}
              onSelect={handleSelect}
            />
            <ReportOption
              type="road_blockage"
              title="Road Block"
              selected={selectedIncidentType === 'road_blockage'}
              onSelect={handleSelect}
            />
            <ReportOption
              type="road_damage"
              title="Road Damage"
              selected={selectedIncidentType === 'road_damage'}
              onSelect={handleSelect}
            />
            <ReportOption
              type="heavy_traffic"
              title="Heavy Traffic"
              selected={selectedIncidentType === 'heavy_traffic'}
              onSelect={handleSelect}
            />
            <ReportOption
              type="flooding"
              title="Flooding"
              selected={selectedIncidentType === 'flooding'}
              onSelect={handleSelect}
            />
            <ReportOption
              type="other"
              title="Other"
              selected={selectedIncidentType === 'other'}
              onSelect={handleSelect}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 24,
    paddingBottom: 36,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
