import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StyleProp,
  ViewStyle,
  Linking,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { Hospital, Doctor } from '../types';
import { colors, typography, spacing, borderRadius, shadows, motion } from '../theme';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { useApp } from '../context/AppContext';
import { openHospitalLocationInMaps } from '../utils/mapUtils';

interface HospitalCardProps {
  hospital: Hospital;
  onPress: () => void;
  onViewDoctors?: () => void;
  onDoctorPress?: (doctor: Doctor) => void;
  onBookDoctor?: (doctor: Doctor) => void;
  onViewOnMap?: () => void;
  style?: StyleProp<ViewStyle>;
  initiallyExpanded?: boolean;
}

export const HospitalCard: React.FC<HospitalCardProps> = ({
  hospital,
  onPress,
  onViewDoctors,
  onDoctorPress,
  onBookDoctor,
  onViewOnMap,
  style,
  initiallyExpanded = false,
}) => {
  const { doctors: allDoctors } = useApp();
  const [showDoctorsList, setShowDoctorsList] = useState(initiallyExpanded);

  // Match doctors affiliated with this hospital
  const hospitalDoctors = React.useMemo(() => {
    return allDoctors.filter((doc) => {
      if (doc.hospitalId && doc.hospitalId === hospital.id) return true;
      const docHosp = doc.hospital.toLowerCase();
      const hName = hospital.name.toLowerCase();
      return docHosp.includes(hName) || hName.includes(docHosp);
    });
  }, [allDoctors, hospital]);

  const handleCall = () => {
    if (hospital.phone) {
      Linking.openURL(`tel:${hospital.phone.replace(/\s+/g, '')}`).catch(() => {
        Alert.alert('Unable to call', `Hospital phone: ${hospital.phone}`);
      });
    }
  };

  const handleDirections = () => {
    openHospitalLocationInMaps(
      hospital.name,
      hospital.address,
      hospital.city,
      hospital.latitude,
      hospital.longitude
    );
  };

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={motion.pressScaleSubtle}
      style={[styles.card, style]}
    >
      {/* Hospital Image & Badges */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: hospital.image }}
          style={styles.image}
          contentFit="cover"
          transition={motion.duration.base}
        />
        <View style={styles.cityBadge}>
          <Icon name="location" size={11} color={colors.white} />
          <Text style={styles.cityBadgeText}>{hospital.city}</Text>
        </View>

        {hospital.emergencyAvailable && (
          <View style={styles.emergencyPill}>
            <View style={styles.redPulseDot} />
            <Text style={styles.emergencyPillText}>24/7 Emergency</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {/* Hospital Name & Rating */}
        <View style={styles.headerRow}>
          <Text numberOfLines={1} style={styles.hospitalName}>
            {hospital.name}
          </Text>
        </View>

        {/* Hospital Location with Directions */}
        <View style={styles.locationContainer}>
          <View style={styles.addressRow}>
            <View style={styles.locationPinIconBox}>
              <Icon name="navigate-circle" size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={2} style={styles.addressText}>
                {hospital.address}, {hospital.city}
              </Text>
            </View>
          </View>
        </View>

        {/* Meta Stats: Rating + OPD Status + Doctor Count */}
        <View style={styles.metaRow}>
          <View style={styles.ratingBadge}>
            <Icon name="star" size={12} color={colors.star} />
            <Text style={styles.ratingText}>{hospital.rating.toFixed(1)}</Text>
            {hospital.reviewsCount && (
              <Text style={styles.reviewsText}>({hospital.reviewsCount}+ reviews)</Text>
            )}
          </View>

          <View style={styles.dotDivider} />

          <View style={styles.opdBadge}>
            <Icon name="checkmark-circle" size={12} color={colors.success} />
            <Text style={styles.opdText}>OPD Active</Text>
          </View>

          {hospitalDoctors.length > 0 && (
            <>
              <View style={styles.dotDivider} />
              <View style={styles.doctorsCountBadge}>
                <Icon name="people" size={12} color={colors.primary} />
                <Text style={styles.doctorsCountText}>
                  {hospitalDoctors.length} {hospitalDoctors.length === 1 ? 'Doctor' : 'Doctors'}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Departments / Specializations Tags */}
        {hospital.departments && hospital.departments.length > 0 && (
          <View style={styles.departmentsRow}>
            {hospital.departments.slice(0, 3).map((dept, idx) => (
              <View key={idx} style={styles.deptChip}>
                <Text style={styles.deptChipText}>{dept}</Text>
              </View>
            ))}
            {hospital.departments.length > 3 && (
              <View style={styles.deptMoreChip}>
                <Text style={styles.deptMoreText}>+{hospital.departments.length - 3}</Text>
              </View>
            )}
          </View>
        )}

        {/* Doctors with Specialization Preview / Accordion */}
        {hospitalDoctors.length > 0 && (
          <View style={styles.doctorsAccordionContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.doctorsAccordionHeader}
              onPress={() => setShowDoctorsList(!showDoctorsList)}
            >
              <View style={styles.doctorsHeaderTitleRow}>
                <Icon name="medkit-outline" size={14} color={colors.primary} />
                <Text style={styles.doctorsAccordionTitle}>
                  Doctors & Specializations ({hospitalDoctors.length})
                </Text>
              </View>
              <View style={styles.togglePill}>
                <Text style={styles.togglePillText}>
                  {showDoctorsList ? 'Hide' : 'Show List'}
                </Text>
                <Icon
                  name={showDoctorsList ? 'chevron-up' : 'chevron-down'}
                  size={12}
                  color={colors.primary}
                />
              </View>
            </TouchableOpacity>

            {/* Doctors List with Specialization */}
            {showDoctorsList ? (
              <View style={styles.doctorsListWrapper}>
                {hospitalDoctors.map((doc) => (
                  <View key={doc.id} style={styles.docItemCard}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.docItemLeft}
                      onPress={() => onDoctorPress ? onDoctorPress(doc) : onPress()}
                    >
                      <Image
                        source={{ uri: doc.photo }}
                        style={styles.docAvatar}
                        contentFit="cover"
                      />
                      <View style={styles.docItemInfo}>
                        <View style={styles.docNameRow}>
                          <Text numberOfLines={1} style={styles.docName}>
                            {doc.name}
                          </Text>
                          {doc.isVerified && (
                            <Icon name="checkmark-circle" size={13} color={colors.primary} />
                          )}
                        </View>

                        {/* Specialization Badge */}
                        <View style={styles.specialtyBadge}>
                          <Icon name="sparkles" size={10} color={colors.primary} />
                          <Text style={styles.specialtyBadgeText}>
                            {doc.specialty}
                          </Text>
                        </View>

                        <Text style={styles.docSubInfo}>
                          {doc.experience} yrs exp • Rs. {doc.fees}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {onBookDoctor && (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.docBookBtn}
                        onPress={() => onBookDoctor(doc)}
                      >
                        <Text style={styles.docBookBtnText}>Book</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              /* Compact Specializations Pills when collapsed */
              <View style={styles.specialtiesSummaryRow}>
                {hospitalDoctors.slice(0, 3).map((doc, idx) => (
                  <View key={idx} style={styles.summarySpecialtyPill}>
                    <Text style={styles.summarySpecialtyText}>
                      {doc.name.split(' ')[1] || doc.name} ({doc.specialty})
                    </Text>
                  </View>
                ))}
                {hospitalDoctors.length > 3 && (
                  <Text style={styles.moreSpecialtiesText}>
                    +{hospitalDoctors.length - 3} more
                  </Text>
                )}
              </View>
            )}
          </View>
        )}

        <View style={styles.divider} />

        {/* Action Buttons: Map, Directions, Call, View Doctors */}
        <View style={styles.actionsRow}>
          {/* View on Map pill */}
          {onViewOnMap && (
            <PressableScale
              onPress={onViewOnMap}
              style={styles.mapBtn}
              accessibilityLabel={`View ${hospital.name} on map`}
            >
              <Icon name="map-outline" size={14} color={colors.primary} />
              <Text style={styles.mapBtnText}>Map</Text>
            </PressableScale>
          )}

          <PressableScale
            onPress={handleDirections}
            style={styles.directionsBtn}
            accessibilityLabel={`Get directions to ${hospital.name}`}
          >
            <Icon name="navigate-outline" size={14} color={colors.primary} />
            <Text style={styles.directionsBtnText}>Directions</Text>
          </PressableScale>

          {hospital.phone && (
            <PressableScale
              onPress={handleCall}
              style={styles.callButton}
              accessibilityLabel={`Call ${hospital.name}`}
            >
              <Icon name="call-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.callButtonText}>Call</Text>
            </PressableScale>
          )}

          <PressableScale
            onPress={onViewDoctors || onPress}
            style={styles.viewDoctorsBtn}
            accessibilityLabel={`View hospital details and specialists at ${hospital.name}`}
          >
            <Icon name="business-outline" size={14} color={colors.white} />
            <Text style={styles.viewDoctorsText}>Details</Text>
          </PressableScale>
        </View>
      </View>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.card,
  },
  imageContainer: {
    width: '100%',
    height: 130,
    backgroundColor: colors.primaryLight,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cityBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.round,
  },
  cityBadgeText: {
    ...typography.captionBold,
    fontSize: 11,
    color: colors.white,
  },
  emergencyPill: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(254, 242, 242, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  redPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.error,
  },
  emergencyPillText: {
    ...typography.tiny,
    fontSize: 10,
    fontWeight: '700',
    color: colors.error,
  },
  content: {
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hospitalName: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  locationContainer: {
    marginTop: 6,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  locationPinIconBox: {
    marginTop: 1,
  },
  addressText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  reviewsText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  dotDivider: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    marginHorizontal: 6,
  },
  opdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  opdText: {
    ...typography.tiny,
    fontSize: 11,
    fontWeight: '600',
    color: colors.successText,
  },
  doctorsCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  doctorsCountText: {
    ...typography.tiny,
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  departmentsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  deptChip: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deptChipText: {
    ...typography.tiny,
    fontSize: 10,
    color: colors.textSecondary,
  },
  deptMoreChip: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  deptMoreText: {
    ...typography.tiny,
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  doctorsAccordionContainer: {
    marginTop: 10,
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  doctorsAccordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  doctorsHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  doctorsAccordionTitle: {
    ...typography.captionBold,
    color: colors.textPrimary,
    fontSize: 12,
  },
  togglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  togglePillText: {
    ...typography.tiny,
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  doctorsListWrapper: {
    marginTop: spacing.sm,
    gap: 8,
  },
  docItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  docItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  docAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceMuted,
  },
  docItemInfo: {
    flex: 1,
  },
  docNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  docName: {
    ...typography.captionBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  specialtyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
    marginTop: 2,
  },
  specialtyBadgeText: {
    ...typography.tiny,
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  docSubInfo: {
    ...typography.tiny,
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  docBookBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
    marginLeft: 6,
  },
  docBookBtnText: {
    ...typography.tiny,
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
  specialtiesSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 6,
  },
  summarySpecialtyPill: {
    backgroundColor: colors.card,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summarySpecialtyText: {
    ...typography.tiny,
    fontSize: 10,
    color: colors.textSecondary,
  },
  moreSpecialtiesText: {
    ...typography.tiny,
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    flexWrap: 'wrap',
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 36,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  mapBtnText: {
    ...typography.captionBold,
    fontSize: 12,
    color: colors.primary,
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 36,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  directionsBtnText: {
    ...typography.captionBold,
    fontSize: 12,
    color: colors.primary,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 36,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  callButtonText: {
    ...typography.captionBold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  viewDoctorsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    minHeight: 36,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    ...shadows.primary,
  },
  viewDoctorsText: {
    ...typography.captionBold,
    fontSize: 12,
    color: colors.white,
  },
});

export default HospitalCard;
