import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Review } from '../types';
import { colors, typography, spacing, borderRadius, motion } from '../theme';
import { Icon } from './Icon';

interface ReviewCardProps {
  review: Review;
  style?: StyleProp<ViewStyle>;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, style }) => {
  return (
    <View
      accessible
      accessibilityLabel={`${review.patientName}, rated ${review.rating.toFixed(1)} out of 5. ${review.comment}`}
      style={[styles.container, style]}
    >
      <View style={styles.headerRow}>
        <Image
          source={{ uri: review.patientPhoto }}
          style={styles.avatar}
          contentFit="cover"
          transition={motion.duration.base}
        />
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{review.patientName}</Text>
          <Text style={styles.date}>{review.date}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <Icon name="star" size={12} color={colors.star} />
          <Text style={styles.ratingText}>{review.rating.toFixed(1)}</Text>
        </View>
      </View>

      <Text style={styles.comment}>{review.comment}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
  },
  nameContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  date: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.round,
    gap: 3,
  },
  ratingText: {
    ...typography.captionBold,
    fontSize: 11,
    lineHeight: 14,
    color: colors.warningText,
  },
  comment: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});

export default ReviewCard;
