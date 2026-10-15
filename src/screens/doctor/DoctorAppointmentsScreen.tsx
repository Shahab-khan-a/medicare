import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Icon } from '../../components/Icon';
import { AppointmentStatusBadge } from '../../components/AppointmentStatusBadge';
import { DoctorPage, DoctorSheet, doctorStyles as s } from '../../components/DoctorWorkspace';
import { useApp } from '../../context/AppContext';
import { Appointment } from '../../types';
import { doctorAppointments } from '../../utils/doctorWorkflow';

type Tab = 'upcoming' | 'pending' | 'completed';
function tabFor(appointment: Appointment): Tab {
  const status = appointment.status.toLowerCase();
  return status === 'pending' ? 'pending' : ['completed', 'cancelled', 'no show'].includes(status) ? 'completed' : 'upcoming';
}
export default function DoctorAppointmentsScreen({ navigation, route }: { navigation: any; route: any }) {
  const { appointments, currentUser, isCurrentDoctorVerified, reviewAppointmentRequest, startConsultation } = useApp();
  const [tab, setTab] = useState<Tab>(route?.params?.initialTab || 'upcoming');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [declineOpen, setDeclineOpen] = useState(false);
  const visits = useMemo(() => doctorAppointments(appointments, currentUser), [appointments, currentUser]);
  const canManage = currentUser?.role === 'doctor' && isCurrentDoctorVerified;
  const selected = visits.find(visit => visit.id === selectedId);
  useEffect(() => { setTab(route?.params?.initialTab || 'upcoming'); }, [route?.params?.initialTab]);
  const filtered = visits.filter(visit => tabFor(visit) === tab && (visit.patientName.toLowerCase().includes(query.trim().toLowerCase()) || String(visit.tokenNumber || '').includes(query.trim())));
  const close = () => { setSelectedId(null); setDeclineOpen(false); };
  const primaryLabel = selected?.status === 'In Consultation' ? 'Write visit notes' : selected?.status === 'Your Turn' ? 'Start consultation' : selected?.status.toLowerCase() === 'pending' ? 'Accept request' : selected?.prescriptionId ? 'View prescription' : 'Open clinic queue';
  const handlePrimary = () => {
    if (!selected) return;
    if (selected.status.toLowerCase() === 'pending') { reviewAppointmentRequest(selected.id, true); close(); return; }
    if (selected.status === 'Your Turn') { startConsultation(selected.id); close(); navigation.navigate('DoctorDashboard'); return; }
    if (selected.status === 'In Consultation') { close(); navigation.navigate('WritePrescription', { appointmentId: selected.id }); return; }
    if (selected.prescriptionId) { close(); navigation.navigate('Prescription', { prescriptionId: selected.prescriptionId }); return; }
    close(); navigation.navigate('DoctorDashboard');
  };
  return <DoctorPage title="Patient appointments" scroll={false}>
    <View style={{ paddingHorizontal: 22, paddingBottom: 10 }}>
      <View style={[s.row, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E3E8EF', borderRadius: 16, paddingLeft: 14 }]}><Icon name="search-outline" size={22} color="#267259" /><TextInput accessibilityLabel="Search patients or queue numbers" value={query} onChangeText={setQuery} placeholder="Patient name or queue number" placeholderTextColor="#5B6475" style={{ flex: 1, minWidth: 0, paddingVertical: 16, color: '#0F172A', fontSize: 14 }} />{!!query && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Clear patient search" onPress={() => setQuery('')} style={s.iconButton}><Icon name="close" size={20} color="#5B6475" /></TouchableOpacity>}</View>
      <View style={s.chips}>{([{ key: 'upcoming', label: 'Upcoming' }, { key: 'pending', label: 'Requests' }, { key: 'completed', label: 'History' }] as const).map(item => <TouchableOpacity key={item.key} accessibilityRole="tab" accessibilityState={{ selected: tab === item.key }} onPress={() => setTab(item.key)} style={[s.chip, { flex: 1, alignItems: 'center', paddingHorizontal: 5 }, tab === item.key && s.chipSelected]}><Text style={[s.badgeText, tab !== item.key && { color: '#5B6475' }]}>{item.label} · {visits.filter(visit => tabFor(visit) === item.key).length}</Text></TouchableOpacity>)}</View>
    </View>
    <FlatList data={filtered} keyExtractor={item => item.id} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} ListEmptyComponent={<EmptyState icon="calendar-outline" title={query ? 'No matching patients' : tab === 'pending' ? 'All requests reviewed' : tab === 'completed' ? 'Your visit history starts here' : 'Your upcoming patients'} subtitle={query ? 'Try another name or queue number.' : currentUser?.role !== 'doctor' ? 'Sign in as a doctor to see your clinic’s patients.' : 'Patient bookings for your clinic will appear here.'} />} renderItem={({ item }) => <TouchableOpacity accessibilityRole="button" accessibilityLabel={'View appointment for ' + item.patientName} onPress={() => setSelectedId(item.id)} style={s.card}><View style={s.sectionRow}><View style={{ flex: 1 }}><Text style={s.sectionTitle}>{item.patientName}</Text><Text style={s.caption}>{item.patientAge} years · {item.patientGender}</Text></View><AppointmentStatusBadge status={item.status} /></View><View style={s.row}><Icon name="calendar-outline" size={17} color="#267259" /><Text style={s.caption}>{item.date} · {item.time}</Text></View><View style={[s.row, { marginTop: 9 }]}><Icon name="ticket-outline" size={17} color="#267259" /><Text style={s.caption}>{item.tokenNumber ? 'Queue #' + item.tokenNumber : 'Queue number after approval'} · {item.checkInStatus || 'Not Checked In'}</Text></View><Text style={[s.badgeText, { marginTop: 17 }]}>{item.status.toLowerCase() === 'pending' ? 'Review request' : 'View patient details'} →</Text></TouchableOpacity>} />
    <DoctorSheet title={declineOpen ? 'Decline this request?' : 'Patient appointment'} visible={!!selected} close={close}>
      {selected && <><Text style={s.title}>{selected.patientName}</Text><Text style={s.body}>{selected.patientAge} years · {selected.patientGender}</Text><View style={{ marginTop: 14 }}><AppointmentStatusBadge status={selected.status} /></View><View style={s.divider} /><Text style={s.name}>Visit details</Text><Text style={s.body}>{selected.date} · {selected.time}</Text><Text style={s.caption}>{selected.shift} · {selected.opdRoom || 'Clinic reception'}</Text><Text style={s.caption}>{selected.tokenNumber ? 'Queue #' + selected.tokenNumber : 'No queue number assigned yet'}</Text><Text style={s.caption}>{selected.checkInStatus || 'Not Checked In'}</Text><View style={s.divider} /><Text style={s.name}>Reason for visit</Text><Text style={s.body}>{selected.symptoms || 'Not supplied by the patient.'}</Text>{!!selected.uploadedReports?.length && <><Text style={[s.name, { marginTop: 18 }]}>Attached reports</Text>{selected.uploadedReports.map(report => <Text key={report.id} style={s.caption}>{report.title} · {report.fileFormat}</Text>)}</>}
      {!canManage && <Text style={[s.noticeText, { marginTop: 18 }]}>Complete doctor verification before reviewing requests or starting consultations.</Text>}
      {declineOpen ? <><Text style={[s.body, { marginTop: 20 }]}>This request will be cancelled. The visit will remain in your history.</Text><Button title="Decline request" disabled={!canManage} onPress={() => { reviewAppointmentRequest(selected.id, false); close(); }} variant="danger" style={{ marginTop: 18 }} /><Button title="Keep request" onPress={() => setDeclineOpen(false)} variant="ghost" /></> :
      <><Button title={primaryLabel} disabled={!canManage && !selected.prescriptionId} onPress={handlePrimary} style={{ marginTop: 22 }} />{selected.status.toLowerCase() === 'pending' && <Button title="Decline request" onPress={() => setDeclineOpen(true)} disabled={!canManage} variant="ghost" style={{ marginTop: 8 }} />}</>}</>}
    </DoctorSheet>
  </DoctorPage>;
}
