import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, fonts } from '../../theme';
import Icon from '../../components/Icon';
import Button from '../../components/Button';
import { LinearGradient } from '../../components/LinearGradient';
import { useApp } from '../../context/AppContext';
import { DoctorDelayType, QueueItem } from '../../types';

interface DoctorDashboardScreenProps {
  navigation: any;
}

export const DoctorDashboardScreen: React.FC<DoctorDashboardScreenProps> = ({
  navigation,
}) => {
  const {
    doctors,
    queueStatus,
    callNextPatient,
    skipPatient,
    markNoShow,
    recallSkippedPatient,
    pauseQueue,
    resumeQueue,
    setDoctorDelay,
    startConsultation,
    medicalReports,
    prescriptions,
    isCurrentDoctorVerified,
    currentUser,
  } = useApp();

  const currentDoctor =
    doctors.find((d) => d.id === currentUser?.uid || d.name === currentUser?.name) || {
      id: currentUser?.uid || 'doc-1',
      name: currentUser?.name || 'Dr. Physician',
      specialty: currentUser?.specialty || 'General Physician',
      hospital: currentUser?.hospital || 'MediCare Central Clinic',
      photo:
        currentUser?.photoUrl ||
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
      rating: 5.0,
      reviewsCount: 1,
      patientsCount: 0,
      fees: 2500,
    };

  // Modals state
  const [selectedQueuePatient, setSelectedQueuePatient] = useState<QueueItem | null>(null);
  const [delayModalVisible, setDelayModalVisible] = useState(false);

  // Compute live queue counts
  const currentServing = queueStatus.currentServing;
  const waitingCount = queueStatus.queue.filter(
    (q) => q.status === 'waiting' || q.status === 'next'
  ).length;
  const completedCount = queueStatus.queue.filter((q) => q.status === 'completed').length;
  const skippedCount = queueStatus.skippedTokens.length;

  const currentServingPatient = queueStatus.queue.find((q) => q.tokenNumber === currentServing);
  const nextPatient = queueStatus.queue.find((q) => q.tokenNumber === currentServing + 1);

  // Confirmation before Calling Next
  const confirmCallNext = () => {
    if (!isCurrentDoctorVerified) {
      Alert.alert(
        'License Verification Required',
        'Your medical license is undergoing credential review. Please complete verification before calling live patients in OPD.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Verify Account',
            onPress: () => navigation.navigate('DoctorVerification'),
          },
        ]
      );
      return;
    }

    Alert.alert(
      'Call Next Patient',
      `Advance queue from Token #${currentServing} to #${currentServing + 1} (${nextPatient?.patientName || 'Next Patient'})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          onPress: () => {
            callNextPatient();
            Alert.alert(
              'Patient Called',
              `Calling Token #${currentServing + 1} to Room #204. Waiting room chimes and patient app alert sent.`
            );
          },
        },
      ]
    );
  };

  // Confirmation before Skip
  const confirmSkip = () => {
    Alert.alert(
      'Skip Patient',
      `Move Token #${currentServing} (${currentServingPatient?.patientName || 'Patient'}) to skipped roster?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip Patient',
          style: 'destructive',
          onPress: () => {
            skipPatient();
          },
        },
      ]
    );
  };

  // Confirmation before No-Show
  const confirmNoShow = () => {
    Alert.alert(
      'Mark as No-Show',
      `Mark Token #${currentServing} (${currentServingPatient?.patientName || 'Patient'}) as Absent / No-Show? This updates their appointment status.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark No-Show',
          style: 'destructive',
          onPress: () => {
            markNoShow();
          },
        },
      ]
    );
  };

  // Delay settings list
  const delayOptions: { type: DoctorDelayType; label: string; minutes: number }[] = [
    { type: 'on_time', label: 'Running on Time', minutes: 0 },
    { type: 'delayed_10', label: 'Running 10 min late', minutes: 10 },
    { type: 'delayed_20', label: 'Running 20 min late', minutes: 20 },
    { type: 'delayed_30', label: 'Running 30 min late', minutes: 30 },
    { type: 'emergency_delay', label: 'Emergency Delay (~45 min)', minutes: 45 },
  ];

  const handleSelectDelay = (opt: { type: DoctorDelayType; minutes: number }) => {
    setDoctorDelay(opt.type, opt.minutes);
    setDelayModalVisible(false);
    Alert.alert(
      'Schedule Updated',
      opt.minutes === 0
        ? 'Doctor schedule restored to On-Time. Waiting times normalized.'
        : `Schedule set to ${opt.minutes} minutes late. All patient estimated wait times updated.`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Doctor Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Hello, {currentDoctor.name} 👋</Text>
          <Text style={styles.specialtySubtitle}>
            {currentDoctor.specialty} • {currentDoctor.hospital}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setDelayModalVisible(true)}
            style={styles.delayBadgeBtn}
          >
            <Icon
              name={queueStatus.delayStatus.status === 'on_time' ? 'time-outline' : 'warning-outline'}
              size={14}
              color={queueStatus.delayStatus.status === 'on_time' ? colors.primary : '#B45309'}
            />
            <Text
              style={[
                styles.delayBadgeText,
                queueStatus.delayStatus.status !== 'on_time' && { color: '#B45309' },
              ]}
            >
              {queueStatus.delayStatus.status === 'on_time'
                ? 'On Schedule'
                : `+${queueStatus.delayStatus.delayMinutes}m Late`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('DoctorProfileTab')}
            style={styles.avatarButton}
          >
            <Image source={{ uri: currentDoctor.photo }} style={styles.avatarImage} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Verification Status Banner */}
        {!isCurrentDoctorVerified && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('DoctorVerification')}
            style={styles.verificationBanner}
          >
            <View style={styles.verificationBannerIcon}>
              <Icon name="shield-outline" size={20} color={colors.warning} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.verificationBannerTitle}>Credentials Under Review</Text>
                <View style={styles.verificationBannerTag}>
                  <Text style={styles.verificationBannerTagText}>PENDING</Text>
                </View>
              </View>
              <Text style={styles.verificationBannerSubtitle}>
                Complete license verification to unlock live OPD consultations & verified trust badge.
              </Text>
            </View>
            <Icon name="chevron-forward" size={16} color={colors.warning} />
          </TouchableOpacity>
        )}

        {/* Professional Queue Control Center Card */}
        <View style={styles.queueControlCard}>
          <LinearGradient
            colors={['#0A1428', '#0D1B2E', '#0A1428']}
            style={styles.queueBg}
          >
            <View style={styles.queueOverlay}>
              <View style={styles.queueControlTop}>
                <View style={styles.liveTag}>
                  <View style={styles.pulseDot} />
                  <Text style={styles.liveTagText}>{"TODAY'S OPD QUEUE CONTROLLER"}</Text>
                </View>
                <Text style={styles.clinicRoomText}>Room #204</Text>
              </View>

              {/* Status Metric Counter Grid */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricItemPrimary}>
                  <Text style={styles.metricLabel}>Currently Serving</Text>
                  <Text style={styles.metricNumberPrimary}>#{currentServing}</Text>
                  <Text style={styles.metricSubText} numberOfLines={1}>
                    {currentServingPatient?.patientName || 'In Consultation'}
                  </Text>
                </View>

                <View style={styles.metricsTriple}>
                  <View style={styles.miniMetric}>
                    <Text style={styles.miniMetricLabel}>Waiting</Text>
                    <Text style={styles.miniMetricValue}>{waitingCount}</Text>
                  </View>
                  <View style={styles.miniMetric}>
                    <Text style={styles.miniMetricLabel}>Completed</Text>
                    <Text style={[styles.miniMetricValue, { color: colors.success }]}>
                      {completedCount}
                    </Text>
                  </View>
                  <View style={styles.miniMetric}>
                    <Text style={styles.miniMetricLabel}>Skipped</Text>
                    <Text style={[styles.miniMetricValue, { color: '#F87171' }]}>
                      {skippedCount}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Next in line prompt */}
              <View style={styles.nextInLineBox}>
                <Icon name="arrow-forward-circle" size={16} color="#38BDF8" />
                <Text style={styles.nextInLineText}>
                  Next in line: <Text style={styles.boldText}>Token #{currentServing + 1}</Text> ({nextPatient?.patientName || 'Waiting'})
                </Text>
                {nextPatient?.checkInStatus === 'Checked In' && (
                  <View style={styles.arrivedPill}>
                    <Text style={styles.arrivedPillText}>Arrived</Text>
                  </View>
                )}
              </View>

              {/* Large Interactive Control Buttons */}
              <View style={styles.buttonActionGrid}>
                <TouchableOpacity
                  style={[styles.bigCallBtn, queueStatus.isPaused && { opacity: 0.5 }]}
                  activeOpacity={0.8}
                  onPress={confirmCallNext}
                  disabled={queueStatus.isPaused}
                >
                  <Icon name="megaphone" size={20} color={colors.white} />
                  <Text style={styles.bigCallText}>CALL NEXT PATIENT</Text>
                </TouchableOpacity>

                <View style={styles.actionRowSecond}>
                  <TouchableOpacity
                    style={styles.subActionBtn}
                    activeOpacity={0.7}
                    onPress={confirmSkip}
                  >
                    <Icon name="play-skip-forward-outline" size={16} color="#E2E8F0" />
                    <Text style={styles.subActionText}>Skip</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.subActionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}
                    activeOpacity={0.7}
                    onPress={confirmNoShow}
                  >
                    <Icon name="close-circle-outline" size={16} color="#F87171" />
                    <Text style={[styles.subActionText, { color: '#F87171' }]}>Mark Absent</Text>
                  </TouchableOpacity>

                  {queueStatus.isPaused ? (
                    <TouchableOpacity
                      style={[styles.subActionBtn, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}
                      activeOpacity={0.7}
                      onPress={resumeQueue}
                    >
                      <Icon name="play-outline" size={16} color="#4ADE80" />
                      <Text style={[styles.subActionText, { color: '#4ADE80' }]}>Resume</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.subActionBtn}
                      activeOpacity={0.7}
                      onPress={pauseQueue}
                    >
                      <Icon name="pause-outline" size={16} color="#FBBF24" />
                      <Text style={[styles.subActionText, { color: '#FBBF24' }]}>Pause</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Recall skipped patients if any exist */}
                {queueStatus.skippedTokens.length > 0 && (
                  <View style={styles.skippedBar}>
                    <Text style={styles.skippedBarLabel}>Skipped Tokens:</Text>
                    {queueStatus.skippedTokens.map((st) => (
                      <TouchableOpacity
                        key={st}
                        style={styles.recallChip}
                        onPress={() => recallSkippedPatient(st)}
                      >
                        <Text style={styles.recallChipText}>Recall #{st} ↺</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Queue Details Section */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Queue Details & Patients</Text>
            <Text style={styles.sectionSub}>Tap any patient to inspect clinical file or write Rx</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('DoctorAvailability')}
            style={styles.scheduleLink}
          >
            <Text style={styles.scheduleLinkText}>Configure OPD ⚙</Text>
          </TouchableOpacity>
        </View>

        {queueStatus.queue.map((item) => {
          const isServing = item.tokenNumber === currentServing;
          const isCompleted = item.status === 'completed';
          const isSkipped = item.status === 'skipped';
          const isNoShow = item.status === 'no_show';

          return (
            <TouchableOpacity
              key={item.tokenNumber}
              activeOpacity={0.7}
              style={[
                styles.patientQueueCard,
                isServing && styles.patientQueueCardServing,
                isCompleted && { opacity: 0.7 },
              ]}
              onPress={() => setSelectedQueuePatient(item)}
            >
              <View
                style={[
                  styles.patientTokenCircle,
                  isServing && styles.tokenCircleServing,
                  isCompleted && styles.tokenCircleDone,
                ]}
              >
                <Text
                  style={[
                    styles.patientTokenNumber,
                    isServing && styles.patientTokenNumberServing,
                  ]}
                >
                  #{item.tokenNumber}
                </Text>
              </View>

              <View style={styles.patientInfoCol}>
                <View style={styles.patientNameLine}>
                  <Text style={styles.patientNameText}>{item.patientName}</Text>
                  <Text style={styles.aptTimeText}>{item.appointmentTime || item.estimatedTime}</Text>
                </View>

                <Text style={styles.patientSymptomsText} numberOfLines={1}>
                  {item.symptoms || 'General OPD Consultation'}
                </Text>

                <View style={styles.patientBadgesRow}>
                  {item.checkInStatus === 'Checked In' ? (
                    <View style={styles.checkInTag}>
                      <Icon name="checkmark" size={10} color={colors.successText} />
                      <Text style={styles.checkInTagText}>Checked In</Text>
                    </View>
                  ) : (
                    <View style={styles.notCheckedInTag}>
                      <Text style={styles.notCheckedInTagText}>Not Checked In</Text>
                    </View>
                  )}

                  {isServing && (
                    <View style={styles.servingTag}>
                      <Text style={styles.servingTagText}>In Room</Text>
                    </View>
                  )}
                  {isSkipped && (
                    <View style={styles.skippedTag}>
                      <Text style={styles.skippedTagText}>Skipped</Text>
                    </View>
                  )}
                  {isNoShow && (
                    <View style={styles.noShowTag}>
                      <Text style={styles.noShowTagText}>No-Show</Text>
                    </View>
                  )}
                </View>
              </View>

              <Icon name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Patient Details Inspection Modal */}
      <Modal
        visible={!!selectedQueuePatient}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedQueuePatient(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Patient OPD File</Text>
                <Text style={styles.modalSub}>Token #{selectedQueuePatient?.tokenNumber} • Clinic Room #204</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedQueuePatient(null)}
                style={styles.closeBtn}
              >
                <Icon name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {selectedQueuePatient && (
                <View style={styles.modalBody}>
                  {/* Demographics */}
                  <View style={styles.demographicsCard}>
                    <View style={styles.demoAvatar}>
                      <Icon name="person" size={24} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.demoName}>{selectedQueuePatient.patientName}</Text>
                      <Text style={styles.demoDetails}>
                        {selectedQueuePatient.patientAge || 29} yrs • {selectedQueuePatient.patientGender || 'Male'} • Blood: B+
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.checkInTag,
                        selectedQueuePatient.checkInStatus !== 'Checked In' && {
                          backgroundColor: '#FEF3C7',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.checkInTagText,
                          selectedQueuePatient.checkInStatus !== 'Checked In' && {
                            color: '#B45309',
                          },
                        ]}
                      >
                        {selectedQueuePatient.checkInStatus || 'Waiting'}
                      </Text>
                    </View>
                  </View>

                  {/* Symptoms & Chief Complaint */}
                  <View style={styles.sectionBox}>
                    <Text style={styles.sectionLabel}>Chief Symptoms / Complaint</Text>
                    <Text style={styles.sectionBodyText}>
                      {selectedQueuePatient.symptoms || 'Persistent throat discomfort and elevated evening temperature.'}
                    </Text>
                  </View>

                  {/* Uploaded Reports Preview */}
                  <View style={styles.sectionBox}>
                    <Text style={styles.sectionLabel}>Uploaded Medical Reports (2)</Text>
                    {medicalReports.slice(0, 2).map((rep) => (
                      <View key={rep.id} style={styles.reportRowMini}>
                        <Icon name="document-attach-outline" size={16} color={colors.primary} />
                        <View style={{ flex: 1, marginLeft: 8 }}>
                          <Text style={styles.reportRowTitle}>{rep.title}</Text>
                          <Text style={styles.reportRowMeta}>{rep.fileFormat} • {rep.fileSize} • {rep.uploadDate}</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => Alert.alert('Report Preview', `Viewing ${rep.title}\nDoctor Notes: ${rep.doctorNotes}`)}
                        >
                          <Text style={styles.previewLink}>View</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>

                  {/* Previous Prescriptions History */}
                  <View style={styles.sectionBox}>
                    <Text style={styles.sectionLabel}>Previous Prescription Records</Text>
                    {prescriptions.slice(0, 1).map((rx) => (
                      <View key={rx.id} style={styles.rxRecordCard}>
                        <Text style={styles.rxDate}>{rx.date} - Diagnosis: {rx.diagnosis}</Text>
                        <Text style={styles.rxMeds}>
                          {rx.medicines.map((m) => m.name).join(', ')}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <Button
                title="Write E-Prescription"
                variant="primary"
                onPress={() => {
                  const pName = selectedQueuePatient?.patientName || 'Patient';
                  setSelectedQueuePatient(null);
                  navigation.navigate('WritePrescription', { patientName: pName });
                }}
                iconName="create-outline"
                style={{ flex: 1 }}
              />
              <Button
                title="Start Consultation"
                variant="secondary"
                onPress={() => {
                  if (selectedQueuePatient?.appointmentId) {
                    startConsultation(selectedQueuePatient.appointmentId);
                  }
                  Alert.alert('Consultation Started', `Now consulting with ${selectedQueuePatient?.patientName}.`);
                  setSelectedQueuePatient(null);
                }}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Delay Settings Modal */}
      <Modal
        visible={delayModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDelayModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.delayDialog}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Doctor Schedule Delay</Text>
              <TouchableOpacity onPress={() => setDelayModalVisible(false)}>
                <Icon name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.delayDialogHint}>
              Selecting a delay automatically recalibrates patient wait times and notifies queue members.
            </Text>

            {delayOptions.map((opt) => {
              const isSelected = queueStatus.delayStatus.status === opt.type;
              return (
                <TouchableOpacity
                  key={opt.type}
                  style={[
                    styles.delayOptionRow,
                    isSelected && styles.delayOptionRowActive,
                  ]}
                  onPress={() => handleSelectDelay(opt)}
                >
                  <Icon
                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={isSelected ? colors.primary : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.delayOptionText,
                      isSelected && styles.delayOptionTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    ...typography.h3,
    fontSize: 18,
    color: colors.textPrimary,
  },
  specialtySubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  delayBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
  },
  delayBadgeText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.primary,
  },
  avatarButton: {
    padding: 2,
  },
  avatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryLight,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.huge,
  },
  queueControlCard: {
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  queueBg: {
    width: '100%',
  },
  queueOverlay: {
    padding: spacing.lg,
  },
  queueControlTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38BDF8',
  },
  liveTagText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  clinicRoomText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.white,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metricItemPrimary: {
    flex: 1.2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  metricLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: '#94A3B8',
  },
  metricNumberPrimary: {
    fontFamily: fonts.extrabold,
    fontSize: 36,
    color: '#F59E0B',
    lineHeight: 42,
  },
  metricSubText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.white,
    marginTop: 2,
  },
  metricsTriple: {
    flex: 1,
    gap: 6,
  },
  miniMetric: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  miniMetricLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: '#94A3B8',
  },
  miniMetricValue: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.white,
  },
  nextInLineBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    marginBottom: 14,
  },
  nextInLineText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: '#E2E8F0',
    flex: 1,
  },
  boldText: {
    fontFamily: fonts.bold,
    color: '#38BDF8',
  },
  arrivedPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  arrivedPillText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: '#15803D',
  },
  buttonActionGrid: {
    gap: 8,
  },
  bigCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
  },
  bigCallText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.white,
    letterSpacing: 0.5,
  },
  actionRowSecond: {
    flexDirection: 'row',
    gap: 8,
  },
  subActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  subActionText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: '#E2E8F0',
  },
  skippedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  skippedBarLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: '#94A3B8',
  },
  recallChip: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  recallChipText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: '#FCA5A5',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.textPrimary,
  },
  sectionSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  scheduleLink: {
    paddingVertical: 4,
  },
  scheduleLinkText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.primary,
  },
  patientQueueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  patientQueueCardServing: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
  },
  patientTokenCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 12,
  },
  tokenCircleServing: {
    backgroundColor: '#F59E0B',
    borderColor: '#D97706',
  },
  tokenCircleDone: {
    backgroundColor: '#E2E8F0',
  },
  patientTokenNumber: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  patientTokenNumberServing: {
    color: colors.white,
  },
  patientInfoCol: {
    flex: 1,
  },
  patientNameLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientNameText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  aptTimeText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  patientSymptomsText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  patientBadgesRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  checkInTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  checkInTagText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: '#15803D',
  },
  notCheckedInTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  notCheckedInTagText: {
    fontFamily: fonts.medium,
    fontSize: 9,
    color: '#64748B',
  },
  servingTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  servingTagText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: '#B45309',
  },
  skippedTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  skippedTagText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: '#DC2626',
  },
  noShowTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  noShowTagText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: '#991B1B',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 20, 40, 0.75)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  modalSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    gap: 12,
    paddingBottom: 16,
  },
  demographicsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    padding: 12,
    borderRadius: borderRadius.md,
    gap: 12,
  },
  demoAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoName: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  demoDetails: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionBox: {
    backgroundColor: colors.surfaceMuted,
    padding: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  sectionLabel: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  sectionBodyText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  reportRowMini: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  reportRowTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.textPrimary,
  },
  reportRowMeta: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.textSecondary,
  },
  previewLink: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.primary,
    paddingHorizontal: 8,
  },
  rxRecordCard: {
    backgroundColor: colors.white,
    padding: 8,
    borderRadius: 8,
  },
  rxDate: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.textPrimary,
  },
  rxMeds: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  delayDialog: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 'auto',
    marginTop: 'auto',
  },
  delayDialogHint: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 16,
  },
  delayOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: colors.surfaceMuted,
  },
  delayOptionRowActive: {
    backgroundColor: colors.primaryLight,
  },
  delayOptionText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  delayOptionTextActive: {
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  verificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  verificationBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verificationBannerTitle: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: '#92400E',
  },
  verificationBannerTag: {
    backgroundColor: '#FDE68A',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  verificationBannerTagText: {
    fontSize: 9,
    fontFamily: fonts.bold,
    color: '#78350F',
    letterSpacing: 0.5,
  },
  verificationBannerSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
    lineHeight: 15,
  },
});

export default DoctorDashboardScreen;
