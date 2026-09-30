import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  SharedValue,
} from 'react-native-reanimated';
import { OTP_CONFIG } from './otpConfig';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface CheckmarkProps {
  progress: SharedValue<number>;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const CHECK_LENGTH = 26;

export const Checkmark: React.FC<CheckmarkProps> = React.memo(
  ({
    progress,
    size = OTP_CONFIG.CENTER_SQUARE_SIZE,
    color = OTP_CONFIG.COLORS.accentEmerald,
    strokeWidth = 2.5,
  }) => {
    const animatedProps = useAnimatedProps(() => {
      // Clamped 0 to 1
      const p = Math.max(0, Math.min(1, progress.value));
      return {
        strokeDashoffset: CHECK_LENGTH * (1 - p),
      };
    });

    return (
      <View style={[styles.container, { width: size, height: size }]} pointerEvents="none">
        <Svg width={size} height={size} viewBox="0 0 40 40">
          <AnimatedPath
            d="M 12.5 20.5 L 17.5 25.5 L 27.5 15.5"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={[CHECK_LENGTH, CHECK_LENGTH]}
            animatedProps={animatedProps}
          />
        </Svg>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
