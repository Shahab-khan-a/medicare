import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, fonts } from '../../theme';
import Icon from '../../components/Icon';
import Header from '../../components/Header';
import Button from '../../components/Button';
import { LinearGradient } from '../../components/LinearGradient';
import QRCodeModal from '../../components/QRCodeModal';
import { useApp } from '../../context/AppContext';
import { Appointment } from '../../types';

interface LiveQueueTrackerScreenProps {
  navigation: any;
  route: any;
}

export const LiveQueueTrackerScreen: React.FC<LiveQueueTrackerScreenProps> = ({
  navigation,
  route,
}) => {
  const {
    queueStatus,
    appointments,
    checkInPatient,
    callNextPatient,
    setDoctorDelay,
    currentUser,
  } = useApp();

  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Find user's active appointment
  const routeAppointment: Appointment | undefined = route?.params?.appointment;
  const userAppointment =
    routeAppointment ||
    appointments.find(
      (a) =>
        (queueStatus.userToken > 0 && a.tokenNumber === queueStatus.userToken) ||
        (a.status !== 'Completed' && a.status !== 'completed' && a.status !== 'Cancelled' && a.status !== 'cancelled')
    );

  const hasActiveToken = Boolean(userAppointment?.tokenNumber || (queueStatus.userToken && queueStatus.userToken > 0));
  const userToken = userAppointment?.tokenNumber || queueStatus.userToken || 0;
  const currentServing = queueStatus.currentServing;
  const patientsAhead = Math.max(0, userToken - currentServing);
  const isCheckedIn = userAppointment?.checkInStatus === 'Checked In';

  // Dynamic wait calculation with delay factor
  const waitMinutes = queueStatus.estimatedWaitMinutes;

  // Build the progression chain (e.g. Token #11 -> #12 -> #13 -> #14 -> YOUR TOKEN #15)
  const progressTokens: number[] = [];
  const startTok = Math.min(currentServing, userToken);
  const endTok = Math.max(currentServing, userToken);
  for (let t = startTok; t <= endTok && t <= startTok + 5; t++) {
    progressTokens.push(t);
  }

  const handleCheckIn = () => {
    if (userAppointment) {
      checkInPatient(userAppointment.id);
      Alert.alert(
        'Check-In Successful ✓',
        `You are successfully checked in for Token #${userToken} at ${queueStatus.room}. The doctor's console now marks you as arrived.`
      );
    }
  };

  const handleSimulateAlerts = () => {
    Alert.alert(
      'OPD Queue Bell Alert',
      `🔔 Chime Sound Triggered!\nToken #${currentServing} called to ${queueStatus.room}.\nPush Notification & SMS: Sent to patient.`,
      [{ text: 'OK' }]
    );
  };

  if (!hasActiveToken || userToken <= 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <Header
          title="Live OPD Queue Tracker"
          showBack
          onBack={() => navigation.goBack()}
        />
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconCircle}>
            <Icon name="ticket-outline" size={48} color={colors.primary} />
          </View>
          <Text style={styles.emptyStateTitle}>No Active OPD Token</Text>
          <Text style={styles.emptyStateSubtitle}>
            You do not currently have an active in-clinic consultation token. Book an appointment with a clinic doctor to track your live queue turn.
          </Text>
          <Button
            title="Book OPD Consultation"
            onPress={() => navigation.navigate('DoctorList')}
            size="lg"
            style={{ marginTop: spacing.xl, width: '100%' }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <Header
        title="Live OPD Queue Tracker"
        showBack
        onBack={() => navigation.goBack()}
        rightIcon="notifications-outline"
        onRightPress={handleSimulateAlerts}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Doctor Delay Alert Banner */}
        {queueStatus.delayStatus.status !== 'on_time' && (
          <View style={styles.delayBanner}>
            <Icon name="warning" size={20} color="#B45309" />
            <View style={styles.delayBannerTextWrap}>
              <Text style={styles.delayBannerTitle}>Doctor Schedule Notice</Text>
              <Text style={styles.delayBannerMsg}>
                {queueStatus.delayStatus.message}
              </Text>
            </View>
          </View>
        )}

        {/* Queue Paused Banner */}
        {queueStatus.isPaused && (
          <View style={styles.pausedBanner}>
            <Icon name="pause-circle" size={20} color="#DC2626" />
            <View style={styles.delayBannerTextWrap}>
              <Text style={styles.pausedBannerTitle}>OPD Queue Paused</Text>
              <Text style={styles.pausedBannerMsg}>
                Doctor is attending an emergency inpatient review. Tokens will resume shortly.
              </Text>
            </View>
          </View>
        )}

        {/* Digital Slip Card */}
        <View style={styles.digitalSlipCard}>
          <LinearGradient
            colors={['#0A1428', '#0D1B2E']}
            style={styles.slipHeaderBg}
          >
            <View style={styles.slipHeaderOverlay}>
              <View style={styles.slipHeaderRow}>
                <View>
                  <View style={styles.hospitalBrandRow}>
                    <Icon name="business" size={14} color="#38BDF8" />
                    <Text style={styles.hospitalTitle}>{queueStatus.hospital}</Text>
                  </View>
                  <Text style={styles.slipDoctorName}>{userAppointment?.doctorName || queueStatus.doctorName}</Text>
                  <Text style={styles.slipRoom}>{userAppointment?.opdRoom || queueStatus.room} • {userAppointment?.shift || queueStatus.shift}</Text>
                </View>
                <View style={styles.shiftBadge}>
                  <Text style={styles.shiftBadgeText}>OPD Active</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.cutoutRow}>
            <View style={styles.leftCutout} />
            <View style={styles.dashedLine} />
            <View style={styles.rightCutout} />
          </View>

          {/* Core Metrics: YOUR TOKEN, NOW SERVING, PATIENTS AHEAD, WAIT, ROOM */}
          <View style={styles.statsGrid}>
            <View style={styles.statBoxPrimary}>
              <Text style={styles.statLabelMuted}>YOUR TOKEN</Text>
              <Text style={styles.statValueLarge}>#{userToken}</Text>
              <Text style={styles.statSubText}>{userAppointment?.patientName || currentUser?.name || 'Verified Patient'}</Text>
            </View>

            <View style={styles.statBoxAccent}>
              <Text style={styles.statLabelMuted}>NOW SERVING</Text>
              <Text style={styles.statValueServing}>#{currentServing}</Text>
              <Text style={styles.statSubTextServing}>
                {patientsAhead === 0 ? 'Inside Room' : `${patientsAhead} ahead`}
              </Text>
            </View>
          </View>

          <View style={styles.subStatsRow}>
            <View style={styles.subStatItem}>
              <Text style={styles.subStatLabel}>PATIENTS AHEAD</Text>
              <Text style={styles.subStatValue}>{patientsAhead}</Text>
            </View>
            <View style={styles.subDivider} />
            <View style={styles.subStatItem}>
              <Text style={styles.subStatLabel}>ESTIMATED WAIT</Text>
              <Text style={styles.subStatValueHighlight}>~{waitMinutes} MIN</Text>
              <Text style={styles.approxNote}>(approximate)</Text>
            </View>
            <View style={styles.subDivider} />
            <View style={styles.subStatItem}>
              <Text style={styles.subStatLabel}>ROOM</Text>
              <Text style={styles.subStatValue}>204</Text>
            </View>
          </View>

          {/* Progress Timeline Indicator */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressTitle}>QUEUE PROGRESS CHAIN</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.progressRow}
            >
              {progressTokens.map((tok, idx) => {
                const isServing = tok === currentServing;
                const isMine = tok === userToken;
                return (
                  <React.Fragment key={tok}>
                    <View
                      style={[
                        styles.tokenStepPill,
                        isServing && styles.tokenStepPillServing,
                        isMine && styles.tokenStepPillMine,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tokenStepPillText,
                          (isServing || isMine) && styles.tokenStepPillTextActive,
                        ]}
                      >
                        {isMine ? `YOUR TOKEN #${tok}` : `#${tok}`}
                      </Text>
                    </View>
                    {idx < progressTokens.length - 1 && (
                      <Icon name="arrow-forward" size={14} color="#94A3B8" />
                    )}
                  </React.Fragment>
                );
              })}
            </ScrollView>
          </View>

          {/* Digital Check-In Module */}
          <View style={styles.checkInCard}>
            <View style={styles.checkInHeader}>
              <View style={styles.checkInIconBox}>
                <Icon
                  name={isCheckedIn ? 'checkmark-circle' : 'location-outline'}
                  size={20}
                  color={isCheckedIn ? colors.success : colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.checkInTitle}>Digital Arrival Check-In</Text>
                <Text style={styles.checkInSub}>
                  {isCheckedIn
                    ? `✓ Checked In at ${userAppointment?.checkInTime || 'OPD Lobby'} • Doctor notified`
                    : 'Check in when you reach clinic lobby to secure queue position'}
                </Text>
              </View>
            </View>

            {!isCheckedIn ? (
              <Button
                title="CHECK IN NOW"
                variant="primary"
                onPress={handleCheckIn}
                iconName="checkmark-circle"
                style={styles.checkInBtn}
              />
            ) : (
              <View style={styles.checkedInStatusPill}>
                <Icon name="checkmark-done" size={16} color={colors.successText} />
                <Text style={styles.checkedInStatusText}>Verified at Clinic Lobby</Text>
              </View>
            )}
          </View>

          {/* Dynamic Status Guidance Banner */}
          <View
            style={[
              styles.bannerBox,
              patientsAhead === 0 && styles.bannerBoxServing,
              patientsAhead <= 2 && patientsAhead > 0 && styles.bannerBoxUrgent,
            ]}
          >
            <Icon
              name={
                patientsAhead === 0
                  ? 'checkmark-circle'
                  : patientsAhead <= 2
                  ? 'alarm'
                  : 'information-circle'
              }
              size={20}
              color={
                patientsAhead === 0
                  ? colors.success
                  : patientsAhead <= 2
                  ? colors.error
                  : colors.primary
              }
            />
            <Text
              style={[
                styles.bannerText,
                patientsAhead === 0 && styles.bannerTextServing,
                patientsAhead <= 2 && styles.bannerTextUrgent,
              ]}
            >
              {patientsAhead === 0
                ? `🔔 PLEASE ENTER ${userAppointment?.opdRoom || queueStatus.room || 'THE OPD ROOM'}. ${(userAppointment?.doctorName || queueStatus.doctorName || 'THE DOCTOR').toUpperCase()} IS WAITING!`
                : patientsAhead === 1
                ? `⚡ You are next! Please stand by directly outside ${userAppointment?.opdRoom || queueStatus.room || 'the consultation room'}.`
                : patientsAhead === 2
                ? `⏱ 2 patients remaining. Please proceed towards ${userAppointment?.opdRoom || queueStatus.room || 'the OPD room'}.`
                : `${userAppointment?.doctorName || queueStatus.doctorName || 'The Doctor'} is serving Token #${currentServing}. You have approximately ${waitMinutes} mins.`}
            </Text>
          </View>

          {/* Actions: QR Pass + Refresh + Bell chime */}
          <View style={styles.cardActionsRow}>
            <TouchableOpacity
              style={styles.cardActionBtn}
              activeOpacity={0.7}
              onPress={() => setQrModalVisible(true)}
            >
              <Icon name="qr-code-outline" size={16} color={colors.primary} />
              <Text style={styles.cardActionText}>Show QR Pass</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cardActionBtn}
              activeOpacity={0.7}
              onPress={callNextPatient}
            >
              <Icon name="play-forward" size={16} color={colors.primary} />
              <Text style={styles.cardActionText}>Call Next (Demo)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cardActionBtn}
              activeOpacity={0.7}
              onPress={handleSimulateAlerts}
            >
              <Icon name="volume-high-outline" size={16} color={colors.primary} />
              <Text style={styles.cardActionText}>Sound Bell</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Live Queue Order List */}
        <View style={styles.queueHeaderRow}>
          <Text style={styles.queueSectionTitle}>{"Today's OPD Queue Roster"}</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.greenPulseDot} />
            <Text style={styles.liveIndicatorText}>
              {autoRefresh ? 'Live Synced' : 'Paused'}
            </Text>
          </View>
        </View>

        {queueStatus.queue.map((item) => {
          const isCurrent = item.tokenNumber === currentServing;
          const isUser = item.tokenNumber === userToken;
          const isCompleted = item.status === 'completed';
          const isSkipped = item.status === 'skipped';

          return (
            <View
              key={item.tokenNumber}
              style={[
                styles.queueItemRow,
                isCurrent && styles.queueItemServing,
                isUser && styles.queueItemUser,
                isSkipped && styles.queueItemSkipped,
              ]}
            >
              <View
                style={[
                  styles.tokenBadge,
                  isCurrent && styles.tokenBadgeServing,
                  isUser && styles.tokenBadgeUser,
                  isCompleted && styles.tokenBadgePassed,
                  isSkipped && styles.tokenBadgeSkipped,
                ]}
              >
                <Text
                  style={[
                    styles.tokenBadgeText,
                    (isCurrent || isUser) && styles.tokenBadgeTextLight,
                  ]}
                >
                  #{item.tokenNumber}
                </Text>
              </View>

              <View style={styles.queueItemDetails}>
                <View style={styles.queuePatientLine}>
                  <Text
                    style={[
                      styles.queuePatientName,
                      isUser && styles.queuePatientNameUser,
                    ]}
                  >
                    {item.patientName} {isUser && '(You)'}
                  </Text>
                  <Text style={styles.queueTimeText}>{item.appointmentTime || item.estimatedTime}</Text>
                </View>
                <View style={styles.queueMetaRow}>
                  <Text style={styles.queueSubInfo}>
                    {isCurrent
                      ? 'Currently in Room #204'
                      : isCompleted
                      ? 'Consultation Completed'
                      : isSkipped
                      ? 'Skipped / Awaiting recall'
                      : item.tokenNumber === currentServing + 1
                      ? 'Next Turn'
                      : 'Waiting in lobby'}
                  </Text>
                  {item.checkInStatus === 'Checked In' && (
                    <View style={styles.checkInTagMini}>
                      <Text style={styles.checkInTagMiniText}>Checked In</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.queueStatusBadge}>
                {isCurrent ? (
                  <View style={styles.servingPill}>
                    <Text style={styles.servingPillText}>Serving</Text>
                  </View>
                ) : isUser ? (
                  <View style={styles.yourTurnPill}>
                    <Text style={styles.yourTurnPillText}>Your Turn</Text>
                  </View>
                ) : isCompleted ? (
                  <Icon name="checkmark-done" size={16} color={colors.success} />
                ) : isSkipped ? (
                  <View style={styles.skippedPill}>
                    <Text style={styles.skippedPillText}>Skipped</Text>
                  </View>
                ) : (
                  <View style={styles.waitPill}>
                    <Text style={styles.waitPillText}>Wait</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* QR Pass Modal */}
      <QRCodeModal
        visible={qrModalVisible}
        onClose={() => setQrModalVisible(false)}
        appointmentData={{
          doctorName: queueStatus.doctorName,
          patientName: userAppointment?.patientName || currentUser?.name || 'Verified Patient',
          tokenNumber: userToken,
          date: userAppointment?.date || 'Today',
          time: userAppointment?.time || '10:30 AM',
          shift: queueStatus.shift,
          room: queueStatus.room,
          estimatedWait: `~${waitMinutes} min`,
          bookingId: userAppointment?.id || 'MC-98421',
        }}
      />
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
  delayBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: borderRadius.lg,
    padding: 12,
    marginBottom: spacing.md,
  },
  delayBannerTextWrap: {
    flex: 1,
  },
  delayBannerTitle: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: '#92400E',
  },
  delayBannerMsg: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#B45309',
    marginTop: 1,
  },
  pausedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: borderRadius.lg,
    padding: 12,
    marginBottom: spacing.md,
  },
  pausedBannerTitle: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: '#991B1B',
  },
  pausedBannerMsg: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#DC2626',
    marginTop: 1,
  },
  digitalSlipCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    paddingBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  slipHeaderBg: {
    width: '100%',
  },
  slipHeaderOverlay: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  slipHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  hospitalBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  hospitalTitle: {
    fontFamily: fonts.bold,
    color: '#38BDF8',
    fontSize: 12,
  },
  slipDoctorName: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.white,
    marginTop: 2,
  },
  slipRoom: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  shiftBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  shiftBadgeText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: '#38BDF8',
  },
  cutoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    backgroundColor: colors.card,
    marginTop: -10,
  },
  leftCutout: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.background,
    marginLeft: -10,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  rightCutout: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.background,
    marginRight: -10,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: 12,
  },
  statBoxPrimary: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    padding: 14,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  statBoxAccent: {
    flex: 1,
    backgroundColor: '#FEF3C7',
    padding: 14,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  statLabelMuted: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },
  statValueLarge: {
    fontFamily: fonts.extrabold,
    fontSize: 34,
    color: colors.primary,
    marginVertical: 2,
  },
  statValueServing: {
    fontFamily: fonts.extrabold,
    fontSize: 34,
    color: '#B45309',
    marginVertical: 2,
  },
  statSubText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.textPrimary,
  },
  statSubTextServing: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: '#92400E',
  },
  subStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  subStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  subStatLabel: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  subStatValue: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: 2,
  },
  subStatValueHighlight: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.accentText,
    marginTop: 2,
  },
  approxNote: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: colors.textMuted,
  },
  subDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  progressContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  progressTitle: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  tokenStepPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tokenStepPillServing: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  tokenStepPillMine: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  tokenStepPillText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  tokenStepPillTextActive: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
  },
  checkInCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  checkInHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  checkInIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkInTitle: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  checkInSub: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  checkInBtn: {
    marginTop: 4,
  },
  checkedInStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  checkedInStatusText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: '#15803D',
  },
  bannerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.primaryLight,
    padding: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  bannerBoxUrgent: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  bannerBoxServing: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  bannerText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.primary,
    lineHeight: 18,
  },
  bannerTextUrgent: {
    color: colors.errorText,
    fontFamily: fonts.bold,
  },
  bannerTextServing: {
    color: colors.successText,
    fontFamily: fonts.bold,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  cardActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardActionText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.primary,
  },
  queueHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  queueSectionTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.textPrimary,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  greenPulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.success,
  },
  liveIndicatorText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.successText,
  },
  queueItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  queueItemServing: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  queueItemUser: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  queueItemSkipped: {
    opacity: 0.6,
  },
  tokenBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.md,
  },
  tokenBadgeServing: {
    backgroundColor: '#F59E0B',
    borderColor: '#D97706',
  },
  tokenBadgeUser: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  tokenBadgePassed: {
    backgroundColor: '#E2E8F0',
  },
  tokenBadgeSkipped: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  tokenBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  tokenBadgeTextLight: {
    color: colors.white,
  },
  queueItemDetails: {
    flex: 1,
  },
  queuePatientLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  queuePatientName: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  queuePatientNameUser: {
    color: colors.primary,
    fontFamily: fonts.bold,
  },
  queueTimeText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  queueMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  queueSubInfo: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  checkInTagMini: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  checkInTagMiniText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: '#15803D',
  },
  queueStatusBadge: {
    marginLeft: spacing.sm,
  },
  servingPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  servingPillText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: '#B45309',
  },
  yourTurnPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  yourTurnPillText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.white,
  },
  waitPill: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  waitPillText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textSecondary,
  },
  skippedPill: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  skippedPillText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: '#DC2626',
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyStateTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  emptyStateSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 290,
  },
});

export default LiveQueueTrackerScreen;
