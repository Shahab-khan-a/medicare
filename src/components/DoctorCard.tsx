import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Doctor } from '../types';
import { colors, typography } from '../theme';
import { Icon } from './Icon';

interface DoctorCardProps { doctor: Doctor; onPress: () => void; onBookPress?: () => void; variant?: 'vertical' | 'horizontal'; style?: StyleProp<ViewStyle> }
export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onPress, onBookPress, variant = 'vertical', style }) => (
  <View style={[styles.card, variant === 'horizontal' && { width: 280, marginRight: 12 }, style]}>
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel={doctor.name + ', ' + doctor.specialty + ', ' + doctor.rating.toFixed(1) + ' stars. View profile.'}>
      <View style={styles.row}>
        <Image source={{ uri: doctor.photo }} style={styles.photo} contentFit="cover" recyclingKey={doctor.id} />
        <View style={styles.info}>
          <View style={styles.nameRow}><Text style={styles.name}>{doctor.name}</Text>{doctor.isVerified && <Icon name="checkmark-circle" size={17} color={colors.primary} />}</View>
          <Text style={styles.specialty}>{doctor.specialty}</Text>
          <Text style={styles.meta}>{doctor.experience} years of experience</Text>
          <View style={styles.ratingRow}><Icon name="star" size={13} color={colors.star} /><Text style={styles.rating}>{doctor.rating.toFixed(1)}</Text><Text style={styles.meta}>({doctor.reviewsCount} reviews)</Text></View>
        </View>
      </View>
      <View style={styles.hospital}><Icon name="location-outline" size={15} color={colors.textSecondary} /><Text style={[styles.meta, { flex: 1 }]}>{doctor.hospital}{doctor.city ? ' · ' + doctor.city : ''}</Text><Icon name="chevron-forward" size={16} color={colors.textSecondary} /></View>
    </TouchableOpacity>
    <View style={styles.footer}>
      <View><Text style={styles.feeLabel}>Consultation fee</Text><Text style={styles.fee}>Rs. {doctor.fees.toLocaleString()}</Text></View>
      <TouchableOpacity style={styles.book} onPress={onBookPress || onPress} accessibilityRole="button" accessibilityLabel={'Book a visit with ' + doctor.name}><Text style={styles.bookText}>Book visit</Text><Icon name="arrow-forward" size={16} color={colors.primary} /></TouchableOpacity>
    </View>
  </View>
);
const styles = StyleSheet.create({
  card: { padding: 17, backgroundColor: colors.white, borderRadius: 20, borderWidth: 1, borderColor: colors.border, marginBottom: 14 }, row: { flexDirection: 'row', gap: 13 }, photo: { width: 70, height: 80, borderRadius: 15, backgroundColor: colors.primaryLight }, info: { flex: 1, minWidth: 0 }, nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 }, name: { ...typography.bodyBold, color: colors.textPrimary, flexShrink: 1 }, specialty: { ...typography.captionMedium, color: colors.primary, marginTop: 3 }, meta: { ...typography.caption, color: colors.textSecondary, marginTop: 3 }, ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 }, rating: { ...typography.captionBold, color: colors.textPrimary }, hospital: { flexDirection: 'row', gap: 5, alignItems: 'center', marginTop: 15 }, footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: 13, marginTop: 13 }, feeLabel: { ...typography.tiny, color: colors.textSecondary }, fee: { ...typography.bodyBold, color: colors.textPrimary, marginTop: 3 }, book: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 44, paddingHorizontal: 16, borderRadius: 12, backgroundColor: colors.primaryLight }, bookText: { ...typography.captionBold, color: colors.primary },
});
export default DoctorCard;
