import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Image } from 'expo-image';
import { DoctorPage, DoctorSection, DoctorLink, doctorStyles as s } from '../../components/DoctorWorkspace';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { useApp } from '../../context/AppContext';
import { logoutUser } from '../../services/authService';

export default function DoctorProfileScreen({ navigation }: { navigation: any }) {
  const { currentUser, doctors, doctorAvailability, isCurrentDoctorVerified, setCurrentUser } = useApp();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState('');
  const doctor = doctors.find(item => item.id === currentUser?.uid || (!!currentUser?.name && item.name.toLowerCase() === currentUser.name.toLowerCase()));
  const photo = currentUser?.photoUrl || doctor?.photo;
  const signedIn = currentUser?.role === 'doctor';
  const signOut = async () => { setSigningOut(true); setError(''); try { await logoutUser(); setCurrentUser(null); navigation.replace('AuthStack'); } catch { setError('Could not sign out. Please try again.'); setSigningOut(false); } };
  return <DoctorPage title="Doctor profile">
    <DoctorSection><View style={{ alignItems: 'center' }}>{photo && signedIn ? <Image source={{ uri: photo }} style={{ width: 88, height: 96, borderRadius: 22 }} /> : <View style={{ width: 88, height: 88, borderRadius: 26, backgroundColor: '#E7F3ED', alignItems: 'center', justifyContent: 'center' }}><Icon name="person-outline" size={36} color="#267259" /></View>}<Text style={[s.title, { textAlign: 'center', marginTop: 16 }]}>{signedIn ? currentUser.name : 'Your doctor profile'}</Text><Text style={s.body}>{signedIn ? currentUser.specialty || doctor?.specialty || 'Add your specialty in verification' : 'Manage your clinic in one place'}</Text>{signedIn && <Text style={s.caption}>{currentUser.hospital || doctor?.hospital || 'Clinic details needed'}</Text>}<View style={[s.badge, { marginTop: 14, alignSelf: 'center', backgroundColor: isCurrentDoctorVerified ? '#E7F3ED' : '#FEF3C7' }]}><Text style={[s.badgeText, { color: isCurrentDoctorVerified ? '#267259' : '#B45309' }]}>{isCurrentDoctorVerified ? 'Verified doctor' : signedIn ? 'Verification needed' : 'Doctor sign-in required'}</Text></View></View></DoctorSection>
    <DoctorSection title="Professional details"><Text style={s.caption}>Medical registration</Text><Text style={s.name}>{currentUser?.medicalLicenseNumber || doctor?.medicalLicenseNumber || 'Not supplied'}</Text><Text style={[s.caption, { marginTop: 14 }]}>Medical council</Text><Text style={s.name}>{currentUser?.medicalCouncil || doctor?.medicalCouncil || 'Not supplied'}</Text><Text style={[s.caption, { marginTop: 14 }]}>Email</Text><Text style={s.name}>{currentUser?.email || 'Sign in to view your details'}</Text><Button title={signedIn ? 'Manage verification & credentials' : 'Sign in as a doctor'} variant="secondary" onPress={() => navigation.navigate(signedIn ? 'DoctorVerification' : 'Login')} style={{ marginTop: 20 }} /></DoctorSection>
    <DoctorSection title="Your clinic"><DoctorLink title="Clinic hours & availability" subtitle={doctorAvailability.workingDays.join(' · ')} icon="time-outline" onPress={() => navigation.navigate('DoctorAvailability')} /><DoctorLink title="Patient appointments" subtitle="Requests, upcoming visits and history" icon="calendar-outline" onPress={() => navigation.navigate('DoctorAppointments')} /><DoctorLink title="Clinic earnings" subtitle="Your completed consultation activity" icon="receipt-outline" onPress={() => navigation.navigate('DoctorEarnings')} />{doctor && signedIn && <DoctorLink title="View public doctor profile" subtitle="See your profile as patients see it" icon="person-circle-outline" onPress={() => navigation.navigate('DoctorDetail', { doctorId: doctor.id })} />}</DoctorSection>
    <DoctorSection title="Account"><DoctorLink title="Open patient mode" subtitle="Find care and manage your own visits" icon="swap-horizontal-outline" onPress={() => navigation.replace('PatientTabs')} />{signedIn && <Button title="Sign out" onPress={signOut} loading={signingOut} variant="ghost" style={{ marginTop: 16 }} textStyle={{ color: '#B91C1C' }} />}{!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}</DoctorSection>
  </DoctorPage>;
}
