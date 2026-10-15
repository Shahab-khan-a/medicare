import React, { useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { DoctorPage, DoctorSection, DoctorMetric, DoctorLink, DoctorSheet, doctorStyles as s } from '../../components/DoctorWorkspace';
import { useApp } from '../../context/AppContext';
import { DoctorDelayType, QueueItem } from '../../types';
import { doctorAppointments, isVisitToday, nextQueuePatient } from '../../utils/doctorWorkflow';

export default function DoctorDashboardScreen({ navigation }: { navigation: any }) {
  const { currentUser, appointments, queueStatus, refreshData, setDoctorQueueShift, callNextPatient, startConsultation, skipPatient, markNoShow, recallSkippedPatient, pauseQueue, resumeQueue, setDoctorDelay, isCurrentDoctorVerified } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [delayOpen, setDelayOpen] = useState(false);
  const [confirm, setConfirm] = useState<'skip' | 'absent' | null>(null);
  const [selected, setSelected] = useState<QueueItem | null>(null);
  const visits = doctorAppointments(appointments, currentUser);
  const today = visits.filter(visit => isVisitToday(visit.date));
  const queue = queueStatus.doctorId === currentUser?.uid ? queueStatus.queue.filter(item => today.some(visit => visit.id === item.appointmentId)) : [];
  const current = queue.find(item => item.status === 'serving' || item.status === 'in_consultation');
  const next = nextQueuePatient(queue);
  const waiting = queue.filter(item => item.status === 'waiting' || item.status === 'next');
  const skipped = queue.filter(item => item.status === 'skipped');
  const canManage = currentUser?.role === 'doctor' && isCurrentDoctorVerified;
  const selectedVisit = visits.find(visit => visit.id === selected?.appointmentId);
  const primaryAction = () => {
    if (!canManage) { navigation.navigate(currentUser?.role === 'doctor' ? 'DoctorVerification' : 'Login'); return; }
    if (current?.status === 'in_consultation') { navigation.navigate('WritePrescription', { appointmentId: current.appointmentId }); return; }
    if (current?.appointmentId) { startConsultation(current.appointmentId); return; }
    callNextPatient();
  };
  const delays: { label: string; type: DoctorDelayType; minutes: number }[] = [
    { label: 'On time', type: 'on_time', minutes: 0 }, { label: '10 minutes late', type: 'delayed_10', minutes: 10 },
    { label: '20 minutes late', type: 'delayed_20', minutes: 20 }, { label: '30 minutes late', type: 'delayed_30', minutes: 30 },
    { label: 'Emergency delay · 45 min', type: 'emergency_delay', minutes: 45 },
  ];
  return <DoctorPage title="Clinic workspace" right={<TouchableOpacity accessibilityRole="button" accessibilityLabel={refreshing ? 'Refreshing clinic' : 'Refresh clinic appointments'} disabled={refreshing} style={s.iconButton} onPress={async () => { setRefreshing(true); try { await refreshData(); } finally { setRefreshing(false); } }}><Icon name={refreshing ? 'hourglass-outline' : 'refresh-outline'} size={22} color="#267259" /></TouchableOpacity>}>
    <Text style={s.eyebrow}>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}</Text>
    <Text style={[s.heading, { marginTop: 9 }]}>Your clinic, at a glance.</Text>
    <Text style={[s.body, { marginBottom: 22 }]}>{currentUser?.role === 'doctor' ? currentUser.name + ' · ' + (currentUser.hospital || 'Your clinic') : 'A clearer view of your patients and your day.'}</Text>
    {!canManage && <View style={s.notice}><Text style={s.name}>{currentUser?.role === 'doctor' ? 'Complete your doctor verification' : 'Sign in to manage your clinic'}</Text><Text style={s.noticeText}>{currentUser?.role === 'doctor' ? 'Your credentials are needed before calling patients or issuing prescriptions.' : 'Your own appointments and queue appear after doctor sign-in.'}</Text><Button title={currentUser?.role === 'doctor' ? 'View verification' : 'Doctor sign-in'} onPress={() => navigation.navigate(currentUser?.role === 'doctor' ? 'DoctorVerification' : 'Login')} variant="secondary" style={{ marginTop: 12 }} /></View>}
    <View style={s.metricRow}><DoctorMetric label="Booked today" value={today.filter(visit => visit.status.toLowerCase() !== 'cancelled').length} icon="calendar-outline" /><DoctorMetric label="Waiting" value={waiting.length} icon="people-outline" /><DoctorMetric label="Completed" value={today.filter(visit => visit.status.toLowerCase() === 'completed').length} icon="checkmark-circle-outline" /></View>
    <View style={[s.chips, { marginTop: 0 }]}>{(['Morning OPD', 'Evening OPD'] as const).map(shift => <TouchableOpacity key={shift} accessibilityRole="tab" accessibilityState={{ selected: queueStatus.shift === shift, disabled: currentUser?.role !== 'doctor' || !!current }} disabled={currentUser?.role !== 'doctor' || !!current} onPress={() => setDoctorQueueShift(shift)} style={[s.chip, { flex: 1, alignItems: 'center' }, queueStatus.shift === shift && s.chipSelected]}><Text style={s.badgeText}>{shift === 'Morning OPD' ? 'Morning clinic' : 'Evening clinic'}</Text></TouchableOpacity>)}</View>
    {!!current && <Text style={[s.caption, { marginBottom: 14 }]}>Finish or skip the current patient before changing shifts.</Text>}
    <View style={s.hero}>
      <View style={s.sectionRow}><Text style={s.heroEyebrow}>YOUR CLINIC QUEUE</Text><View style={[s.badge, { backgroundColor: '#2C6659' }]}><Text style={[s.badgeText, { color: '#D4E8E2' }]}>{queueStatus.isPaused ? 'Paused' : 'Ready'}</Text></View></View>
      <Text style={s.heroText}>{queueStatus.shift} · {queueStatus.doctorId === currentUser?.uid ? queueStatus.room : 'Clinic room'}</Text>
      <Text style={s.heroNumber}>{current ? '#' + current.tokenNumber : '—'}</Text>
      <Text style={s.heroTitle}>{current ? current.patientName : next ? 'Ready for your next patient' : 'No patient being seen'}</Text>
      <Text style={s.heroText}>{current?.status === 'in_consultation' ? 'Consultation in progress. Save visit notes when you finish.' : current ? 'Patient called. Start the consultation when they arrive.' : next ? 'Next: #' + next.tokenNumber + ' · ' + next.patientName : waiting.length ? 'Waiting for patients to check in at reception.' : 'Checked-in patients will appear in your queue.'}</Text>
      <Button title={!canManage ? 'Set up doctor access' : current?.status === 'in_consultation' ? 'Write visit notes' : current ? 'Start consultation' : 'Call next patient'} onPress={primaryAction} disabled={canManage && ((queueStatus.isPaused && current?.status !== 'in_consultation') || (!current && !next))} iconName={current?.status === 'in_consultation' ? 'create-outline' : 'arrow-forward'} iconPosition="right" variant="secondary" style={{ marginTop: 20 }} />
      {current?.status === 'serving' && <View style={[s.row, { marginTop: 10 }]}><Button title="Skip for now" onPress={() => setConfirm('skip')} variant="ghost" fullWidth={false} style={{ flex: 1 }} textStyle={{ color: '#D4E8E2' }} /><Button title="Mark absent" onPress={() => setConfirm('absent')} variant="ghost" fullWidth={false} style={{ flex: 1 }} textStyle={{ color: '#D4E8E2' }} /></View>}
    </View>
    <View style={[s.row, { marginBottom: 22 }]}><Button title={queueStatus.isPaused ? 'Resume queue' : 'Pause queue'} disabled={!canManage || queueStatus.doctorId !== currentUser?.uid} onPress={queueStatus.isPaused ? resumeQueue : pauseQueue} iconName={queueStatus.isPaused ? 'play-outline' : 'pause-outline'} variant="outline" fullWidth={false} style={{ flex: 1 }} /><Button title="Set delay" disabled={!canManage || queueStatus.doctorId !== currentUser?.uid} onPress={() => setDelayOpen(true)} variant="outline" iconName="time-outline" fullWidth={false} style={{ flex: 1 }} /></View>
    {queueStatus.doctorId === currentUser?.uid && queueStatus.delayStatus.status !== 'on_time' && <View style={s.notice}><Text style={s.name}>Schedule update</Text><Text style={s.noticeText}>{queueStatus.delayStatus.message}</Text></View>}
    <View style={s.sectionRow}><Text style={s.sectionTitle}>Waiting patients</Text><TouchableOpacity accessibilityRole="button" style={{ padding: 10 }} onPress={() => navigation.navigate('DoctorAppointments', { initialTab: 'upcoming' })}><Text style={s.badgeText}>View all</Text></TouchableOpacity></View>
    {waiting.length ? waiting.slice(0, 6).map(item => <PatientRow key={item.appointmentId} item={item} onPress={() => setSelected(item)} />) : <DoctorSection><View style={s.empty}><Icon name="people-outline" size={30} color="#267259" /><Text style={[s.name, { marginTop: 12 }]}>A little breathing room</Text><Text style={s.caption}>There are no waiting patients for this shift.</Text></View></DoctorSection>}
    {!!skipped.length && <DoctorSection title="Skipped patients">{skipped.map(item => <View key={item.appointmentId} style={[s.sectionRow, { marginBottom: 10 }]}><View style={{ flex: 1 }}><Text style={s.name}>#{item.tokenNumber} · {item.patientName}</Text><Text style={s.caption}>Return this patient to the waiting list.</Text></View><Button title="Recall" size="sm" fullWidth={false} variant="secondary" disabled={!canManage} onPress={() => recallSkippedPatient(item.tokenNumber)} /></View>)}</DoctorSection>}
    <DoctorSection title="Plan your clinic"><DoctorLink title="Clinic hours & availability" subtitle="Working days, shifts and consultation fee" icon="time-outline" onPress={() => navigation.navigate('DoctorAvailability')} /><DoctorLink title="Appointment requests" subtitle={visits.filter(visit => visit.status.toLowerCase() === 'pending').length + ' waiting for review'} icon="calendar-outline" onPress={() => navigation.navigate('DoctorAppointments', { initialTab: 'pending' })} /></DoctorSection>
    <DoctorSheet title={confirm === 'skip' ? 'Skip this patient?' : 'Mark this patient absent?'} visible={!!confirm} close={() => setConfirm(null)}><Text style={s.name}>#{current?.tokenNumber} · {current?.patientName}</Text><Text style={s.body}>{confirm === 'skip' ? 'The patient will move to the skipped list. You can recall them when they arrive.' : 'This visit will be marked as a no-show. Check reception before confirming.'}</Text><Button title={confirm === 'skip' ? 'Skip patient' : 'Mark absent'} onPress={() => { if (confirm === 'skip') skipPatient(); else markNoShow(); setConfirm(null); }} variant={confirm === 'absent' ? 'danger' : 'primary'} style={{ marginTop: 22 }} /><Button title="Keep current patient" variant="ghost" onPress={() => setConfirm(null)} style={{ marginTop: 8 }} /></DoctorSheet>
    <DoctorSheet title="Clinic delay" visible={delayOpen} close={() => setDelayOpen(false)}><Text style={[s.body, { marginBottom: 14 }]}>Choose the update to show in your clinic queue.</Text>{delays.map(delay => <TouchableOpacity key={delay.type} accessibilityRole="button" onPress={() => { setDoctorDelay(delay.type, delay.minutes); setDelayOpen(false); }} style={[s.linkRow, queueStatus.delayStatus.status === delay.type && { backgroundColor: '#E7F3ED', paddingHorizontal: 12, borderRadius: 12 }]}><Text style={[s.name, { flex: 1 }]}>{delay.label}</Text>{queueStatus.delayStatus.status === delay.type && <Icon name="checkmark" size={22} color="#267259" />}</TouchableOpacity>)}</DoctorSheet>
    <DoctorSheet title="Patient details" visible={!!selected} close={() => setSelected(null)}><Text style={s.title}>{selected?.patientName}</Text><Text style={s.body}>Queue #{selected?.tokenNumber} · {selectedVisit?.patientAge ?? '—'} years · {selectedVisit?.patientGender || '—'}</Text><Text style={s.body}>{selectedVisit?.date} · {selectedVisit?.time}</Text><View style={s.divider} /><Text style={s.name}>Reason for visit</Text><Text style={s.body}>{selectedVisit?.symptoms || 'No reason supplied by the patient.'}</Text><View style={s.divider} /><Text style={s.name}>Check-in</Text><Text style={s.body}>{selected?.checkInStatus || 'Not Checked In'}</Text>{!!selectedVisit?.uploadedReports?.length && <Text style={s.body}>{selectedVisit.uploadedReports.length} attached medical reports</Text>}<Button title="Close patient details" onPress={() => setSelected(null)} variant="secondary" style={{ marginTop: 22 }} /></DoctorSheet>
  </DoctorPage>;
}
function PatientRow({ item, onPress }: { item: QueueItem; onPress: () => void }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={'Patient ' + item.patientName + ', queue number ' + item.tokenNumber} onPress={onPress} style={[s.card, s.row]}><View style={s.linkIcon}><Text style={s.badgeText}>#{item.tokenNumber}</Text></View><View style={{ flex: 1 }}><Text style={s.name}>{item.patientName}</Text><Text style={s.caption}>{item.appointmentTime} · {item.checkInStatus === 'Checked In' || item.checkInStatus === 'Waiting' ? 'Arrived at clinic' : 'Not checked in'}</Text></View><Icon name="chevron-forward" size={20} color="#5B6475" /></TouchableOpacity>;
}
