import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { HapticType } from '../utils/haptics';
import { Icon, IconType } from './Icon';
import { PressableScale } from './PressableScale';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  iconName?: string;
  iconPosition?: 'left' | 'right';
  iconType?: IconType;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
  haptic?: HapticType;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const variantColors: Record<ButtonVariant, { container: ViewStyle; text: string }> = {
  primary: {
    container: { backgroundColor: colors.primary, ...shadows.primary },
    text: colors.white,
  },
  secondary: {
    container: { backgroundColor: colors.primaryLight },
    text: colors.primary,
  },
  outline: {
    container: {
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    text: colors.primary,
  },
  ghost: {
    container: { backgroundColor: colors.transparent },
    text: colors.primary,
  },
  danger: {
    container: { backgroundColor: colors.error },
    text: colors.white,
  },
};

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  iconName,
  iconPosition = 'left',
  iconType = 'ion',
  style,
  textStyle,
  fullWidth = true,
  haptic,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const isInteractive = !loading && !disabled;
  const palette = variantColors[variant];
  const textColor = disabled ? colors.textMuted : palette.text;
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 20 : 18;

  const renderIcon = () =>
    iconName ? <Icon name={iconName} size={iconSize} color={textColor} type={iconType} /> : null;

  return (
    <PressableScale
      onPress={onPress}
      disabled={!isInteractive}
      haptic={haptic ?? (variant === 'danger' ? 'medium' : 'light')}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      style={[
        styles.base,
        sizeStyles[size],
        fullWidth && styles.fullWidth,
        palette.container,
        disabled && (variant === 'ghost' ? styles.disabledGhost : styles.disabled),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <View style={styles.contentRow}>
          {iconPosition === 'left' && renderIcon()}
          <Text
            numberOfLines={1}
            style={[
              styles.text,
              size === 'sm' && styles.textSm,
              size === 'lg' && styles.textLg,
              { color: textColor },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {iconPosition === 'right' && renderIcon()}
        </View>
      )}
    </PressableScale>
  );
};

const sizeStyles = StyleSheet.create({
  sm: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  md: {
    minHeight: 50,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  lg: {
    minHeight: 56,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.lg,
  },
});

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  disabled: {
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledGhost: {
    opacity: 0.6,
  },
  text: {
    ...typography.button,
    textAlign: 'center',
  },
  textSm: {
    fontSize: 13,
    lineHeight: 18,
  },
  textLg: {
    fontSize: 16,
    lineHeight: 22,
  },
});

export default Button;
