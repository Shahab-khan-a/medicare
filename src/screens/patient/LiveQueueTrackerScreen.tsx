import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../../theme';
import { Icon, Header, Button, EmptyState } from '../../components';
import { useApp } from '../../context/AppContext';
import { Appointment } from '../../types';
import { visitDateTime } from '../../utils/booking';

export default function LiveQueueTrackerScreen({ navigation, route }: { navigation: any; route: any }) {
  const { appointments, queueStatus, checkInPatient, doctors, refreshData } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState('');
  const chosen: Appointment | undefined = route?.params?.appointment;
  const active = appointments.filter(appointment => !['completed', 'cancelled', 'no show'].includes(appointment.status.toLowerCase()) && !!appointment.tokenNumber);
  const appointment = chosen ? active.find(item => item.id === chosen.id) : active[0];
  const today = new Date();
  const sameDay = appointment && visitDateTime(appointment.date, '12:00 PM').toDateString() === today.toDateString();
  const queueMatches = !!appointment && sameDay && queueStatus.doctorId === appointment.doctorId && queueStatus.shift === appointment.shift;
  const checkedIn = appointment?.checkInStatus === 'Checked In' || appointment?.checkInStatus === 'Waiting';
  const yourTurn = queueMatches && (appointment?.status === 'Your Turn' || (checkedIn && queueStatus.currentServing === appointment?.tokenNumber));
  const missedTurn = queueMatches && appointment?.tokenNumber !== undefined && queueStatus.currentServing > appointment.tokenNumber;
  const clinic = doctors.find(doctor => doctor.id === appointment?.doctorId);
  const shiftStart = appointment ? visitDateTime(appointment.date, appointment.shift === 'Evening OPD' ? '04:00 PM' : '09:00 AM') : undefined;
  const checkInOpen = sameDay && shiftStart && today.getTime() >= shiftStart.getTime() - 45 * 60 * 1000;
  const refresh = async () => { setRefreshing(true); setRefreshError(''); try { await refreshData(); } catch { setRefreshError('Could not refresh. Please try again.'); } finally { setRefreshing(false); } };
  return <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
    <StatusBar barStyle="dark-content" /><Header title="My turn" showBack={false} />
    {!appointment ? <EmptyState icon="ticket-outline" title="Your turn starts here" subtitle="Book a clinic visit to get a queue number. Your visit and queue updates will appear here." actionTitle="Find a doctor" onAction={() => navigation.navigate('DoctorList')} /> :
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {active.length > 1 && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choices}>{active.map(item => <TouchableOpacity key={item.id} accessibilityRole="button" accessibilityState={{ selected: item.id === appointment.id }} onPress={() => navigation.navigate('LiveQueueTracker', { appointment: item })} style={[styles.choice, item.id === appointment.id && { borderColor: colors.primary, backgroundColor: colors.primaryLight }]}><Text style={styles.small}>#{item.tokenNumber} · {item.doctorName}</Text></TouchableOpacity>)}</ScrollView>}
      <View style={styles.hero}><View style={styles.heroTop}><Text style={styles.heroLabel}>YOUR QUEUE NUMBER</Text><Icon name="ticket-outline" size={28} color="#C7F3E6" /></View><Text style={styles.number}>#{appointment.tokenNumber}</Text><Text style={styles.heroName}>{appointment.patientName}</Text><Text style={styles.heroMeta}>{appointment.doctorName}</Text><Text style={styles.heroMeta}>{clinic?.hospital || 'Clinic visit'} · {appointment.opdRoom || 'Ask at reception'}</Text><View style={styles.heroDivider} /><Text style={styles.heroMeta}>{appointment.date} · {appointment.time}</Text></View>
      <View style={styles.card}><View style={styles.statusRow}><View style={[styles.dot, { backgroundColor: queueMatches ? colors.primary : colors.textMuted }]} /><Text style={styles.sectionTitle}>{!queueMatches ? 'Waiting for clinic updates' : queueStatus.isPaused ? 'Queue is paused' : yourTurn ? 'It’s your turn' : missedTurn ? 'Check with reception' : 'Your clinic queue'}</Text></View>
        {!queueMatches ? <Text style={styles.body}>{sameDay ? 'Live information for this doctor and shift is not available yet. Your booking is saved.' : 'Your visit is booked for ' + appointment.date + '. Check this screen on the day of your visit.'}</Text> : <>
          <View style={styles.metrics}><View style={styles.metric}><Text style={styles.caption}>NOW SERVING</Text><Text style={styles.metricValue}>{queueStatus.currentServing > 0 ? '#' + queueStatus.currentServing : '—'}</Text></View><View style={styles.metric}><Text style={styles.caption}>ESTIMATED WAIT</Text><Text style={styles.metricValue}>{yourTurn ? 'Your turn' : missedTurn ? 'Ask clinic' : '~' + (queueStatus.userToken === appointment.tokenNumber ? queueStatus.estimatedWaitMinutes : appointment.estimatedWaitMinutes ?? '—') + ' min'}</Text></View></View>
          <Text style={styles.body}>{yourTurn ? 'Please go to ' + (appointment.opdRoom || 'clinic reception') + ' when the clinic calls your number.' : missedTurn ? 'Your number may have been called. Ask reception to check your place in the queue.' : 'Waiting times are estimates and may change during consultations.'}</Text>
          {queueStatus.delayStatus.status !== 'on_time' && <View style={styles.notice}><Icon name="time-outline" size={20} color={colors.warningText} /><Text style={[styles.body, { flex: 1, color: colors.warningText }]}>{queueStatus.delayStatus.message}</Text></View>}
        </>}
      </View>
      <View style={styles.card}><View style={styles.statusRow}><Icon name={checkedIn ? 'checkmark-circle' : 'location-outline'} size={23} color={colors.primary} /><Text style={styles.sectionTitle}>{checkedIn ? 'You’re checked in' : 'Check in at the clinic'}</Text></View><Text style={styles.body}>{checkedIn ? 'Keep your queue number ready and follow the clinic’s instructions.' : 'When you arrive at the clinic, check in so the team knows you’re here. Check-in opens 45 minutes before your shift.'}</Text>{!checkedIn && <Button title={checkInOpen ? 'I’m at the clinic — check in' : 'Check-in opens on your visit day'} disabled={!checkInOpen} onPress={() => checkInPatient(appointment.id)} variant="secondary" style={{ marginTop: 16 }} />}</View>
      <Button title="Refresh my appointment" onPress={refresh} loading={refreshing} variant="outline" iconName="refresh-outline" />
      {!!refreshError && <Text accessibilityRole="alert" style={{ ...styles.body, color: colors.error }}>{refreshError}</Text>}
      <Text style={styles.footnote}>Queue information updates when the clinic shares its status.</Text>
    </ScrollView>}
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background }, content: { padding: 22, paddingBottom: 28, width: '100%', maxWidth: 720, alignSelf: 'center' }, choices: { gap: 8, paddingBottom: 18 }, choice: { padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white }, small: { ...typography.captionBold, color: colors.textPrimary }, hero: { borderRadius: 24, padding: 24, backgroundColor: '#174D43', marginBottom: 20 }, heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, heroLabel: { ...typography.overline, color: '#C7F3E6' }, number: { ...typography.display, fontSize: 64, lineHeight: 78, color: colors.white, marginTop: 8 }, heroName: { ...typography.h3, color: colors.white, marginTop: 3 }, heroMeta: { ...typography.caption, color: '#D4E8E2', lineHeight: 20, marginTop: 6 }, heroDivider: { height: 1, backgroundColor: '#46756A', marginTop: 18, marginBottom: 10 }, card: { padding: 20, backgroundColor: colors.white, borderRadius: 20, borderWidth: 1, borderColor: colors.border, marginBottom: 18 }, statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, dot: { width: 8, height: 8, borderRadius: 4 }, sectionTitle: { ...typography.h3, color: colors.textPrimary, flexShrink: 1 }, body: { ...typography.caption, color: colors.textSecondary, marginTop: 10, lineHeight: 21 }, metrics: { flexDirection: 'row', gap: 14, marginTop: 22, marginBottom: 5 }, metric: { flex: 1, padding: 13, borderRadius: 14, backgroundColor: colors.primaryLight }, caption: { ...typography.overline, fontSize: 9, color: colors.primary }, metricValue: { ...typography.h2, color: colors.primaryDark, marginTop: 8 }, notice: { flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12, backgroundColor: colors.warningLight, borderRadius: 12, marginTop: 16 }, footnote: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginTop: 16 },
});
