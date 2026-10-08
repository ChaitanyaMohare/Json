import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { WaysureLogo } from '../components/WaysureLogo';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onSkip?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onSkip,
}) => {
  const { loginUser } = useApp();

  // Step 1: 'email' | Step 2: '2fa_otp'
  const [step, setStep] = useState<'email' | '2fa_otp'>('email');
  const [email, setEmail] = useState<string>('alex.rider@waysure.com');
  const [generatedOtp, setGeneratedOtp] = useState<string>('749210');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resendTimer, setResendTimer] = useState<number>(45);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Countdown timer for 2FA OTP Resend
  useEffect(() => {
    let interval: any = null;
    if (step === '2fa_otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, resendTimer]);

  const handleSendCode = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    // Simulate sending authentic 2FA email code
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setIsLoading(false);
      setStep('2fa_otp');
      setResendTimer(45);
      setOtpDigits(['', '', '', '', '', '']);
    }, 900);
  };

  const handleOtpChange = (text: string, index: number) => {
    setErrorMessage(null);
    const cleaned = text.replace(/[^0-9]/g, '');

    // Support pasting full 6-digit code
    if (cleaned.length === 6) {
      const newDigits = cleaned.split('');
      setOtpDigits(newDigits);
      inputRefs.current[5]?.focus();
      return;
    }

    const digit = cleaned.slice(-1);
    const updated = [...otpDigits];
    updated[index] = digit;
    setOtpDigits(updated);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify2FA = async () => {
    const enteredCode = otpDigits.join('');
    if (enteredCode.length < 6) {
      setErrorMessage('Please enter the complete 6-digit security code.');
      return;
    }

    if (enteredCode !== generatedOtp && enteredCode !== '749210' && enteredCode !== '123456') {
      setErrorMessage('Invalid 2FA code. Please check your email or click auto-fill.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    // Authenticate user session
    await loginUser(email.trim().toLowerCase());

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess();
    }, 600);
  };

  const handleAutoFillDemoCode = () => {
    const digits = generatedOtp.split('');
    setOtpDigits(digits);
    setErrorMessage(null);
  };

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
          {/* Top Logo & Branding Header */}
          <View style={styles.brandingBox}>
            <View style={styles.logoBadgeContainer}>
              <WaysureLogo size={88} />
            </View>
            <Text style={styles.appTitle}>
              <Text style={{ color: '#0F172A' }}>Way</Text>
              <Text style={{ color: '#DC2626' }}>Sure</Text>
            </Text>
            <Text style={styles.appSubtitle}>SAFER JOURNEYS FOR EVERYONE</Text>
          </View>

          {/* 2FA Security Pill Indicator */}
          <View style={styles.securityPill}>
            <Ionicons name="shield-checkmark" size={14} color="#15803D" />
            <Text style={styles.securityPillText}>Two-Factor Email Authentication (2FA)</Text>
          </View>

          {/* Error Message Box */}
          {errorMessage && (
            <View style={styles.errorCard}>
              <Feather name="alert-circle" size={16} color="#DC2626" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* ========================================================
              STEP 1: ENTER EMAIL ADDRESS
              ======================================================== */}
          {step === 'email' ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Sign in to WaySure</Text>
              <Text style={styles.cardDesc}>
                Enter your email address to receive a secure Two-Factor Authentication (2FA) verification code.
              </Text>

              <View style={styles.inputWrapper}>
                <Feather name="mail" size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="name@waysure.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    setErrorMessage(null);
                  }}
                />
              </View>

              {/* Quick Presets for Demo / Testing */}
              <View style={styles.presetsSection}>
                <Text style={styles.presetsLabel}>Quick Rider Profiles:</Text>
                <View style={styles.presetChipsRow}>
                  {['alex.rider@waysure.com', 'sarah.drive@waysure.com'].map((demo) => (
                    <TouchableOpacity
                      key={demo}
                      onPress={() => setEmail(demo)}
                      style={[
                        styles.presetChip,
                        email === demo && styles.presetChipActive,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          email === demo && styles.presetChipTextActive,
                        ]}
                      >
                        {demo.split('@')[0]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Send Code Action */}
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleSendCode}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>Send 2FA Security Code</Text>
                    <Feather name="arrow-right" size={18} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            /* ========================================================
               STEP 2: 2FA EMAIL OTP VERIFICATION
               ======================================================== */
            <View style={styles.card}>
              <View style={styles.stepHeaderRow}>
                <TouchableOpacity
                  onPress={() => setStep('email')}
                  style={styles.backBtn}
                  activeOpacity={0.7}
                >
                  <Feather name="arrow-left" size={18} color="#2563EB" />
                </TouchableOpacity>
                <Text style={styles.cardTitle}>Verify Security Code</Text>
                <View style={{ width: 28 }} />
              </View>

              <Text style={styles.cardDesc}>
                We sent a 6-digit authentication code to{' '}
                <Text style={{ fontWeight: '800', color: '#0F172A' }}>{email}</Text>.
              </Text>

              {/* Simulated Live Inbox Toast Helper for One-Click Testing */}
              <TouchableOpacity
                style={styles.simulatedInboxCard}
                onPress={handleAutoFillDemoCode}
                activeOpacity={0.8}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialCommunityIcons name="email-check-outline" size={18} color="#2563EB" />
                  <Text style={styles.simulatedInboxTitle}>Email OTP Code: {generatedOtp}</Text>
                </View>
                <View style={styles.autoFillTag}>
                  <Text style={styles.autoFillTagText}>Auto-Fill Code</Text>
                </View>
              </TouchableOpacity>

              {/* 6-Digit OTP Box Grid */}
              <View style={styles.otpGrid}>
                {otpDigits.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={(r) => {
                      inputRefs.current[idx] = r;
                    }}
                    style={[
                      styles.otpBox,
                      digit ? styles.otpBoxFilled : null,
                    ]}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, idx)}
                    onKeyPress={(e) => handleOtpKeyPress(e, idx)}
                    autoFocus={idx === 0}
                  />
                ))}
              </View>

              {/* Resend Code / Timer */}
              <View style={styles.resendRow}>
                {resendTimer > 0 ? (
                  <Text style={styles.resendTimerText}>
                    Resend code in <Text style={{ fontWeight: '800' }}>{resendTimer}s</Text>
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleSendCode} activeOpacity={0.7}>
                    <Text style={styles.resendActionText}>Resend 2FA Code</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Verify & Launch Button */}
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleVerify2FA}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>Verify & Launch WaySure</Text>
                    <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Skip / Guest Mode */}
          {onSkip && (
            <TouchableOpacity
              onPress={onSkip}
              style={styles.skipBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.skipBtnText}>Continue as Guest</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  brandingBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoBadgeContainer: {
    marginBottom: 12,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1.2,
  },
  securityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#86EFAC',
    marginBottom: 16,
  },
  securityPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    width: '100%',
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  backBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 18,
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
  },
  presetsSection: {
    marginBottom: 20,
  },
  presetsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  presetChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  presetChipText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '700',
  },
  presetChipTextActive: {
    color: '#2563EB',
  },
  simulatedInboxCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 16,
  },
  simulatedInboxTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E40AF',
  },
  autoFillTag: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  autoFillTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  otpBox: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  otpBoxFilled: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  resendRow: {
    alignItems: 'center',
    marginBottom: 18,
  },
  resendTimerText: {
    fontSize: 12,
    color: '#64748B',
  },
  resendActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  skipBtn: {
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
});
