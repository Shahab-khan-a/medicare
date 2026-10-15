import React, { useRef, useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { DoctorPage, DoctorSection, doctorStyles as s } from '../../components/DoctorWorkspace';
import { FormScrollView } from '../../components/FormScrollView';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { EmptyState } from '../../components/EmptyState';
import { useApp } from '../../context/AppContext';
import { PrescriptionMedicine } from '../../types';
import { belongsToDoctor } from '../../utils/doctorWorkflow';
import { visitDateTime } from '../../utils/booking';

export default function WritePrescriptionScreen({ navigation, route }: { navigation: any; route: any }) {
  const { savePrescription, appointments, currentUser, isCurrentDoctorVerified } = useApp();
  const appointment = appointments.find(visit => visit.id === route?.params?.appointmentId && belongsToDoctor(visit, currentUser));
  const [review, setReview] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([]);
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  const [instructions, setInstructions] = useState('');
  const [advice, setAdvice] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [error, setError] = useState('');
  const [medicineError, setMedicineError] = useState('');
  const [saving, setSaving] = useState(false);
  const submitted = useRef(false);
  const back = () => review ? setReview(false) : navigation.goBack();
  const addMedicine = () => {
    if (![name, dose, frequency, duration].every(value => value.trim())) { setMedicineError('Enter the medicine name, dose, frequency and duration.'); return; }
    setMedicines(previous => [...previous, { id: 'med-' + Date.now(), name: name.trim(), dosage: dose.trim(), frequency: frequency.trim(), duration: duration.trim(), instruction: instructions.trim() }]);
    setName(''); setDose(''); setFrequency(''); setDuration(''); setInstructions(''); setMedicineError('');
  };
  const validate = () => {
    if (!diagnosis.trim()) { setError('Enter the clinical diagnosis or assessment.'); return false; }
    if ([name, dose, frequency, duration, instructions].some(value => value.trim())) { setError('Add the medicine you are editing, or clear its fields before reviewing.'); return false; }
    if (followUp.trim()) {
      const date = visitDateTime(followUp.trim(), '12:00 PM');
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (!(date >= today)) { setError('Use a follow-up date from today onward, such as 15 Oct 2026.'); return false; }
    }
    setError(''); return true;
  };
  const save = () => {
    if (!appointment || !currentUser || !validate() || submitted.current) return;
    submitted.current = true; setSaving(true);
    try {
      savePrescription({
        appointmentId: appointment.id, patientId: (appointment as any).patientId,
        doctorId: currentUser.uid, doctorName: currentUser.name, doctorSpecialty: currentUser.specialty || appointment.doctorSpecialty,
        doctorHospital: currentUser.hospital || 'Clinic', patientName: appointment.patientName, patientAge: appointment.patientAge,
        patientGender: appointment.patientGender, date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        diagnosis: diagnosis.trim(), medicines, advice: advice.split('\n').map(value => value.trim()).filter(Boolean),
        followUpDate: followUp.trim() || 'Not scheduled', doctorSignature: currentUser.name + (currentUser.medicalLicenseNumber ? ' · ' + currentUser.medicalLicenseNumber : ''),
      });
      navigation.replace('DoctorTabs');
    } catch (caught) { submitted.current = false; setSaving(false); setError(caught instanceof Error ? caught.message : 'Could not save the visit notes. Please try again.'); }
  };
  if (!appointment || !isCurrentDoctorVerified || appointment.status !== 'In Consultation') {
    return <DoctorPage title="Visit notes" back={() => navigation.goBack()}><EmptyState icon="create-outline" title="Start the patient visit first" subtitle="Choose the current patient and start their consultation before writing visit notes." actionTitle="Open clinic workspace" onAction={() => navigation.replace('DoctorTabs')} /></DoctorPage>;
  }
  return <DoctorPage title={review ? 'Review visit notes' : 'Write visit notes'} back={back} scroll={false}>
    <FormScrollView contentContainerStyle={s.content}>
      <DoctorSection><Text style={s.eyebrow}>PATIENT VISIT · #{appointment.tokenNumber}</Text><Text style={[s.title, { marginTop: 10 }]}>{appointment.patientName}</Text><Text style={s.body}>{appointment.patientAge} years · {appointment.patientGender}</Text><Text style={s.caption}>{appointment.date} · {appointment.opdRoom || 'Clinic room'}</Text>{!!appointment.symptoms && <Text style={s.caption}>Reason: {appointment.symptoms}</Text>}</DoctorSection>
      {!review ? <>
        <DoctorSection title="Clinical assessment"><InputField label="Diagnosis or assessment" required value={diagnosis} onChangeText={setDiagnosis} placeholder="Enter your clinical assessment" multiline numberOfLines={3} /></DoctorSection>
        <DoctorSection title={'Medicines · ' + medicines.length}>
          {!medicines.length && <Text style={[s.caption, { marginBottom: 18 }]}>Add medicines if prescribed for this visit. Medication details start blank for you to complete.</Text>}
          {medicines.map((medicine, index) => <View key={medicine.id} style={{ paddingBottom: 14, marginBottom: 14, borderBottomWidth: 1, borderBottomColor: '#E3E8EF' }}><View style={s.row}><View style={{ flex: 1 }}><Text style={s.name}>{index + 1}. {medicine.name}</Text><Text style={s.caption}>{medicine.dosage} · {medicine.frequency} · {medicine.duration}</Text>{!!medicine.instruction && <Text style={s.caption}>{medicine.instruction}</Text>}</View><TouchableOpacity accessibilityRole="button" accessibilityLabel={'Remove ' + medicine.name} onPress={() => setMedicines(previous => previous.filter(item => item.id !== medicine.id))} style={s.iconButton}><Icon name="trash-outline" size={20} color="#B91C1C" /></TouchableOpacity></View></View>)}
          <InputField label="Medicine name" value={name} onChangeText={setName} placeholder="Enter medicine name" />
          <InputField label="Dose" value={dose} onChangeText={setDose} placeholder="Enter prescribed dose" />
          <InputField label="Frequency" value={frequency} onChangeText={setFrequency} placeholder="Enter prescribed frequency" />
          <InputField label="Duration" value={duration} onChangeText={setDuration} placeholder="Enter prescribed duration" />
          <InputField label="Instructions (optional)" value={instructions} onChangeText={setInstructions} placeholder="Enter any specific instructions" />
          {!!medicineError && <Text accessibilityRole="alert" style={s.error}>{medicineError}</Text>}
          <Button title="Add medicine to visit notes" iconName="add-outline" variant="secondary" onPress={addMedicine} style={{ marginTop: 12 }} />
        </DoctorSection>
        <DoctorSection title="Advice & follow-up"><InputField label="Patient advice (optional)" value={advice} onChangeText={setAdvice} placeholder="Enter advice, one item per line" multiline numberOfLines={4} style={{ minHeight: 100, textAlignVertical: 'top' }} /><InputField label="Follow-up date (optional)" value={followUp} onChangeText={setFollowUp} placeholder="For example, 15 Oct 2026" hint="Leave blank if no follow-up is scheduled." /></DoctorSection>
      </> : <>
        <Text style={[s.title, { marginBottom: 20 }]}>Check before completing the visit.</Text>
        <DoctorSection title="Clinical assessment"><Text style={s.body}>{diagnosis.trim()}</Text></DoctorSection>
        <DoctorSection title="Medicines">{medicines.length ? medicines.map(medicine => <View key={medicine.id} style={{ marginBottom: 16 }}><Text style={s.name}>{medicine.name}</Text><Text style={s.body}>{medicine.dosage} · {medicine.frequency} · {medicine.duration}</Text>{!!medicine.instruction && <Text style={s.caption}>{medicine.instruction}</Text>}</View>) : <Text style={s.body}>No medicines prescribed.</Text>}</DoctorSection>
        <DoctorSection title="Advice & follow-up"><Text style={s.body}>{advice.trim() || 'No additional advice.'}</Text><Text style={s.caption}>Follow-up: {followUp.trim() || 'Not scheduled'}</Text></DoctorSection>
        <View style={s.notice}><Text style={s.noticeText}>Saving these notes completes this patient’s appointment and adds the prescription to their records.</Text></View>
      </>}
      {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    </FormScrollView>
    <View style={{ padding: 18, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E3E8EF' }}><Button title={review ? 'Save notes & complete visit' : 'Review visit notes'} loading={saving} onPress={() => review ? save() : validate() && setReview(true)} iconName={review ? 'checkmark-outline' : 'arrow-forward'} /></View>
  </DoctorPage>;
}
