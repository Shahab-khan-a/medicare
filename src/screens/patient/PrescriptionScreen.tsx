import React from 'react';
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
import { Prescription } from '../../types';
import { useApp } from '../../context/AppContext';

interface PrescriptionScreenProps {
  navigation: any;
  route: any;
}

export const PrescriptionScreen: React.FC<PrescriptionScreenProps> = ({
  navigation,
  route,
}) => {
  const { prescriptions: livePrescriptions } = useApp();
  const prescriptionId = route?.params?.prescriptionId;
  const rx: Prescription | undefined =
    (prescriptionId && livePrescriptions.find((p) => p.id === prescriptionId)) ||
    livePrescriptions[0];

  const handleDownload = () => {
    if (!rx) return;
    Alert.alert(
      'Download Prescription',
      `Prescription ${rx.id}.pdf has been saved to your device downloads.`
    );
  };

  const handleOrderMeds = () => {
    Alert.alert(
      'Order Medicines',
      'Connecting to partner pharmacy network... Your medicines will be delivered within 2 hours!'
    );
  };

  if (!rx) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <Header
          title="Digital Prescription"
          showBack
          onBack={() => navigation.goBack()}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
          <Icon name="document-text-outline" size={60} color={colors.textMuted} />
          <Text style={{ ...typography.h3, color: colors.textPrimary, marginTop: spacing.md }}>
            No Prescriptions Issued Yet
          </Text>
          <Text style={{ ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs }}>
            Digital prescriptions created by doctors during your OPD consultations will appear here automatically.
          </Text>
          <Button
            title="Book OPD Consultation"
            onPress={() => navigation.navigate('DoctorList')}
            size="md"
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <Header
        title="Digital Prescription"
        showBack
        onBack={() => navigation.goBack()}
        rightIcon="download-outline"
        onRightPress={handleDownload}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.rxDocumentCard}>
          {/* Clinic / Doctor Header */}
          <View style={styles.docHeaderRow}>
            <View style={styles.logoMedKit}>
              <Icon name="medkit" size={24} color={colors.white} />
            </View>
            <View style={styles.docHeaderInfo}>
              <Text style={styles.docName}>{rx.doctorName}</Text>
              <Text style={styles.docSpecialty}>{rx.doctorSpecialty}</Text>
              <Text style={styles.hospitalText}>{rx.doctorHospital}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Rx Meta Bar */}
          <View style={styles.metaRow}>
            <View>
              <Text style={styles.metaLabel}>Prescription ID</Text>
              <Text style={styles.metaValue}>{rx.id}</Text>
            </View>
            <View style={styles.metaRight}>
              <Text style={styles.metaLabel}>Date Issued</Text>
              <Text style={styles.metaValue}>{rx.date}</Text>
            </View>
          </View>

          {/* Patient Card */}
          <View style={styles.patientCard}>
            <View style={styles.patientCol}>
              <Text style={styles.patientLabel}>Patient Name</Text>
              <Text style={styles.patientValue}>{rx.patientName}</Text>
            </View>
            <View style={styles.patientCol}>
              <Text style={styles.patientLabel}>Age / Gender</Text>
              <Text style={styles.patientValue}>
                {rx.patientAge} yrs • {rx.patientGender}
              </Text>
            </View>
          </View>

          {/* Diagnosis */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionTitleRow}>
              <Icon name="clipboard-outline" size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>Diagnosis</Text>
            </View>
            <View style={styles.diagnosisBox}>
              <Text style={styles.diagnosisText}>{rx.diagnosis}</Text>
            </View>
          </View>

          {/* Medicines Table */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.rxSymbol}>℞</Text>
              <Text style={styles.sectionTitle}>Prescribed Medicines</Text>
            </View>

            {rx.medicines.map((med, index) => (
              <View key={med.id || index} style={styles.medCard}>
                <View style={styles.medTopRow}>
                  <Text style={styles.medName}>
                    {index + 1}. {med.name}
                  </Text>
                  <View style={styles.durationPill}>
                    <Text style={styles.durationText}>{med.duration}</Text>
                  </View>
                </View>

                <Text style={styles.dosageText}>Dosage: {med.dosage}</Text>
                {med.instruction ? (
                  <Text style={styles.instructionText}>
                    Note: {med.instruction}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>

          {/* Doctor Advice */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionTitleRow}>
              <Icon name="information-circle-outline" size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>Medical Advice & Instructions</Text>
            </View>
            {rx.advice.map((adv, idx) => (
              <View key={idx} style={styles.adviceItem}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.adviceText}>{adv}</Text>
              </View>
            ))}
          </View>

          {/* Follow-up & Signature */}
          <View style={styles.footerRow}>
            <View style={styles.followUpCol}>
              <Text style={styles.followUpLabel}>Next Follow-up</Text>
              <Text style={styles.followUpValue}>{rx.followUpDate}</Text>
            </View>

            <View style={styles.signatureCol}>
              <Text style={styles.signatureFont}>{rx.doctorSignature}</Text>
              <View style={styles.sigLine} />
              <Text style={styles.signatureLabel}>Authorized Signature</Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Order Prescribed Medicines"
            onPress={handleOrderMeds}
            size="lg"
            iconName="cart-outline"
            style={styles.orderBtn}
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleDownload}
            style={styles.downloadBtn}
          >
            <Icon name="download-outline" size={18} color={colors.primary} />
            <Text style={styles.downloadBtnText}>Save PDF to Phone</Text>
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
  rxDocumentCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  docHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logoMedKit: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docHeaderInfo: {
    flex: 1,
  },
  docName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  docSpecialty: {
    ...typography.captionBold,
    color: colors.primary,
    marginTop: 1,
  },
  hospitalText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  metaRight: {
    alignItems: 'flex-end',
  },
  metaLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  metaValue: {
    ...typography.captionBold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  patientCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  patientCol: {
    flex: 1,
  },
  patientLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  patientValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  sectionBlock: {
    marginBottom: spacing.lg,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  rxSymbol: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    lineHeight: 24,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  diagnosisBox: {
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  diagnosisText: {
    ...typography.bodyMedium,
    color: colors.primaryDark,
  },
  medCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  medTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  medName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    flex: 1,
  },
  durationPill: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.border,
  },
  durationText: {
    ...typography.tiny,
    fontWeight: '700',
    color: colors.primary,
  },
  dosageText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    marginTop: 4,
  },
  instructionText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    fontStyle: 'italic',
  },
  adviceItem: {
    flexDirection: 'row',
    marginVertical: 3,
    paddingRight: spacing.sm,
  },
  bulletDot: {
    ...typography.bodyBold,
    color: colors.primary,
    marginRight: 6,
  },
  adviceText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  followUpCol: {
    flex: 1,
  },
  followUpLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  followUpValue: {
    ...typography.bodyBold,
    color: colors.primaryDark,
    marginTop: 2,
  },
  signatureCol: {
    alignItems: 'center',
  },
  signatureFont: {
    fontStyle: 'italic',
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 4,
  },
  sigLine: {
    width: 120,
    height: 1,
    backgroundColor: colors.textPrimary,
  },
  signatureLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
    marginTop: 4,
  },
  actionButtons: {
    marginTop: spacing.xl,
  },
  orderBtn: {
    marginBottom: spacing.md,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    borderWidth: 1.2,
    borderColor: colors.primary,
    gap: spacing.sm,
  },
  downloadBtnText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
});

export default PrescriptionScreen;
