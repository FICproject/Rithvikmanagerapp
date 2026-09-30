import React, {
  useState,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  runOnJS,
  useReducedMotion,
  interpolate,
} from 'react-native-reanimated';
import { OTP_CONFIG } from './otpConfig';
import { OtpVerificationProps, OtpVerificationRef, OtpPhase } from './types';
import { OtpBox } from './OtpBox';
import { OrbitRing } from './OrbitRing';
import { SuccessBurst } from './SuccessBurst';
import { Checkmark } from './Checkmark';
import { triggerHaptic } from './haptics';

export const OtpVerification = React.memo(
  forwardRef<OtpVerificationRef, OtpVerificationProps>(
    (
      {
        length = 4,
        onComplete,
        verify,
        onVerified,
        phoneNumber = '+91 98765 •••• 10',
        title = 'Verify your mobile',
        subtitle,
      },
      ref
    ) => {
      const { width: windowWidth } = useWindowDimensions();
      const cardWidth = Math.min(windowWidth - 32, 360);

      // Reduced motion hook from Reanimated
      const reducedMotion = useReducedMotion();

      // State machine phase
      const [phase, setPhase] = useState<OtpPhase>('typing');
      const [code, setCode] = useState('');

      const inputRef = useRef<TextInput>(null);

      // Animation shared values
      const gatherProgress = useSharedValue(0);
      const orbitSpinProgress = useSharedValue(0);
      const colorProgress = useSharedValue(0);
      const collapseProgress = useSharedValue(0);
      const centerSquareScale = useSharedValue(0);
      const burstProgress = useSharedValue(0);
      const checkProgress = useSharedValue(0);
      const textFadeProgress = useSharedValue(0);
      const textSuccessProgress = useSharedValue(0);
      const shakeX = useSharedValue(0);

      // Reset to initial typing state
      const reset = useCallback(() => {
        gatherProgress.value = 0;
        orbitSpinProgress.value = 0;
        colorProgress.value = 0;
        collapseProgress.value = 0;
        centerSquareScale.value = 0;
        burstProgress.value = 0;
        checkProgress.value = 0;
        textFadeProgress.value = 0;
        textSuccessProgress.value = 0;
        shakeX.value = 0;
        setCode('');
        setPhase('typing');
        setTimeout(() => {
          inputRef.current?.focus();
        }, 80);
      }, [
        gatherProgress,
        orbitSpinProgress,
        colorProgress,
        collapseProgress,
        centerSquareScale,
        burstProgress,
        checkProgress,
        textFadeProgress,
        textSuccessProgress,
        shakeX,
      ]);

      const resetToTyping = useCallback(() => {
        shakeX.value = 0;
        setCode('');
        setPhase('typing');
        inputRef.current?.focus();
      }, [shakeX]);

      const notifyVerified = useCallback(() => {
        onVerified?.();
      }, [onVerified]);

      // Phase 5: Success animation
      const startSuccess = useCallback(() => {
        setPhase('success');
        triggerHaptic('notificationSuccess');

        // Center square pops in
        centerSquareScale.value = withSpring(1, {
          damping: 14,
          stiffness: 180,
        });

        // Checkmark draws (~350ms)
        checkProgress.value = withTiming(1, {
          duration: OTP_CONFIG.TIMINGS.SUCCESS_CHECK,
        });

        // Rings expand & particle burst (~750ms)
        burstProgress.value = withTiming(1, {
          duration: OTP_CONFIG.TIMINGS.SUCCESS_BURST,
          easing: OTP_CONFIG.EASINGS.success,
        });

        // Header text fades in and slides up 6px
        textSuccessProgress.value = withTiming(
          1,
          { duration: OTP_CONFIG.TIMINGS.SUCCESS_TEXT },
          (finished) => {
            if (finished) {
              runOnJS(notifyVerified)();
            }
          }
        );
      }, [
        centerSquareScale,
        checkProgress,
        burstProgress,
        textSuccessProgress,
        notifyVerified,
      ]);

      // Phase 4: Collapse animation
      const startCollapse = useCallback(() => {
        setPhase('collapse');

        // Header fades down
        textFadeProgress.value = withDelay(
          OTP_CONFIG.TIMINGS.COLLAPSE_HOLD,
          withTiming(1, { duration: OTP_CONFIG.TIMINGS.COLLAPSE })
        );

        // Boxes scale down to 0.2 and translate to center
        collapseProgress.value = withDelay(
          OTP_CONFIG.TIMINGS.COLLAPSE_HOLD,
          withTiming(
            1,
            {
              duration: OTP_CONFIG.TIMINGS.COLLAPSE,
              easing: OTP_CONFIG.EASINGS.collapse,
            },
            (finished) => {
              if (finished) {
                runOnJS(startSuccess)();
              }
            }
          )
        );
      }, [collapseProgress, textFadeProgress, startSuccess]);

      // Phase 3: Orbit spin animation
      const startOrbit = useCallback(() => {
        setPhase('orbit');

        // Spin ring ~450°
        orbitSpinProgress.value = withTiming(1, {
          duration: OTP_CONFIG.TIMINGS.ORBIT_SPIN,
          easing: OTP_CONFIG.EASINGS.spin,
        });

        // Cross-fade colors to emerald while settling
        const colorDelay = Math.max(
          0,
          OTP_CONFIG.TIMINGS.ORBIT_SPIN - OTP_CONFIG.TIMINGS.COLOR_TRANSITION
        );

        colorProgress.value = withDelay(
          colorDelay,
          withTiming(
            1,
            { duration: OTP_CONFIG.TIMINGS.COLOR_TRANSITION },
            (finished) => {
              if (finished) {
                runOnJS(startCollapse)();
              }
            }
          )
        );
      }, [orbitSpinProgress, colorProgress, startCollapse]);

      // Phase 2: Gather animation
      const startGather = useCallback(() => {
        setPhase('gather');

        gatherProgress.value = withTiming(
          1,
          {
            duration: OTP_CONFIG.TIMINGS.GATHER,
            easing: OTP_CONFIG.EASINGS.gather,
          },
          (finished) => {
            if (finished) {
              runOnJS(startOrbit)();
            }
          }
        );
      }, [gatherProgress, startOrbit]);

      // Reduced motion bypass
      const runReducedMotionSuccess = useCallback(() => {
        setPhase('success');
        triggerHaptic('notificationSuccess');

        colorProgress.value = 1;
        centerSquareScale.value = 1;
        checkProgress.value = 1;
        burstProgress.value = 1;

        textFadeProgress.value = withTiming(1, { duration: 300 });
        textSuccessProgress.value = withDelay(
          150,
          withTiming(1, { duration: 350 }, (finished) => {
            if (finished) {
              runOnJS(notifyVerified)();
            }
          })
        );
      }, [
        colorProgress,
        centerSquareScale,
        checkProgress,
        burstProgress,
        textFadeProgress,
        textSuccessProgress,
        notifyVerified,
      ]);

      // Trigger shake error
      const triggerError = useCallback(() => {
        triggerHaptic('notificationError');
        setPhase('error');

        shakeX.value = withSequence(
          withTiming(-12, { duration: 55 }),
          withTiming(12, { duration: 65 }),
          withTiming(-8, { duration: 60 }),
          withTiming(8, { duration: 60 }),
          withTiming(-4, { duration: 50 }),
          withTiming(0, { duration: 50 }, (finished) => {
            if (finished) {
              runOnJS(resetToTyping)();
            }
          })
        );
      }, [shakeX, resetToTyping]);

      // Handle full code entry
      const handleFullCode = useCallback(
        async (finalCode: string) => {
          Keyboard.dismiss();
          onComplete?.(finalCode);

          if (verify) {
            setPhase('verifying');
            const startTime = Date.now();

            try {
              const isValid = await verify(finalCode);
              const elapsed = Date.now() - startTime;
              const remainingWait = Math.max(
                0,
                OTP_CONFIG.TIMINGS.VERIFY_PENDING_MIN - elapsed
              );

              setTimeout(() => {
                if (isValid) {
                  if (reducedMotion) {
                    runReducedMotionSuccess();
                  } else {
                    startGather();
                  }
                } else {
                  triggerError();
                }
              }, remainingWait);
            } catch {
              triggerError();
            }
          } else {
            // Direct flow
            if (reducedMotion) {
              runReducedMotionSuccess();
            } else {
              startGather();
            }
          }
        },
        [
          onComplete,
          verify,
          reducedMotion,
          runReducedMotionSuccess,
          startGather,
          triggerError,
        ]
      );

      // Handle input text changes
      const handleTextChange = useCallback(
        (text: string) => {
          if (phase !== 'typing') return;

          // Digits only
          const cleaned = text.replace(/[^0-9]/g, '').slice(0, length);
          setCode(cleaned);

          if (cleaned.length > code.length) {
            triggerHaptic('impactLight');
          }

          if (cleaned.length === length) {
            handleFullCode(cleaned);
          }
        },
        [phase, length, code.length, handleFullCode]
      );

      // Imperative Handle
      useImperativeHandle(
        ref,
        () => ({
          reset,
          replay: () => {
            const currentCode = code.length === length ? code : '4719';
            reset();
            setTimeout(() => {
              setCode(currentCode);
              handleFullCode(currentCode);
            }, 120);
          },
          focus: () => {
            inputRef.current?.focus();
          },
          setCode: (newCode: string) => {
            const cleaned = newCode.replace(/[^0-9]/g, '').slice(0, length);
            setCode(cleaned);
            if (cleaned.length === length) {
              handleFullCode(cleaned);
            }
          },
        }),
        [reset, code, length, handleFullCode]
      );

      // Wrapper animated styles for 450° orbit rotation & tilt
      const orbitWrapperStyle = useAnimatedStyle(() => {
        const s = orbitSpinProgress.value;
        const rotateZ = s * 450;
        // Subtle tilt on x-axis during spin
        const tiltX = Math.sin(s * Math.PI) * 14;

        // Dynamic drop shadow during movement
        const shadowOpacity = interpolate(s, [0, 0.5, 1], [0, 0.45, 0.1]);

        return {
          shadowOpacity,
          transform: [
            { perspective: 800 },
            { rotate: `${rotateZ}deg` },
            { rotateX: `${tiltX}deg` },
          ],
        };
      });

      // Horizontal shake animated style
      const shakeStyle = useAnimatedStyle(() => {
        return {
          transform: [{ translateX: shakeX.value }],
        };
      });

      // Default header animated style (fades out on collapse & success)
      const defaultHeaderStyle = useAnimatedStyle(() => {
        const opacity = (1 - textFadeProgress.value) * (1 - textSuccessProgress.value);
        return {
          opacity,
        };
      });

      // Success header animated style (fades in and slides up 6px)
      const successHeaderStyle = useAnimatedStyle(() => {
        const opacity = textSuccessProgress.value;
        const translateY = (1 - textSuccessProgress.value) * 6;
        return {
          opacity,
          transform: [{ translateY }],
        };
      });

      // Center square animated style in success phase
      const centerSquareStyle = useAnimatedStyle(() => {
        // Appears at end of collapse
        const scale =
          collapseProgress.value >= 0.95
            ? Math.max(centerSquareScale.value, (collapseProgress.value - 0.95) / 0.05)
            : 0;

        return {
          transform: [{ scale }],
        };
      });

      // Build 4 digit slots
      const digits = Array.from({ length }, (_, i) => code[i] || '');
      const activeIndex = Math.min(code.length, length - 1);

      return (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
        >
          <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
            <View style={[styles.card, { width: cardWidth }]}>
              {/* Drag Handle Pill */}
              <View style={styles.dragPill} />

              {/* Title & Subtitle Header Container */}
              <View style={styles.headerContainer}>
                {/* Default Header */}
                <Animated.View style={[styles.headerContent, defaultHeaderStyle]}>
                  <Text style={styles.title}>{title}</Text>
                  <Text style={styles.subtitle}>
                    {subtitle ? (
                      subtitle
                    ) : (
                      <>
                        Enter the {length}-digit code we sent to{' '}
                        <Text style={styles.phoneHighlight}>{phoneNumber}</Text>.
                      </>
                    )}
                  </Text>
                </Animated.View>

                {/* Success Header (Cross-fade & Slide Up 6px) */}
                <Animated.View
                  style={[
                    styles.headerContent,
                    styles.absoluteHeader,
                    successHeaderStyle,
                  ]}
                  pointerEvents="none"
                >
                  <Text style={[styles.title, styles.titleSuccess]}>
                    Verified successfully
                  </Text>
                  <Text style={styles.subtitle}>
                    Your number has been verified.
                  </Text>
                </Animated.View>
              </View>

              {/* Animation Stage */}
              <Animated.View style={[styles.stageContainer, shakeStyle]}>
                {/* Rotating Orbit Ring & Digit Boxes */}
                <Animated.View style={[styles.orbitWrapper, orbitWrapperStyle]}>
                  <OrbitRing
                    gatherProgress={gatherProgress}
                    colorProgress={colorProgress}
                    collapseProgress={collapseProgress}
                  />

                  {/* 4 Digit Boxes */}
                  {digits.map((digit, index) => (
                    <OtpBox
                      key={index}
                      index={index}
                      digit={digit}
                      isActive={index === activeIndex}
                      phase={phase}
                      gatherProgress={gatherProgress}
                      orbitSpinProgress={orbitSpinProgress}
                      colorProgress={colorProgress}
                      collapseProgress={collapseProgress}
                    />
                  ))}
                </Animated.View>

                {/* Success State Center Elements */}
                {phase === 'success' && (
                  <View style={styles.successWrapper} pointerEvents="none">
                    <SuccessBurst progress={burstProgress} />

                    {/* Green-outlined Rounded Square */}
                    <Animated.View
                      style={[styles.centerSquare, centerSquareStyle]}
                    >
                      <Checkmark progress={checkProgress} />
                    </Animated.View>
                  </View>
                )}
              </Animated.View>

              {/* Hidden Real TextInput for Native Keyboard & SMS Autofill */}
              <TextInput
                ref={inputRef}
                style={styles.hiddenInput}
                value={code}
                onChangeText={handleTextChange}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                maxLength={length}
                caretHidden
                editable={phase === 'typing'}
                accessibilityLabel="OTP Code Input"
              />
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      );
    }
  )
);

