import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Icon from '../../components/Icon';
import CategoryChip from '../../components/CategoryChip';
import DoctorCard from '../../components/DoctorCard';
import AppointmentCard from '../../components/AppointmentCard';
import LiveTokenCard from '../../components/LiveTokenCard';
import { LinearGradient } from '../../components/LinearGradient';
import { categories } from '../../data';
import { useApp } from '../../context/AppContext';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { appointments, queueStatus, checkInPatient, doctors, currentUser } = useApp();
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState('');

  // Top rated doctors (sorted by rating descending)
  const topDoctors = [...doctors].sort((a, b) => b.rating - a.rating).slice(0, 5);

  // Nearby doctors
  const nearbyDoctors = doctors.slice(0, 4);

  // Single upcoming appointment from live store
  const upcomingAppointment = appointments.find(
    (a) =>
      a.status !== 'Completed' &&
      a.status !== 'completed' &&
      a.status !== 'Cancelled' &&
      a.status !== 'cancelled' &&
      a.status !== 'No Show'
  );

  const hasActiveToken =
    (queueStatus.userToken > 0) ||
    Boolean(upcomingAppointment?.tokenNumber);

  const activeTokenNumber =
    queueStatus.userToken > 0
      ? queueStatus.userToken
      : upcomingAppointment?.tokenNumber || 0;

  const activeDoctorName =
    upcomingAppointment?.doctorName ||
    (queueStatus.userToken > 0 ? queueStatus.doctorName : 'OPD Specialist');

  const activeRoom =
    upcomingAppointment?.opdRoom ||
    `${queueStatus.room} • Central Clinic`;

  const activeShift = upcomingAppointment?.shift || queueStatus.shift;
  const activeServing =
    upcomingAppointment?.currentServingNumber !== undefined
      ? upcomingAppointment.currentServingNumber
      : queueStatus.currentServing;
  const activeWaitMinutes =
    upcomingAppointment?.estimatedWaitMinutes !== undefined
      ? upcomingAppointment.estimatedWaitMinutes
      : queueStatus.estimatedWaitMinutes;


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Hero Header with Gradient only */}
      <LinearGradient
        colors={['#0A1428', '#0F172A', '#0A1428']}
        style={styles.heroBackground}
      >
        <SafeAreaView style={styles.heroSafeArea}>
            {/* Top Bar */}
            <View style={styles.topBar}>
              <View style={styles.hospitalBrandRow}>
                <View style={styles.brandIconBox}>
                  <Icon name="pulse" size={18} color="#38BDF8" />
                </View>
                <View>
                  <Text style={styles.brandTitle}>MediCare Clinic OPD</Text>
                  <Text style={styles.brandSubtitle}>Central Hospital Network</Text>
                </View>
              </View>

              <View style={styles.topRightActions}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => navigation.navigate('Notifications')}
                  style={styles.headerIconBtn}
                >
                  <Icon name="notifications-outline" size={19} color={colors.white} />
                  <View style={styles.badgeDot} />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => navigation.navigate('Profile')}
                  style={styles.profileAvatarWrapper}
                >
                  <Image
                    source={{
                      uri:
                        currentUser?.photoUrl ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
                    }}
                    style={styles.profileAvatar}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Greeting & Location */}
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>
                {currentUser?.name
                  ? `${new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening'}, ${currentUser.name.split(' ')[0]} 👋`
                  : 'Welcome to MediCare 👋'}
              </Text>
              <View style={styles.locationBadge}>
                <Icon name="business" size={13} color="#38BDF8" />
                <Text style={styles.locationText}>Main Hospital OPD • Room #204 Active</Text>
              </View>
            </View>

            {/* Medical Quick Action Icons — Premium Grid */}
            <View style={styles.quickActionsGrid}>
              {[
                {
                  icon: 'calendar',
                  label: 'Book Token',
                  color: '#38BDF8',
                  bg: 'rgba(2, 132, 199, 0.25)',
                  glow: 'rgba(56, 189, 248, 0.4)',
                  border: 'rgba(56, 189, 248, 0.35)',
                  onPress: () => navigation.navigate('DoctorList'),
                },
                {
                  icon: 'speedometer',
                  label: 'Live Queue',
                  color: '#4ADE80',
                  bg: 'rgba(16, 185, 129, 0.2)',
                  glow: 'rgba(74, 222, 128, 0.35)',
                  border: 'rgba(74, 222, 128, 0.3)',
                  onPress: () => navigation.navigate('LiveQueueTracker'),
                },
                {
                  icon: 'receipt',
                  label: 'OPD Slips',
                  color: '#FBBF24',
                  bg: 'rgba(245, 158, 11, 0.2)',
                  glow: 'rgba(251, 191, 36, 0.35)',
                  border: 'rgba(251, 191, 36, 0.3)',
                  onPress: () => navigation.navigate('MyAppointments'),
                },
                {
                  icon: 'document-text',
                  label: 'My Rx',
                  color: '#C084FC',
                  bg: 'rgba(139, 92, 246, 0.2)',
                  glow: 'rgba(192, 132, 252, 0.35)',
                  border: 'rgba(192, 132, 252, 0.3)',
                  onPress: () => navigation.navigate('Prescription', { prescriptionId: 'rx-101' }),
                },
              ].map((action, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.75}
                  onPress={action.onPress}
                  style={styles.quickActionItem}
                >
                  <View
                    style={[
                      styles.quickActionIconBox,
                      {
                        backgroundColor: action.bg,
                        borderColor: action.border,
                        shadowColor: action.glow,
                      },
                    ]}
                  >
                    <Icon name={action.icon} size={22} color={action.color} />
                  </View>
                  <Text style={styles.quickActionLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Frosted Glass Search Bar */}
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.searchBar}
              onPress={() => navigation.navigate('DoctorList')}
            >
              <Icon name="search-outline" size={20} color="#94A3B8" />
              <TextInput
                placeholder="Search physical OPD doctors, departments..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
                onFocus={() => navigation.navigate('DoctorList')}
              />
              <View style={styles.filterBtn}>
                <Icon name="options-outline" size={16} color={colors.white} />
              </View>
            </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Live OPD Token Queue Banner */}
        {hasActiveToken ? (
          <View style={styles.liveTokenSection}>
            <LiveTokenCard
              tokenNumber={activeTokenNumber}
              currentServing={activeServing}
              estimatedWaitMinutes={activeWaitMinutes}
              doctorName={activeDoctorName}
              room={activeRoom}
              shift={activeShift}
              onPress={() => navigation.navigate('LiveQueueTracker')}
            />
          </View>
        ) : (
          <View style={styles.liveTokenSection}>
            <LinearGradient
              colors={['#0F172A', '#1E293B']}
              style={styles.noTokenCard}
            >
              <View style={styles.noTokenHeader}>
                <View style={styles.liveBadgeGreen}>
                  <View style={styles.greenPulseDot} />
                  <Text style={styles.greenBadgeText}>OPD Live Today</Text>
                </View>
                <Text style={styles.noTokenTimeText}>Central Clinic</Text>
              </View>
              <Text style={styles.noTokenTitle}>No Active OPD Token</Text>
              <Text style={styles.noTokenSubtitle}>
                Skip the physical hospital waiting lines. Book an in-clinic consultation to get your instant live OPD token and real-time alerts.
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('DoctorList')}
                style={styles.bookTokenBtn}
              >
                <Icon name="ticket-outline" size={16} color={colors.white} />
                <Text style={styles.bookTokenBtnText}>Get OPD Token</Text>
                <Icon name="chevron-forward" size={16} color={colors.white} />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}


        {/* Medical Specialties */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleRow}>
            <Icon name="medkit-outline" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>OPD Specialties</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('DoctorList')}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map((cat) => (
            <CategoryChip
              key={cat.id}
              id={cat.id}
              name={cat.name}
              icon={cat.icon}
              color={cat.color}
              isSelected={selectedSpecialty === cat.id}
              onPress={() => {
                setSelectedSpecialty(cat.id);
                navigation.navigate('DoctorList', { category: cat.name });
              }}
            />
          ))}
        </ScrollView>

        {/* Hospital Promo Banner with Clinical Guarantee */}
        <LinearGradient
          colors={['#0284C7', '#0D9488']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.promoBanner}
        >
          <View style={styles.promoContent}>
            <View style={styles.promoBadge}>
              <Icon name="shield-checkmark" size={12} color={colors.white} />
              <Text style={styles.promoBadgeText}>100% IN-CLINIC PHYSICAL OPD</Text>
            </View>
            <Text style={styles.promoTitle}>Zero Reception Wait Time 🎉</Text>
            <Text style={styles.promoSubtitle}>
              Book your physical OPD token number online, check live status from home, and enter Room #204 when your number rings.
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.promoButton}
              onPress={() => navigation.navigate('DoctorList')}
            >
              <Text style={styles.promoButtonText}>Book OPD Token</Text>
              <Icon name="arrow-forward" size={14} color="#0369A1" />
            </TouchableOpacity>
          </View>
          <View style={styles.promoIconContainer}>
            <Icon name="business" size={68} color="rgba(255, 255, 255, 0.2)" />
          </View>
        </LinearGradient>

        {/* Upcoming In-Clinic Appointment */}
        {upcomingAppointment && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <Icon name="calendar-outline" size={18} color={colors.primary} />
                <Text style={styles.sectionTitle}>Your Confirmed OPD Booking</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('MyAppointments')}
              >
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.upcomingWrapper}>
              <AppointmentCard
                appointment={upcomingAppointment}
                onPress={() =>
                  navigation.navigate('DoctorDetail', { doctorId: upcomingAppointment.doctorId })
                }
                onJoinCall={() =>
                  navigation.navigate('LiveQueueTracker', { appointment: upcomingAppointment })
                }
                onReschedule={() =>
                  navigation.navigate('BookAppointment', {
                    doctor: doctors.find((d) => d.id === upcomingAppointment.doctorId) || doctors[0],
                  })
                }
                onCancel={() => {}}
              />
            </View>
          </View>
        )}

        {/* Top Rated Doctors (Horizontal Carousel) */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleRow}>
            <Icon name="star-outline" size={18} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Top Rated In-Clinic Specialists</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('DoctorList')}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.doctorsCarousel}
        >
          {topDoctors.map((doc) => (
            <DoctorCard
              key={doc.id}
              doctor={doc}
              variant="horizontal"
              onPress={() => navigation.navigate('DoctorDetail', { doctorId: doc.id })}
              onBookPress={() => navigation.navigate('BookAppointment', { doctor: doc })}
            />
          ))}
        </ScrollView>

        {/* Nearby Doctors (Vertical List) */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleRow}>
            <Icon name="location-outline" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Nearby Hospital OPD Specialists</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('DoctorList')}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.nearbyList}>
          {nearbyDoctors.map((doc) => (
            <DoctorCard
              key={doc.id}
              doctor={doc}
              variant="vertical"
              onPress={() => navigation.navigate('DoctorDetail', { doctorId: doc.id })}
              onBookPress={() => navigation.navigate('BookAppointment', { doctor: doc })}
            />
          ))}
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
  heroBackground: {
    width: '100%',
  },
  heroSafeArea: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs + 2, // SafeAreaView adds the status bar inset on top of this
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  hospitalBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.3,
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  badgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
  profileAvatarWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
  },
  profileAvatar: {
    width: '100%',
    height: '100%',
  },
  greetingContainer: {
    marginBottom: spacing.md,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: 4,
  },
  quickActionItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  quickActionLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#E2E8F0',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: borderRadius.xl,
    paddingLeft: spacing.md,
    paddingRight: 6,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.white,
    paddingHorizontal: spacing.sm,
  },
  filterBtn: {
    backgroundColor: '#0284C7',
    borderRadius: borderRadius.md,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: spacing.huge,
  },
  liveTokenSection: {
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
  },
  seeAllText: {
    ...typography.captionBold,
    color: colors.primary,
  },
  categoriesScroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  promoBanner: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.md + 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  promoContent: {
    flex: 1,
  },
  promoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    marginBottom: spacing.xs,
  },
  promoBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },
  promoTitle: {
    fontSize: 17,
    color: colors.white,
    fontWeight: '900',
  },
  promoSubtitle: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 3,
    lineHeight: 16,
  },
  promoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    alignSelf: 'flex-start',
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm + 2,
    gap: 4,
  },
  promoButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0369A1',
  },
  promoIconContainer: {
    marginLeft: spacing.sm,
  },
  sectionContainer: {
    marginTop: spacing.sm,
  },
  upcomingWrapper: {
    paddingHorizontal: spacing.lg,
  },
  doctorsCarousel: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  nearbyList: {
    paddingHorizontal: spacing.lg,
  },
  noTokenCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  noTokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  liveBadgeGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    gap: 6,
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  greenBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4ADE80',
  },
  noTokenTimeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  noTokenTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.white,
    marginTop: spacing.xs,
  },
  noTokenSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 4,
  },
  bookTokenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    alignSelf: 'flex-start',
    paddingVertical: 9,
    paddingHorizontal: spacing.md + 2,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
    gap: 6,
  },
  bookTokenBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.white,
  },
});

export default HomeScreen;
