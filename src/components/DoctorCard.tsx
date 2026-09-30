import React from 'react';
import { Platform, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Doctor } from '../types';
import { colors, typography, spacing, borderRadius, shadows, motion } from '../theme';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';

interface DoctorCardProps {
  doctor: Doctor;
  onPress: () => void;
  onBookPress?: () => void;
  variant?: 'vertical' | 'horizontal';
  style?: StyleProp<ViewStyle>;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  onPress,
  onBookPress,
  variant = 'vertical',
  style,
}) => {
  const a11yLabel = `${doctor.name}, ${doctor.specialty}, rated ${doctor.rating.toFixed(1)}${
    doctor.isOnline ? ', available now' : ''
  }`;

  if (variant === 'horizontal') {
    // Horizontal carousel card (compact width)
    return (
      <PressableScale
        onPress={onPress}
        scaleTo={motion.pressScaleSubtle}
        accessibilityLabel={a11yLabel}
        accessibilityHint="Opens doctor profile"
        style={[styles.carouselCard, style]}
      >
        <View style={styles.carouselImageContainer}>
          <Image
            source={{ uri: doctor.photo }}
            style={styles.carouselImage}
            contentFit="cover"
            transition={motion.duration.base}
            recyclingKey={doctor.id}
            accessible={false}
          />
          {doctor.isOnline && (
            <View style={styles.onlinePill}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlinePillText}>Available</Text>
            </View>
          )}
          <View style={styles.ratingBadge}>
            <Icon name="star" size={11} color={colors.star} />
            <Text style={styles.ratingText}>{doctor.rating.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.carouselContent}>
          <View style={styles.nameRow}>
            <Text numberOfLines={1} style={styles.carouselName}>
              {doctor.name}
            </Text>
            {doctor.isVerified && (
              <Icon name="checkmark-circle" size={14} color={colors.primary} />
            )}
          </View>
          <Text numberOfLines={1} style={styles.specialtyText}>
            {doctor.specialty}
          </Text>
          <Text numberOfLines={1} style={styles.hospitalText}>
            {doctor.hospital}
          </Text>
          <View style={styles.priceRow}>
            <View style={styles.opdPill}>
              <Icon name="business" size={10} color={colors.primary} />
              <Text style={styles.opdPillText}>OPD</Text>
            </View>
            <Text style={styles.feeAmount}>Rs. {doctor.fees}</Text>
          </View>
        </View>
      </PressableScale>
    );
  }

  const handleBook = onBookPress || onPress;

  // Vertical list card (full width, detailed)
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={motion.pressScaleSubtle}
      // On web a "button" role renders <button>, which can't contain the Book button.
      accessibilityRole={Platform.OS === 'web' ? undefined : 'button'}
      accessibilityLabel={a11yLabel}
      accessibilityHint="Opens doctor profile"
      // An accessible parent hides the inner Book button from VoiceOver, so expose it as an action.
      accessibilityActions={[{ name: 'activate' }, { name: 'book', label: 'Book token' }]}
      onAccessibilityAction={(event) =>
        event.nativeEvent.actionName === 'book' ? handleBook() : onPress()
      }
      style={[styles.listCard, style]}
    >
      <View style={styles.cardHeaderRow}>
        <View>
          <Image
            source={{ uri: doctor.photo }}
            style={styles.doctorImage}
            contentFit="cover"
            transition={motion.duration.base}
            recyclingKey={doctor.id}
            accessible={false}
          />
          {doctor.isOnline && <View style={styles.onlineBadgeLarge} />}
        </View>

        <View style={styles.infoWrapper}>
          <View style={styles.nameVerifiedRow}>
            <Text numberOfLines={1} style={styles.doctorName}>
              {doctor.name}
            </Text>
            {doctor.isVerified && (
              <Icon name="checkmark-circle" size={16} color={colors.primary} />
            )}
          </View>

          <Text style={styles.specialtyAndExp}>
            {doctor.specialty} • {doctor.experience} yrs exp
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={13} color={colors.star} />
              <Text style={styles.ratingValue}>{doctor.rating.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>({doctor.reviewsCount})</Text>
            </View>

            <View style={styles.dotSeparator} />

            <View style={styles.locationContainer}>
              <Icon name="location-outline" size={13} color={colors.textSecondary} />
              <Text numberOfLines={1} style={styles.locationDistance}>
                {doctor.distance}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardFooterRow}>
        <View>
          <Text style={styles.consultationFeeLabel}>OPD Token Fee</Text>
          <Text style={styles.consultationFee}>Rs. {doctor.fees}</Text>
        </View>

        <PressableScale
          onPress={handleBook}
          accessibilityLabel={`Book token with ${doctor.name}`}
          style={styles.bookNowButton}
        >
          <Icon name="ticket-outline" size={15} color={colors.white} />
          <Text style={styles.bookNowText}>Book Token</Text>
        </PressableScale>
      </View>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  // Horizontal Carousel Style
  carouselCard: {
    width: 172,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg + 2,
    padding: spacing.sm,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.card,
  },
  carouselImageContainer: {
    width: '100%',
    height: 124,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.primaryLight,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  onlinePill: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: borderRadius.round,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  onlinePillText: {
    ...typography.tiny,
    fontSize: 9,
    color: colors.successText,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: borderRadius.round,
  },
  ratingText: {
    ...typography.captionBold,
    fontSize: 11,
    lineHeight: 14,
    color: colors.textPrimary,
  },
  carouselContent: {
    paddingTop: spacing.sm + 2,
    paddingHorizontal: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  carouselName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  specialtyText: {
    ...typography.captionMedium,
    color: colors.primary,
    marginTop: 2,
  },
  hospitalText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  feeAmount: {
    ...typography.bodyBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  opdPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 3,
  },
  opdPillText: {
    ...typography.tiny,
    fontSize: 9,
    color: colors.primary,
  },

  // Vertical Detailed List Card
  listCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.card,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorImage: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryLight,
  },
  onlineBadgeLarge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.success,
    borderWidth: 3,
    borderColor: colors.card,
  },
  infoWrapper: {
    flex: 1,
    marginLeft: spacing.md + 2,
  },
  nameVerifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  doctorName: {
    ...typography.h3,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  specialtyAndExp: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingValue: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  reviewCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    marginHorizontal: spacing.sm,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  locationDistance: {
    ...typography.caption,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  consultationFeeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  consultationFee: {
    ...typography.h3,
    fontFamily: typography.h2.fontFamily,
    fontWeight: typography.h2.fontWeight,
    color: colors.textPrimary,
  },
  bookNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    ...shadows.primary,
  },
  bookNowText: {
    ...typography.captionBold,
    fontSize: 13,
    color: colors.white,
  },
});

export default DoctorCard;
