import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Icon from '../../components/Icon';
import Button from '../../components/Button';
import ReviewCard from '../../components/ReviewCard';
import TimeSlotChip from '../../components/TimeSlotChip';
import { Doctor } from '../../types';
import { useApp } from '../../context/AppContext';

interface DoctorDetailScreenProps {
  navigation: any;
  route: any;
}

const getUpcomingDays = () => {
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    days.push({
      day: i === 0 ? 'Today' : dayNames[d.getDay()],
      date: String(d.getDate()).padStart(2, '0'),
      fullDate: `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]}`,
    });
  }
  return days;
};

const consultationSlots = [
  { time: '09:00 AM', isAvailable: true },
  { time: '09:30 AM', isAvailable: false },
  { time: '10:00 AM', isAvailable: true },
  { time: '10:30 AM', isAvailable: true },
  { time: '11:00 AM', isAvailable: false },
  { time: '11:30 AM', isAvailable: true },
  { time: '02:00 PM', isAvailable: true },
  { time: '02:30 PM', isAvailable: true },
  { time: '03:00 PM', isAvailable: false },
  { time: '04:00 PM', isAvailable: true },
  { time: '04:30 PM', isAvailable: true },
  { time: '05:00 PM', isAvailable: false },
];

export const DoctorDetailScreen: React.FC<DoctorDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { doctors, reviews } = useApp();
  const upcomingDays = getUpcomingDays();
  const doctorId = route?.params?.doctorId || 'doc-1';
  const doctor: Doctor = doctors.find((d) => d.id === doctorId) || doctors[0];

  const [activeTab, setActiveTab] = useState<'About' | 'Availability' | 'Reviews'>('About');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00 AM');
  const [isFavorite, setIsFavorite] = useState(false);

  const doctorReviews = reviews.filter((r) => r.doctorId === doctor.id);
  const displayReviews = doctorReviews.length > 0 ? doctorReviews : reviews.slice(0, 3);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Book a consultation with ${doctor.name} (${doctor.specialty}) on MediCare app!`,
      });
    } catch (e) {}
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Large Header Image Section */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: doctor.photo }} style={styles.doctorLargePhoto} />
          <View style={styles.imageOverlay} />

          <SafeAreaView style={styles.navBar}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.goBack()}
              style={styles.circleButton}
            >
              <Icon name="arrow-back" size={22} color={colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.navRight}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleShare}
                style={styles.circleButton}
              >
                <Icon name="share-social-outline" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsFavorite(!isFavorite)}
                style={styles.circleButton}
              >
                <Icon
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isFavorite ? colors.error : colors.textPrimary}
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* Doctor Info Card (Overlapping) */}
        <View style={styles.mainInfoCard}>
          <View style={styles.nameHeader}>
            <View style={styles.nameRow}>
              <Text style={styles.doctorName}>{doctor.name}</Text>
              {doctor.isVerified && (
                <Icon name="checkmark-circle" size={20} color={colors.primary} />
              )}
            </View>
            <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
            {doctor.isVerified && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Icon name="shield-checkmark" size={14} color={colors.success} />
                <Text style={{ fontSize: 11, color: colors.successText, fontWeight: '700' }}>
                  PMC Verified Physician {doctor.medicalLicenseNumber ? `• Reg #${doctor.medicalLicenseNumber}` : ''}
                </Text>
              </View>
            )}
            <View style={styles.hospitalRow}>
              <Icon name="business-outline" size={15} color={colors.textSecondary} />
              <Text style={styles.hospitalText}>{doctor.hospital}</Text>
            </View>
          </View>

          {/* 4 Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <View style={[styles.statIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Icon name="star" size={16} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>{doctor.rating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>

            <View style={styles.statBox}>
              <View style={[styles.statIconCircle, { backgroundColor: colors.primaryLight }]}>
                <Icon name="chatbubble-ellipses-outline" size={16} color={colors.primary} />
              </View>
              <Text style={styles.statValue}>{doctor.reviewsCount}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>

            <View style={styles.statBox}>
              <View style={[styles.statIconCircle, { backgroundColor: colors.accentLight }]}>
                <Icon name="ribbon-outline" size={16} color={colors.accent} />
              </View>
              <Text style={styles.statValue}>{doctor.experience}+ yrs</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>

            <View style={styles.statBox}>
              <View style={[styles.statIconCircle, { backgroundColor: '#EDE9FE' }]}>
                <Icon name="people-outline" size={16} color="#8B5CF6" />
              </View>
              <Text style={styles.statValue}>{doctor.patientsCount}+</Text>
              <Text style={styles.statLabel}>Patients</Text>
            </View>
          </View>
        </View>

        {/* Tab Selection */}
        <View style={styles.tabsRow}>
          {(['About', 'Availability', 'Reviews'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.8}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab 1: About */}
        {activeTab === 'About' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeading}>Biography</Text>
            <Text style={styles.bioText}>{doctor.bio}</Text>

            <Text style={styles.sectionHeading}>Qualifications</Text>
            {doctor.qualifications.map((q, idx) => (
              <View key={idx} style={styles.bulletItem}>
                <Icon name="checkmark-done" size={16} color={colors.primary} />
                <Text style={styles.bulletText}>{q}</Text>
              </View>
            ))}

            <Text style={styles.sectionHeading}>Languages</Text>
            <View style={styles.languageTags}>
              {doctor.languages.map((lang, idx) => (
                <View key={idx} style={styles.langPill}>
                  <Text style={styles.langText}>{lang}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionHeading}>Clinic Location</Text>
            <View style={styles.locationCard}>
              <View style={styles.locIconWrapper}>
                <Icon name="location-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.locDetails}>
                <Text style={styles.locTitle}>{doctor.hospital}</Text>
                <Text style={styles.locAddress}>{doctor.location}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Tab 2: Availability */}
        {activeTab === 'Availability' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeading}>Select Date</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.daysScroll}
            >
              {upcomingDays.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.75}
                  onPress={() => setSelectedDayIndex(idx)}
                  style={[
                    styles.dayChip,
                    selectedDayIndex === idx && styles.dayChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      selectedDayIndex === idx && styles.dayTextActive,
                    ]}
                  >
                    {item.day}
                  </Text>
                  <Text
                    style={[
                      styles.dateText,
                      selectedDayIndex === idx && styles.dateTextActive,
                    ]}
                  >
                    {item.date}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionHeading}>Morning & Afternoon Slots</Text>
            <View style={styles.slotsGrid}>
              {consultationSlots.map((slot, idx) => (
                <TimeSlotChip
                  key={idx}
                  time={slot.time}
                  isAvailable={slot.isAvailable}
                  isSelected={selectedTimeSlot === slot.time}
                  onPress={() => setSelectedTimeSlot(slot.time)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Tab 3: Reviews */}
        {activeTab === 'Reviews' && (
          <View style={styles.tabContent}>
            <View style={styles.reviewSummaryCard}>
              <View style={styles.ratingBigCol}>
                <Text style={styles.ratingBigNumber}>{doctor.rating.toFixed(1)}</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Icon key={s} name="star" size={16} color="#F59E0B" />
                  ))}
                </View>
                <Text style={styles.ratingBigCount}>Based on {doctor.reviewsCount} reviews</Text>
              </View>
            </View>

            {displayReviews.map((rev) => (
              <ReviewCard key={rev.id} review={rev} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <SafeAreaView style={styles.bottomBarSafe}>
        <View style={styles.bottomBar}>
          <View style={styles.feesSection}>
            <Text style={styles.feesLabel}>Consultation Fee</Text>
            <Text style={styles.feesAmount}>Rs. {doctor.fees}</Text>
          </View>

          <View style={styles.bookButtonContainer}>
            <Button
              title="Book Appointment"
              onPress={() =>
                navigation.navigate('BookAppointment', {
                  doctor,
                  selectedDate: upcomingDays[selectedDayIndex].fullDate,
                  selectedTime: selectedTimeSlot,
                })
              }
              size="lg"
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  doctorLargePhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  circleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  mainInfoCard: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginTop: -36,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  nameHeader: {
    marginBottom: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  doctorName: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  doctorSpecialty: {
    ...typography.bodyMedium,
    color: colors.primary,
    marginTop: 2,
  },
  hospitalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  hospitalText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
    marginTop: 1,
  },
  tabsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.white,
  },
  tabContent: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionHeading: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  bioText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  bulletText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  languageTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  langPill: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.round,
  },
  langText: {
    ...typography.captionBold,
    color: colors.primary,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  locIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locDetails: {
    flex: 1,
  },
  locTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  locAddress: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  daysScroll: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  dayChip: {
    width: 64,
    height: 74,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    borderWidth: 1.2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  dayTextActive: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  dateText: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: 4,
  },
  dateTextActive: {
    color: colors.white,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  reviewSummaryCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ratingBigCol: {
    alignItems: 'center',
  },
  ratingBigNumber: {
    ...typography.h1,
    fontSize: 40,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginVertical: 4,
  },
  ratingBigCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  bottomBarSafe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  feesSection: {
    marginRight: spacing.md,
  },
  feesLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  feesAmount: {
    ...typography.h2,
    color: colors.primaryDark,
  },
  bookButtonContainer: {
    flex: 1,
  },
});

export default DoctorDetailScreen;
