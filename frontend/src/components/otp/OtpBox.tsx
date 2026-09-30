import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import Svg, { Rect, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  interpolateColor,
  SharedValue,
  Easing,
} from 'react-native-reanimated';
import { OTP_CONFIG } from './otpConfig';
import { OtpPhase } from './types';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface OtpBoxProps {
  index: number;
  digit: string;
  isActive: boolean;
  phase: OtpPhase;
  gatherProgress: SharedValue<number>;
  orbitSpinProgress: SharedValue<number>;
  colorProgress: SharedValue<number>;
  collapseProgress: SharedValue<number>;
}

// 4 boxes row positions relative to container center (0, 0)
// Total width = 4 * 44 + 3 * 14 = 218 -> offsets from center: -87, -29, 29, 87
const ROW_X_OFFSETS = [-87, -29, 29, 87];

// Circle positions (R = 45):
// Demo layout: 7 top, 4 left, 1 right, 9 bottom
// For code [4, 7, 1, 9]:
// Box 0 (4) -> Left (-45, 0)
// Box 1 (7) -> Top (0, -45)
// Box 2 (1) -> Right (45, 0)
// Box 3 (9) -> Bottom (0, 45)
const CIRCLE_OFFSETS = [
  { x: -OTP_CONFIG.ORBIT_RADIUS, y: 0 },
  { x: 0, y: -OTP_CONFIG.ORBIT_RADIUS },
  { x: OTP_CONFIG.ORBIT_RADIUS, y: 0 },
  { x: 0, y: OTP_CONFIG.ORBIT_RADIUS },
];

const PERIMETER = 150;
const ARC_LENGTH = PERIMETER * 0.25;

