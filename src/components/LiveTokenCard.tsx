import React, { useEffect, useState } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, shadows, motion } from '../theme';
import { triggerHaptic } from '../utils/haptics';
import { Button } from './Button';
import { Icon } from './Icon';
import { LinearGradient } from './LinearGradient';
import { PressableScale } from './PressableScale';

interface LiveTokenCardProps {
  tokenNumber?: number;
  currentServing?: number;
  estimatedWaitMinutes?: number;
  doctorName?: string;
  room?: string;
  shift?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const LivePulse: React.FC = () => {
  const reduceMotion = useReducedMotion();
  const ping = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    ping.set(withRepeat(withTiming(1, { duration: 1400, easing: Easing.out(Easing.ease) }), -1));
  }, [ping, reduceMotion]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.5 * (1 - ping.get()),
    transform: [{ scale: 1 + ping.get() * 1.4 }],
  }));

  return (
    <View style={styles.pulseContainer}>
      <Animated.View style={[styles.pulseRing, ringStyle]} />
      <View style={styles.liveDot} />
    </View>
  );
};

export const LiveTokenCard: React.FC<LiveTokenCardProps> = ({
  tokenNumber = 1,
  currentServing: initialServing = 1,
  estimatedWaitMinutes: initialWait = 10,
  doctorName = 'OPD Specialist',
  room = 'OPD Room #204',
  shift = 'Morning OPD (09:00 AM - 01:00 PM)',
  onPress,
  style,
}) => {
  const [currentServing, setCurrentServing] = useState(initialServing);
  const [waitMinutes, setWaitMinutes] = useState(initialWait);

  useEffect(() => {
    setCurrentServing(initialServing);
  }, [initialServing]);

  useEffect(() => {
    setWaitMinutes(initialWait);
  }, [initialWait]);

  const validTokenNumber = Math.max(1, tokenNumber);
  const patientsAhead = Math.max(0, validTokenNumber - currentServing);
  const isYourTurn = patientsAhead === 0;
  const progressPercent = Math.min(100, Math.round((currentServing / validTokenNumber) * 100));

  const progress = useSharedValue(progressPercent);
  useEffect(() => {
    progress.set(withTiming(progressPercent, { duration: motion.duration.slow }));
  }, [progress, progressPercent]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.get()}%`,
  }));

  const handleSimulateNext = () => {
    if (currentServing >= tokenNumber) return;
    const next = currentServing + 1;
    setCurrentServing(next);
    setWaitMinutes((prev) => Math.max(5, prev - 4));
    triggerHaptic(next >= tokenNumber ? 'success' : 'selection');
  };

  return (
    <View style={[styles.card, style]}>
      {/* Header */}
      <View style={styles.topHeader}>
        <View style={styles.liveBadge}>
          <LivePulse />
          <Text style={styles.liveText}>Live OPD Counter</Text>
        </View>

        <PressableScale
          onPress={handleSimulateNext}
          haptic="none"
          disabled={isYourTurn}
          accessibilityLabel="Simulate next patient"
          style={[styles.simulateBtn, isYourTurn && styles.simulateBtnDisabled]}
        >
          <Icon name="play-skip-forward" size={12} color={colors.primary} />
          <Text style={styles.simulateText}>Next turn</Text>
        </PressableScale>
      </View>

      <View style={styles.facilityRow}>
        <Icon name="time-outline" size={13} color={colors.textSecondary} />
        <Text style={styles.facilityText} numberOfLines={1}>
          {shift}
        </Text>
      </View>

      {/* Big numbers */}
      <View style={styles.numbersRow}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.tokenTile}
          accessible
          accessibilityLabel={`Your token number ${tokenNumber}`}
        >
          <Text style={styles.tileLabelInverse}>Your token</Text>
          <Text style={styles.tokenNumber}>
            <Text style={styles.hashInverse}>#</Text>
            {tokenNumber}
          </Text>
          <View style={styles.tokenPill}>
            <Icon name="ticket-outline" size={11} color={colors.white} />
            <Text style={styles.tokenPillText}>Online token</Text>
          </View>
        </LinearGradient>

        <View
          style={[styles.servingTile, isYourTurn && styles.servingTileTurn]}
          accessible
          accessibilityLabel={`Now serving number ${currentServing}. ${
            isYourTurn ? 'It is your turn now' : `${patientsAhead} patients ahead of you`
          }`}
          accessibilityLiveRegion="polite"
        >
          <Text style={styles.tileLabel}>Now in room</Text>
          <Text style={[styles.servingNumber, isYourTurn && styles.servingNumberTurn]}>
            <Text style={styles.hash}>#</Text>
            {currentServing}
          </Text>
          <View style={[styles.aheadPill, isYourTurn && styles.aheadPillTurn]}>
            <Text style={[styles.aheadText, isYourTurn && styles.aheadTextTurn]}>
              {isYourTurn ? 'Your turn now!' : `${patientsAhead} ahead of you`}
            </Text>
          </View>
        </View>
      </View>

      {/* Progress */}
      <View
        style={styles.progressContainer}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: progressPercent }}
      >
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressStyle]}>
            <LinearGradient
              colors={[colors.primary, colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressText}>Queue progress</Text>
          <Text style={styles.progressPercent}>{progressPercent}%</Text>
        </View>
      </View>

      {/* Info strip */}
      <View style={styles.infoStrip}>
        <InfoItem icon="hourglass-outline" tint={colors.primary} bg={colors.primaryLight} label="Est. wait" value={`~${waitMinutes} min`} />
        <View style={styles.infoDivider} />
        <InfoItem icon="business-outline" tint={colors.accentText} bg={colors.accentLight} label="Location" value={room} />
        <View style={styles.infoDivider} />
        <InfoItem
          icon="medkit-outline"
          tint={colors.warningText}
          bg={colors.warningLight}
          label="Doctor"
          value={doctorName.replace('Dr. ', '')}
        />
      </View>

      <Button
        title="View slip & live queue"
        onPress={onPress ?? (() => {})}
        disabled={!onPress}
        iconName="receipt-outline"
        size="md"
        style={styles.actionButton}
      />
    </View>
  );
};

const InfoItem: React.FC<{ icon: string; tint: string; bg: string; label: string; value: string }> = ({
  icon,
  tint,
  bg,
  label,
  value,
}) => (
  <View style={styles.infoCol} accessible accessibilityLabel={`${label}: ${value}`}>
    <View style={[styles.infoIcon, { backgroundColor: bg }]}>
      <Icon name={icon} size={14} color={tint} />
    </View>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text numberOfLines={1} style={styles.infoValue}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.medium,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    gap: 7,
  },
  pulseContainer: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  liveText: {
    ...typography.overline,
    fontSize: 10,
    color: colors.successText,
  },
  simulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 32,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    borderRadius: borderRadius.round,
    gap: 5,
  },
  simulateBtnDisabled: {
    opacity: 0.5,
  },
  simulateText: {
    ...typography.captionBold,
    fontSize: 11,
    color: colors.primary,
  },
  facilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: spacing.md,
  },
  facilityText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  numbersRow: {
    flexDirection: 'row',
    gap: spacing.sm + 2,
    marginBottom: spacing.lg,
  },
  tokenTile: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'flex-start',
  },
  servingTile: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'flex-start',
  },
  servingTileTurn: {
    backgroundColor: colors.successLight,
    borderColor: colors.successLight,
  },
  tileLabel: {
    ...typography.overline,
    fontSize: 10,
    color: colors.textSecondary,
  },
  tileLabelInverse: {
    ...typography.overline,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  tokenNumber: {
    ...typography.display,
    fontSize: 40,
    lineHeight: 48,
    color: colors.white,
    marginTop: 2,
  },
  hashInverse: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  servingNumber: {
    ...typography.display,
    fontSize: 40,
    lineHeight: 48,
    color: colors.textPrimary,
    marginTop: 2,
  },
  servingNumberTurn: {
    color: colors.successText,
  },
  hash: {
    fontSize: 24,
    color: colors.textMuted,
  },
  tokenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.round,
    marginTop: spacing.xs,
  },
  tokenPillText: {
    ...typography.tiny,
    color: colors.white,
  },
  aheadPill: {
    backgroundColor: colors.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.round,
    marginTop: spacing.xs,
  },
  aheadPillTurn: {
    backgroundColor: colors.card,
  },
  aheadText: {
    ...typography.tiny,
    color: colors.warningText,
  },
  aheadTextTurn: {
    color: colors.successText,
  },
  progressContainer: {
    marginBottom: spacing.lg,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.backgroundSecondary,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs + 2,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  progressPercent: {
    ...typography.captionBold,
    color: colors.primary,
  },
  infoStrip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    marginBottom: spacing.md,
  },
  infoCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  infoDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.divider,
  },
  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs + 2,
  },
  infoLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.captionBold,
    color: colors.textPrimary,
    marginTop: 1,
  },
  actionButton: {
    marginTop: 0,
  },
});

export default LiveTokenCard;
