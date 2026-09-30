import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';

interface CategoryChipProps {
  id: string;
  name: string;
  icon: string;
  isSelected?: boolean;
  onPress: () => void;
  color?: string;
  variant?: 'vertical' | 'horizontal';
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  name,
  icon,
  isSelected = false,
  onPress,
  color = colors.primary,
  variant = 'vertical',
}) => {
  const a11y = {
    accessibilityLabel: name,
    accessibilityState: { selected: isSelected },
  };

  if (variant === 'horizontal') {
    return (
      <PressableScale
        onPress={onPress}
        haptic="selection"
        {...a11y}
        style={[styles.horizontalContainer, isSelected && styles.horizontalSelected]}
      >
        <Icon name={icon} size={16} color={isSelected ? colors.white : color} />
        <Text style={[styles.horizontalText, isSelected && styles.horizontalTextSelected]}>
          {name}
        </Text>
      </PressableScale>
    );
  }

  return (
    <PressableScale
      onPress={onPress}
      haptic="selection"
      {...a11y}
      style={styles.verticalContainer}
    >
      <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>
        <Icon name={icon} size={24} color={isSelected ? colors.white : color} />
      </View>
      <Text
        numberOfLines={1}
        style={[styles.verticalText, isSelected && styles.verticalTextSelected]}
      >
        {name}
      </Text>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  verticalContainer: {
    alignItems: 'center',
    width: 72,
    marginRight: spacing.sm,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.subtle,
  },
  iconBoxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.primary,
  },
  verticalText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  verticalTextSelected: {
    ...typography.captionBold,
    color: colors.primary,
  },
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
    paddingHorizontal: spacing.md + 2,
    backgroundColor: colors.card,
    borderRadius: borderRadius.round,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs + 2,
  },
  horizontalSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  horizontalText: {
    ...typography.captionBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  horizontalTextSelected: {
    color: colors.white,
  },
});

export default CategoryChip;
