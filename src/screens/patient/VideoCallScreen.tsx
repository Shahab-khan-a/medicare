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
import { Doctor } from '../../types';
import { useApp } from '../../context/AppContext';

interface VideoCallScreenProps {
  navigation: any;
  route: any;
}

export const VideoCallScreen: React.FC<VideoCallScreenProps> = ({
  navigation,
  route,
}) => {
  const { doctors, currentUser, queueStatus } = useApp();
  const doctor: Doctor = route?.params?.doctor || doctors[0];
  const [seconds, setSeconds] = useState(134); // elapsed consultation time

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleFinishConsultation = () => {
    Alert.alert(
      'Complete Consultation',
      'The doctor has finished your physical examination. Would you like to view your digital prescription now?',
      [
        {
          text: 'Exit to Home',
          onPress: () => navigation.replace('PatientTabs'),
        },
        {
          text: 'View Prescription',
          style: 'default',
          onPress: () => {
            navigation.replace('Prescription', {
              doctorId: doctor.id,
              fromCall: false,
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Icon name="chevron-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.roomBadge}>
            <Icon name="business" size={16} color={colors.primary} />
            <Text style={styles.roomBadgeText}>Clinic Room #204</Text>
          </View>
        </View>

        <View style={styles.timerBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.timerText}>{formatTimer(seconds)}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleFinishConsultation}
          style={styles.exitBtn}
        >
          <Text style={styles.exitBtnText}>Exit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Token Active Banner */}
        <View style={styles.tokenBanner}>
          <View style={styles.tokenLeft}>
            <Text style={styles.tokenSub}>CURRENT IN-ROOM TOKEN</Text>
            <Text style={styles.tokenNumber}>#{queueStatus.currentServing || 1}</Text>
          </View>
          <View style={styles.tokenRight}>
            <View style={styles.statusActiveBadge}>
              <Icon name="checkmark-circle" size={14} color="#16A34A" />
              <Text style={styles.statusActiveText}>Examination Active</Text>
            </View>
            <Text style={styles.patientName}>{currentUser?.name || 'Verified Patient'}</Text>
          </View>
        </View>

        {/* Doctor In-Person Card */}
        <View style={styles.doctorCard}>
          <Image source={{ uri: doctor.photo }} style={styles.doctorPhoto} />
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
            <Text style={styles.hospitalText}>{doctor.hospital}</Text>
          </View>
        </View>

        {/* Real-Time Recorded Vitals */}
        <Text style={styles.sectionTitle}>Physical Examination Vitals</Text>
        <View style={styles.vitalsGrid}>
          <View style={styles.vitalCard}>
            <Icon name="heart-outline" size={20} color="#EF4444" />
            <Text style={styles.vitalValue}>120 / 80</Text>
            <Text style={styles.vitalUnit}>mmHg (BP)</Text>
            <Text style={styles.vitalStatus}>Normal</Text>
          </View>

          <View style={styles.vitalCard}>
            <Icon name="pulse-outline" size={20} color="#3B82F6" />
            <Text style={styles.vitalValue}>74</Text>
            <Text style={styles.vitalUnit}>bpm (Pulse)</Text>
            <Text style={styles.vitalStatus}>Resting</Text>
          </View>

          <View style={styles.vitalCard}>
            <Icon name="thermometer-outline" size={20} color="#F59E0B" />
            <Text style={styles.vitalValue}>98.6</Text>
            <Text style={styles.vitalUnit}>°F (Temp)</Text>
            <Text style={styles.vitalStatus}>Afebrile</Text>
          </View>

          <View style={styles.vitalCard}>
            <Icon name="speedometer-outline" size={20} color="#10B981" />
            <Text style={styles.vitalValue}>99%</Text>
            <Text style={styles.vitalUnit}>SpO2 (Oxygen)</Text>
            <Text style={styles.vitalStatus}>Optimal</Text>
          </View>
        </View>

        {/* In-Clinic Clinical Observations */}
        <View style={styles.notesCard}>
          <View style={styles.notesHeader}>
            <Icon name="medkit-outline" size={20} color={colors.primary} />
            <Text style={styles.notesTitle}>{"Doctor's"} Physical Checkup Notes</Text>
          </View>
          <Text style={styles.notesBody}>
            Patient examined in-person at OPD Room #204. Chest auscultation indicates clear bilateral breath sounds. Mild pharyngeal redness noted. Heart sounds S1/S2 audible, no murmurs. Physical prescription generated for 5 days of medication.
          </Text>
          <View style={styles.verifiedRow}>
            <Icon name="shield-checkmark" size={16} color={colors.success} />
            <Text style={styles.verifiedText}>Verified by {doctor.name}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionSection}>
          <Button
            title="View Prescribed Medicines"
            onPress={() =>
              navigation.navigate('Prescription', { doctorId: doctor.id })
            }
            iconName="document-text-outline"
            size="lg"
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleFinishConsultation}
            style={styles.finishBtn}
          >
            <Icon name="checkmark-done" size={18} color={colors.primary} />
            <Text style={styles.finishBtnText}>Complete Visit & Leave Room</Text>
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
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
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
  tokenBanner: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  tokenLeft: {},
  tokenSub: {
    ...typography.captionBold,
    color: '#94A3B8',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  tokenNumber: {
    fontSize: 34,
    fontWeight: '900',
    color: '#38BDF8',
    marginTop: 2,
  },
  tokenRight: {
    alignItems: 'flex-end',
  },
  statusActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 163, 74, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    gap: 4,
    marginBottom: 6,
  },
  statusActiveText: {
    ...typography.captionBold,
    color: '#4ADE80',
    fontSize: 11,
  },
  patientName: {
    ...typography.captionBold,
    color: colors.white,
    fontSize: 13,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  doctorPhoto: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.backgroundSecondary,
  },
  doctorInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  doctorName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  doctorSpecialty: {
    ...typography.captionBold,
    color: colors.primary,
    marginTop: 2,
  },
  hospitalText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
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
  vitalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  vitalUnit: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  vitalStatus: {
    ...typography.captionBold,
    color: colors.success,
    fontSize: 11,
    marginTop: 4,
  },
  notesCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.xl,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  notesTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  notesBody: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 4,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  verifiedText: {
    ...typography.captionBold,
    color: colors.textPrimary,
    fontSize: 12,
  },
  actionSection: {
    gap: spacing.md,
  },
  finishBtn: {
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
  finishBtnText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
});

export default VideoCallScreen;
