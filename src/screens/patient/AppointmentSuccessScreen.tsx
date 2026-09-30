import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Icon from '../../components/Icon';
import Button from '../../components/Button';
import Header from '../../components/Header';
import QRCodeModal from '../../components/QRCodeModal';
import { Doctor } from '../../types';
import { useApp } from '../../context/AppContext';

interface AppointmentSuccessScreenProps {
  navigation: any;
  route: any;
}

export const AppointmentSuccessScreen: React.FC<AppointmentSuccessScreenProps> = ({
  navigation,
  route,
}) => {
  const { doctors, currentUser } = useApp();
  const [showQrModal, setShowQrModal] = useState(false);
  const doctor: Doctor = route?.params?.doctor || doctors[0];
  const bookingDetails = route?.params?.bookingDetails || {
    date: 'Today',
    time: '10:00 AM',
    type: 'in_clinic',
    totalAmount: 2650,
    tokenNumber: 1,
    patientName: currentUser?.name || 'Patient',
  };

  const tokenNumber = bookingDetails.tokenNumber || 1;
  const bookingId = bookingDetails.receipt?.transactionId || `#MC-${Date.now().toString().slice(-5)}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <Header
        title="Booking Confirmed"
        showBack
        onBack={() => navigation.navigate('PatientTabs', { screen: 'HomeScreen' })}
      />

      <View style={styles.container}>
        {/* Big Success Icon */}
        <View style={styles.successOuterCircle}>
          <View style={styles.successInnerCircle}>
            <Icon name="checkmark-done" size={54} color={colors.white} />
          </View>
        </View>

        <Text style={styles.title}>Appointment Confirmed! 🎉</Text>
        <Text style={styles.subtitle}>
          Your booking has been successfully scheduled. A confirmation SMS & email
          has been sent.
        </Text>

        {/* Appointment Card */}
        <View style={styles.ticketCard}>
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketBookingId}>Booking ID: {bookingId}</Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>Confirmed</Text>
            </View>
          </View>

          <View style={styles.doctorRow}>
            <Image source={{ uri: doctor.photo }} style={styles.doctorAvatar} />
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{doctor.name}</Text>
              <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
              <Text style={styles.doctorHospital}>{doctor.hospital}</Text>
            </View>
          </View>

          <View style={styles.dashedDivider} />

          <View style={styles.detailsGrid}>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{bookingDetails.date}</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{bookingDetails.time}</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Visit Type</Text>
              <Text style={[styles.detailValue, { color: colors.primary }]}>
                {bookingDetails.shift || 'In-Clinic OPD'}
              </Text>
            </View>
          </View>

          {/* Online Token Number Strip */}
          <View style={styles.tokenSuccessStrip}>
            <View style={styles.tokenSuccessLeft}>
              <Text style={styles.tokenSuccessLabel}>YOUR ONLINE TOKEN</Text>
              <Text style={styles.tokenSuccessBig}>#{tokenNumber}</Text>
            </View>
            <View style={styles.tokenSuccessRight}>
              <Text style={styles.tokenSuccessSub}>Room #204 • Physical Visit</Text>
              <Text style={styles.tokenSuccessSubGreen}>Live Tracker Ready</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title="Track My Turn Live"
            onPress={() => navigation.navigate('LiveQueueTracker')}
            size="lg"
            iconName="speedometer-outline"
            style={styles.trackTurnButton}
          />

          <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowQrModal(true)}
              style={[styles.calendarButton, { flex: 1 }]}
            >
              <Icon name="qr-code-outline" size={18} color={colors.primary} />
              <Text style={styles.calendarButtonText}>Show QR Pass</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                Alert.alert(
                  'Payment Receipt',
                  `Transaction: ${bookingId}\nAmount Paid: Rs. ${bookingDetails.totalAmount}\nStatus: Paid via ${bookingDetails.receipt?.method || 'Card'}`
                )
              }
              style={[styles.calendarButton, { flex: 1 }]}
            >
              <Icon name="receipt-outline" size={18} color={colors.primary} />
              <Text style={styles.calendarButtonText}>Receipt</Text>
            </TouchableOpacity>
          </View>

          <Button
            title="View My Appointments"
            onPress={() => navigation.navigate('PatientTabs', { screen: 'MyAppointments' })}
            size="md"
            variant="outline"
            style={styles.viewAptButton}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('PatientTabs', { screen: 'HomeScreen' })}
            style={styles.homeLink}
          >
            <Text style={styles.homeLinkText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>

      <QRCodeModal
        visible={showQrModal}
        onClose={() => setShowQrModal(false)}
        onTrackQueue={() => {
          setShowQrModal(false);
          navigation.navigate('LiveQueueTracker');
        }}
        appointmentData={{
          doctorName: doctor.name,
          patientName: bookingDetails.patientName || currentUser?.name || 'Patient',
          tokenNumber: tokenNumber,
          date: bookingDetails.date,
          time: bookingDetails.time,
          shift: bookingDetails.shift || 'Morning OPD',
          room: 'Room #204',
          estimatedWait: '~20 min',
          bookingId: bookingId,
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
  container: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successOuterCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  successInnerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  ticketCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: spacing.xxl,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  ticketBookingId: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  statusPill: {
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: borderRadius.round,
  },
  statusPillText: {
    ...typography.tiny,
    color: colors.success,
    fontWeight: '700',
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorAvatar: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryLight,
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
    ...typography.caption,
    color: colors.primary,
    marginTop: 1,
  },
  doctorHospital: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: colors.divider,
    borderStyle: 'dashed',
    marginVertical: spacing.md,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailCol: {
    alignItems: 'center',
  },
  detailLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.captionBold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  tokenSuccessStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
  },
  tokenSuccessLeft: {
    alignItems: 'flex-start',
  },
  tokenSuccessLabel: {
    ...typography.tiny,
    color: '#15803D',
    fontWeight: '800',
  },
  tokenSuccessBig: {
    ...typography.h1,
    fontSize: 28,
    fontWeight: '900',
    color: colors.success,
  },
  tokenSuccessRight: {
    alignItems: 'flex-end',
  },
  tokenSuccessSub: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  tokenSuccessSubGreen: {
    ...typography.tiny,
    color: '#15803D',
    fontWeight: '600',
  },
  actionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  trackTurnButton: {
    width: '100%',
    marginBottom: spacing.md,
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1.2,
    borderColor: colors.border,
    width: '100%',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  calendarButtonText: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '600',
  },
  viewAptButton: {
    width: '100%',
    marginBottom: spacing.md,
  },
  homeLink: {
    paddingVertical: spacing.sm,
  },
  homeLinkText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
});

export default AppointmentSuccessScreen;
