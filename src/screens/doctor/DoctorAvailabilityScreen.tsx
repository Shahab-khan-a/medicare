import React, { useState } from 'react';
import { Text, View, TouchableOpacity, Switch } from 'react-native';
import { DoctorPage, DoctorSection, doctorStyles as s } from '../../components/DoctorWorkspace';
import { FormScrollView } from '../../components/FormScrollView';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import { useApp } from '../../context/AppContext';
import { OPDShiftConfig } from '../../types';
import { availabilityErrors } from '../../utils/doctorWorkflow';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
type ShiftDraft = Omit<OPDShiftConfig, 'maxTokens' | 'consultationDurationMinutes'> & { maxTokens: string; consultationDurationMinutes: string };
export default function DoctorAvailabilityScreen({ navigation }: { navigation: any }) {
  const { doctorAvailability, setDoctorAvailability, currentUser } = useApp();
  const [workingDays, setWorkingDays] = useState(doctorAvailability.workingDays);
  const [fee, setFee] = useState(String(doctorAvailability.consultationFee));
  const [shifts, setShifts] = useState<ShiftDraft[]>(doctorAvailability.shifts.map(shift => ({ ...shift, maxTokens: String(shift.maxTokens), consultationDurationMinutes: String(shift.consultationDurationMinutes) })));
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const update = (index: number, patch: Partial<ShiftDraft>) => { setSaved(false); setShifts(previous => previous.map((shift, itemIndex) => itemIndex === index ? { ...shift, ...patch } : shift)); };
  const save = () => {
    const config = { ...doctorAvailability, doctorId: currentUser?.uid || doctorAvailability.doctorId, workingDays, daysOff: days.filter(day => !workingDays.includes(day)), consultationFee: fee.trim() ? Number(fee) : NaN, shifts: shifts.map(shift => ({ ...shift, maxTokens: shift.maxTokens.trim() ? Number(shift.maxTokens) : NaN, consultationDurationMinutes: shift.consultationDurationMinutes.trim() ? Number(shift.consultationDurationMinutes) : NaN })) };
    const validation = availabilityErrors(config); setErrors(validation);
    if (validation.length || currentUser?.role !== 'doctor') return;
    setDoctorAvailability(config); setSaved(true);
  };
  return <DoctorPage title="Clinic hours" back={() => navigation.goBack()} scroll={false}>
    <FormScrollView contentContainerStyle={s.content}>
      <Text style={s.heading}>Make room for your patients.</Text><Text style={[s.body, { marginBottom: 22 }]}>Set your working days, clinic shifts and consultation fee.</Text>
      <DoctorSection title="Working days"><Text style={s.caption}>Choose the days you see patients at the clinic.</Text><View style={s.chips}>{days.map(day => <TouchableOpacity key={day} accessibilityRole="button" accessibilityState={{ selected: workingDays.includes(day) }} onPress={() => { setSaved(false); setWorkingDays(previous => previous.includes(day) ? previous.filter(value => value !== day) : [...previous, day]); }} style={[s.chip, workingDays.includes(day) && s.chipSelected]}><Text style={[s.badgeText, !workingDays.includes(day) && { color: '#5B6475' }]}>{day}</Text></TouchableOpacity>)}</View></DoctorSection>
      {shifts.map((shift, index) => <DoctorSection key={shift.shiftName}>
        <View style={s.sectionRow}><View style={{ flex: 1 }}><Text style={s.sectionTitle}>{shift.shiftName === 'Morning OPD' ? 'Morning clinic' : 'Evening clinic'}</Text><Text style={s.caption}>{shift.isActive ? 'This shift is enabled' : 'This shift is disabled'}</Text></View><Switch accessibilityLabel={'Enable ' + shift.shiftName} value={shift.isActive} onValueChange={value => update(index, { isActive: value })} trackColor={{ false: '#CBD3DF', true: '#267259' }} /></View>
        {shift.isActive && <>
          <Text style={[s.caption, { marginBottom: 14 }]}>Enter times such as 09:00 AM or 05:00 PM.</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}><View style={{ flex: 1 }}><InputField label="Starts at" value={shift.startTime} onChangeText={value => update(index, { startTime: value.toUpperCase() })} autoCapitalize="characters" /></View><View style={{ flex: 1 }}><InputField label="Ends at" value={shift.endTime} onChangeText={value => update(index, { endTime: value.toUpperCase() })} autoCapitalize="characters" /></View></View>
          <View style={{ flexDirection: 'row', gap: 10 }}><View style={{ flex: 1 }}><InputField label="Patient limit" value={shift.maxTokens} onChangeText={value => update(index, { maxTokens: value })} keyboardType="number-pad" maxLength={3} /></View><View style={{ flex: 1 }}><InputField label="Minutes per visit" value={shift.consultationDurationMinutes} onChangeText={value => update(index, { consultationDurationMinutes: value })} keyboardType="number-pad" maxLength={3} /></View></View>
          <InputField label="Clinic room" value={shift.roomNumber} onChangeText={value => update(index, { roomNumber: value })} placeholder="For example, Room 102" />
        </>}
      </DoctorSection>)}
      <DoctorSection title="Consultation fee"><InputField label="Fee in Pakistani rupees" value={fee} onChangeText={value => { setFee(value); setSaved(false); }} keyboardType="number-pad" placeholder="Enter consultation fee" hint="Enter 0 if the consultation is free." /></DoctorSection>
      {!!errors.length && <View accessibilityRole="alert" style={s.notice}>{errors.map(error => <Text key={error} style={s.error}>{error}</Text>)}</View>}
      {saved && <View accessibilityRole="alert" style={[s.notice, { backgroundColor: '#E7F3ED' }]}><Text style={s.badgeText}>Clinic hours saved for this session.</Text></View>}
      <Text style={s.caption}>These settings currently apply in this app session. Publishing clinic hours to patient booking still needs a schedule connection.</Text>
    </FormScrollView>
    <View style={{ padding: 18, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E3E8EF' }}><Button title={saved ? 'Saved — update clinic hours' : 'Save clinic hours'} onPress={save} disabled={currentUser?.role !== 'doctor'} iconName="checkmark-outline" />{currentUser?.role !== 'doctor' && <Text style={[s.caption, { textAlign: 'center' }]}>Sign in as a doctor to save changes.</Text>}</View>
  </DoctorPage>;
}
