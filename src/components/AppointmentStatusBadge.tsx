import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppointmentStatus } from '../types';
import { colors, fonts } from '../theme';

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
  size?: 'small' | 'medium' | 'large';
  showDot?: boolean;
}

export const AppointmentStatusBadge: React.FC<AppointmentStatusBadgeProps> = ({
  status,
  size = 'medium',
  showDot = true,
}) => {
  // Normalize string for safety
  const rawStatus = (status || 'Pending').toString();
  const normalized = rawStatus.toLowerCase();

  let label = rawStatus;
  let bg = colors.surfaceMuted;
  let text = colors.textSecondary;
  let dotColor = colors.textMuted;

  if (normalized === 'confirmed') {
    label = 'Confirmed';
    bg = colors.successLight;
    text = colors.successText;
    dotColor = colors.success;
  } else if (normalized === 'waiting') {
    label = 'Waiting in OPD';
    bg = '#E0F2FE';
    text = '#0369A1';
    dotColor = '#0EA5E9';
  } else if (normalized === 'in queue' || normalized === 'inqueue') {
    label = 'In Queue';
    bg = colors.primaryLight;
    text = colors.primaryDark;
    dotColor = colors.primary;
  } else if (normalized === 'your turn' || normalized === 'yourturn') {
    label = 'YOUR TURN';
    bg = '#FEF08A';
    text = '#854D0E';
    dotColor = '#EAB308';
  } else if (normalized === 'in consultation' || normalized === 'inconsultation') {
    label = 'In Consultation';
    bg = '#F3E8FF';
    text = '#7E22CE';
    dotColor = '#A855F7';
  } else if (normalized === 'completed') {
    label = 'Completed';
    bg = '#DCFCE7';
    text = '#15803D';
    dotColor = '#16A34A';
  } else if (normalized === 'cancelled') {
    label = 'Cancelled';
    bg = colors.errorLight;
    text = colors.errorText;
    dotColor = colors.error;
  } else if (normalized === 'no show' || normalized === 'noshow') {
    label = 'No Show';
    bg = '#FEE2E2';
    text = '#991B1B';
    dotColor = '#DC2626';
  } else if (normalized === 'rescheduled') {
    label = 'Rescheduled';
    bg = '#FEF3C7';
    text = '#B45309';
    dotColor = '#F59E0B';
  } else if (normalized === 'upcoming') {
    label = 'Upcoming';
    bg = colors.primaryLight;
    text = colors.primary;
    dotColor = colors.primary;
  } else {
    label = 'Pending';
    bg = '#F1F5F9';
    text = '#475569';
    dotColor = '#64748B';
  }

  const isSmall = size === 'small';
  const isLarge = size === 'large';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: bg },
        isSmall && styles.containerSmall,
        isLarge && styles.containerLarge,
      ]}
    >
      {showDot && (
        <View
          style={[
            styles.dot,
            { backgroundColor: dotColor },
            isSmall && styles.dotSmall,
          ]}
        />
      )}
      <Text
        style={[
          styles.text,
          { color: text },
          isSmall && styles.textSmall,
          isLarge && styles.textLarge,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  containerSmall: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
  },
  containerLarge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 24,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  dotSmall: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 4,
  },
  text: {
    fontFamily: fonts.semibold,
    fontSize: 12,
  },
  textSmall: {
    fontSize: 10,
  },
  textLarge: {
    fontSize: 13,
  },
});

export default AppointmentStatusBadge;
