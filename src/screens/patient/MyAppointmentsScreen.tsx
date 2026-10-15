import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { colors, typography, spacing, borderRadius, fonts } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import Icon from '../../components/Icon';
import Button from '../../components/Button';
import AppointmentCard from '../../components/AppointmentCard';
import QRCodeModal from '../../components/QRCodeModal';
import { useApp } from '../../context/AppContext';
import { Appointment } from '../../types';
import { bookingDates, VISIT_SHIFTS, visitDateTime } from '../../utils/booking';

interface MyAppointmentsScreenProps {
  navigation: any;
}

type TabType = 'upcoming' | 'completed' | 'cancelled';

const TAB_CONFIG = [
  { key: 'upcoming', label: 'Upcoming', icon: 'calendar-outline', color: '#38BDF8' },
  { key: 'completed', label: 'Completed', icon: 'checkmark-done-circle-outline', color: '#4ADE80' },
  { key: 'cancelled', label: 'Cancelled', icon: 'close-circle-outline', color: '#F87171' },
] as const;

export const MyAppointmentsScreen: React.FC<MyAppointmentsScreenProps> = ({ navigation }) => {
  const {
    appointments,
    cancelAppointment,
    submitReview,
    rescheduleAppointment,
    doctors,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [reschedulingApt, setReschedulingApt] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const rescheduleDoctor = doctors.find(doctor => doctor.id === reschedulingApt?.doctorId);
  const rescheduleDates = rescheduleDoctor ? bookingDates(rescheduleDoctor) : [];

  // Cancellation Modal State
  const [cancellingApt, setCancellingApt] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('Changed plans');
  const [customReason, setCustomReason] = useState('');

  // Rating Modal State
  const [ratingApt, setRatingApt] = useState<Appointment | null>(null);
  const [starCount, setStarCount] = useState(5);
  const [waitingRating, setWaitingRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // QR Modal
  const [qrModalApt, setQrModalApt] = useState<Appointment | null>(null);

  const cancellationReasons = [
    'Changed plans',
    'Doctor unavailable',
    'Found another doctor',
    'Emergency at home',
    'Feeling better / no longer needed',
    'Other reason',
  ];

  const filteredAppointments = appointments.filter((apt) => {
    const s = (apt.status || '').toLowerCase();
    if (activeTab === 'upcoming') {
      return (
        s === 'upcoming' ||
        s === 'confirmed' ||
        s === 'waiting' ||
        s === 'in queue' ||
        s === 'inqueue' ||
        s === 'your turn' ||
        s === 'yourturn' ||
        s === 'in consultation' ||
        s === 'pending' || s === 'rescheduled'
      );
    }
    if (activeTab === 'completed') {
      return s === 'completed';
    }
    if (activeTab === 'cancelled') {
      return s === 'cancelled' || s === 'no show' || s === 'noshow';
    }
    return true;
  });

  const handleConfirmCancel = () => {
    if (!cancellingApt) return;
    const finalReason = cancelReason === 'Other reason' && customReason ? customReason : cancelReason;
    cancelAppointment(cancellingApt.id, finalReason);
    setCancellingApt(null);
    Alert.alert(
      'Appointment Cancelled',
      `Your token has been cancelled. Contact the clinic directly if you need help with a payment made at reception.`
    );
  };

  const handleSubmitReview = () => {
    if (!ratingApt) return;
    submitReview({
      doctorId: ratingApt.doctorId,
      appointmentId: ratingApt.id,
      rating: starCount,
      comment: reviewComment,
      doctorRating: starCount,
      consultationRating: starCount,
      waitingRating: waitingRating,
    });
    setRatingApt(null);
  };

  const handleReschedule = (apt: Appointment) => {
    setReschedulingApt(apt);
    setRescheduleDate('');
    setRescheduleTime('');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />

      <Header title="My appointments" showBack={false} rightIcon="add" rightAccessibilityLabel="Book a new visit" onRightPress={() => navigation.navigate('DoctorList')} />

      {/* Tabs Row */}
      <View style={styles.tabContainer}>
        {TAB_CONFIG.map((t) => {
          const isActive = activeTab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              activeOpacity={0.7}
              onPress={() => setActiveTab(t.key)}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
            >
              <Icon
                name={t.icon}
                size={16}
                color={isActive ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Appointment Cards List */}
      <FlatList
        data={filteredAppointments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <AppointmentCard
            appointment={item}
            onPress={() => {
              if (item.status === 'Completed' || item.status === 'completed') {
                if (item.prescriptionId) {
                  navigation.navigate('Prescription', { prescriptionId: item.prescriptionId });
                }
              } else {
                navigation.navigate('LiveQueueTracker', { appointment: item });
              }
            }}
            onJoinCall={() => navigation.navigate('LiveQueueTracker', { appointment: item })}
            onCheckIn={() => navigation.navigate('LiveQueueTracker', { appointment: item })}
            onShowQR={() => setQrModalApt(item)}
            onCancel={() => setCancellingApt(item)}
            onReschedule={() => handleReschedule(item)}
            onViewPrescription={() => navigation.navigate('Prescription', { prescriptionId: item.prescriptionId })}
            onRate={() => {
              setRatingApt(item);
            }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="calendar-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No {activeTab} appointments</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'upcoming'
                ? 'Your upcoming visits will appear here. Find a doctor to book your first visit.'
                : `No ${activeTab} visits recorded in your profile.`}
            </Text>
            {activeTab === 'upcoming' && (
              <Button
                title="Find a doctor"
                onPress={() => navigation.navigate('DoctorList')}
                size="md"
                style={{ marginTop: 16 }}
              />
            )}
          </View>
        }
      />

      <Modal visible={!!reschedulingApt} transparent animationType="slide" onRequestClose={() => setReschedulingApt(null)}>
        <View style={styles.modalBackdrop}>
          <SafeAreaView style={[styles.modalSheet, { maxHeight: '90%' }]} edges={['bottom']}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>Move your visit</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel="Close rescheduling" onPress={() => setReschedulingApt(null)} style={{ padding: 12 }}><Icon name="close" size={22} color={colors.textSecondary} /></TouchableOpacity></View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSub}>{reschedulingApt?.doctorName} · {reschedulingApt?.shift}</Text>
              <Text style={[styles.reasonLabel, { marginTop: 18 }]}>Choose a new date</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {rescheduleDates.filter(date => date.available).map(date => <TouchableOpacity key={date.full} accessibilityRole="button" accessibilityState={{ selected: rescheduleDate === date.full }} onPress={() => { setRescheduleDate(date.full); setRescheduleTime(''); }} style={[styles.reasonOption, { minWidth: '28%', flexGrow: 1, justifyContent: 'center' }, rescheduleDate === date.full && styles.reasonOptionActive]}><Text style={styles.reasonText}>{date.day} {date.number} {date.month}</Text></TouchableOpacity>)}
              </View>
              <Text style={[styles.reasonLabel, { marginTop: 18 }]}>Choose a new arrival time</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {VISIT_SHIFTS[reschedulingApt?.shift === 'Evening OPD' ? 1 : 0].times.map(time => {
                  const disabled = !rescheduleDate || !(visitDateTime(rescheduleDate, time) > new Date());
                  return <TouchableOpacity key={time} disabled={disabled} accessibilityRole="button" accessibilityState={{ selected: rescheduleTime === time, disabled }} onPress={() => setRescheduleTime(time)} style={[styles.reasonOption, { minWidth: '28%', flexGrow: 1, justifyContent: 'center', opacity: disabled ? 0.35 : 1 }, rescheduleTime === time && styles.reasonOptionActive]}><Text style={styles.reasonText}>{time}</Text></TouchableOpacity>;
                })}
              </View>
            </ScrollView>
            <Button title="Save new visit time" disabled={!rescheduleDate || !rescheduleTime} style={{ marginTop: 18 }} onPress={() => {
              if (!reschedulingApt || !(visitDateTime(rescheduleDate, rescheduleTime) > new Date())) return;
              rescheduleAppointment(reschedulingApt.id, rescheduleDate, rescheduleTime);
              setReschedulingApt(null);
            }} />
          </SafeAreaView>
        </View>
      </Modal>

      {/* Cancellation & Refund Reason Modal (Req #20) */}
      <Modal
        visible={!!cancellingApt}
        transparent
        animationType="slide"
        onRequestClose={() => setCancellingApt(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Cancel OPD Appointment</Text>
                <Text style={styles.modalSub}>
                  Token #{cancellingApt?.tokenNumber} • {cancellingApt?.doctorName}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setCancellingApt(null)}>
                <Icon name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.refundInfoBox}>
              <Icon name="cash-outline" size={20} color={colors.successText} />
              <View style={{ flex: 1 }}>
                <Text style={styles.refundTitle}>Before you cancel</Text>
                <Text style={styles.refundDesc}>
                  Cancelling releases your queue number. If you paid the clinic separately, contact reception about its refund policy.
                </Text>
              </View>
            </View>

            <Text style={styles.reasonLabel}>Please select cancellation reason:</Text>
            {cancellationReasons.map((r) => {
              const isSelected = cancelReason === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.reasonOption, isSelected && styles.reasonOptionActive]}
                  onPress={() => setCancelReason(r)}
                >
                  <Icon
                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={isSelected ? colors.primary : colors.textMuted}
                  />
                  <Text style={[styles.reasonText, isSelected && styles.reasonTextActive]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {cancelReason === 'Other reason' && (
              <TextInput
                style={styles.customReasonInput}
                placeholder="Enter specific reason..."
                placeholderTextColor={colors.textMuted}
                value={customReason}
                onChangeText={setCustomReason}
              />
            )}

            <View style={styles.modalActions}>
              <Button
                title="Keep Appointment"
                variant="secondary"
                onPress={() => setCancellingApt(null)}
                style={{ flex: 1 }}
              />
              <Button
                title="Confirm Cancel"
                variant="danger"
                onPress={handleConfirmCancel}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Post Consultation Rating & Review Modal (Req #18) */}
      <Modal
        visible={!!ratingApt}
        transparent
        animationType="slide"
        onRequestClose={() => setRatingApt(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Rate Your OPD Experience</Text>
                <Text style={styles.modalSub}>{ratingApt?.doctorName} • {ratingApt?.date}</Text>
              </View>
              <TouchableOpacity onPress={() => setRatingApt(null)}>
                <Icon name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Doctor Rating Stars */}
            <Text style={styles.ratingSectionLabel}>Doctor & Consultation Quality</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setStarCount(star)}>
                  <Icon
                    name={star <= starCount ? 'star' : 'star-outline'}
                    size={32}
                    color={colors.star}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Waiting Experience Rating */}
            <Text style={[styles.ratingSectionLabel, { marginTop: 12 }]}>
              OPD Waiting & Queue Experience
            </Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setWaitingRating(star)}>
                  <Icon
                    name={star <= waitingRating ? 'star' : 'star-outline'}
                    size={28}
                    color="#0EA5E9"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reviewInput}
              multiline
              numberOfLines={3}
              placeholder="Write an optional review..."
              placeholderTextColor={colors.textMuted}
              value={reviewComment}
              onChangeText={setReviewComment}
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setRatingApt(null)}
                style={{ flex: 1 }}
              />
              <Button
                title="Submit Review"
                variant="primary"
                onPress={handleSubmitReview}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* QR Code Pass Modal */}
      {qrModalApt && (
        <QRCodeModal
          visible={!!qrModalApt}
          onClose={() => setQrModalApt(null)}
          onTrackQueue={() => {
            setQrModalApt(null);
            navigation.navigate('LiveQueueTracker', { appointment: qrModalApt });
          }}
          appointmentData={{
            doctorName: qrModalApt.doctorName,
            patientName: qrModalApt.patientName,
            tokenNumber: qrModalApt.tokenNumber || 15,
            date: qrModalApt.date,
            time: qrModalApt.time,
            shift: qrModalApt.shift || 'Morning OPD',
            room: qrModalApt.opdRoom || 'Room #204',
            estimatedWait: '~20 min',
            bookingId: qrModalApt.id,
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroHeader: {
    paddingTop: 54,
    paddingBottom: 20,
    paddingHorizontal: spacing.lg,
  },
  heroContent: {
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  heroLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  heroTitle: {
    ...typography.h2,
    color: colors.white,
    marginTop: 2,
  },
  newBookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  newBookingText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: '#38BDF8',
  },
  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: borderRadius.lg,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontFamily: fonts.extrabold,
    fontSize: 18,
    color: '#38BDF8',
  },
  summaryLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  summaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceMuted,
  },
  tabButtonActive: {
    backgroundColor: colors.primaryLight,
  },
  tabText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  tabTextActive: {
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: 12,
  },
  emptySubtitle: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
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
  refundInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#DCFCE7',
    padding: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 14,
  },
  refundTitle: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: '#15803D',
  },
  refundDesc: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: '#166534',
    marginTop: 1,
    lineHeight: 16,
  },
  reasonLabel: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    marginBottom: 6,
  },
  reasonOptionActive: {
    backgroundColor: colors.primaryLight,
  },
  reasonText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textPrimary,
  },
  reasonTextActive: {
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  customReasonInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textPrimary,
    marginTop: 6,
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  ratingSectionLabel: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceMuted,
    marginTop: 14,
  },
});

export default MyAppointmentsScreen;
