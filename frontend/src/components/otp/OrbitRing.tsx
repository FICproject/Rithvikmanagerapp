import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  interpolateColor,
  SharedValue,
} from 'react-native-reanimated';
import { OTP_CONFIG } from './otpConfig';

interface OrbitRingProps {
  gatherProgress: SharedValue<number>;
  colorProgress: SharedValue<number>;
  collapseProgress: SharedValue<number>;
}

export const OrbitRing: React.FC<OrbitRingProps> = React.memo(
  ({ gatherProgress, colorProgress, collapseProgress }) => {
    const trackStyle = useAnimatedStyle(() => {
      const opacity = gatherProgress.value * (1 - collapseProgress.value);
      return {
        opacity,
      };
    });

    const dotStyle = useAnimatedStyle(() => {
      const opacity = gatherProgress.value * (1 - collapseProgress.value);
      const backgroundColor = interpolateColor(
        colorProgress.value,
        [0, 1],
        [OTP_CONFIG.COLORS.centerDot, OTP_CONFIG.COLORS.accentEmerald]
      );
      return {
        opacity,
        backgroundColor,
      };
    });

    const glowStyle = useAnimatedStyle(() => {
      // Glow becomes visible as color turns emerald
      const opacity = colorProgress.value * (1 - collapseProgress.value) * 0.8;
      return {
        opacity,
      };
    });

    const ringDiameter = OTP_CONFIG.ORBIT_RADIUS * 2;

    return (
      <View style={styles.container} pointerEvents="none">
        {/* Orbit circular track */}
        <Animated.View style={[styles.trackWrapper, trackStyle]}>
          <Svg
            width={ringDiameter + 2}
            height={ringDiameter + 2}
            viewBox={`0 0 ${ringDiameter + 2} ${ringDiameter + 2}`}
          >
            <Circle
              cx={OTP_CONFIG.ORBIT_RADIUS + 1}
              cy={OTP_CONFIG.ORBIT_RADIUS + 1}
              r={OTP_CONFIG.ORBIT_RADIUS}
              fill="none"
              stroke={OTP_CONFIG.COLORS.orbitTrack}
              strokeWidth={1}
            />
          </Svg>
        </Animated.View>

        {/* Center dot glow */}
        <Animated.View style={[styles.centerGlow, glowStyle]}>
          <Svg width={36} height={36} viewBox="0 0 36 36">
            <Defs>
              <RadialGradient id="centerDotGlow" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor={OTP_CONFIG.COLORS.accentGlow} stopOpacity="0.8" />
                <Stop offset="50%" stopColor={OTP_CONFIG.COLORS.accentEmerald} stopOpacity="0.3" />
                <Stop offset="100%" stopColor={OTP_CONFIG.COLORS.accentEmerald} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx={18} cy={18} r={18} fill="url(#centerDotGlow)" />
          </Svg>
        </Animated.View>

        {/* Small center dot */}
        <Animated.View style={[styles.centerDot, dotStyle]} />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackWrapper: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerGlow: {
    position: 'absolute',
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
