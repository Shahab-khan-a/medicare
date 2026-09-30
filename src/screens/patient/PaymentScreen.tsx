import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Icon from '../../components/Icon';
import Header from '../../components/Header';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import { Doctor, PaymentReceipt } from '../../types';
import { useApp } from '../../context/AppContext';

interface PaymentScreenProps {
  navigation: any;
  route: any;
}

type PaymentMethod = 'card' | 'jazzcash' | 'easypaisa' | 'bank';

export const PaymentScreen: React.FC<PaymentScreenProps> = ({ navigation, route }) => {
  const { bookAppointment, doctors, currentUser } = useApp();

  const doctor: Doctor = route?.params?.doctor || doctors[0];
  const bookingDetails = route?.params?.bookingDetails || {
    date: 'Today',
    time: '10:00 AM',
    type: 'in_clinic',
    fees: doctor.fees,
  };

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState(
    currentUser?.name || bookingDetails.patientName || 'Cardholder'
  );
  const [expiry, setExpiry] = useState('08/29');
  const [cvv, setCvv] = useState('882');
  const [isProcessing, setIsProcessing] = useState(false);

  const platformFee = 150;
  const totalAmount = doctor.fees + platformFee;

  const handlePayNow = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);

      const createdAppointment = bookAppointment({
        doctor,
        date: bookingDetails.date,
        time: bookingDetails.time,
        type: bookingDetails.type || 'in_clinic',
        patientName: bookingDetails.patientName || currentUser?.name || 'Patient',
        patientAge: Number(bookingDetails.patientAge) || 29,
        patientGender: bookingDetails.gender || 'Male',
        familyMemberId: bookingDetails.familyMemberId,
        familyMemberRelation: bookingDetails.familyMemberRelation,
        symptoms: bookingDetails.symptoms,
        shift: bookingDetails.shift || 'Morning OPD',
        opdRoom: bookingDetails.opdRoom || 'Room #204',
        fees: doctor.fees,
      });

      const receipt: PaymentReceipt = {
        transactionId: `TXN-${Date.now().toString().slice(-6)}`,
        appointmentId: createdAppointment.id,
        doctorName: doctor.name,
        patientName: createdAppointment.patientName,
        amount: totalAmount,
        consultationFee: doctor.fees,
        serviceFee: platformFee,
        discount: 0,
        method:
          selectedMethod === 'card'
            ? 'Credit/Debit Card'
            : selectedMethod === 'jazzcash'
            ? 'JazzCash'
            : selectedMethod === 'easypaisa'
            ? 'EasyPaisa'
            : 'Bank Transfer',
        status: 'Paid',
        paidAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      navigation.replace('AppointmentSuccess', {
        doctor,
        bookingDetails: {
          ...bookingDetails,
          tokenNumber: createdAppointment.tokenNumber,
          totalAmount,
          receipt,
        },
        appointment: createdAppointment,
      });
    }, 1200);
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <Header title="Payment" showBack onBack={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Order Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryHeading}>Consultation Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Doctor</Text>
            <Text style={styles.summaryValue}>{doctor.name}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Specialty</Text>
            <Text style={styles.summaryValue}>{doctor.specialty}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Schedule</Text>
            <Text style={styles.summaryValue}>
              {bookingDetails.date} at {bookingDetails.time}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Visit Type</Text>
            <Text style={styles.summaryValue}>
              In-Clinic Physical OPD
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Doctor Consultation Fee</Text>
            <Text style={styles.summaryValue}>Rs. {doctor.fees}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Hospital / Platform Fee</Text>
            <Text style={styles.summaryValue}>Rs. {platformFee}</Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalAmount}>Rs. {totalAmount}</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>Select Payment Method</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSelectedMethod('card')}
          style={[
            styles.methodCard,
            selectedMethod === 'card' && styles.methodCardActive,
          ]}
        >
          <View style={styles.methodLeft}>
            <View style={[styles.methodIcon, { backgroundColor: '#E0F2FE' }]}>
              <Icon name="card" size={22} color="#0284C7" />
            </View>
            <View>
              <Text style={styles.methodTitle}>Credit / Debit Card</Text>
              <Text style={styles.methodSubtitle}>Visa, MasterCard, UnionPay</Text>
            </View>
          </View>
          <View
            style={[
              styles.radioCircle,
              selectedMethod === 'card' && styles.radioCircleActive,
            ]}
          >
            {selectedMethod === 'card' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>

        {selectedMethod === 'card' && (
          <View style={styles.cardForm}>
            <InputField
              label="Card Number"
              value={cardNumber}
              onChangeText={setCardNumber}
              leftIcon="card-outline"
              keyboardType="number-pad"
            />
            <InputField
              label="Cardholder Name"
              value={cardHolder}
              onChangeText={setCardHolder}
              leftIcon="person-outline"
            />
            <View style={styles.expiryCvvRow}>
              <View style={styles.halfInput}>
                <InputField
                  label="Expires"
                  value={expiry}
                  onChangeText={setExpiry}
                  leftIcon="calendar-outline"
                />
              </View>
              <View style={styles.halfInput}>
                <InputField
                  label="CVV / CVC"
                  value={cvv}
                  onChangeText={setCvv}
                  isPassword
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSelectedMethod('jazzcash')}
          style={[
            styles.methodCard,
            selectedMethod === 'jazzcash' && styles.methodCardActive,
          ]}
        >
          <View style={styles.methodLeft}>
            <View style={[styles.methodIcon, { backgroundColor: '#FEE2E2' }]}>
              <Icon name="phone-portrait-outline" size={22} color="#DC2626" />
            </View>
            <View>
              <Text style={styles.methodTitle}>JazzCash Mobile Wallet</Text>
              <Text style={styles.methodSubtitle}>Pay instantly via OTP</Text>
            </View>
          </View>
          <View
            style={[
              styles.radioCircle,
              selectedMethod === 'jazzcash' && styles.radioCircleActive,
            ]}
          >
            {selectedMethod === 'jazzcash' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSelectedMethod('easypaisa')}
          style={[
            styles.methodCard,
            selectedMethod === 'easypaisa' && styles.methodCardActive,
          ]}
        >
          <View style={styles.methodLeft}>
            <View style={[styles.methodIcon, { backgroundColor: '#DCFCE7' }]}>
              <Icon name="wallet-outline" size={22} color="#16A34A" />
            </View>
            <View>
              <Text style={styles.methodTitle}>EasyPaisa Account</Text>
              <Text style={styles.methodSubtitle}>Instant digital payment</Text>
            </View>
          </View>
          <View
            style={[
              styles.radioCircle,
              selectedMethod === 'easypaisa' && styles.radioCircleActive,
            ]}
          >
            {selectedMethod === 'easypaisa' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSelectedMethod('bank')}
          style={[
            styles.methodCard,
            selectedMethod === 'bank' && styles.methodCardActive,
          ]}
        >
          <View style={styles.methodLeft}>
            <View style={[styles.methodIcon, { backgroundColor: '#F3F4F6' }]}>
              <Icon name="business-outline" size={22} color="#4B5563" />
            </View>
            <View>
              <Text style={styles.methodTitle}>Direct Bank Transfer (1Link)</Text>
              <Text style={styles.methodSubtitle}>All Pakistani banks supported</Text>
            </View>
          </View>
          <View
            style={[
              styles.radioCircle,
              selectedMethod === 'bank' && styles.radioCircleActive,
            ]}
          >
            {selectedMethod === 'bank' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Pay Now Button */}
      <View style={styles.bottomBar}>
        <Button
          title={`Pay Rs. ${totalAmount}`}
          onPress={handlePayNow}
          loading={isProcessing}
          size="lg"
          iconName="lock-closed"
          iconPosition="left"
        />
      </View>
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
    paddingBottom: 110,
    paddingTop: spacing.xs,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryHeading: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryLabel: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  totalRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  totalLabel: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  totalAmount: {
    ...typography.h2,
    color: colors.primaryDark,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  methodCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  methodSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  cardForm: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  expiryCvvRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

export default PaymentScreen;
