import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../../theme';
import { Icon } from '../../components/Icon';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Appointment } from '../../types';

export default function AppointmentSuccessScreen({ navigation, route }: { navigation: any; route: any }) {
  const appointment: Appointment | undefined = route?.params?.appointment;
  const details = route?.params?.bookingDetails;
  const home = () => navigation.replace('PatientTabs');
  if (!appointment) return <SafeAreaView style={styles.screen}><Header title="Your appointment" showBack={false} /><EmptyState icon="calendar-outline" title="Find your confirmed visits" subtitle="Your saved appointments and queue numbers are in My appointments." actionTitle="My appointments" onAction={() => navigation.replace('PatientTabs', { screen: 'MyAppointments' })} /></SafeAreaView>;
  return <SafeAreaView style={styles.screen}><StatusBar barStyle="dark-content" /><Header title="Visit confirmed" showBack={false} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.check}><Icon name="checkmark" size={38} color={colors.primary} /></View>
      <Text style={styles.title}>You’re all booked.</Text><Text style={styles.description}>Your visit is saved in My appointments.{details?.paymentStatus === 'Not collected' ? '\nThis is a demo booking. No payment was taken.' : ''}</Text>
      <View style={styles.ticket}>
        <View style={styles.ticketTop}><Text style={styles.eyebrow}>YOUR QUEUE NUMBER</Text><Icon name="ticket-outline" size={25} color={colors.primary} /></View>
        <Text style={styles.number}>#{appointment.tokenNumber}</Text><Text style={styles.body}>Keep this number handy for your clinic visit.</Text>
        <View style={styles.divider} /><Text style={styles.doctor}>{appointment.doctorName}</Text><Text style={styles.body}>{appointment.doctorSpecialty}</Text>
        {[['Patient', appointment.patientName], ['Date', appointment.date], ['Arrival time', appointment.time], ['Clinic room', appointment.opdRoom || 'Ask at reception'], ['Shift', appointment.shift || 'In-clinic visit']].map(([label, value]) => <View key={label} style={styles.row}><Text style={styles.body}>{label}</Text><Text style={styles.value}>{value}</Text></View>)}
        <View style={styles.divider} /><Text style={styles.reference}>Booking reference: {appointment.id}</Text>
      </View>
      <View style={styles.next}><Text style={styles.doctor}>What happens next?</Text><Text style={styles.body}>1. Check your queue status before heading to the clinic.</Text><Text style={styles.body}>2. Check in when you arrive at reception.</Text><Text style={styles.body}>3. Follow your queue number and wait for the clinic to call your turn.</Text></View>
      <Button title="Track my turn" onPress={() => navigation.replace('PatientTabs', { screen: 'LiveQueueTracker', appointment })} iconName="ticket-outline" />
      <Button title="View my appointments" onPress={() => navigation.replace('PatientTabs', { screen: 'MyAppointments' })} variant="outline" style={{ marginTop: 12 }} />
      <Button title="Back to home" onPress={home} variant="ghost" style={{ marginTop: 8 }} />
    </ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background }, content: { padding: 22, paddingBottom: 28, width: '100%', maxWidth: 600, alignSelf: 'center' }, check: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginVertical: 12 }, title: { ...typography.h1, color: colors.textPrimary, textAlign: 'center', marginTop: 10 }, description: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: 10, marginBottom: 24 }, ticket: { padding: 22, backgroundColor: colors.white, borderRadius: 22, borderWidth: 1, borderColor: colors.border }, ticketTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, eyebrow: { ...typography.overline, color: colors.primary }, number: { ...typography.display, fontSize: 56, lineHeight: 68, color: colors.primary, marginTop: 12 }, body: { ...typography.caption, color: colors.textSecondary, marginTop: 6, lineHeight: 20 }, divider: { height: 1, backgroundColor: colors.border, marginVertical: 18 }, doctor: { ...typography.h3, color: colors.textPrimary }, row: { flexDirection: 'row', gap: 14, alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 12 }, value: { ...typography.bodySemibold, color: colors.textPrimary, flex: 1, textAlign: 'right' }, reference: { ...typography.caption, color: colors.textSecondary }, next: { padding: 18, borderRadius: 18, backgroundColor: colors.primaryLight, marginVertical: 20 },
});
