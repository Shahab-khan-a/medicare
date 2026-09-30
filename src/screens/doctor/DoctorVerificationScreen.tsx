import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Icon from '../../components/Icon';
import Header from '../../components/Header';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import { useApp } from '../../context/AppContext';

interface DoctorVerificationScreenProps {
  navigation: any;
}

const SPECIALTY_OPTIONS = [
  'General Physician',
  'Cardiology',
  'Pediatrics',
  'Dermatology',
  'Orthopedics',
  'Neurology',
  'Ophthalmology',
  'Dentistry',
];

export const DoctorVerificationScreen: React.FC<DoctorVerificationScreenProps> = ({
  navigation,
}) => {
  const {
    currentUser,
    isCurrentDoctorVerified,
    submitDoctorVerification,
    verifyDoctorStatus,
  } = useApp();

  const isVerified = isCurrentDoctorVerified || currentUser?.verificationStatus === 'verified';
  const isPending = !isVerified && (currentUser?.verificationStatus === 'pending' || Boolean(currentUser?.medicalLicenseNumber));

  const [isEditing, setIsEditing] = useState(!isVerified && !isPending);
  const [licenseNumber, setLicenseNumber] = useState(
    currentUser?.medicalLicenseNumber || ''
  );
  const [medicalCouncil, setMedicalCouncil] = useState(
    currentUser?.medicalCouncil || 'Pakistan Medical Commission (PMC)'
  );
  const [specialty, setSpecialty] = useState(
    currentUser?.specialty || 'General Physician'
  );
  const [hospital, setHospital] = useState(
    currentUser?.hospital || ''
  );
  const [experienceYears, setExperienceYears] = useState(
    currentUser?.experienceYears ? String(currentUser.experienceYears) : ''
  );
  const [documentName, setDocumentName] = useState(
    currentUser?.verificationDocumentName || ''
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!licenseNumber.trim()) {
      Alert.alert('License Required', 'Please enter your medical license or registration number.');
      return;
    }
    if (!hospital.trim()) {
      Alert.alert('Hospital Required', 'Please specify your primary hospital or clinic.');
      return;
    }

    setSubmitting(true);
    const success = await submitDoctorVerification({
      licenseNumber: licenseNumber.trim(),
      medicalCouncil: medicalCouncil.trim(),
      specialty,
      experienceYears: parseInt(experienceYears, 10) || 5,
      hospital: hospital.trim(),
      documentName,
    });
    setSubmitting(false);

    if (success) {
      setIsEditing(false);
      Alert.alert(
        'Credentials Submitted',
        'Your medical credentials have been submitted for verification. The credentialing board will review your license.'
      );
    } else {
      Alert.alert('Error', 'Could not submit verification at this moment.');
    }
  };

  const handleInstantApprove = async () => {
    Alert.alert(
      'Medical Board Approval',
      'Approve this doctor account and grant Verified Medical Practitioner status?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve & Verify',
          onPress: async () => {
            await verifyDoctorStatus('verified');
            setIsEditing(false);
            Alert.alert(
              'Account Verified!',
              'This physician account is now verified. Live consultations and verified patient trust badges are unlocked.'
            );
          },
        },
      ]
    );
  };

  const handleRevoke = async () => {
    Alert.alert(
      'Reset Verification',
      'Move status back to Pending Review for testing?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Set Pending',
          style: 'destructive',
          onPress: async () => {
            await verifyDoctorStatus('pending');
            Alert.alert('Status Updated', 'Verification status set back to Pending Review.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <Header
        title="Doctor Verification"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Verification Status Card */}
        <View
          style={[
            styles.statusCard,
            isVerified
              ? styles.statusCardVerified
              : isPending
              ? styles.statusCardPending
              : styles.statusCardUnverified,
          ]}
        >
          <View style={styles.statusHeader}>
            <View
              style={[
                styles.statusIconWrap,
                isVerified
                  ? styles.statusIconWrapVerified
                  : isPending
                  ? styles.statusIconWrapPending
                  : styles.statusIconWrapUnverified,
              ]}
            >
              <Icon
                name={
                  isVerified
                    ? 'shield-checkmark'
                    : isPending
                    ? 'time'
                    : 'alert-circle'
                }
                size={26}
                color={
                  isVerified
                    ? colors.success
                    : isPending
                    ? colors.warning
                    : colors.primary
                }
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.statusPill,
                    isVerified
                      ? styles.statusPillVerified
                      : isPending
                      ? styles.statusPillPending
                      : styles.statusPillUnverified,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      isVerified
                        ? styles.statusPillTextVerified
                        : isPending
                        ? styles.statusPillTextPending
                        : styles.statusPillTextUnverified,
                    ]}
                  >
                    {isVerified
                      ? 'OFFICIALLY VERIFIED'
                      : isPending
                      ? 'UNDER REVIEW'
                      : 'NOT VERIFIED'}
                  </Text>
                </View>
              </View>
              <Text style={styles.statusTitle}>
                {isVerified
                  ? 'Verified Medical Practitioner'
                  : isPending
                  ? 'Credentials Under Review'
                  : 'Submit Medical Credentials'}
              </Text>
            </View>
          </View>

          <Text style={styles.statusDescription}>
            {isVerified
              ? 'Your medical license has been verified against the official medical council registry. You have full privileges to conduct OPD consultations and prescribe medicines.'
              : isPending
              ? 'Your license credentials have been submitted and are undergoing compliance review by the MediCare clinical board. You can monitor review milestones below.'
              : 'Provide your official medical council registration number and practicing license to verify your identity and unlock doctor features.'}
          </Text>

          {/* Stepper for Pending or Verified */}
          {(isPending || isVerified) && (
            <View style={styles.stepperContainer}>
              <View style={styles.stepItem}>
                <View style={[styles.stepDot, styles.stepDotDone]}>
                  <Icon name="checkmark" size={12} color={colors.white} />
                </View>
                <View style={styles.stepTextCol}>
                  <Text style={styles.stepTitle}>Application Submitted</Text>
                  <Text style={styles.stepSubtitle}>License & credentials received</Text>
                </View>
              </View>
              <View style={styles.stepLine} />

              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepDot,
                    isVerified ? styles.stepDotDone : styles.stepDotActive,
                  ]}
                >
                  {isVerified ? (
                    <Icon name="checkmark" size={12} color={colors.white} />
                  ) : (
                    <Icon name="sync" size={12} color={colors.white} />
                  )}
                </View>
                <View style={styles.stepTextCol}>
                  <Text style={styles.stepTitle}>Council Registry Check</Text>
                  <Text style={styles.stepSubtitle}>
                    {isVerified ? 'Registry verified' : 'Cross-checking with PMDC/PMC'}
                  </Text>
                </View>
              </View>
              <View style={styles.stepLine} />

              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepDot,
                    isVerified ? styles.stepDotDone : styles.stepDotUpcoming,
                  ]}
                >
                  {isVerified ? (
                    <Icon name="checkmark" size={12} color={colors.white} />
                  ) : (
                    <View style={styles.stepInnerDot} />
                  )}
                </View>
                <View style={styles.stepTextCol}>
                  <Text style={styles.stepTitle}>OPD Practice Clearance</Text>
                  <Text style={styles.stepSubtitle}>
                    {isVerified ? 'Full practice unlocked' : 'Pending final approval'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Verified Doctor Privileges Box */}
        {isVerified && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Physician Verified Privileges</Text>
            <View style={styles.privilegeRow}>
              <Icon name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.privilegeText}>Official Verified badge displayed to patients</Text>
            </View>
            <View style={styles.privilegeRow}>
              <Icon name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.privilegeText}>Live OPD queue calling and consultation active</Text>
            </View>
            <View style={styles.privilegeRow}>
              <Icon name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.privilegeText}>Digital e-prescriptions with medical registry stamp</Text>
            </View>
            <View style={styles.privilegeRow}>
              <Icon name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.privilegeText}>Video telemedicine consultation calls enabled</Text>
            </View>

            <View style={{ marginTop: 18 }}>
              <Button
                title="Go to Doctor Dashboard"
                onPress={() => navigation.navigate('DoctorTabs')}
              />
              <TouchableOpacity
                onPress={handleRevoke}
                style={{ marginTop: 12, alignItems: 'center', paddingVertical: 8 }}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 13, textDecorationLine: 'underline' }}>
                  Test Pending State (Reset Verification)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Submitted Credentials Summary (When not editing) */}
        {!isEditing && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.sectionTitle}>Registered Credentials</Text>
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                style={styles.editBtn}
              >
                <Icon name="create-outline" size={15} color={colors.primary} />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Medical Council</Text>
              <Text style={styles.detailValue}>{medicalCouncil}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>License Number</Text>
              <Text style={[styles.detailValue, { fontWeight: '700', color: colors.primary }]}>
                {licenseNumber}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Specialty</Text>
              <Text style={styles.detailValue}>{specialty}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Hospital / Clinic</Text>
              <Text style={styles.detailValue}>{hospital}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Experience</Text>
              <Text style={styles.detailValue}>{experienceYears} Years</Text>
            </View>

            {/* Document preview */}
            <View style={styles.documentCard}>
              <View style={styles.docIconWrap}>
                <Icon name="document-text" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.docName}>{documentName}</Text>
                <Text style={styles.docSize}>Official Medical License Copy • PDF</Text>
              </View>
              <Icon name="checkmark-circle" size={18} color={colors.success} />
            </View>

            {/* If pending, show Demo Instant Approval button */}
            {isPending && (
              <View style={{ marginTop: 20 }}>
                <Button
                  title="Instant Board Approval (Demo)"
                  onPress={handleInstantApprove}
                  variant="primary"
                />
                <Text style={styles.demoHintText}>
                  Tap to instantly approve and test full doctor privileges without waiting for board review.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Verification Form (When editing or unverified) */}
        {isEditing && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Medical Licensing Information</Text>

            <InputField
              label="Medical Council / Registry"
              placeholder="e.g. Pakistan Medical Commission (PMC)"
              value={medicalCouncil}
              onChangeText={setMedicalCouncil}
              leftIcon="business-outline"
            />

            <InputField
              label="License / PMDC Registration Number"
              placeholder="e.g. PMC-84920-M"
              value={licenseNumber}
              onChangeText={setLicenseNumber}
              autoCapitalize="characters"
              leftIcon="card-outline"
            />

            {/* Specialty Selector */}
            <Text style={styles.fieldLabel}>Medical Specialty</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.specialtyScroll}
            >
              {SPECIALTY_OPTIONS.map((spec) => (
                <TouchableOpacity
                  key={spec}
                  onPress={() => setSpecialty(spec)}
                  style={[
                    styles.specialtyChip,
                    specialty === spec && styles.specialtyChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.specialtyChipText,
                      specialty === spec && styles.specialtyChipTextActive,
                    ]}
                  >
                    {spec}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <InputField
              label="Primary Hospital / Clinic Affiliation"
              placeholder="e.g. MediCare Health Center, Lahore"
              value={hospital}
              onChangeText={setHospital}
              leftIcon="medkit-outline"
            />

            <InputField
              label="Years of Experience"
              placeholder="e.g. 8"
              value={experienceYears}
              onChangeText={setExperienceYears}
              keyboardType="numeric"
              leftIcon="calendar-outline"
            />

            {/* Document Attachment */}
            <Text style={styles.fieldLabel}>License Certificate / Degree Document</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                Alert.alert(
                  'Upload Certificate',
                  'Select document from files or capture photo of license.',
                  [
                    {
                      text: 'PMC_License_Card_Scanned.pdf',
                      onPress: () => setDocumentName('PMC_License_Card_Scanned.pdf'),
                    },
                    {
                      text: 'Doctor_Registry_Certificate.pdf',
                      onPress: () => setDocumentName('Doctor_Registry_Certificate.pdf'),
                    },
                    { text: 'Cancel', style: 'cancel' },
                  ]
                );
              }}
              style={styles.uploadArea}
            >
              <Icon name="cloud-upload-outline" size={26} color={colors.primary} />
              <Text style={styles.uploadTitle}>
                {documentName ? documentName : 'Attach License Certificate (PDF or Image)'}
              </Text>
              <Text style={styles.uploadSubtitle}>
                Tap to select official credential document
              </Text>
            </TouchableOpacity>

            <View style={{ marginTop: 20 }}>
              <Button
                title={submitting ? 'Submitting...' : 'Submit for Verification'}
                onPress={handleSubmit}
                loading={submitting}
              />
              {(isPending || isVerified) && (
                <TouchableOpacity
                  onPress={() => setIsEditing(false)}
                  style={{ marginTop: 12, alignItems: 'center', paddingVertical: 8 }}
                >
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DoctorVerificationScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  statusCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  statusCardVerified: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  statusCardPending: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  statusCardUnverified: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIconWrapVerified: {
    backgroundColor: colors.successLight,
  },
  statusIconWrapPending: {
    backgroundColor: colors.warningLight,
  },
  statusIconWrapUnverified: {
    backgroundColor: colors.primaryLight,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  statusPillVerified: {
    backgroundColor: '#DCFCE7',
  },
  statusPillPending: {
    backgroundColor: '#FEF3C7',
  },
  statusPillUnverified: {
    backgroundColor: '#DBEAFE',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusPillTextVerified: {
    color: colors.successText,
  },
  statusPillTextPending: {
    color: colors.warningText,
  },
  statusPillTextUnverified: {
    color: colors.primaryDark,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statusDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  stepperContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepDotDone: {
    backgroundColor: colors.success,
  },
  stepDotActive: {
    backgroundColor: colors.warning,
  },
  stepDotUpcoming: {
    backgroundColor: '#E2E8F0',
  },
  stepInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#94A3B8',
  },
  stepTextCol: {
    marginLeft: 12,
    flex: 1,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  stepSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  stepLine: {
    width: 2,
    height: 16,
    backgroundColor: colors.border,
    marginLeft: 10,
    marginVertical: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryLight,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  privilegeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  privilegeText: {
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    padding: 12,
    borderRadius: borderRadius.md,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  docIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  docSize: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  demoHintText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 4,
  },
  specialtyScroll: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    paddingVertical: 4,
  },
  specialtyChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  specialtyChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  specialtyChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  specialtyChipTextActive: {
    color: colors.white,
  },
  uploadArea: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 8,
    textAlign: 'center',
  },
  uploadSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
