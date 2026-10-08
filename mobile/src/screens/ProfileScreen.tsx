import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { PRESET_AVATARS, DEFAULT_USER_PROFILE } from '../data/mockData';
import { UserProfile } from '../types';

interface ProfileScreenProps {
  onBack: () => void;
  onOpenRewards?: () => void;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack, onOpenRewards }) => {
  const {
    userProfile,
    updateUserProfile,
    safetyCoins,
    userRewardTier,
    logoutUser,
    authEmail,
  } = useApp();

  // Local form state
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [phone, setPhone] = useState(userProfile.phone);
  const [bio, setBio] = useState(userProfile.bio || '');
  const [bloodGroup, setBloodGroup] = useState(userProfile.bloodGroup || 'O+');
  const [emergencyName, setEmergencyName] = useState(
    userProfile.emergencyContactName || ''
  );
  const [emergencyPhone, setEmergencyPhone] = useState(
    userProfile.emergencyContactPhone || ''
  );
  const [vehicleType, setVehicleType] = useState<
    'car' | 'suv' | 'bike' | 'walk'
  >(userProfile.vehicleType || 'car');
  const [avatarUri, setAvatarUri] = useState(userProfile.avatarUri);

  // Preference switches
  const [hazardAlerts, setHazardAlerts] = useState(userProfile.hazardAlerts);
  const [slowdownSensors, setSlowdownSensors] = useState(
    userProfile.slowdownSensors
  );
  const [voiceGuidance, setVoiceGuidance] = useState(
    userProfile.voiceGuidance ?? true
  );

  // UI state
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state if userProfile changes
  useEffect(() => {
    setName(userProfile.name);
    setEmail(userProfile.email);
    setPhone(userProfile.phone);
    setBio(userProfile.bio || '');
    setBloodGroup(userProfile.bloodGroup || 'O+');
    setEmergencyName(userProfile.emergencyContactName || '');
    setEmergencyPhone(userProfile.emergencyContactPhone || '');
    setVehicleType(userProfile.vehicleType || 'car');
    setAvatarUri(userProfile.avatarUri);
    setHazardAlerts(userProfile.hazardAlerts);
    setSlowdownSensors(userProfile.slowdownSensors);
    setVoiceGuidance(userProfile.voiceGuidance ?? true);
  }, [userProfile]);

  // Pick image from camera
  const handleTakePhoto = async () => {
    setAvatarModalVisible(false);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera access is required to take a new profile photo.'
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (err) {
      console.warn('Camera picker error:', err);
      Alert.alert('Notice', 'Unable to open camera. Please pick from presets.');
    }
  };

  // Pick image from photo library
  const handlePickFromGallery = async () => {
    setAvatarModalVisible(false);
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Gallery access is required to choose a profile photo.'
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (err) {
      console.warn('Gallery picker error:', err);
      Alert.alert('Notice', 'Unable to open gallery. Please pick from presets.');
    }
  };

  // Select preset avatar
  const handleSelectPreset = (uri: string) => {
    setAvatarUri(uri);
    setAvatarModalVisible(false);
  };

  // Save changes
  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name.');
      return;
    }

    setIsSaving(true);
    const updatedData: Partial<UserProfile> = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
      bloodGroup,
      emergencyContactName: emergencyName.trim(),
      emergencyContactPhone: emergencyPhone.trim(),
      vehicleType,
      avatarUri,
      hazardAlerts,
      slowdownSensors,
      voiceGuidance,
    };

    await updateUserProfile(updatedData);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Reset to default
  const handleResetToDefault = () => {
    Alert.alert(
      'Reset Profile?',
      'Are you sure you want to reset your profile details to defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await updateUserProfile(DEFAULT_USER_PROFILE);
            Alert.alert('Reset Complete', 'Profile restored to defaults.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>User Profile</Text>
        <TouchableOpacity
          onPress={handleSaveProfile}
          disabled={isSaving}
          style={styles.headerSaveBtn}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.headerSaveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Success Banner */}
          {saveSuccess && (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={20} color="#15803D" />
              <Text style={styles.successBannerText}>
                Profile updated successfully!
              </Text>
            </View>
          )}

          {/* Avatar & Header Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              <TouchableOpacity
                style={styles.avatarEditBadge}
                activeOpacity={0.85}
                onPress={() => setAvatarModalVisible(true)}
              >
                <Feather name="camera" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.avatarName}>{name || 'Your Name'}</Text>
            <Text style={styles.avatarEmail}>{email || 'Add email'}</Text>

            {/* Trust Score & Metrics Pill */}
            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Ionicons
                  name="shield-checkmark"
                  size={16}
                  color={colors.safetyGreen}
                />
                <Text style={styles.metricValue}>
                  {userProfile.trustScore || 98}/100
                </Text>
                <Text style={styles.metricLabel}>Trust Score</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <MaterialCommunityIcons
                  name="map-marker-distance"
                  size={16}
                  color="#2563EB"
                />
                <Text style={styles.metricValue}>412 km</Text>
                <Text style={styles.metricLabel}>Navigated</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Feather name="alert-triangle" size={15} color="#D97706" />
                <Text style={styles.metricValue}>14</Text>
                <Text style={styles.metricLabel}>Reports</Text>
              </View>
            </View>
          </View>

          {/* SAFETY COIN REWARD WALLET BANNER */}
          <TouchableOpacity
            style={styles.safetyCoinBanner}
            onPress={onOpenRewards}
            activeOpacity={0.85}
          >
            <View style={styles.safetyCoinBannerLeft}>
              <View style={styles.coinBannerIconBox}>
                <Text style={{ fontSize: 24 }}>🪙</Text>
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.safetyCoinBannerTitle}>Safety Coin Wallet</Text>
                  <View style={styles.tierSmallBadge}>
                    <Text style={styles.tierSmallText}>{userRewardTier.name}</Text>
                  </View>
                </View>
                <Text style={styles.safetyCoinBalanceText}>
                  {safetyCoins} Coins Available • Redeem Gear & Fuel
                </Text>
              </View>
            </View>
            <View style={styles.openRewardsPill}>
              <Text style={styles.openRewardsPillText}>Store</Text>
              <Feather name="chevron-right" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {/* Section 1: Personal Details */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputRow}>
                <Feather
                  name="user"
                  size={18}
                  color="#64748B"
                  style={styles.fieldIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter full name"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputRow}>
                <Feather
                  name="mail"
                  size={18}
                  color="#64748B"
                  style={styles.fieldIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@example.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Phone</Text>
              <View style={styles.inputRow}>
                <Feather
                  name="phone"
                  size={18}
                  color="#64748B"
                  style={styles.fieldIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+91 98765 43210"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Bio Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>About / Bio</Text>
              <View style={[styles.inputRow, styles.bioInputRow]}>
                <Feather
                  name="file-text"
                  size={18}
                  color="#64748B"
                  style={[styles.fieldIcon, { marginTop: 4 }]}
                />
                <TextInput
                  style={[styles.textInput, styles.bioTextInput]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Brief note about yourself"
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={2}
                />
              </View>
            </View>
          </View>

          {/* Section 2: Preferred Vehicle Mode */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Default Vehicle / Travel Mode</Text>
            <Text style={styles.sectionSub}>
              Used as your primary navigation avatar on maps
            </Text>

            <View style={styles.vehicleGrid}>
              {[
                { type: 'car' as const, label: 'Car', icon: 'car-side' },
                { type: 'suv' as const, label: 'SUV', icon: 'car-estate' },
                { type: 'bike' as const, label: 'Bike', icon: 'motorbike' },
                { type: 'walk' as const, label: 'Walk', icon: 'walk' },
              ].map((v) => {
                const isSelected = vehicleType === v.type;
                return (
                  <TouchableOpacity
                    key={v.type}
                    activeOpacity={0.8}
                    onPress={() => setVehicleType(v.type)}
                    style={[
                      styles.vehiclePill,
                      isSelected && styles.vehiclePillSelected,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={v.icon as any}
                      size={22}
                      color={isSelected ? '#2563EB' : '#64748B'}
                      style={{ marginBottom: 4 }}
                    />
                    <Text
                      style={[
                        styles.vehiclePillLabel,
                        isSelected && styles.vehiclePillLabelSelected,
                      ]}
                    >
                      {v.label}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="#2563EB"
                        style={styles.selectedCheck}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Section 3: Emergency & Safety Contacts */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Emergency Medical & Contact</Text>
            <Text style={styles.sectionSub}>
              Accessible quickly during on-road safety alerts
            </Text>

            {/* Blood Group Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Blood Group</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.bloodChipsRow}
              >
                {BLOOD_GROUPS.map((bg) => {
                  const isSelected = bloodGroup === bg;
                  return (
                    <TouchableOpacity
                      key={bg}
                      activeOpacity={0.7}
                      onPress={() => setBloodGroup(bg)}
                      style={[
                        styles.bloodChip,
                        isSelected && styles.bloodChipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.bloodChipText,
                          isSelected && styles.bloodChipTextSelected,
                        ]}
                      >
                        {bg}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Emergency Contact Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Emergency Contact Name</Text>
              <View style={styles.inputRow}>
                <Feather
                  name="shield"
                  size={18}
                  color="#64748B"
                  style={styles.fieldIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={emergencyName}
                  onChangeText={setEmergencyName}
                  placeholder="e.g. Family Contact"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* Emergency Contact Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Emergency Contact Phone</Text>
              <View style={styles.inputRow}>
                <Feather
                  name="phone-call"
                  size={18}
                  color="#64748B"
                  style={styles.fieldIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={emergencyPhone}
                  onChangeText={setEmergencyPhone}
                  placeholder="+91 91234 56789"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>

          {/* Section 4: Safety & Navigation Preferences */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Navigation Preferences</Text>

            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>Hazard Audio Alerts</Text>
                <Text style={styles.switchSub}>
                  Voice warnings for accidents and roadblocks
                </Text>
              </View>
              <Switch
                value={hazardAlerts}
                onValueChange={setHazardAlerts}
                trackColor={{ false: '#E2E8F0', true: '#93C5FD' }}
                thumbColor={hazardAlerts ? '#2563EB' : '#FFFFFF'}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>Slowdown Sensors</Text>
                <Text style={styles.switchSub}>
                  Automatic warnings when approaching sudden congestion
                </Text>
              </View>
              <Switch
                value={slowdownSensors}
                onValueChange={setSlowdownSensors}
                trackColor={{ false: '#E2E8F0', true: '#93C5FD' }}
                thumbColor={slowdownSensors ? '#2563EB' : '#FFFFFF'}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>Voice Turn Guidance</Text>
                <Text style={styles.switchSub}>
                  Spoken turn-by-turn navigation instructions
                </Text>
              </View>
              <Switch
                value={voiceGuidance}
                onValueChange={setVoiceGuidance}
                trackColor={{ false: '#E2E8F0', true: '#93C5FD' }}
                thumbColor={voiceGuidance ? '#2563EB' : '#FFFFFF'}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.bottomActions}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSaveProfile}
              disabled={isSaving}
              style={styles.saveMainBtn}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Feather
                    name="check"
                    size={20}
                    color="#FFFFFF"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.saveMainBtnText}>Save Profile Changes</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleResetToDefault}
              style={styles.resetBtn}
            >
              <Text style={styles.resetBtnText}>Reset to Default</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={async () => {
                Alert.alert(
                  'Sign Out of WaySure',
                  'Are you sure you want to sign out? You will need your email 2FA code to log back in.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Sign Out',
                      style: 'destructive',
                      onPress: async () => {
                        await logoutUser();
                        if (onBack) onBack();
                      },
                    },
                  ]
                );
              }}
              style={styles.signOutBtn}
            >
              <Feather name="log-out" size={16} color="#DC2626" />
              <Text style={styles.signOutBtnText}>Sign Out ({authEmail || userProfile.email || '2FA'})</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Avatar Selection Modal */}
      <Modal
        visible={avatarModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setAvatarModalVisible(false)}
        >
          <View style={styles.avatarModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Profile Photo</Text>
              <TouchableOpacity onPress={() => setAvatarModalVisible(false)}>
                <Feather name="x" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Camera & Gallery Action Buttons */}
            <View style={styles.modalActionButtons}>
              <TouchableOpacity
                style={styles.modalActionBtn}
                activeOpacity={0.8}
                onPress={handleTakePhoto}
              >
                <View style={[styles.modalActionIcon, { backgroundColor: '#EFF6FF' }]}>
                  <Feather name="camera" size={20} color="#2563EB" />
                </View>
                <Text style={styles.modalActionLabel}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalActionBtn}
                activeOpacity={0.8}
                onPress={handlePickFromGallery}
              >
                <View style={[styles.modalActionIcon, { backgroundColor: '#F0FDF4' }]}>
                  <Feather name="image" size={20} color="#16A34A" />
                </View>
                <Text style={styles.modalActionLabel}>Upload Photo</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.presetSectionTitle}>Or choose a curated avatar</Text>
            <View style={styles.presetsGrid}>
              {PRESET_AVATARS.map((uri, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  onPress={() => handleSelectPreset(uri)}
                  style={[
                    styles.presetItem,
                    avatarUri === uri && styles.presetItemSelected,
                  ]}
                >
                  <Image source={{ uri }} style={styles.presetImage} />
                  {avatarUri === uri && (
                    <View style={styles.presetCheckOverlay}>
                      <Feather name="check" size={14} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  headerSaveBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
  },
  headerSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 60,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
  },
  successBannerText: {
    color: '#15803D',
    fontSize: 14,
    fontWeight: '700',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: '#2563EB',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  avatarEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metricItem: {
    alignItems: 'center',
    gap: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 14,
  },
  inputGroup: {
    marginTop: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bioInputRow: {
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  fieldIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
    padding: 0,
  },
  bioTextInput: {
    minHeight: 40,
    textAlignVertical: 'top',
  },
  vehicleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  vehiclePill: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 8,
  },
  vehiclePillSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  vehicleEmoji: {
    fontSize: 20,
  },
  vehiclePillLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  vehiclePillLabelSelected: {
    color: '#1D4ED8',
  },
  selectedCheck: {
    marginLeft: 'auto',
  },
  bloodChipsRow: {
    gap: 8,
    paddingVertical: 4,
  },
  bloodChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  bloodChipSelected: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  bloodChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bloodChipTextSelected: {
    color: '#FFFFFF',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  switchInfo: {
    flex: 1,
    paddingRight: 12,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  switchSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bottomActions: {
    gap: 12,
    marginTop: 8,
    marginBottom: 40,
  },
  saveMainBtn: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 18,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveMainBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  resetBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  resetBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  avatarModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalActionButtons: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
  },
  modalActionBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  modalActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  presetSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  presetItem: {
    width: 60,
    height: 60,
    borderRadius: 30,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetItemSelected: {
    borderColor: '#2563EB',
  },
  presetImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  presetCheckOverlay: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  safetyCoinBanner: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#334155',
  },
  safetyCoinBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  coinBannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safetyCoinBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tierSmallBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  tierSmallText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FCD34D',
  },
  safetyCoinBalanceText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  openRewardsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 2,
  },
  openRewardsPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 10,
  },
  signOutBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
});
