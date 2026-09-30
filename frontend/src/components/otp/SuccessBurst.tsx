import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  SharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { OTP_CONFIG } from './otpConfig';
import { ParticleConfig } from './types';

interface SuccessBurstProps {
  progress: SharedValue<number>;
}

const PARTICLE_COUNT = 22;

const ParticleDot: React.FC<{
  particle: ParticleConfig;
  progress: SharedValue<number>;
}> = React.memo(({ particle, progress }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;
    if (p <= particle.delay) {
      return {
        opacity: 0,
        transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 0 }],
      };
    }

    const localP = Math.min(1, (p - particle.delay) / (1 - particle.delay));
    // Cubic out distance easing
    const easeDist = 1 - Math.pow(1 - localP, 3);
    const dist = particle.distance * easeDist;
    const translateX = Math.cos(particle.angle) * dist;
    const translateY = Math.sin(particle.angle) * dist;

    // Fade in quickly, then fade out toward 0
    const opacity = localP < 0.2 ? localP / 0.2 : (1 - localP) * 0.95;
    const scale = localP < 0.2 ? (localP / 0.2) * 1.2 : Math.max(0.2, 1.2 - localP);

    return {
      opacity,
      transform: [{ translateX }, { translateY }, { scale }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: particle.color,
        },
        animatedStyle,
      ]}
    />
  );
});

export const SuccessBurst: React.FC<SuccessBurstProps> = React.memo(
  ({ progress }) => {
    // Ring 1 animation (immediate on burst)
    const ring1Style = useAnimatedStyle(() => {
      const p = progress.value;
      if (p <= 0) return { opacity: 0, transform: [{ scale: 1 }] };

      const scale = 1 + p * 1.2; // 1 -> ~2.2x
      const opacity = Math.max(0, (1 - p) * 0.4);
      return {
        opacity,
        transform: [{ scale }],
      };
    });

    // Ring 2 animation (staggered by ~120ms, which is ~0.15 of progress)
    const ring2Style = useAnimatedStyle(() => {
      const p = progress.value;
      const stagger = 0.14;
      if (p <= stagger) return { opacity: 0, transform: [{ scale: 1 }] };

      const localP = (p - stagger) / (1 - stagger);
      const scale = 1 + localP * 2.1; // 1 -> ~3.1x
      const opacity = Math.max(0, (1 - localP) * 0.35);
      return {
        opacity,
        transform: [{ scale }],
      };
    });

    // Permanent faint ambient glow around the success square
    const glowStyle = useAnimatedStyle(() => {
      const p = progress.value;
      return {
        opacity: Math.min(1, p * 1.5) * 0.85,
      };
    });

    // Precompute particles once
    const particles = useMemo<ParticleConfig[]>(() => {
      const list: ParticleConfig[] = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const baseAngle = (i * 360) / PARTICLE_COUNT;
        const jitter = ((i * 11) % 19) - 9;
        const angleRad = ((baseAngle + jitter) * Math.PI) / 180;
        const distance = 32 + ((i * 13) % 58); // 32 to 90
        const size = 2 + (i % 3); // 2, 3, or 4
        const color =
          i % 3 === 0 ? '#ffffff' : OTP_CONFIG.COLORS.accentEmerald;
        const delay = (i % 6) * 0.035; // 0 to ~0.17 stagger
        list.push({
          id: i,
          angle: angleRad,
          distance,
          size,
          color,
          delay,
        });
      }
      return list;
    }, []);

    return (
      <View style={styles.container} pointerEvents="none">
        {/* Soft Radial Glow behind center square */}
        <Animated.View style={[styles.glowWrapper, glowStyle]}>
          <Svg width={110} height={110} viewBox="0 0 110 110">
            <Defs>
              <RadialGradient id="successGlow" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop
                  offset="0%"
                  stopColor={OTP_CONFIG.COLORS.accentGlow}
                  stopOpacity="0.4"
                />
                <Stop
                  offset="60%"
                  stopColor={OTP_CONFIG.COLORS.accentEmerald}
                  stopOpacity="0.12"
                />
                <Stop
                  offset="100%"
                  stopColor={OTP_CONFIG.COLORS.accentEmerald}
                  stopOpacity="0"
                />
              </RadialGradient>
            </Defs>
            <Rect width={110} height={110} fill="url(#successGlow)" />
          </Svg>
        </Animated.View>

        {/* Outer Ring 1 */}
        <Animated.View style={[styles.expandingRing, ring1Style]} />

        {/* Outer Ring 2 (Staggered) */}
        <Animated.View style={[styles.expandingRing, ring2Style]} />

        {/* Particle Dots */}
        {particles.map((particle) => (
          <ParticleDot
            key={particle.id}
            particle={particle}
            progress={progress}
          />
        ))}
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
  glowWrapper: {
    position: 'absolute',
    width: 110,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandingRing: {
    position: 'absolute',
    width: OTP_CONFIG.CENTER_SQUARE_SIZE,
    height: OTP_CONFIG.CENTER_SQUARE_SIZE,
    borderRadius: OTP_CONFIG.BOX_RADIUS,
    borderWidth: 1,
    borderColor: OTP_CONFIG.COLORS.accentEmerald,
  },
  dot: {
    position: 'absolute',
  },
});
