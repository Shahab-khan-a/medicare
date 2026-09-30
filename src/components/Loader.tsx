import React, { useEffect } from 'react';
import { DimensionValue, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, borderRadius, spacing } from '../theme';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

/** A single pulsing placeholder block. Compose these to mirror any layout. */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 12,
  radius = borderRadius.xs + 2,
  style,
}) => {
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.set(withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }), -1, true));
  }, [pulse, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - pulse.get() * 0.55,
  }));

  return (
    <Animated.View
      style={[{ width, height, borderRadius: radius, backgroundColor: colors.skeleton }, animatedStyle, style]}
    />
  );
};

export type LoaderVariant = 'card' | 'list' | 'carousel';

interface LoaderProps {
  count?: number;
  variant?: LoaderVariant;
  style?: StyleProp<ViewStyle>;
}

const CardSkeleton = () => (
  <View style={styles.card}>
    <View style={styles.row}>
      <Skeleton width={64} height={64} radius={borderRadius.lg} />
      <View style={styles.lines}>
        <Skeleton width="70%" height={15} />
        <Skeleton width="50%" height={11} />
        <Skeleton width="35%" height={10} />
      </View>
    </View>
    <View style={styles.divider} />
    <View style={styles.rowBetween}>
      <Skeleton width="30%" height={12} />
      <Skeleton width={96} height={34} radius={borderRadius.md} />
    </View>
  </View>
);

const ListRowSkeleton = () => (
  <View style={styles.listRow}>
    <Skeleton width={44} height={44} radius={22} />
    <View style={styles.lines}>
      <Skeleton width="60%" height={13} />
      <Skeleton width="85%" height={10} />
    </View>
  </View>
);

const CarouselSkeleton = () => (
  <View style={styles.carouselCard}>
    <Skeleton height={120} radius={borderRadius.md} />
    <View style={styles.carouselLines}>
      <Skeleton width="80%" height={13} />
      <Skeleton width="55%" height={10} />
      <Skeleton width="40%" height={10} />
    </View>
  </View>
);

/** Skeleton placeholders shown while content loads. */
export const Loader: React.FC<LoaderProps> = ({ count = 3, variant = 'card', style }) => {
  const Item =
    variant === 'list' ? ListRowSkeleton : variant === 'carousel' ? CarouselSkeleton : CardSkeleton;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      style={[variant === 'carousel' ? styles.carouselContainer : styles.container, style]}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Item key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  carouselContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lines: {
    flex: 1,
    marginLeft: spacing.md,
    gap: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  carouselCard: {
    width: 170,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  carouselLines: {
    paddingTop: spacing.sm,
    gap: spacing.xs + 2,
  },
});

export default Loader;
