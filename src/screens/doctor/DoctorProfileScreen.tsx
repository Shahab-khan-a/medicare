import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Icon from '../../components/Icon';
import Header from '../../components/Header';
import { Doctor } from '../../types';
import { useApp } from '../../context/AppContext';

interface DoctorProfileScreenProps {
  navigation: any;
}

export const DoctorProfileScreen: React.FC<DoctorProfileScreenProps> = ({
  navigation,
}) => {
  const { doctors, currentUser, isCurrentDoctorVerified } = useApp();
  const doctor: Doctor =
    doctors.find((d) => d.name === currentUser?.name || d.id === currentUser?.uid) || {
      id: currentUser?.uid || 'doc-1',
      name: currentUser?.name || 'Dr. Physician',
      specialty: currentUser?.specialty || 'General Physician',
      specialtyId: '1',
      photo:
        currentUser?.photoUrl ||
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
      rating: 5.0,
      reviewsCount: 1,
      patientsCount: 0,
      experience: currentUser?.experienceYears || 5,
      fees: 2000,
      hospital: currentUser?.hospital || 'MediCare Central Clinic',
      location: 'Central OPD',
      distance: '0 km',
      bio: 'Verified in-clinic consulting physician.',
      qualifications: ['MBBS', currentUser?.medicalCouncil || 'PMDC Registered'],
      languages: ['English', 'Urdu'],
      isVerified: isCurrentDoctorVerified || currentUser?.verificationStatus === 'verified',
      isOnline: true,
    };
  const [isAcceptingConsultations, setIsAcceptingConsultations] = useState(true);

  const isVerified = isCurrentDoctorVerified || currentUser?.verificationStatus === 'verified' || doctor.isVerified;

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Sign out of doctor portal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            const { logoutUser } = await import('../../services/authService');
            await logoutUser();
          } catch (e) {
            console.warn('Doctor sign out notice:', e);
          }
          navigation.replace('AuthStack');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <Header
        title="Doctor Profile"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: doctor.photo }} style={styles.avatar} />
            <View
              style={[
                styles.verifiedBadge,
                !isVerified && { backgroundColor: colors.warning },
              ]}
            >
              <Icon
                name={isVerified ? 'checkmark' : 'time'}
                size={14}
                color={colors.white}
              />
            </View>
          </View>

          <Text style={styles.doctorName}>{doctor.name}</Text>

          {/* Verification Status Pill */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('DoctorVerification')}
            style={[
              styles.verificationPill,
              isVerified ? styles.verificationPillVerified : styles.verificationPillPending,
            ]}
          >
            <Icon
              name={isVerified ? 'shield-checkmark' : 'time'}
              size={13}
              color={isVerified ? colors.successText : colors.warningText}
            />
            <Text
              style={[
                styles.verificationPillText,
                isVerified ? styles.verificationPillTextVerified : styles.verificationPillTextPending,
              ]}
            >
              {isVerified
                ? `PMC Verified • ${currentUser?.medicalLicenseNumber || doctor.medicalLicenseNumber || 'PMC-84920-M'}`
                : 'Credentials Under Review'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.specialtyText}>
            {doctor.specialty} • {doctor.experience} Years Experience
          </Text>
          <Text style={styles.hospitalText}>{doctor.hospital}</Text>

          <View style={styles.statusToggleRow}>
            <Text style={styles.statusToggleLabel}>Available for Clinic OPD</Text>
            <Switch
              value={isAcceptingConsultations}
              onValueChange={setIsAcceptingConsultations}
              trackColor={{ false: colors.border, true: colors.success }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* 3 Stats Row */}
        <View style={styles.statsCard}>
          <View style={styles.statCol}>
            <Text style={styles.statValue}>{doctor.patientsCount}+</Text>
            <Text style={styles.statLabel}>Patients Treated</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statCol}>
            <Text style={styles.statValue}>{doctor.rating.toFixed(1)} ★</Text>
            <Text style={styles.statLabel}>Doctor Rating</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statCol}>
            <Text style={styles.statValue}>{doctor.reviewsCount}</Text>
            <Text style={styles.statLabel}>Patient Reviews</Text>
          </View>
        </View>

        {/* Professional Details Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Professional Information</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Degrees & Board Certifications</Text>
            {doctor.qualifications.map((q, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <Icon name="ribbon-outline" size={16} color={colors.primary} />
                <Text style={styles.bulletText}>{q}</Text>
              </View>
            ))}

            <View style={styles.divider} />

            <Text style={styles.infoTitle}>Spoken Languages</Text>
            <Text style={styles.infoText}>{doctor.languages.join(', ')}</Text>

            <View style={styles.divider} />

            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Current Consultation Fee</Text>
              <Text style={styles.feeVal}>Rs. {doctor.fees}</Text>
            </View>
          </View>
        </View>

        {/* Management Actions */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Practice Management</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('DoctorVerification')}
            style={styles.menuItem}
          >
            <View
              style={[
                styles.menuIconBox,
                { backgroundColor: isVerified ? colors.successLight : colors.warningLight },
              ]}
            >
              <Icon
                name={isVerified ? 'shield-checkmark' : 'shield-outline'}
                size={20}
                color={isVerified ? colors.successText : colors.warningText}
              />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.menuItemText}>Medical License & Verification</Text>
              <Text style={{ fontSize: 11, color: isVerified ? colors.successText : colors.warningText, marginTop: 1 }}>
                {isVerified ? 'Official Verified Practitioner' : 'Credentials Under Board Review'}
              </Text>
            </View>
            <View
              style={[
                styles.menuStatusBadge,
                isVerified ? styles.menuStatusBadgeVerified : styles.menuStatusBadgePending,
              ]}
            >
              <Text
                style={[
                  styles.menuStatusBadgeText,
                  isVerified ? styles.menuStatusBadgeTextVerified : styles.menuStatusBadgeTextPending,
                ]}
              >
                {isVerified ? 'VERIFIED' : 'PENDING'}
              </Text>
            </View>
            <Icon name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('DoctorAvailability')}
            style={styles.menuItem}
          >
            <View style={[styles.menuIconBox, { backgroundColor: colors.primaryLight }]}>
              <Icon name="calendar-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.menuItemText}>Set Weekly Schedule</Text>
            <Icon name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('DoctorEarnings')}
            style={styles.menuItem}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Icon name="wallet-outline" size={20} color="#D97706" />
            </View>
            <Text style={styles.menuItemText}>Financial Statements & Payouts</Text>
            <Icon name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Switch to Patient Portal */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.replace('PatientTabs')}
            style={[styles.menuItem, styles.portalSwitchItem]}
          >
            <View style={[styles.menuIconBox, { backgroundColor: colors.primaryLight }]}>
              <Icon name="person" size={20} color={colors.primary} />
            </View>
            <View style={styles.portalSwitchInfo}>
              <Text style={styles.portalSwitchTitle}>Switch to Patient App</Text>
              <Text style={styles.portalSwitchSub}>Experience patient booking flow</Text>
            </View>
            <Icon name="chevron-forward" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleLogout}
            style={[styles.menuItem, styles.logoutItem]}
          >
            <View style={[styles.menuIconBox, { backgroundColor: colors.errorLight }]}>
              <Icon name="log-out-outline" size={20} color={colors.error} />
            </View>
            <Text style={styles.logoutText}>Sign Out of Practice</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.huge,
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: spacing.md,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primaryLight,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  doctorName: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  specialtyText: {
    ...typography.captionBold,
    color: colors.primary,
    marginTop: 2,
  },
  hospitalText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  statusToggleLabel: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...typography.h3,
    color: colors.primaryDark,
  },
  statLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.divider,
  },
  menuSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.captionBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    ...typography.captionBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 3,
  },
  bulletText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  infoText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feeLabel: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  feeVal: {
    ...typography.h3,
    color: colors.primaryDark,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuItemText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    flex: 1,
  },
  portalSwitchItem: {
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
  },
  portalSwitchInfo: {
    flex: 1,
  },
  portalSwitchTitle: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  portalSwitchSub: {
    ...typography.tiny,
    color: colors.primaryDark,
  },
  logoutItem: {
    borderColor: colors.errorLight,
  },
  logoutText: {
    ...typography.bodyBold,
    color: colors.error,
  },
  verificationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginTop: 6,
    marginBottom: 6,
  },
  verificationPillVerified: {
    backgroundColor: '#DCFCE7',
  },
  verificationPillPending: {
    backgroundColor: '#FEF3C7',
  },
  verificationPillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  verificationPillTextVerified: {
    color: colors.successText,
  },
  verificationPillTextPending: {
    color: colors.warningText,
  },
  menuStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  menuStatusBadgeVerified: {
    backgroundColor: '#DCFCE7',
  },
  menuStatusBadgePending: {
    backgroundColor: '#FEF3C7',
  },
  menuStatusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  menuStatusBadgeTextVerified: {
    color: colors.successText,
  },
  menuStatusBadgeTextPending: {
    color: colors.warningText,
  },
});

export default DoctorProfileScreen;
