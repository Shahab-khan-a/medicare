import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
  Alert,
  TextInput,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Icon, DoctorCard, EmptyState, Header, HospitalLocationMap } from '../../components';
import { Hospital, Doctor } from '../../types';
import { useApp } from '../../context/AppContext';
import { hospitals as defaultHospitals } from '../../data';
import { openHospitalLocationInMaps } from '../../utils/mapUtils';

interface HospitalDetailScreenProps {
  navigation: any;
  route: any;
}

export const HospitalDetailScreen: React.FC<HospitalDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { doctors: allDoctors } = useApp();
  const { hospitalId, hospital: initialHospital } = route.params || {};

  // Resolve hospital
  const hospital: Hospital | undefined = useMemo(() => {
    if (initialHospital) return initialHospital;
    if (hospitalId) {
      return defaultHospitals.find((h) => h.id === hospitalId);
    }
    return defaultHospitals[0];
  }, [initialHospital, hospitalId]);

  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [doctorSearchQuery, setDoctorSearchQuery] = useState('');

  // Find all doctors affiliated with this hospital
  const hospitalDoctors = useMemo(() => {
    if (!hospital) return [];
    return allDoctors.filter((doc) => {
      if (doc.hospitalId && doc.hospitalId === hospital.id) return true;
      const docHosp = (doc.hospital || '').toLowerCase();
      const hName = (hospital.name || '').toLowerCase();
      return docHosp.includes(hName) || hName.includes(docHosp);
    });
  }, [allDoctors, hospital]);

  // Unique specializations available at this hospital
  const availableSpecializations = useMemo(() => {
    const specs = new Set<string>();
    hospitalDoctors.forEach((doc) => {
      if (doc.specialty) specs.add(doc.specialty);
    });
    return ['All', ...Array.from(specs)];
  }, [hospitalDoctors]);

  // Filtered doctors by selected specialization and search query
  const filteredDoctors = useMemo(() => {
    return hospitalDoctors.filter((doc) => {
      const matchSpecialty =
        selectedSpecialty === 'All' || doc.specialty.toLowerCase() === selectedSpecialty.toLowerCase();
      const query = doctorSearchQuery.trim().toLowerCase();
      const matchQuery =
        query.length === 0 ||
        doc.name.toLowerCase().includes(query) ||
        doc.specialty.toLowerCase().includes(query);
      return matchSpecialty && matchQuery;
    });
  }, [hospitalDoctors, selectedSpecialty, doctorSearchQuery]);

  if (!hospital) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Hospital" showBack onBack={() => navigation.goBack()} />
        <EmptyState
          icon="business-outline"
          title="Hospital Not Found"
          subtitle="The hospital you are looking for is not available."
          actionTitle="Go Back"
          onAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

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

  const handleShare = () => {
    Share.share({
      title: hospital.name,
      message: `${hospital.name}\n${hospital.address}, ${hospital.city}\nPhone: ${hospital.phone || 'N/A'}\nBook OPD and view specialists on MediCare app.`,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Hero Header with Hospital Image */}
      <View style={styles.heroContainer}>
        <Image
          source={{ uri: hospital.image }}
          style={styles.heroImage}
          contentFit="cover"
        />
        <View style={styles.heroOverlay} />

        {/* Floating Top Navigation */}
        <SafeAreaView style={styles.heroTopNav}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.circleNavBtn}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back" size={20} color={colors.white} />
          </TouchableOpacity>

          <View style={styles.topRightActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.circleNavBtn}
              onPress={handleShare}
            >
              <Icon name="share-social-outline" size={18} color={colors.white} />
            </TouchableOpacity>

            {hospital.phone && (
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.circleNavBtn, { backgroundColor: colors.primary }]}
                onPress={handleCall}
              >
                <Icon name="call" size={17} color={colors.white} />
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>

        {/* Hero Title & City Overlay */}
        <View style={styles.heroBottomContent}>
          <View style={styles.cityTag}>
            <Icon name="location-sharp" size={12} color={colors.white} />
            <Text style={styles.cityTagText}>{hospital.city}</Text>
          </View>

          <Text style={styles.heroTitle}>{hospital.name}</Text>

          <View style={styles.heroMetaRow}>
            <View style={styles.ratingBox}>
              <Icon name="star" size={13} color={colors.star} />
              <Text style={styles.heroRatingText}>{hospital.rating.toFixed(1)}</Text>
              {hospital.reviewsCount && (
                <Text style={styles.heroReviewsText}>({hospital.reviewsCount}+ reviews)</Text>
              )}
            </View>

            {hospital.emergencyAvailable && (
              <View style={styles.emergencyHeroBadge}>
                <View style={styles.redPulseDot} />
                <Text style={styles.emergencyHeroText}>24/7 Emergency</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Main Content Scroll */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hospital Location & Directions Card */}
        <View style={styles.locationCard}>
          <View style={styles.locationCardHeader}>
            <View style={styles.locationIconBox}>
              <Icon name="navigate" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationCardTitle}>Hospital Location</Text>
              <Text style={styles.locationFullAddress}>
                {hospital.address}, {hospital.city}, Pakistan
              </Text>
            </View>
          </View>

          {/* Interactive Hospital Map Preview */}
          <View style={styles.detailMapContainer}>
            <HospitalLocationMap
              hospitals={[hospital]}
              initialHospitalId={hospital.id}
              singleHospitalMode={true}
              showControls={true}
              showCityFilters={false}
              showSearchBar={false}
              showBottomCard={false}
              height={175}
            />
          </View>

          {/* Quick Location Action Buttons */}
          <View style={styles.locationActionsRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.getDirectionsButton}
              onPress={handleDirections}
            >
              <Icon name="navigate-outline" size={15} color={colors.white} />
              <Text style={styles.getDirectionsText}>Open in Google Maps</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.mapTabButton}
              onPress={() =>
                navigation.navigate('DoctorList', {
                  initialTab: 'map',
                  city: hospital.city,
                })
              }
            >
              <Icon name="map-outline" size={15} color={colors.primary} />
              <Text style={styles.mapTabButtonText}>Hospital Map</Text>
            </TouchableOpacity>

            {hospital.phone && (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.callHospitalButton}
                onPress={handleCall}
              >
                <Icon name="call-outline" size={15} color={colors.textPrimary} />
                <Text style={styles.callHospitalText}>{hospital.phone}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* OPD Hours & Token Service info */}
          <View style={styles.timingsRow}>
            <Icon name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.timingsText}>
              OPD Hours: Mon - Sat (08:00 AM - 08:00 PM) • Live Queue Active
            </Text>
          </View>
        </View>

        {/* Hospital Departments Chips */}
        {hospital.departments && hospital.departments.length > 0 && (
          <View style={styles.departmentsSection}>
            <Text style={styles.sectionTitle}>Departments</Text>
            <View style={styles.departmentsGrid}>
              {hospital.departments.map((dept, index) => (
                <View key={index} style={styles.deptBadge}>
                  <Icon name="checkmark-circle-outline" size={13} color={colors.primary} />
                  <Text style={styles.deptBadgeText}>{dept}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Doctors Section Header */}
        <View style={styles.doctorsSectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Doctors & Specializations ({hospitalDoctors.length})
            </Text>
            <Text style={styles.sectionSubtitle}>
              Consult with top verified specialists at {hospital.name}
            </Text>
          </View>
        </View>

        {/* Doctor Search & Specialization Filters */}
        <View style={styles.searchSpecialistBar}>
          <Icon name="search-outline" size={16} color={colors.textSecondary} />
          <TextInput
            placeholder="Filter by doctor name or specialty..."
            placeholderTextColor={colors.textMuted}
            value={doctorSearchQuery}
            onChangeText={setDoctorSearchQuery}
            style={styles.searchSpecialistInput}
          />
          {doctorSearchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setDoctorSearchQuery('')}>
              <Icon name="close-circle" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Specialization Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.specialtyScroll}
        >
          {availableSpecializations.map((spec) => {
            const isSelected = selectedSpecialty.toLowerCase() === spec.toLowerCase();
            return (
              <TouchableOpacity
                key={spec}
                activeOpacity={0.75}
                style={[
                  styles.specialtyPill,
                  isSelected && styles.specialtyPillActive,
                ]}
                onPress={() => setSelectedSpecialty(spec)}
              >
                {spec !== 'All' && (
                  <Icon
                    name="sparkles"
                    size={11}
                    color={isSelected ? colors.white : colors.primary}
                  />
                )}
                <Text
                  style={[
                    styles.specialtyPillText,
                    isSelected && styles.specialtyPillTextActive,
                  ]}
                >
                  {spec}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Doctor List */}
        <View style={styles.doctorListContainer}>
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doc: Doctor) => (
              <View key={doc.id} style={styles.doctorCardItem}>
                <DoctorCard
                  doctor={doc}
                  variant="vertical"
                  onPress={() => navigation.navigate('DoctorDetail', { doctorId: doc.id })}
                  onBookPress={() => navigation.navigate('BookAppointment', { doctor: doc })}
                />
              </View>
            ))
          ) : (
            <EmptyState
              icon="search-outline"
              title="No Specialists Found"
              subtitle={`No doctors found matching "${doctorSearchQuery || selectedSpecialty}" at ${hospital.name}.`}
              actionTitle="Show All Specialists"
              onAction={() => {
                setSelectedSpecialty('All');
                setDoctorSearchQuery('');
              }}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroContainer: {
    position: 'relative',
    height: 250,
    backgroundColor: colors.primaryDark,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  heroTopNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  circleNavBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroBottomContent: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.lg,
    right: spacing.lg,
  },
  cityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(2, 132, 199, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.round,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  cityTagText: {
    ...typography.tiny,
    fontSize: 11,
    color: colors.white,
    fontWeight: '700',
  },
  heroTitle: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
    lineHeight: 26,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroRatingText: {
    ...typography.captionBold,
    color: colors.white,
    fontWeight: '700',
  },
  heroReviewsText: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  emergencyHeroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.round,
  },
  redPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
  },
  emergencyHeroText: {
    ...typography.tiny,
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  locationCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
    marginBottom: spacing.lg,
  },
  locationCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  locationIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationCardTitle: {
    ...typography.captionBold,
    fontSize: 13,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationFullAddress: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 2,
    lineHeight: 20,
  },
  detailMapContainer: {
    height: 175,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginTop: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  getDirectionsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 40,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    ...shadows.primary,
  },
  getDirectionsText: {
    ...typography.captionBold,
    fontSize: 12,
    color: colors.white,
  },
  mapTabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    minHeight: 40,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.25)',
  },
  mapTabButtonText: {
    ...typography.captionBold,
    fontSize: 12,
    color: colors.primary,
  },
  callHospitalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 40,
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  callHospitalText: {
    ...typography.captionBold,
    fontSize: 12,
    color: colors.textPrimary,
  },
  timingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm + 2,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  timingsText: {
    ...typography.tiny,
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
  },
  departmentsSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  departmentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: spacing.sm,
  },
  deptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deptBadgeText: {
    ...typography.captionBold,
    fontSize: 11,
    color: colors.textPrimary,
  },
  doctorsSectionHeader: {
    marginBottom: spacing.sm,
  },
  searchSpecialistBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    gap: 8,
  },
  searchSpecialistInput: {
    flex: 1,
    ...typography.body,
    fontSize: 13,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  specialtyScroll: {
    gap: 8,
    paddingBottom: spacing.sm,
  },
  specialtyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.card,
    borderRadius: borderRadius.round,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  specialtyPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  specialtyPillText: {
    ...typography.captionBold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  specialtyPillTextActive: {
    color: colors.white,
  },
  doctorListContainer: {
    marginTop: spacing.sm,
  },
  doctorCardItem: {
    marginBottom: spacing.sm,
  },
});

export default HospitalDetailScreen;
