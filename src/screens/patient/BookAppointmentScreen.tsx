import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, BackHandler } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../../theme';
import { Icon } from '../../components/Icon';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { InputField } from '../../components/InputField';
import { FormScrollView } from '../../components/FormScrollView';
import { EmptyState } from '../../components/EmptyState';
import { Doctor, FamilyMember } from '../../types';
import { useApp } from '../../context/AppContext';
import { bookingDates, patientErrors, SERVICE_FEE, VISIT_SHIFTS, visitDateTime } from '../../utils/booking';

export default function BookAppointmentScreen({ navigation, route }: { navigation: any; route: any }) {
  const { doctors, currentUser, familyMembers } = useApp();
  const doctor: Doctor | undefined = route?.params?.doctor || doctors.find(d => d.id === route?.params?.doctorId);
  const dates = useMemo(() => doctor ? bookingDates(doctor) : [], [doctor]);
  const [step, setStep] = useState(0);
  const [date, setDate] = useState(dates.find(d => d.available)?.full || '');
  const [shift, setShift] = useState<0 | 1>(0);
  const [time, setTime] = useState('');
  const [memberId, setMemberId] = useState<string | undefined>(familyMembers[0]?.id);
  const [name, setName] = useState(familyMembers[0]?.name || currentUser?.name || '');
  const [age, setAge] = useState(familyMembers[0] ? String(familyMembers[0].age) : '');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(familyMembers[0]?.gender || 'Other');
  const [symptoms, setSymptoms] = useState('');
  const [validation, setValidation] = useState(false);
  const [visitError, setVisitError] = useState('');
  const scroll = useRef<ScrollView>(null);
  useFocusEffect(useCallback(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step === 0) return false;
      setStep(value => value - 1);
      scroll.current?.scrollTo({ y: 0, animated: false });
      return true;
    });
    return () => subscription.remove();
  }, [step]));
  const errors = patientErrors(name, age);
  const changeStep = (value: number) => { setStep(value); scroll.current?.scrollTo({ y: 0, animated: false }); };
  const selectMember = (member?: FamilyMember) => {
    setMemberId(member?.id); setName(member?.name || ''); setAge(member ? String(member.age) : '');
    setGender(member?.gender || 'Other'); setValidation(false);
  };
  const validVisit = () => {
    if (!date || !time || !(visitDateTime(date, time) > new Date())) {
      setVisitError('Choose a date and a future visit time.'); changeStep(0); return false;
    }
    return true;
  };
  const continueBooking = () => {
    if (!doctor || !validVisit()) return;
    if (step === 0) { changeStep(1); return; }
    setValidation(true);
    if (errors.name || errors.age) { changeStep(1); return; }
    if (step === 1) { changeStep(2); return; }
    const member = familyMembers.find(m => m.id === memberId);
    navigation.navigate('Payment', { doctor, bookingDetails: {
      date, time, type: 'in_clinic', patientName: name.trim(), patientAge: Number(age), gender,
      familyMemberId: member?.id, familyMemberRelation: member?.relationship,
      symptoms: symptoms.trim(), fees: doctor.fees, shift: VISIT_SHIFTS[shift].name,
      opdRoom: doctor.roomNumber || 'Ask at clinic reception',
    } });
  };
  if (!doctor) return <SafeAreaView style={styles.screen}><Header title="Book a visit" showBack onBack={() => navigation.goBack()} /><EmptyState icon="search-outline" title="Choose your doctor first" subtitle="Find a doctor to see their clinic and consultation fee." actionTitle="Find a doctor" onAction={() => navigation.navigate('DoctorList')} /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <Header title="Book your visit" showBack onBack={() => step > 0 ? changeStep(step - 1) : navigation.goBack()} />
      <View style={styles.progress}>
        {['Visit', 'Patient', 'Review'].map((label, index) => <View key={label} style={styles.progressItem}><View style={[styles.progressLine, index <= step && styles.progressActive]} /><Text style={[styles.progressLabel, index === step && { color: colors.primary }]}>{index + 1}. {label}</Text></View>)}
      </View>
      <FormScrollView ref={scroll} contentContainerStyle={styles.content}>
        <View style={styles.doctorCard}><Image source={{ uri: doctor.photo }} style={styles.photo} /><View style={{ flex: 1 }}><Text style={styles.doctorName}>{doctor.name}</Text><Text style={styles.body}>{doctor.specialty}</Text><Text style={styles.body}>{doctor.hospital}</Text></View></View>
        <Text style={styles.title}>{['When would you like to visit?', 'Who is this visit for?', 'Everything look right?'][step]}</Text>
        <Text style={styles.description}>{['Choose a date and time for your in-person clinic visit.', 'Check the patient details so the clinic can prepare.', 'Check your visit and total fee before continuing.'][step]}</Text>
        {step === 0 && <>
          <Text style={styles.label}>Choose a date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
            {dates.map(item => <TouchableOpacity key={item.full} disabled={!item.available} accessibilityRole="button" accessibilityLabel={item.full} accessibilityState={{ selected: date === item.full, disabled: !item.available }} onPress={() => { setDate(item.full); setTime(''); setVisitError(''); }} style={[styles.date, date === item.full && styles.selected, !item.available && styles.disabled]}>
              <Text style={[styles.dateDay, date === item.full && styles.white]}>{item.day}</Text><Text style={[styles.dateNumber, date === item.full && styles.white]}>{item.number}</Text><Text style={[styles.dateDay, date === item.full && styles.white]}>{item.month}</Text>
            </TouchableOpacity>)}
          </ScrollView>
          <Text style={styles.label}>Choose a clinic shift</Text>
          <View style={styles.shiftRow}>{VISIT_SHIFTS.map((item, index) => <TouchableOpacity key={item.name} accessibilityRole="radio" accessibilityState={{ checked: shift === index }} onPress={() => { setShift(index as 0 | 1); setTime(''); }} style={[styles.shift, shift === index && styles.outlined]}><Icon name={item.icon} size={22} color={colors.primary} /><Text style={styles.doctorName}>{item.label}</Text><Text style={styles.body}>{item.hours}</Text></TouchableOpacity>)}</View>
          <Text style={styles.label}>Choose a visit time</Text>
          <View style={styles.times}>{VISIT_SHIFTS[shift].times.map(slot => {
            const disabled = !date || visitDateTime(date, slot) <= new Date();
            return <TouchableOpacity key={slot} disabled={disabled} accessibilityRole="button" accessibilityState={{ selected: time === slot, disabled }} onPress={() => { setTime(slot); setVisitError(''); }} style={[styles.time, time === slot && styles.selected, disabled && styles.disabled]}><Text style={[styles.timeText, time === slot && styles.white]}>{slot}</Text></TouchableOpacity>;
          })}</View>
          {!!visitError && <Text accessibilityRole="alert" style={styles.error}>{visitError}</Text>}
          <View style={styles.note}><Icon name="information-circle-outline" size={21} color={colors.primary} /><Text style={[styles.body, { flex: 1 }]}>Your visit time is an arrival guide. The clinic sees patients by queue number; waiting times can vary.</Text></View>
        </>}
        {step === 1 && <>
          <Text style={styles.label}>Patient profile</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.memberRow}>
            {familyMembers.map(member => <TouchableOpacity key={member.id} accessibilityRole="button" accessibilityState={{ selected: memberId === member.id }} onPress={() => selectMember(member)} style={[styles.member, memberId === member.id && styles.outlined]}><Text style={styles.timeText}>{member.name} · {member.relationship}</Text></TouchableOpacity>)}
            <TouchableOpacity accessibilityRole="button" onPress={() => selectMember()} style={[styles.member, !memberId && styles.outlined]}><Text style={styles.timeText}>Someone else</Text></TouchableOpacity>
          </ScrollView>
          <InputField label="Patient full name" required value={name} onChangeText={text => { setName(text); setMemberId(undefined); }} placeholder="Enter full name" autoCapitalize="words" error={validation ? errors.name : undefined} />
          <InputField label="Age in years" required value={age} onChangeText={setAge} placeholder="Enter age" keyboardType="number-pad" maxLength={3} error={validation ? errors.age : undefined} hint="For a baby under one year, enter 0." />
          <Text style={styles.label}>Gender</Text>
          <View style={styles.shiftRow}>{(['Male', 'Female', 'Other'] as const).map(value => <TouchableOpacity key={value} accessibilityRole="radio" accessibilityState={{ checked: gender === value }} onPress={() => setGender(value)} style={[styles.gender, gender === value && styles.outlined]}><Text style={styles.timeText}>{value}</Text></TouchableOpacity>)}</View>
          <InputField label="Reason for your visit (optional)" value={symptoms} onChangeText={setSymptoms} placeholder="Let the doctor know how you’re feeling" multiline numberOfLines={4} style={{ minHeight: 100, textAlignVertical: 'top' }} />
        </>}
        {step === 2 && <>
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}><Text style={styles.label}>Visit details</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel="Edit visit details" onPress={() => changeStep(0)} style={styles.edit}><Text style={styles.link}>Edit</Text></TouchableOpacity></View>
            <ReviewRow icon="calendar-outline" title={date} subtitle={time + ' · ' + VISIT_SHIFTS[shift].label + ' shift'} />
            <ReviewRow icon="location-outline" title={doctor.hospital} subtitle={doctor.roomNumber || 'Ask at clinic reception'} />
            <Text style={styles.body}>{doctor.location}</Text>
          </View>
          <View style={styles.reviewCard}><View style={styles.reviewHeader}><Text style={styles.label}>Patient details</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel="Edit patient details" onPress={() => changeStep(1)} style={styles.edit}><Text style={styles.link}>Edit</Text></TouchableOpacity></View><ReviewRow icon="person-outline" title={name.trim()} subtitle={age + ' years · ' + gender} />{!!symptoms.trim() && <Text style={styles.body}>{symptoms.trim()}</Text>}</View>
          <View style={styles.reviewCard}><Text style={styles.label}>Fee breakdown</Text><View style={styles.feeRow}><Text style={styles.body}>Consultation</Text><Text style={styles.doctorName}>Rs. {doctor.fees.toLocaleString()}</Text></View><View style={styles.feeRow}><Text style={styles.body}>Service fee</Text><Text style={styles.doctorName}>Rs. {SERVICE_FEE}</Text></View><View style={[styles.feeRow, styles.totalRow]}><Text style={styles.doctorName}>Total</Text><Text style={styles.total}>Rs. {(doctor.fees + SERVICE_FEE).toLocaleString()}</Text></View></View>
          <View style={styles.note}><Icon name="ticket-outline" size={21} color={colors.primary} /><Text style={[styles.body, { flex: 1 }]}>Your queue number will appear on the confirmation screen. You can then track your turn from My appointments.</Text></View>
        </>}
      </FormScrollView>
      <View style={styles.footer}><View style={styles.footerRow}><Text style={styles.body}>Total, including service fee</Text><Text style={styles.doctorName}>Rs. {(doctor.fees + SERVICE_FEE).toLocaleString()}</Text></View><Button title={['Continue to patient details', 'Review my visit', 'Continue to payment'][step]} onPress={continueBooking} disabled={step === 0 && (!date || !time)} iconName="arrow-forward" iconPosition="right" /></View>
    </SafeAreaView>
  );
}
function ReviewRow({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) { return <View style={styles.reviewRow}><Icon name={icon} size={22} color={colors.primary} /><View style={{ flex: 1 }}><Text style={styles.doctorName}>{title}</Text><Text style={styles.body}>{subtitle}</Text></View></View>; }
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background }, content: { padding: 22, paddingBottom: 26, width: '100%', maxWidth: 720, alignSelf: 'center' },
  progress: { flexDirection: 'row', gap: 10, paddingHorizontal: 22, paddingBottom: 12 }, progressItem: { flex: 1 }, progressLine: { height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: 8 }, progressActive: { backgroundColor: colors.primary }, progressLabel: { ...typography.captionBold, color: colors.textSecondary },
  doctorCard: { flexDirection: 'row', gap: 13, alignItems: 'center', padding: 16, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, marginBottom: 24 }, photo: { width: 54, height: 60, borderRadius: 12, backgroundColor: colors.primaryLight }, doctorName: { ...typography.bodySemibold, color: colors.textPrimary }, body: { ...typography.caption, color: colors.textSecondary, marginTop: 3 },
  title: { ...typography.h1, color: colors.textPrimary }, description: { ...typography.body, color: colors.textSecondary, marginTop: 8, marginBottom: 24 }, label: { ...typography.bodySemibold, color: colors.textPrimary, marginBottom: 12 },
  dateRow: { gap: 9, paddingBottom: 22 }, date: { width: 67, paddingVertical: 13, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, alignItems: 'center' }, dateDay: { ...typography.captionMedium, color: colors.textSecondary }, dateNumber: { ...typography.h2, color: colors.textPrimary, marginVertical: 4 }, selected: { backgroundColor: colors.primary, borderColor: colors.primary }, white: { color: colors.white }, disabled: { opacity: 0.35 },
  shiftRow: { flexDirection: 'row', gap: 10, marginBottom: 22 }, shift: { flex: 1, gap: 4, padding: 15, borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.white }, outlined: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  times: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, time: { flexBasis: '29%', flexGrow: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.white }, timeText: { ...typography.captionBold, color: colors.textPrimary },
  note: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', padding: 16, borderRadius: 16, backgroundColor: colors.primaryLight, marginTop: 22 }, error: { ...typography.caption, color: colors.error, marginTop: 12 },
  memberRow: { gap: 10, paddingBottom: 20 }, member: { paddingHorizontal: 15, minHeight: 46, justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white }, gender: { flex: 1, minHeight: 46, justifyContent: 'center', alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  reviewCard: { padding: 18, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, marginBottom: 14 }, reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, reviewRow: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 14 }, edit: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 }, link: { ...typography.captionBold, color: colors.primary }, feeRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 10 }, totalRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14, marginTop: 4 }, total: { ...typography.h3, color: colors.primary },
  footer: { padding: 18, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.white }, footerRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 12 },
});
