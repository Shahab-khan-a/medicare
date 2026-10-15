import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { DoctorPage, DoctorSection, DoctorMetric, doctorStyles as s } from '../../components/DoctorWorkspace';
import { EmptyState } from '../../components/EmptyState';
import { useApp } from '../../context/AppContext';
import { doctorAppointments } from '../../utils/doctorWorkflow';
import { visitDateTime } from '../../utils/booking';

export default function DoctorEarningsScreen() {
  const { appointments, currentUser } = useApp();
  const [period, setPeriod] = useState('Last 7 days');
  const visits = useMemo(() => doctorAppointments(appointments, currentUser), [appointments, currentUser]);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === 'Last 7 days') start.setDate(start.getDate() - 6);
  if (period === 'This month') start.setDate(1);
  const dated = visits.map(visit => ({ visit, date: visit.date === 'Today' ? new Date(now) : visitDateTime(visit.date, visit.time) }));
  const filtered = dated.filter(item => item.date >= start && item.date <= now);
  const completed = filtered.filter(item => item.visit.status.toLowerCase() === 'completed');
  const value = completed.reduce((sum, item) => sum + Math.max(0, item.visit.fees || 0), 0);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now); date.setDate(now.getDate() - 6 + index);
    const total = dated.filter(item => item.visit.status.toLowerCase() === 'completed' && item.date.toDateString() === date.toDateString()).reduce((sum, item) => sum + Math.max(0, item.visit.fees || 0), 0);
    return { day: date.toLocaleDateString('en-GB', { weekday: 'short' }), total };
  });
  const max = Math.max(1, ...days.map(day => day.total));
  return <DoctorPage title="Clinic earnings">
    <Text style={s.eyebrow}>YOUR CONSULTATION ACTIVITY</Text><Text style={[s.heading, { marginTop: 9 }]}>A clearer view of your work.</Text><Text style={s.body}>Recorded consultation fees from completed visits.</Text>
    <View style={s.chips}>{['Today', 'Last 7 days', 'This month'].map(item => <TouchableOpacity key={item} accessibilityRole="button" accessibilityState={{ selected: period === item }} onPress={() => setPeriod(item)} style={[s.chip, period === item && s.chipSelected]}><Text style={s.badgeText}>{item}</Text></TouchableOpacity>)}</View>
    <View style={s.hero}><Text style={s.heroEyebrow}>COMPLETED VISIT VALUE · {period.toUpperCase()}</Text><Text style={s.heroNumber}>Rs. {value.toLocaleString()}</Text><Text style={s.heroText}>{completed.length} completed visits during this period</Text></View>
    <View style={s.metricRow}><DoctorMetric label="Completed visits" value={completed.length} icon="checkmark-circle-outline" /><DoctorMetric label="Average visit fee" value={'Rs. ' + (completed.length ? Math.round(value / completed.length).toLocaleString() : '0')} icon="cash-outline" /></View>
    <DoctorSection title="The last seven days"><View accessibilityRole="image" accessibilityLabel={days.map(day => day.day + ': Rs. ' + day.total).join(', ')} style={{ flexDirection: 'row', gap: 8, height: 145, alignItems: 'flex-end' }}>{days.map((day, index) => <View key={index} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}><View style={{ width: '80%', height: Math.max(4, 100 * day.total / max), borderRadius: 6, backgroundColor: day.total ? '#267259' : '#E7F3ED' }} /><Text style={[s.caption, { fontSize: 10 }]}>{day.day}</Text></View>)}</View></DoctorSection>
    <View style={s.notice}><Text style={s.name}>Payment services are not connected</Text><Text style={s.noticeText}>These totals show consultation fees recorded in the app. Online collection, bank balances and withdrawals will appear when payments are connected.</Text></View>
    <Text style={s.sectionTitle}>Completed consultations</Text>
    {completed.length ? [...completed].sort((a, b) => b.date.getTime() - a.date.getTime()).map(({ visit }) => <View key={visit.id} style={[s.card, s.row]}><View style={{ flex: 1 }}><Text style={s.name}>{visit.patientName}</Text><Text style={s.caption}>{visit.date} · {visit.time}</Text><Text style={s.caption}>Consultation completed</Text></View><Text style={s.name}>Rs. {visit.fees.toLocaleString()}</Text></View>) : <EmptyState icon="receipt-outline" title="No completed visits in this period" subtitle="Consultations will appear here once their visit notes are saved." />}
  </DoctorPage>;
}