const styles = StyleSheet.create({
  keyboardAvoid: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: OTP_CONFIG.COLORS.bgCard,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingTop: 18,
    paddingBottom: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.07,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  dragPill: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: OTP_CONFIG.COLORS.dragHandle,
    alignSelf: 'center',
    marginBottom: 20,
  },
  headerContainer: {
    minHeight: 54,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26,
  },
  headerContent: {
    alignItems: 'center',
    width: '100%',
  },
  absoluteHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  title: {
    color: OTP_CONFIG.COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  titleSuccess: {
    color: OTP_CONFIG.COLORS.accentEmerald,
  },
  subtitle: {
    color: OTP_CONFIG.COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif' },
    }),
  },
  phoneHighlight: {
    color: OTP_CONFIG.COLORS.textPhone,
    fontWeight: '500',
  },
  stageContainer: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbitWrapper: {
    width: 220,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 10,
      },
    }),
  },
  successWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerSquare: {
    width: OTP_CONFIG.CENTER_SQUARE_SIZE,
    height: OTP_CONFIG.CENTER_SQUARE_SIZE,
    borderRadius: OTP_CONFIG.BOX_RADIUS,
    borderWidth: 1,
    borderColor: OTP_CONFIG.COLORS.accentEmerald,
    backgroundColor: OTP_CONFIG.COLORS.accentFill,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: OTP_CONFIG.COLORS.accentEmerald,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
      },
    }),
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.001,
  },
});
