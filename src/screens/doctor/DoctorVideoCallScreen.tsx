import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Icon from '../../components/Icon';
import Button from '../../components/Button';

interface DoctorVideoCallScreenProps {
  navigation: any;
  route: any;
}

export const DoctorVideoCallScreen: React.FC<DoctorVideoCallScreenProps> = ({
  navigation,
  route,
}) => {
  const patientName = route?.params?.patientName || 'Consultation Patient';
  const patientPhoto =
    route?.params?.patientPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400';
  const tokenNumber = route?.params?.tokenNumber || 1;

  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleFinishExamination = () => {
    Alert.alert(
      'Finish In-Clinic Examination',
      `Complete physical consultation for ${patientName} (Token #${tokenNumber})?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Write Prescription',
          onPress: () =>
            navigation.replace('WritePrescription', { patientName }),
        },
        {
          text: 'Finish & Call Next',
          onPress: () => {
            Alert.alert(
              'Next Patient Called',
              `Token #${tokenNumber + 1} called to Room #204.`
            );
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.topBar}>
        <View style={styles.roomBadge}>
          <Icon name="business" size={16} color={colors.primary} />
          <Text style={styles.roomBadgeText}>OPD Room #204</Text>
        </View>

        <View style={styles.timerBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.timerText}>{formatTimer(seconds)}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.exitBtn}
        >
          <Text style={styles.exitBtnText}>Close</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Active Patient Token Header */}
        <View style={styles.patientBanner}>
          <View style={styles.patientAvatarCol}>
            <Image source={{ uri: patientPhoto }} style={styles.patientAvatar} />
            <View style={styles.tokenPill}>
              <Text style={styles.tokenPillText}>TOKEN #{tokenNumber}</Text>
            </View>
          </View>

          <View style={styles.patientDetails}>
            <Text style={styles.patientName}>{patientName}</Text>
            <Text style={styles.patientMeta}>29 yrs • Male • Morning OPD</Text>
            <View style={styles.inPersonTag}>
              <Icon name="checkmark-circle" size={14} color="#16A34A" />
              <Text style={styles.inPersonTagText}>Physical Visit Verified</Text>
            </View>
          </View>
        </View>

        {/* Symptoms / Chief Complaint */}
        <View style={styles.complaintCard}>
          <Text style={styles.complaintLabel}>CHIEF COMPLAINT</Text>
          <Text style={styles.complaintText}>
            Patient complains of persistent throat pain, dry cough, and mild fever spiking in the evenings for 3 days.
          </Text>
        </View>

        {/* In-Clinic Examination Vitals */}
        <Text style={styles.sectionTitle}>Bedside Recorded Vitals</Text>
        <View style={styles.vitalsGrid}>
          <View style={styles.vitalCard}>
            <Text style={styles.vitalLabel}>Blood Pressure</Text>
            <Text style={styles.vitalValue}>120/80</Text>
            <Text style={styles.vitalUnit}>mmHg</Text>
          </View>

          <View style={styles.vitalCard}>
            <Text style={styles.vitalLabel}>Pulse Rate</Text>
            <Text style={styles.vitalValue}>74</Text>
            <Text style={styles.vitalUnit}>bpm</Text>
          </View>

          <View style={styles.vitalCard}>
            <Text style={styles.vitalLabel}>Body Temp</Text>
            <Text style={styles.vitalValue}>98.6</Text>
            <Text style={styles.vitalUnit}>°F</Text>
          </View>

          <View style={styles.vitalCard}>
            <Text style={styles.vitalLabel}>Oxygen (SpO2)</Text>
            <Text style={styles.vitalValue}>99%</Text>
            <Text style={styles.vitalUnit}>Normal</Text>
          </View>
        </View>

        {/* Physical Examination Checklist */}
        <View style={styles.checklistCard}>
          <Text style={styles.checklistTitle}>Physical Exam Checklist</Text>
          
          <View style={styles.checkItem}>
            <Icon name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.checkText}>Throat & Pharynx inspection completed</Text>
          </View>

          <View style={styles.checkItem}>
            <Icon name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.checkText}>Chest auscultation: clear bilateral breath sounds</Text>
          </View>

          <View style={styles.checkItem}>
            <Icon name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.checkText}>Cervical lymph nodes palpated: no swelling</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <Button
            title="Write Digital Prescription"
            onPress={() =>
              navigation.replace('WritePrescription', { patientName })
            }
            iconName="document-text"
            size="lg"
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleFinishExamination}
            style={styles.completeBtn}
          >
            <Icon name="checkmark-done" size={20} color={colors.primary} />
            <Text style={styles.completeBtnText}>Complete & Call Next Patient</Text>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  roomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    gap: 6,
  },
  roomBadgeText: {
    ...typography.captionBold,
    color: colors.primary,
    fontSize: 12,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  timerText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 14,
  },
  exitBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
  },
  exitBtnText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  patientBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  patientAvatarCol: {
    alignItems: 'center',
  },
  patientAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.backgroundSecondary,
  },
  tokenPill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginTop: -8,
  },
  tokenPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
  },
  patientDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  patientName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  patientMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  inPersonTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  inPersonTagText: {
    ...typography.captionBold,
    color: '#16A34A',
    fontSize: 11,
  },
  complaintCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.lg,
  },
  complaintLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  complaintText: {
    ...typography.caption,
    color: colors.textPrimary,
    lineHeight: 18,
    marginTop: 4,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  vitalCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  vitalLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  vitalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4,
  },
  vitalUnit: {
    ...typography.captionBold,
    color: colors.primary,
    fontSize: 11,
    marginTop: 2,
  },
  checklistCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  checklistTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: 4,
  },
  checkText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  actionSection: {
    gap: spacing.md,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  completeBtnText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
});

export default DoctorVideoCallScreen;
