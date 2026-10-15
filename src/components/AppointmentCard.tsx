import React from 'react';
import {
  AccessibilityActionEvent,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { Appointment } from '../types';
import { colors, typography, spacing, borderRadius, shadows, motion, fonts } from '../theme';
import { HapticType } from '../utils/haptics';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';

import { AppointmentStatusBadge } from './AppointmentStatusBadge';

interface AppointmentCardProps {
  appointment: Appointment;
  onPress?: () => void;
  onJoinCall?: () => void;
  onCancel?: () => void;
  onReschedule?: () => void;
  onViewPrescription?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  onCheckIn?: () => void;
  onShowQR?: () => void;
  onRate?: () => void;
  isDoctorView?: boolean;
  style?: StyleProp<ViewStyle>;
}

type ActionTone = 'primary' | 'secondary' | 'danger' | 'success' | 'warning';

const ActionButton: React.FC<{
  label: string;
  onPress?: () => void;
  tone: ActionTone;
  icon?: string;
  grow?: boolean;
  haptic?: HapticType;
}> = ({ label, onPress, tone, icon, grow = true, haptic }) => {
  const toneStyle = actionTones[tone];
  return (
    <PressableScale
      onPress={onPress}
      haptic={haptic}
      accessibilityLabel={label}
      style={[styles.actionButton, grow && styles.actionGrow, { backgroundColor: toneStyle.bg }]}
    >
      {icon ? <Icon name={icon} size={15} color={toneStyle.fg} /> : null}
      <Text numberOfLines={1} style={[styles.actionText, { color: toneStyle.fg }]}>
        {label}
      </Text>
    </PressableScale>
  );
};

const actionTones: Record<ActionTone, { bg: string; fg: string }> = {
  primary: { bg: colors.primary, fg: colors.white },
  secondary: { bg: colors.primaryLight, fg: colors.primary },
  danger: { bg: colors.errorLight, fg: colors.errorText },
  success: { bg: colors.success, fg: colors.white },
  warning: { bg: '#FEF3C7', fg: '#B45309' },
};

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onPress,
  onJoinCall,
  onCancel,
  onReschedule,
  onViewPrescription,
  onAccept,
  onReject,
  onCheckIn,
  onShowQR,
  onRate,
  isDoctorView = false,
  style,
}) => {
  const displayName = isDoctorView ? appointment.patientName : appointment.doctorName;
  const displaySubtitle = isDoctorView
    ? `${appointment.patientAge} yrs • ${appointment.patientGender}`
    : appointment.doctorSpecialty;
  const displayPhoto = isDoctorView
    ? appointment.patientPhoto || appointment.doctorPhoto
    : appointment.doctorPhoto;

  const actions = getActions(appointment, isDoctorView, {
    onPress,
    onJoinCall,
    onCancel,
    onReschedule,
    onViewPrescription,
    onAccept,
    onReject,
    onCheckIn,
    onShowQR,
    onRate,
  });

  const a11yActions = [
    ...(onPress ? [{ name: 'activate' }] : []),
    ...actions.filter((a) => a.onPress).map((a) => ({ name: a.key, label: a.label })),
  ];
  const handleA11yAction = (event: AccessibilityActionEvent) => {
    const { actionName } = event.nativeEvent;
    if (actionName === 'activate') onPress?.();
    else actions.find((a) => a.key === actionName)?.onPress?.();
  };

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={motion.pressScaleSubtle}
      accessibilityRole={Platform.OS === 'web' ? undefined : 'button'}
      accessibilityLabel={`${displayName}, ${appointment.status}, ${appointment.date} at ${appointment.time}`}
      accessibilityActions={a11yActions}
      onAccessibilityAction={handleA11yAction}
      style={[styles.container, style]}
    >
      <View style={styles.topRow}>
        <View style={styles.personRow}>
          <Image
            source={{ uri: displayPhoto }}
            style={styles.avatar}
            contentFit="cover"
            transition={motion.duration.base}
            accessible={false}
          />
          <View style={styles.personDetails}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text numberOfLines={1} style={styles.name}>
                {displayName}
              </Text>
              {appointment.familyMemberRelation && (
                <View style={styles.relationTag}>
                  <Text style={styles.relationTagText}>{appointment.familyMemberRelation}</Text>
                </View>
              )}
            </View>
            <Text numberOfLines={1} style={styles.subtitle}>
              {displaySubtitle}
            </Text>
          </View>
        </View>

        <AppointmentStatusBadge status={appointment.status} size="small" />
      </View>

      {/* OPD Token & Room Bar if available */}
      {appointment.tokenNumber ? (
        <View style={styles.tokenHighlightRow}>
          <View style={styles.tokenBox}>
            <Icon name="ticket-outline" size={13} color={colors.primary} />
            <Text style={styles.tokenBoxText}>Token #{appointment.tokenNumber}</Text>
          </View>
          <View style={styles.roomBox}>
            <Icon name="location-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.roomBoxText}>{appointment.opdRoom || 'Room #204'}</Text>
          </View>
          {appointment.checkInStatus === 'Checked In' ? (
            <View style={styles.checkedInBadge}>
              <Icon name="checkmark" size={12} color={colors.successText} />
              <Text style={styles.checkedInText}>Checked In</Text>
            </View>
          ) : (
            <View style={styles.waitingCheckInBadge}>
              <Text style={styles.waitingCheckInText}>Not Checked In</Text>
            </View>
          )}
        </View>
      ) : null}

      <View style={styles.detailsBox}>
        <View style={styles.detailItem}>
          <Icon name="calendar-outline" size={15} color={colors.primary} />
          <Text style={styles.detailText}>{appointment.date}</Text>
        </View>

        <View style={styles.detailDivider} />

        <View style={styles.detailItem}>
          <Icon name="time-outline" size={15} color={colors.primary} />
          <Text style={styles.detailText}>{appointment.time}</Text>
        </View>

        <View style={styles.detailDivider} />

        <View style={styles.detailItem}>
          <Icon name="business-outline" size={15} color={colors.accentText} />
          <Text style={[styles.detailText, { color: colors.accentText }]}>
            {appointment.shift || 'In-Clinic'}
          </Text>
        </View>
      </View>

      {appointment.symptoms ? (
        <Text numberOfLines={2} style={styles.symptomsText}>
          <Text style={styles.symptomsBold}>Symptoms: </Text>
          {appointment.symptoms}
        </Text>
      ) : null}

      {actions.length > 0 ? (
        <View style={styles.actionRow}>
          {actions.map(({ key, ...action }) => (
            <ActionButton key={key} {...action} />
          ))}
        </View>
      ) : null}
    </PressableScale>
  );
};

