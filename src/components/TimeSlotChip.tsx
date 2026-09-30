import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { PressableScale } from './PressableScale';

interface TimeSlotChipProps {
  time: string;
  isAvailable?: boolean;
  isSelected?: boolean;
  onPress: () => void;
}

export const TimeSlotChip: React.FC<TimeSlotChipProps> = ({
  time,
  isAvailable = true,
  isSelected = false,
  onPress,
}) => {
  return (
    <PressableScale
      onPress={onPress}
      disabled={!isAvailable}
      haptic="selection"
      accessibilityLabel={isAvailable ? time : `${time}, booked`}
      accessibilityState={{ selected: isSelected, disabled: !isAvailable }}
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
        !isAvailable && styles.bookedContainer,
      ]}
    >
      <Text
        style={[styles.text, isSelected && styles.selectedText, !isAvailable && styles.bookedText]}
      >
        {time}
      </Text>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 95,
  },
  selectedContainer: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.primary,
  },
  bookedContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.backgroundSecondary,
  },
  text: {
    ...typography.captionBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  selectedText: {
    color: colors.white,
  },
  bookedText: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
});

export default TimeSlotChip;