export const OtpBox: React.FC<OtpBoxProps> = React.memo(
  ({
    index,
    digit,
    isActive,
    phase,
    gatherProgress,
    orbitSpinProgress,
    colorProgress,
    collapseProgress,
  }) => {
    // Digit animation values
    const digitScale = useSharedValue(digit ? 1 : 0.8);
    const digitOpacity = useSharedValue(digit ? 1 : 0);
    const caretOpacity = useSharedValue(0);
    const pulseGlow = useSharedValue(0);
    const arcOffset = useSharedValue(0);
    const arcOpacity = useSharedValue(0);

    const prevDigitRef = React.useRef(digit);

    // Caret blink effect when active and empty
    useEffect(() => {
      if (isActive && !digit && phase === 'typing') {
        caretOpacity.value = withRepeat(
          withSequence(
            withTiming(1, { duration: OTP_CONFIG.TIMINGS.CARET_BLINK }),
            withTiming(0, { duration: OTP_CONFIG.TIMINGS.CARET_BLINK })
          ),
          -1,
          true
        );
      } else {
        caretOpacity.value = 0;
      }
    }, [isActive, digit, phase, caretOpacity]);

    // On digit entry / deletion pop effect
    useEffect(() => {
      if (digit && !prevDigitRef.current) {
        // Digit popped in
        digitScale.value = 0.8;
        digitOpacity.value = 0;
        digitScale.value = withSpring(1, { damping: 11, stiffness: 220 });
        digitOpacity.value = withTiming(1, {
          duration: OTP_CONFIG.TIMINGS.DIGIT_POP,
        });

        // Trigger radial glow pulse
        pulseGlow.value = withSequence(
          withTiming(1, { duration: 140 }),
          withTiming(0, { duration: 260 })
        );

        // Sweep border arc once around box
        arcOpacity.value = 1;
        arcOffset.value = 0;
        arcOffset.value = withTiming(
          -PERIMETER,
          {
            duration: OTP_CONFIG.TIMINGS.ARC_SWEEP,
            easing: Easing.linear,
          },
          (finished) => {
            if (finished) {
              arcOpacity.value = 0;
            }
          }
        );
      } else if (!digit && prevDigitRef.current) {
        // Digit removed
        digitScale.value = 0.8;
        digitOpacity.value = 0;
        arcOpacity.value = 0;
        arcOffset.value = 0;
      }
      prevDigitRef.current = digit;
    }, [digit, digitScale, digitOpacity, pulseGlow, arcOffset, arcOpacity]);

    // Sweep arc SVG animated props
    const arcAnimatedProps = useAnimatedProps(() => {
      return {
        strokeDashoffset: arcOffset.value,
        strokeOpacity: arcOpacity.value,
      };
    });

    // Box position and orientation transform
    const boxAnimatedStyle = useAnimatedStyle(() => {
      const g = gatherProgress.value;
      const c = collapseProgress.value;
      const s = orbitSpinProgress.value;

      // 1. Interpolate position from row to circle
      const rowX = ROW_X_OFFSETS[index];
      const rowY = 0;
      const circleX = CIRCLE_OFFSETS[index].x;
      const circleY = CIRCLE_OFFSETS[index].y;

      // Current gathered position
      let posX = rowX + (circleX - rowX) * g;
      let posY = rowY + (circleY - rowY) * g;

      // In collapse phase: translate from circle position into center (0, 0)
      if (c > 0) {
        posX = circleX * (1 - c);
        posY = circleY * (1 - c);
      }

      // 2. Counter-rotation during orbit spin:
      // While spinning (0 to 0.75 progress), box rotates with the wrapper (tilting & upside down).
      // During settle (0.75 to 1.0 progress), it smoothly compensates by -90deg so it settles upright.
      let counterRotate = 0;
      if (s > 0.7) {
        const settleProgress = (s - 0.7) / 0.3;
        counterRotate = -90 * settleProgress;
      }

      // In collapse phase: boxes rotate an additional ~30° while scaling down to 0.2
      const collapseRotate = c * 30;
      const finalRotate = counterRotate + collapseRotate;

      // 3. Scale and Opacity during collapse
      const scale = c > 0 ? 1 - c * 0.82 : 1; // 1 -> ~0.18
      const opacity = c > 0.85 ? Math.max(0, (1 - c) / 0.15) : 1;

      // 4. Background and border color interpolation during orbit settle
      const backgroundColor = interpolateColor(
        colorProgress.value,
        [0, 1],
        [OTP_CONFIG.COLORS.bgBox, OTP_CONFIG.COLORS.accentFill]
      );

      const neutralBorder = isActive && phase === 'typing'
        ? OTP_CONFIG.COLORS.borderActive
        : OTP_CONFIG.COLORS.borderNeutral;

      const borderColor = interpolateColor(
        colorProgress.value,
        [0, 1],
        [neutralBorder, OTP_CONFIG.COLORS.accentEmerald]
      );

      return {
        opacity,
        backgroundColor,
        borderColor,
        borderWidth: isActive && phase === 'typing' && colorProgress.value === 0 ? 1.5 : 1,
        transform: [
          { translateX: posX },
          { translateY: posY },
          { rotate: `${finalRotate}deg` },
          { scale },
        ],
      };
    });

    // Digit text animated style (color crossfade and pop)
    const digitAnimatedStyle = useAnimatedStyle(() => {
      const textColor = interpolateColor(
        colorProgress.value,
        [0, 1],
        [OTP_CONFIG.COLORS.textPrimary, OTP_CONFIG.COLORS.accentEmerald]
      );

      return {
        color: textColor,
        opacity: digitOpacity.value,
        transform: [{ scale: digitScale.value }],
      };
    });

    // Caret animated style
    const caretAnimatedStyle = useAnimatedStyle(() => {
      return {
        opacity: caretOpacity.value,
      };
    });

    // Glow on entry pulse & active state
    const glowAnimatedStyle = useAnimatedStyle(() => {
      // Active glow or pulse glow
      const activeOpacity =
        isActive && phase === 'typing' && !digit ? 0.6 : 0;
      const pulseOpacity = pulseGlow.value * 0.9;
      const totalOpacity = Math.max(activeOpacity, pulseOpacity);

      return {
        opacity: totalOpacity,
      };
    });

    return (
      <Animated.View style={[styles.boxContainer, boxAnimatedStyle]}>
        {/* Soft radial glow behind box (Android & iOS) */}
        <Animated.View style={[styles.glowWrapper, glowAnimatedStyle]} pointerEvents="none">
          <Svg width={76} height={76} viewBox="0 0 76 76">
            <Defs>
              <RadialGradient
                id={`boxGlow-${index}`}
                cx="50%"
                cy="50%"
                rx="50%"
                ry="50%"
              >
                <Stop
                  offset="0%"
                  stopColor={digit ? OTP_CONFIG.COLORS.accentGlow : OTP_CONFIG.COLORS.borderActive}
                  stopOpacity="0.25"
                />
                <Stop
                  offset="60%"
                  stopColor={digit ? OTP_CONFIG.COLORS.accentEmerald : OTP_CONFIG.COLORS.borderActive}
                  stopOpacity="0.08"
                />
                <Stop
                  offset="100%"
                  stopColor={OTP_CONFIG.COLORS.borderActive}
                  stopOpacity="0"
                />
              </RadialGradient>
            </Defs>
            <Rect width={76} height={76} fill={`url(#boxGlow-${index})`} />
          </Svg>
        </Animated.View>

        {/* Sweep Arc SVG overlay */}
        <Svg
          width={OTP_CONFIG.BOX_SIZE}
          height={OTP_CONFIG.BOX_SIZE}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        >
          <AnimatedRect
            x={0.75}
            y={0.75}
            width={OTP_CONFIG.BOX_SIZE - 1.5}
            height={OTP_CONFIG.BOX_SIZE - 1.5}
            rx={OTP_CONFIG.BOX_RADIUS}
            fill="none"
            stroke={OTP_CONFIG.COLORS.borderActive}
            strokeWidth={1.5}
            strokeDasharray={[ARC_LENGTH, PERIMETER]}
            animatedProps={arcAnimatedProps}
          />
        </Svg>

        {/* Blinking Caret */}
        {isActive && !digit && phase === 'typing' && (
          <Animated.View style={[styles.caret, caretAnimatedStyle]} />
        )}

        {/* Digit */}
        <Animated.Text style={[styles.digitText, digitAnimatedStyle]}>
          {digit}
        </Animated.Text>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  boxContainer: {
    position: 'absolute',
    width: OTP_CONFIG.BOX_SIZE,
    height: OTP_CONFIG.BOX_SIZE,
    borderRadius: OTP_CONFIG.BOX_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  glowWrapper: {
    position: 'absolute',
    width: 76,
    height: 76,
    justifyContent: 'center',
    alignItems: 'center',
  },
  caret: {
    position: 'absolute',
    width: OTP_CONFIG.CARET_WIDTH,
    height: OTP_CONFIG.CARET_HEIGHT,
    backgroundColor: OTP_CONFIG.COLORS.borderActive,
    borderRadius: 1,
  },
  digitText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
