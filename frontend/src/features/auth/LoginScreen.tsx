import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StatusBar,
  Dimensions,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { ASSETS } from '../../assets/logo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface LoginScreenProps {
  onForgotPassword?: () => void;
  onRegister?: () => void;
  onOtpLogin?: () => void;
}

// ─── Main Login Screen ───────────────────────────────────────────────
export const LoginScreen: React.FC<LoginScreenProps> = ({
  onForgotPassword,
  onRegister,
  onOtpLogin,
}) => {
  const { login, isLoading, authError, clearAuthError } = useAuth();

  const [username, setUsername] = useState<string>('ramesh@forge.in');
  const [password, setPassword] = useState<string>('Password123');
  const [usernameError, setUsernameError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  const validateForm = (): boolean => {
    let isValid = true;
    setUsernameError('');
    setPasswordError('');

    if (!username.trim()) {
      setUsernameError('Email or username is required.');
      isValid = false;
    } else if (username.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username.trim())) {
      setUsernameError('Please enter a valid email address.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    } else if (password.length < 4) {
      setPasswordError('Password must be at least 4 characters long.');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (authError) clearAuthError();
    if (!validateForm()) return;
    await login(username.trim(), password);
  };

  const skylineHeight = Math.min(190, SCREEN_WIDTH * (350 / 841));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ── Top Header: Soft Cream Accent + Tagline ── */}
          <View style={styles.topSection}>
            {/* Soft Cream Accent Oval in Top-Left */}
            <View style={styles.accentCircle} />

            {/* Tagline at Top-Right */}
            <View style={styles.taglineContainer}>
              <Text style={styles.taglineLight}>Empowering</Text>
              <Text style={styles.taglineLight}>Local Businesses</Text>
              <Text style={styles.taglineBold}>A Stronger Tomorrow</Text>
              <View style={styles.taglineUnderline} />
            </View>
          </View>

          {/* ── Official Forge India Connect Logo ── */}
          <View style={styles.logoSection}>
            <Image
              source={ASSETS.logo}
              style={styles.logoImage}
              resizeMode="contain"
              accessibilityLabel="Forge India Connect Logo"
            />
          </View>

          {/* ── Heading / Welcome Text ── */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Let's Connect!</Text>
            <Text style={styles.welcomeSubtitle}>Manage. Grow. Make an Impact.</Text>
          </View>

          {/* ── Form Section ── */}
          <View style={styles.formSection}>
            {/* Auth Error Banner */}
            {authError ? (
              <View style={styles.errorAlert} accessibilityRole="alert">
                <Icon name="alert-circle-outline" size={18} color={theme.colors.error} />
                <Text style={styles.errorAlertText}>{authError}</Text>
              </View>
            ) : null}

            {/* Email / Manager ID Input */}
            <View
              style={[
                styles.inputContainer,
                focusedField === 'email' && styles.inputFocused,
                usernameError ? styles.inputError : null,
              ]}
            >
              <Icon
                name="email-outline"
                size={20}
                color={focusedField === 'email' ? '#0B4A8B' : '#5A6882'}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.inputField}
                placeholder="Email / Manager ID"
                placeholderTextColor="#94A3B8"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  if (usernameError) setUsernameError('');
                  if (authError) clearAuthError();
                }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
                editable={!isLoading}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            {usernameError ? (
              <Text style={styles.fieldError}>{usernameError}</Text>
            ) : null}

            {/* Password Input */}
            <View
              style={[
                styles.inputContainer,
                focusedField === 'password' && styles.inputFocused,
                passwordError ? styles.inputError : null,
              ]}
            >
              <Icon
                name="lock-outline"
                size={20}
                color={focusedField === 'password' ? '#0B4A8B' : '#5A6882'}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.inputField}
                placeholder="Password"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) setPasswordError('');
                  if (authError) clearAuthError();
                }}
                secureTextEntry={!isPasswordVisible}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                editable={!isLoading}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                style={styles.eyeButton}
                accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
              >
                <Icon
                  name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#5A6882"
                />
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text style={styles.fieldError}>{passwordError}</Text>
            ) : null}

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPasswordBtn}
              activeOpacity={0.7}
              onPress={onForgotPassword}
              accessibilityRole="button"
              accessibilityLabel="Forgot Password"
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Login"
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Authenticating...' : 'Login'}
              </Text>
              {!isLoading && (
                <Icon name="arrow-right" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
              )}
            </TouchableOpacity>

            {/* Login with OTP Button */}
            {onOtpLogin && (
              <TouchableOpacity
                style={styles.otpButton}
                activeOpacity={0.8}
                onPress={onOtpLogin}
                accessibilityRole="button"
                accessibilityLabel="Login with OTP Verification"
              >
                <Icon name="shield-key-outline" size={20} color="#0B4A8B" style={{ marginRight: 8 }} />
                <Text style={styles.otpButtonText}>Login with OTP Verification</Text>
              </TouchableOpacity>
            )}

            {/* Registration Card Button */}
            {onRegister && (
              <TouchableOpacity
                style={styles.registerCard}
                activeOpacity={0.8}
                onPress={onRegister}
              >
                <View style={styles.registerCardLeft}>
                  <View style={styles.registerIconBox}>
                    <Icon name="account-plus-outline" size={22} color="#1D4ED8" />
                  </View>
                  <View style={styles.registerCardText}>
                    <Text style={styles.registerCardTitle}>New Territory Manager?</Text>
                    <Text style={styles.registerCardSubtitle}>Register your account here</Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={20} color="#1D4ED8" />
              </TouchableOpacity>
            )}
          </View>

          {/* ── Bottom City Skyline Illustration Artwork ── */}
          <View style={styles.skylineSection}>
            <Image
              source={ASSETS.skyline}
              style={[styles.skylineImage, { height: skylineHeight }]}
              resizeMode="contain"
              accessibilityLabel="City Skyline Illustration"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flexOne: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },

  // ── Top Header Section ──
  topSection: {
    height: 85,
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 24,
    paddingTop: 12,
  },
  accentCircle: {
    position: 'absolute',
    top: -100,
    left: -70,
    width: '75%',
    maxWidth: 270,
    height: 250,
    borderRadius: 135,
    backgroundColor: '#FEF4D8',
    opacity: 0.85,
  },
  taglineContainer: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  taglineLight: {
    fontSize: 12,
    fontWeight: '400',
    color: '#64748B',
    lineHeight: 16,
    letterSpacing: -0.2,
  },
  taglineBold: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    lineHeight: 16,
    letterSpacing: -0.2,
  },
  taglineUnderline: {
    width: 36,
    height: 3,
    backgroundColor: '#F5A623',
    borderRadius: 2,
    marginTop: 5,
  },

  // ── Logo Section ──
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  logoImage: {
    width: '65%',
    maxWidth: 220,
    height: undefined,
    aspectRatio: 220 / 140,
    resizeMode: 'contain',
  },

  // ── Heading / Welcome ──
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0A1329',
    letterSpacing: -0.6,
  },
  welcomeSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#64748B',
    marginTop: 6,
    letterSpacing: -0.2,
  },

  // ── Form Section ──
  formSection: {
    paddingHorizontal: 28,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    gap: 8,
  },
  errorAlertText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#DC2626',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: '#F1F4F8',
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 14,
  },
  inputFocused: {
    borderColor: '#0B4A8B',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginRight: 10,
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
  eyeButton: {
    padding: 6,
  },
  fieldError: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
    marginTop: -8,
    marginBottom: 10,
    marginLeft: 14,
  },

  // ── Forgot Password ──
  forgotPasswordBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -4,
  },
  forgotPasswordText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0B4A8B',
  },

  // ── Login Button ──
  loginButton: {
    backgroundColor: '#0B4A8B',
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#0B4A8B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  otpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBF3FB',
    borderRadius: 14,
    height: 50,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 4,
  },
  otpButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0B4A8B',
  },

  // ── Register Card ──
  registerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    marginBottom: 4,
  },
  registerCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  registerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  registerCardText: {
    flex: 1,
  },
  registerCardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  registerCardSubtitle: {
    fontSize: 11.5,
    color: '#3B82F6',
    marginTop: 1,
  },

  // ── Bottom Skyline Illustration ──
  skylineSection: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  skylineImage: {
    width: '100%',
  },
});
