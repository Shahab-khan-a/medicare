import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../../theme';
import { Icon } from '../../components/Icon';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Doctor } from '../../types';
import { useApp } from '../../context/AppContext';
import { patientErrors, SERVICE_FEE, visitDateTime } from '../../utils/booking';

export default function PaymentScreen({ navigation, route }: { navigation: any; route: any }) {
  const { bookAppointment } = useApp();
  const doctor: Doctor | undefined = route?.params?.doctor;
  const details = route?.params?.bookingDetails;
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const valid = doctor && details && !patientErrors(details.patientName || '', String(details.patientAge ?? '')).name && !patientErrors(details.patientName || '', String(details.patientAge ?? '')).age;
  if (!valid) return <SafeAreaView style={styles.screen}><Header title="Confirm your visit" showBack={false} /><EmptyState icon="calendar-outline" title="Your booking details are missing" subtitle="Please choose a doctor and enter your visit details again." actionTitle="Find a doctor" onAction={() => navigation.replace('PatientTabs', { screen: 'DoctorList' })} /></SafeAreaView>;
  const total = doctor.fees + SERVICE_FEE;
  const confirm = () => {
    if (submitting.current) return;
    if (!(visitDateTime(details.date, details.time) > new Date())) { setError('This visit time has passed. Go back and choose a new time.'); return; }
    submitting.current = true; setProcessing(true);
    try {
      const appointment = bookAppointment({ doctor, date: details.date, time: details.time, type: 'in_clinic', patientName: details.patientName, patientAge: details.patientAge, patientGender: details.gender, familyMemberId: details.familyMemberId, familyMemberRelation: details.familyMemberRelation, symptoms: details.symptoms, shift: details.shift, opdRoom: details.opdRoom, fees: doctor.fees });
      navigation.replace('AppointmentSuccess', { doctor, appointment, bookingDetails: { ...details, totalAmount: total, tokenNumber: appointment.tokenNumber, paymentStatus: 'Not collected' } });
    } catch { submitting.current = false; setProcessing(false); setError('We could not confirm your visit. Please try again.'); }
  };
  return <SafeAreaView style={styles.screen}>
    <StatusBar barStyle="dark-content" /><Header title="Confirm your visit" showBack onBack={() => navigation.goBack()} />
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>One last check.</Text><Text style={styles.description}>Your clinic visit and queue number are ready to book.</Text>
      <View style={styles.card}><Text style={styles.name}>{doctor.name}</Text><Text style={styles.body}>{doctor.specialty} · {doctor.hospital}</Text><View style={styles.divider} /><Row label="Patient" value={details.patientName} /><Row label="Date" value={details.date} /><Row label="Arrival time" value={details.time} /><Row label="Clinic room" value={details.opdRoom} /></View>
      <View style={styles.card}><Text style={styles.name}>Fee summary</Text><Row label="Consultation" value={'Rs. ' + doctor.fees.toLocaleString()} /><Row label="Service fee" value={'Rs. ' + SERVICE_FEE} /><View style={styles.divider} /><Row label="Total" value={'Rs. ' + total.toLocaleString()} /></View>
      <View style={styles.notice}><Icon name="information-circle-outline" size={23} color={colors.primary} /><View style={{ flex: 1 }}><Text style={styles.name}>Payments are not connected yet</Text><Text style={styles.body}>This confirms a demo booking. No money is charged, and no card or wallet details are needed.</Text></View></View>
      {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    </ScrollView>
    <View style={styles.footer}><Button title="Confirm demo booking" onPress={confirm} loading={processing} iconName="checkmark-circle-outline" /><Text style={styles.footerText}>No payment will be taken.</Text></View>
  </SafeAreaView>;
}
function Row({ label, value }: { label: string; value: string }) { return <View style={styles.row}><Text style={styles.body}>{label}</Text><Text style={[styles.value, { flex: 1 }]}>{value}</Text></View>; }
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background }, content: { padding: 22, width: '100%', maxWidth: 720, alignSelf: 'center' }, title: { ...typography.h1, color: colors.textPrimary }, description: { ...typography.body, color: colors.textSecondary, marginTop: 8, marginBottom: 22 }, card: { backgroundColor: colors.white, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.border, marginBottom: 16 }, name: { ...typography.bodyBold, color: colors.textPrimary }, body: { ...typography.caption, color: colors.textSecondary, marginTop: 5 }, divider: { height: 1, backgroundColor: colors.border, marginVertical: 16 }, row: { flexDirection: 'row', gap: 20, justifyContent: 'space-between', marginTop: 12 }, value: { ...typography.bodySemibold, color: colors.textPrimary, textAlign: 'right' }, notice: { flexDirection: 'row', gap: 12, padding: 18, backgroundColor: colors.primaryLight, borderRadius: 18 }, footer: { padding: 18, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border }, footerText: { ...typography.caption, textAlign: 'center', color: colors.textSecondary, marginTop: 10 }, error: { ...typography.body, color: colors.error, marginTop: 16 },
});