interface CardAction {
  key: string;
  label: string;
  tone: ActionTone;
  icon?: string;
  grow?: boolean;
  haptic?: HapticType;
  onPress?: () => void;
}

type ActionHandlers = Pick<
  AppointmentCardProps,
  | 'onPress'
  | 'onJoinCall'
  | 'onCancel'
  | 'onReschedule'
  | 'onViewPrescription'
  | 'onAccept'
  | 'onReject'
  | 'onCheckIn'
  | 'onShowQR'
  | 'onRate'
>;

const getActions = (
  appointment: Appointment,
  isDoctorView: boolean,
  h: ActionHandlers,
): CardAction[] => {
  const status = (appointment.status || '').toLowerCase();
  const norm = status === 'rescheduled' ? 'confirmed' : status;

  if (isDoctorView) {
    if (norm === 'pending') {
      return [
        { key: 'accept', label: 'Accept', icon: 'checkmark', tone: 'success', haptic: 'success', onPress: h.onAccept },
        { key: 'decline', label: 'Decline', icon: 'close', tone: 'danger', haptic: 'warning', onPress: h.onReject },
      ];
    }
    if (norm === 'in consultation' || norm === 'inconsultation' || norm === 'your turn' || norm === 'yourturn') {
      return [
        { key: 'rx', label: 'Write Prescription', icon: 'create-outline', tone: 'primary', onPress: h.onViewPrescription },
        { key: 'patientInfo', label: 'Patient Details', icon: 'person-outline', tone: 'secondary', onPress: h.onPress },
      ];
    }
    if (norm === 'waiting' || norm === 'in queue' || norm === 'confirmed' || norm === 'upcoming') {
      return [
        { key: 'callNow', label: 'Call Turn', icon: 'megaphone-outline', tone: 'primary', onPress: h.onJoinCall || h.onPress },
        { key: 'patientInfo', label: 'View File', icon: 'document-text-outline', tone: 'secondary', onPress: h.onPress },
      ];
    }
    return [{ key: 'viewRecord', label: 'View Medical Record', tone: 'secondary', onPress: h.onPress }];
  }

  // Patient Actions
  const cardActions: CardAction[] = [];

  // Digital check-in trigger if not yet checked in
  if (
    appointment.checkInStatus !== 'Checked In' &&
    (norm === 'confirmed' || norm === 'waiting' || norm === 'upcoming')
  ) {
    cardActions.push({
      key: 'checkin',
      label: 'Check In Now',
      icon: 'checkmark-circle-outline',
      tone: 'success',
      haptic: 'success',
      onPress: h.onCheckIn,
    });
  }

  // QR Pass
  if (norm === 'confirmed' || norm === 'waiting' || norm === 'in queue' || norm === 'your turn') {
    cardActions.push({
      key: 'qr',
      label: 'Pass / QR',
      icon: 'qr-code-outline',
      tone: 'secondary',
      grow: false,
      onPress: h.onShowQR,
    });
  }

  // Live Track
  if (norm === 'confirmed' || norm === 'waiting' || norm === 'in queue' || norm === 'your turn' || norm === 'upcoming') {
    cardActions.push({
      key: 'track',
      label: norm === 'your turn' ? 'Go to Room' : 'Live Queue',
      icon: 'pulse',
      tone: norm === 'your turn' ? 'warning' : 'primary',
      onPress: h.onJoinCall || h.onPress,
    });
  }

  if (norm === 'completed') {
    if (appointment.prescriptionId) {
      cardActions.push({
        key: 'rx',
        label: 'View Rx',
        icon: 'document-text-outline',
        tone: 'primary',
        onPress: h.onViewPrescription,
      });
    }
    if (!appointment.ratingSubmitted) {
      cardActions.push({
        key: 'rate',
        label: 'Rate Visit',
        icon: 'star-outline',
        tone: 'secondary',
        onPress: h.onRate,
      });
    }
    cardActions.push({
      key: 'again',
      label: 'Book Again',
      tone: 'secondary',
      grow: false,
      onPress: h.onReschedule,
    });
  }

  if (norm === 'cancelled' || norm === 'no show' || norm === 'noshow') {
    cardActions.push({
      key: 'new',
      label: 'Book New Slot',
      tone: 'secondary',
      onPress: h.onReschedule,
    });
  }

  return cardActions;
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md + 2,
    backgroundColor: colors.primaryLight,
  },
  personDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  name: {
    ...typography.bodyBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: borderRadius.round,
  },
  statusText: {
    ...typography.captionBold,
    fontSize: 11,
    lineHeight: 14,
  },
  detailsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginTop: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.border,
  },
  detailText: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  symptomsText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.md,
    lineHeight: 18,
  },
  symptomsBold: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  actionGrow: {
    flex: 1,
  },
  actionText: {
    ...typography.captionBold,
    fontSize: 13,
  },
  relationTag: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  relationTagText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: '#0369A1',
  },
  tokenHighlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.sm + 2,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tokenBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tokenBoxText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.primary,
  },
  roomBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roomBoxText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textSecondary,
  },
  checkedInBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 'auto',
  },
  checkedInText: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: '#15803D',
  },
  waitingCheckInBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 'auto',
  },
  waitingCheckInText: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: '#B45309',
  },
});


export default AppointmentCard;
