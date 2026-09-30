import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  OtpVerification,
  OtpVerificationRef,
  OTP_CONFIG,
} from '../../components/otp';
import { ASSETS } from '../../assets/logo';
import { theme } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface OtpVerificationExampleScreenProps {
  onBack?: () => void;
  onLoginSuccess?: () => void;
}

export const OtpVerificationExampleScreen: React.FC<OtpVerificationExampleScreenProps> = ({
  onBack,
  onLoginSuccess,
}) => {
  const otpRef = useRef<OtpVerificationRef>(null);
  const [status, setStatus] = useState<string>('Awaiting code entry');
  const [lastCode, setLastCode] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [resendTimer, setResendTimer] = useState<number>(30);

  // Resend countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Verification handler:
  // Resolves true after 700ms for '4719', false otherwise
  const handleVerify = useCallback(async (code: string): Promise<boolean> => {
    setStatus(`Verifying ${code}...`);
    setLastCode(code);

    await new Promise((resolve) => setTimeout(resolve, 750));

    const isValid = code === '4719';
    setStatus(isValid ? 'Code verified successfully!' : 'Invalid code! Please recheck.');
    return isValid;
  }, []);

  const handleVerified = useCallback(() => {
    setStatus('Verified successfully! Logging in...');
    setIsVerified(true);
    if (onLoginSuccess) {
      setTimeout(() => {
        onLoginSuccess();
      }, 1000);
    }
  }, [onLoginSuccess]);

  const handleReset = useCallback(() => {
    setStatus('Awaiting code entry');
    setLastCode('');
    setIsVerified(false);
    otpRef.current?.reset();
  }, []);

  const handleFillSuccess = useCallback(() => {
    otpRef.current?.reset();
    setIsVerified(false);
    setTimeout(() => {
      otpRef.current?.setCode('4719');
    }, 100);
  }, []);

  const handleFillFail = useCallback(() => {
    otpRef.current?.reset();
    setIsVerified(false);
    setTimeout(() => {
      otpRef.current?.setCode('1234');
    }, 100);
  }, []);

  const handleResend = useCallback(() => {
    if (resendTimer > 0) return;
    setResendTimer(30);
    handleReset();
    setStatus('New OTP sent to registered number');
  }, [resendTimer, handleReset]);

  const skylineHeight = Math.min(130, SCREEN_WIDTH * 0.28);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        {onBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back to Login"
          >
            <Icon name="arrow-left" size={20} color="#1E293B" />
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}

        <View style={styles.securityBadge}>
          <Icon name="shield-check" size={14} color="#059669" style={{ marginRight: 4 }} />
          <Text style={styles.securityBadgeText}>256-bit Secure</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Logo & Header */}
        <View style={styles.brandSection}>
          <View style={styles.logoContainer}>
            <Image
              source={ASSETS.logo}
              style={styles.logoImage}
              resizeMode="contain"
              accessibilityLabel="Forge India Connect"
            />
          </View>
          <Text style={styles.screenTitle}>Let's Connect!</Text>
          <Text style={styles.screenSubtitle}>
            Two-Factor Authentication for Territory Managers
          </Text>
        </View>

        {/* The Animated OTP Component Card */}
        <View style={styles.cardContainer}>
          <OtpVerification
            ref={otpRef}
            length={4}
            phoneNumber="+91 98765 •••• 10"
            title="Mobile Verification"
            subtitle="Enter the 4-digit code sent to your registered mobile"
            verify={handleVerify}
            onComplete={(code) => setLastCode(code)}
            onVerified={handleVerified}
          />
        </View>

        {/* Resend Code Action */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendPrompt}>Didn't receive the verification code? </Text>
          {resendTimer > 0 ? (
            <Text style={styles.resendTimer}>Resend in {resendTimer}s</Text>
          ) : (
            <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
              <Text style={styles.resendActiveText}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Verification Status Banner */}
        {isVerified ? (
          <View style={[styles.statusBox, styles.statusBoxSuccess]}>
            <Icon name="check-circle" size={18} color="#059669" style={{ marginRight: 8 }} />
            <Text style={styles.statusSuccessText}>
              Verification successful! Redirecting to Dashboard...
            </Text>
          </View>
        ) : status.includes('Invalid') ? (
          <View style={[styles.statusBox, styles.statusBoxError]}>
            <Icon name="alert-circle-outline" size={18} color="#DC2626" style={{ marginRight: 8 }} />
            <Text style={styles.statusErrorText}>
              Invalid code. Please recheck or tap Quick Fill below.
            </Text>
          </View>
        ) : null}

        {/* Quick Testing Helper Chips */}
        <View style={styles.testSection}>
          <Text style={styles.testLabel}>QUICK TEST SHORTCUTS</Text>
          <View style={styles.testPillsRow}>
            <TouchableOpacity
              style={[styles.testPill, styles.pillSuccess]}
              onPress={handleFillSuccess}
              activeOpacity={0.75}
            >
              <Icon name="key-outline" size={14} color="#059669" style={{ marginRight: 4 }} />
              <Text style={styles.pillTextSuccess}>Auto-Fill 4719 (Pass)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testPill, styles.pillFail]}
              onPress={handleFillFail}
              activeOpacity={0.75}
            >
              <Icon name="close-circle-outline" size={14} color="#DC2626" style={{ marginRight: 4 }} />
              <Text style={styles.pillTextFail}>1234 (Fail)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testPill}
              onPress={handleReset}
              activeOpacity={0.75}
            >
              <Icon name="refresh" size={14} color="#64748B" style={{ marginRight: 4 }} />
              <Text style={styles.pillTextNeutral}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Skyline Illustration */}
        <View style={[styles.skylineSection, { height: skylineHeight }]}>
          <Image
            source={ASSETS.skyline}
            style={styles.skylineImage}
            resizeMode="cover"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  backButtonText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  securityBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#047857',
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  cardContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  resendPrompt: {
    fontSize: 13,
    color: '#64748B',
  },
  resendTimer: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  resendActiveText: {
    fontSize: 13,
    color: '#1D4ED8',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  statusBoxSuccess: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusSuccessText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#047857',
    flex: 1,
  },
  statusBoxError: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  statusErrorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B91C1C',
    flex: 1,
  },
  testSection: {
    width: '100%',
    maxWidth: 360,
    marginTop: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  testLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  testPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  testPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  pillTextSuccess: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  pillFail: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  pillTextFail: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B91C1C',
  },
  pillTextNeutral: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  skylineSection: {
    width: SCREEN_WIDTH,
    marginTop: 'auto',
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  skylineImage: {
    width: '100%',
    height: '100%',
  },
});
