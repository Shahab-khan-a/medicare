import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Icon from '../../components/Icon';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import { registerUser } from '../../services/authService';
import { useApp } from '../../context/AppContext';

interface SignupScreenProps {
  navigation: any;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const { setCurrentUser } = useApp();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // Doctor credentials
  const [licenseNumber, setLicenseNumber] = useState('');
  const [medicalCouncil, setMedicalCouncil] = useState('Pakistan Medical Commission (PMC)');
  const [specialty, setSpecialty] = useState('General Physician');
  const [hospital, setHospital] = useState('');
  const [experienceYears, setExperienceYears] = useState('5');
  const [documentAttached, setDocumentAttached] = useState(true);

  const handleSignup = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Required Fields', 'Please complete all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      Alert.alert('Terms Required', 'Please accept the Terms of Service to continue.');
      return;
    }

    if (role === 'doctor' && !licenseNumber.trim()) {
      Alert.alert(
        'License Required',
        'Please enter your PMDC / Medical Council License Number for verification.'
      );
      return;
    }

    setLoading(true);
    try {
      const doctorDetails =
        role === 'doctor'
          ? {
              medicalLicenseNumber: licenseNumber.trim(),
              medicalCouncil: medicalCouncil.trim(),
              specialty,
              experienceYears: parseInt(experienceYears, 10) || 5,
              hospital: hospital.trim() || 'MediCare Central Clinic',
              documentName: documentAttached ? 'PMC_License_Card_Certificate.pdf' : undefined,
            }
          : undefined;

      const { profile } = await registerUser(
        email,
        password,
        fullName,
        role,
        phone,
        doctorDetails
      );
      setCurrentUser(profile);
      setLoading(false);

      if (role === 'doctor') {
        Alert.alert(
          'Credentials Submitted',
          'Your doctor profile has been created and your medical license submitted for verification.',
          [
            {
              text: 'View Verification Status',
              onPress: () => navigation.navigate('DoctorVerification', { fromLogin: true }),
            },
            {
              text: 'Continue to Portal',
              onPress: () => navigation.replace('DoctorTabs'),
            },
          ]
        );
      } else {
        Alert.alert('Account Created', 'Welcome to MediCare! Your profile has been created.', [
          {
            text: 'Continue',
            onPress: () => navigation.replace('PatientTabs'),
          },
        ]);
      }
    } catch (err: any) {
      setLoading(false);
      const msg = err?.message || 'Failed to create account.';
      Alert.alert(
        'Registration Notice',
        `${msg}\n\nWould you like to proceed in Quick Demo mode?`,
        [
          { text: 'Retry', style: 'cancel' },
          {
            text: 'Continue as Demo',
            onPress: () => {
              if (role === 'doctor') {
                navigation.navigate('DoctorVerification', { fromLogin: true });
              } else {
                navigation.replace('PatientTabs');
              }
            },
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.titleSection}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join MediCare to start booking appointments and managing health records
          </Text>
        </View>

        <View style={styles.roleContainer}>
          <Text style={styles.roleLabel}>I am registering as a:</Text>
          <View style={styles.roleSelector}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setRole('patient')}
              style={[
                styles.roleOption,
                role === 'patient' && styles.roleOptionActive,
              ]}
            >
              <Icon
                name="person-outline"
                size={18}
                color={role === 'patient' ? colors.white : colors.textSecondary}
              />
              <Text
                style={[
                  styles.roleOptionText,
                  role === 'patient' && styles.roleOptionTextActive,
                ]}
              >
                Patient
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setRole('doctor')}
              style={[
                styles.roleOption,
                role === 'doctor' && styles.roleOptionActive,
              ]}
            >
              <Icon
                name="medkit-outline"
                size={18}
                color={role === 'doctor' ? colors.white : colors.textSecondary}
              />
              <Text
                style={[
                  styles.roleOptionText,
                  role === 'doctor' && styles.roleOptionTextActive,
                ]}
              >
                Doctor / Clinic
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formContainer}>
          <InputField
            label="Full Name"
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
            leftIcon="person-outline"
          />

          <InputField
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
          />

          <InputField
            label="Phone Number"
            placeholder="+92 3XX XXXXXXX"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            leftIcon="call-outline"
          />

          <InputField
            label="Password"
            placeholder="Create password"
            value={password}
            onChangeText={setPassword}
            isPassword
            leftIcon="lock-closed-outline"
          />

          <InputField
            label="Confirm Password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            isPassword
            leftIcon="lock-closed-outline"
          />

          {/* Doctor Medical Council Verification Section */}
          {role === 'doctor' && (
            <View style={styles.doctorVerificationSection}>
              <View style={styles.verificationSectionHeader}>
                <View style={styles.verificationBadgeIcon}>
                  <Icon name="shield-checkmark" size={16} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.verificationSectionTitle}>
                    Medical Council Credentials
                  </Text>
                  <Text style={styles.verificationSectionSubtitle}>
                    Required for OPD consultation privileges and board verification
                  </Text>
                </View>
              </View>

              <InputField
                label="PMDC / Medical License Number *"
                placeholder="e.g. PMC-84920-M"
                value={licenseNumber}
                onChangeText={setLicenseNumber}
                autoCapitalize="characters"
                leftIcon="card-outline"
              />

              <InputField
                label="Medical Council / Registry"
                placeholder="e.g. Pakistan Medical Commission (PMC)"
                value={medicalCouncil}
                onChangeText={setMedicalCouncil}
                leftIcon="business-outline"
              />

              <InputField
                label="Hospital / Clinic Affiliation"
                placeholder="e.g. MediCare Central Clinic, Lahore"
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

              {/* Upload Certificate Card */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setDocumentAttached(!documentAttached)}
                style={styles.docUploadCard}
              >
                <Icon
                  name={documentAttached ? 'checkmark-circle' : 'cloud-upload-outline'}
                  size={22}
                  color={documentAttached ? colors.success : colors.primary}
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.docUploadTitle}>
                    {documentAttached
                      ? 'PMC_License_Card_Certificate.pdf'
                      : 'Attach Medical License / Degree Copy'}
                  </Text>
                  <Text style={styles.docUploadSubtitle}>
                    {documentAttached ? 'Document attached for verification' : 'Tap to attach document'}
                  </Text>
                </View>
                {documentAttached && (
                  <Text style={{ fontSize: 11, color: colors.success, fontWeight: '700' }}>
                    ATTACHED
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setAgreeTerms(!agreeTerms)}
            style={styles.termsRow}
          >
            <View
              style={[
                styles.checkbox,
                agreeTerms && styles.checkboxActive,
              ]}
            >
              {agreeTerms && (
                <Icon name="checkmark" size={14} color={colors.white} />
              )}
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          <Button
            title={`Create ${role === 'doctor' ? 'Doctor' : 'Patient'} Account`}
            onPress={handleSignup}
            size="lg"
            loading={loading}
            style={styles.signupBtn}
          />
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginLink}>Login</Text>
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
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  titleSection: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  roleContainer: {
    marginBottom: spacing.lg,
  },
  roleLabel: {
    ...typography.captionBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs + 2,
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    gap: 6,
  },
  roleOptionActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  roleOptionText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  roleOptionTextActive: {
    color: colors.white,
  },
  formContainer: {
    marginTop: spacing.xs,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    backgroundColor: colors.card,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  termsText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  signupBtn: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  doctorVerificationSection: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  verificationSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  verificationBadgeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verificationSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  verificationSectionSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  docUploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginTop: spacing.xs,
  },
  docUploadTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  docUploadSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  loginLink: {
    ...typography.bodyBold,
    color: colors.primary,
  },
});

export default SignupScreen;
