import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, typography, spacing, motion } from '../theme';
import { Icon } from './Icon';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle: string;
  actionTitle?: string;
  onAction?: () => void;
  secondaryActionTitle?: string;
  onSecondaryAction?: () => void;
  /** Tighter spacing for use inside cards or short sections. */
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'file-tray-outline',
  title,
  subtitle,
  actionTitle,
  onAction,
  secondaryActionTitle,
  onSecondaryAction,
  compact = false,
  style,
}) => {
  return (
    <Animated.View
      entering={FadeInDown.duration(motion.duration.slow)}
      style={[styles.container, compact && styles.containerCompact, style]}
    >
      <View style={[styles.halo, compact && styles.haloCompact]}>
        <View style={[styles.iconCircle, compact && styles.iconCircleCompact]}>
          <Icon name={icon} size={compact ? 28 : 36} color={colors.primary} />
        </View>
      </View>

      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {(actionTitle && onAction) || (secondaryActionTitle && onSecondaryAction) ? (
        <View style={styles.actions}>
          {actionTitle && onAction ? (
            <Button title={actionTitle} onPress={onAction} fullWidth={false} style={styles.actionBtn} />
          ) : null}
          {secondaryActionTitle && onSecondaryAction ? (
            <Button
              title={secondaryActionTitle}
              onPress={onSecondaryAction}
              variant="ghost"
              fullWidth={false}
              style={styles.actionBtn}
            />
          ) : null}
        </View>
      ) : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxl,
    marginVertical: spacing.lg,
  },
  containerCompact: {
    paddingVertical: spacing.xl,
    marginVertical: spacing.sm,
  },
  halo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  haloCompact: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  iconCircleCompact: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  title: {
    ...typography.h3,
    fontSize: 17,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs + 2,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 290,
  },
  actions: {
    marginTop: spacing.xl,
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionBtn: {
    minWidth: 180,
  },
});

export default EmptyState;
