import React from 'react';
import { GestureResponderEvent, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { motion } from '../theme';
import { HapticType, triggerHaptic } from '../utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends Omit<PressableProps, 'style' | 'children'> {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Scale while pressed. Use `motion.pressScaleSubtle` for large cards. */
  scaleTo?: number;
  /** Haptic fired on a completed press. */
  haptic?: HapticType;
}

/**
 * Drop-in replacement for TouchableOpacity: springs down slightly on press,
 * fires a haptic on release, and respects the OS "reduce motion" setting.
 */
export const PressableScale: React.FC<PressableScaleProps> = ({
  children,
  style,
  scaleTo = motion.pressScale,
  haptic = 'light',
  onPress,
  onPressIn,
  onPressOut,
  onLongPress,
  disabled,
  accessibilityState,
  ...rest
}) => {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const isInteractive = !disabled && (!!onPress || !!onLongPress);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  const handlePressIn = (event: GestureResponderEvent) => {
    if (isInteractive && !reduceMotion) {
      scale.set(withSpring(scaleTo, motion.spring));
    }
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    scale.set(withSpring(1, motion.spring));
    onPressOut?.(event);
  };

  const handlePress = (event: GestureResponderEvent) => {
    triggerHaptic(haptic);
    onPress?.(event);
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      {...rest}
      disabled={disabled}
      accessibilityState={{ disabled: !!disabled, ...accessibilityState }}
      onPress={onPress ? handlePress : undefined}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
};

export default PressableScale;
