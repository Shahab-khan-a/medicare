import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { colors, typography } from '../../theme';
import { Icon } from '../../components/Icon';
import { Button } from '../../components/Button';
import { DoctorCard } from '../../components/DoctorCard';
import { categories, hospitals } from '../../data';
import { useApp } from '../../context/AppContext';
import { visitDateTime } from '../../utils/booking';

export default function HomeScreen({ navigation }: { navigation: any }) {
  const { doctors, appointments, currentUser, unreadNotificationsCount } = useApp();
  const [query, setQuery] = useState('');
  const recommended = useMemo(() => [...doctors].sort((a, b) => b.rating - a.rating).slice(0, 3), [doctors]);
  const topHospitals = useMemo(() => [...hospitals].sort((a, b) => b.rating - a.rating).slice(0, 4), []);
  const upcoming = appointments.filter(a => !['completed', 'cancelled', 'no show'].includes(a.status.toLowerCase()))
    .sort((a, b) => visitDateTime(a.date, a.time).getTime() - visitDateTime(b.date, b.time).getTime())[0];
  const search = () => navigation.navigate('DoctorList', { initialQuery: query.trim() });

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.brand}><View style={styles.brandMark}><Icon name="add" size={27} color={colors.white} /></View><Text style={styles.brandName}>MediCare<Text style={{ color: colors.primary }}>.</Text></Text></View>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={'Notifications, ' + unreadNotificationsCount + ' unread'} onPress={() => navigation.navigate('Notifications')} style={styles.iconButton}>
            <Icon name="notifications-outline" size={22} color={colors.textPrimary} />
            {unreadNotificationsCount > 0 && <View style={styles.notificationDot} />}
          </TouchableOpacity>
        </View>
        <Text style={styles.eyebrow}>{currentUser?.name ? 'HELLO, ' + currentUser.name.split(' ')[0].toUpperCase() : 'WELCOME TO MEDICARE'}</Text>
        <Text style={styles.heading}>A little care.{'\n'}A healthier you.</Text>
        <Text style={styles.subtitle}>Find your doctor. Book your visit. Know your turn.</Text>
        <View style={styles.search}>
          <Icon name="search-outline" size={22} color={colors.primary} />
          <TextInput accessibilityLabel="Search doctors, specialties or hospitals" style={styles.searchInput} placeholder="Doctor, specialty or hospital" placeholderTextColor={colors.textSecondary} value={query} onChangeText={setQuery} onSubmitEditing={search} returnKeyType="search" />
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Find doctors" onPress={search} style={styles.searchSubmit}><Icon name="arrow-forward" size={20} color={colors.white} /></TouchableOpacity>
        </View>
        <View style={styles.hero}>
          <View style={styles.heroTop}><View style={styles.heroTag}><Icon name="calendar-outline" size={14} color="#C7F3E6" /><Text style={styles.heroTagText}>CARE, ON YOUR SCHEDULE</Text></View><Icon name="medkit-outline" size={35} color="#82CDB9" /></View>
          <Text style={styles.heroTitle}>Your next visit,{'\n'}a few taps away.</Text>
          <Text style={styles.heroDescription}>Book an in-clinic appointment and get your queue number in one place.</Text>
          <Button title="Find a doctor" variant="secondary" onPress={() => navigation.navigate('DoctorList')} iconName="arrow-forward" iconPosition="right" style={styles.heroButton} textStyle={{ color: '#174D43' }} />
        </View>
        {upcoming && <View style={styles.appointment}>
          <View style={styles.sectionRow}><Text style={styles.eyebrow}>YOUR NEXT VISIT</Text><View style={styles.status}><Text style={styles.statusText}>{upcoming.status}</Text></View></View>
          <Text style={styles.appointmentName}>{upcoming.doctorName}</Text>
          <View style={styles.meta}><Icon name="calendar-outline" size={16} color={colors.primary} /><Text style={styles.body}>{upcoming.date} · {upcoming.time}</Text></View>
          {!!upcoming.tokenNumber && <Text style={styles.body}>Queue number #{upcoming.tokenNumber} · {upcoming.opdRoom || 'Clinic room shown at reception'}</Text>}
          <Button title={upcoming.tokenNumber ? 'Track my turn' : 'View appointment'} variant="secondary" onPress={() => upcoming.tokenNumber ? navigation.navigate('LiveQueueTracker', { appointment: upcoming }) : navigation.navigate('MyAppointments')} style={{ marginTop: 14 }} iconName="arrow-forward" iconPosition="right" />
        </View>}
        <View style={styles.sectionRow}><Text style={styles.sectionTitle}>What care do you need?</Text><TouchableOpacity accessibilityRole="button" onPress={() => navigation.navigate('DoctorList')} style={styles.textButton}><Text style={styles.link}>View all</Text></TouchableOpacity></View>
        <View style={styles.specialties}>
          {categories.slice(0, 6).map((category, i) => <TouchableOpacity key={category.id} accessibilityRole="button" accessibilityLabel={'Find ' + category.name + ' doctors'} onPress={() => navigation.navigate('DoctorList', { specialtyId: category.id })} style={styles.specialty}>
            <View style={[styles.specialtyIcon, { backgroundColor: ['#E7F3ED', '#FBEDEC', '#F2ECFA', '#FFF1DD', '#E7EFF9', '#FBEAF0'][i] }]}><Icon name={category.icon} size={25} color={['#267259', '#BC534F', '#8265A6', '#9C6A25', '#5379A3', '#AC5779'][i]} /></View>
            <Text style={styles.specialtyName}>{['General', 'Heart', 'Dental', 'Skin', 'Eyes', 'Children'][i]}</Text>
          </TouchableOpacity>)}
        </View>
        <View style={styles.quickRow}>
          {[
            { label: 'My bookings', sub: 'Upcoming visits', icon: 'calendar-outline', screen: 'MyAppointments', params: undefined },
            { label: 'Queue tracker', sub: 'Follow live token', icon: 'ticket-outline', screen: 'LiveQueueTracker', params: undefined },
            { label: 'Hospital map', sub: 'Find care near you', icon: 'map-outline', screen: 'DoctorList', params: { initialTab: 'map' } },
          ].map(action => (
            <TouchableOpacity
              key={action.label}
              style={styles.quickCard}
              accessibilityRole="button"
              onPress={() => navigation.navigate(action.screen, action.params)}
            >
              <Icon name={action.icon} size={22} color={colors.primary} />
              <Text style={styles.quickTitle}>{action.label}</Text>
              <Text style={styles.quickSub}>{action.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.sectionRow}><View style={{ flex: 1 }}><Text style={styles.sectionTitle}>Meet your care team</Text><Text style={styles.body}>Doctors with highly rated patient reviews</Text></View><TouchableOpacity accessibilityRole="button" onPress={() => navigation.navigate('DoctorList', { filter: 'Top Rated' })} style={styles.textButton}><Text style={styles.link}>See all</Text></TouchableOpacity></View>
        {recommended.map(doctor => <DoctorCard key={doctor.id} doctor={doctor} onPress={() => navigation.navigate('DoctorDetail', { doctorId: doctor.id })} onBookPress={() => navigation.navigate('BookAppointment', { doctor })} />)}
        
        <View style={styles.sectionRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Hospitals & Medical Centers</Text>
            <Text style={styles.body}>Explore verified hospital locations & live OPD</Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => navigation.navigate('DoctorList', { initialTab: 'map' })}
            style={styles.textButton}
          >
            <Text style={styles.link}>View map</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hospitalsScroll}
        >
          {topHospitals.map(hosp => (
            <TouchableOpacity
              key={hosp.id}
              activeOpacity={0.85}
              style={styles.hospitalCardMini}
              onPress={() => navigation.navigate('HospitalDetail', { hospitalId: hosp.id, hospital: hosp })}
            >
              <Image source={{ uri: hosp.image }} style={styles.hospitalCardImage} contentFit="cover" />
              {hosp.emergencyAvailable && (
                <View style={styles.hospitalEmergencyTag}>
                  <Text style={styles.hospitalEmergencyText}>24/7</Text>
                </View>
              )}
              <View style={styles.hospitalCardBody}>
                <View style={styles.hospitalRatingRow}>
                  <Icon name="star" size={11} color={colors.star} />
                  <Text style={styles.hospitalRatingNum}>{hosp.rating.toFixed(1)}</Text>
                  <Text style={styles.hospitalCityText}>• {hosp.city}</Text>
                </View>
                <Text numberOfLines={1} style={styles.hospitalCardTitle}>
                  {hosp.name}
                </Text>
                <Text numberOfLines={1} style={styles.hospitalCardAddress}>
                  {hosp.address}
                </Text>
                <View style={styles.hospitalCardActions}>
                  <TouchableOpacity
                    style={styles.hospitalMapBtn}
                    onPress={() =>
                      navigation.navigate('DoctorList', {
                        initialTab: 'map',
                        hospitalId: hosp.id,
                        city: hosp.city,
                      })
                    }
                  >
                    <Icon name="navigate-outline" size={12} color={colors.primary} />
                    <Text style={styles.hospitalMapBtnText}>Map</Text>
                  </TouchableOpacity>
                  <View style={styles.hospitalOpdTag}>
                    <Text style={styles.hospitalOpdText}>OPD Active</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.help}><Icon name="information-circle-outline" size={20} color={colors.primary} /><Text style={[styles.body, { flex: 1 }]}>New to queue booking? Choose a doctor and visit time. Your queue number appears after confirmation.</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 22, paddingBottom: 28, width: '100%', maxWidth: 720, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 }, brandMark: { width: 35, height: 35, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  brandName: { ...typography.h2, fontSize: 22 }, iconButton: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }, notificationDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.error, position: 'absolute', top: 10, right: 11 },
  eyebrow: { ...typography.overline, color: colors.primary }, heading: { ...typography.display, fontSize: 34, lineHeight: 41, color: colors.textPrimary, marginTop: 10 }, subtitle: { ...typography.body, color: colors.textSecondary, marginTop: 10, marginBottom: 22 },
  search: { flexDirection: 'row', gap: 10, alignItems: 'center', borderRadius: 17, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, paddingLeft: 16, paddingRight: 6, minHeight: 60, marginBottom: 22 }, searchInput: { ...typography.body, flex: 1, minWidth: 0, color: colors.textPrimary, paddingVertical: 14 }, searchSubmit: { width: 46, height: 46, borderRadius: 13, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  hero: { padding: 23, borderRadius: 24, backgroundColor: '#174D43', marginBottom: 26 }, heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, heroTag: { flexDirection: 'row', gap: 6, alignItems: 'center', flexShrink: 1 }, heroTagText: { ...typography.overline, fontSize: 10, color: '#C7F3E6' }, heroTitle: { ...typography.h1, fontSize: 27, lineHeight: 34, color: colors.white, marginTop: 18 }, heroDescription: { ...typography.body, color: '#D4E8E2', marginTop: 10, marginBottom: 20, maxWidth: 380 }, heroButton: { backgroundColor: '#DBEFE4', shadowOpacity: 0, elevation: 0 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }, sectionTitle: { ...typography.h3, color: colors.textPrimary }, textButton: { minHeight: 44, justifyContent: 'center' }, link: { ...typography.captionBold, color: colors.primary },
  specialties: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 22 }, specialty: { flexGrow: 1, flexBasis: '28%', alignItems: 'center', backgroundColor: colors.white, paddingVertical: 16, borderRadius: 18, borderWidth: 1, borderColor: colors.border }, specialtyIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }, specialtyName: { ...typography.captionBold, color: colors.textPrimary },
  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 26 }, quickCard: { flex: 1, padding: 12, backgroundColor: '#EDF3EF', borderRadius: 16 }, quickTitle: { ...typography.bodySemibold, fontSize: 13, color: colors.textPrimary, marginTop: 8 }, quickSub: { ...typography.caption, fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  appointment: { padding: 20, backgroundColor: colors.white, borderRadius: 20, borderWidth: 1, borderColor: colors.border, marginBottom: 22 }, appointmentName: { ...typography.h3, color: colors.textPrimary, marginBottom: 10 }, status: { backgroundColor: colors.primaryLight, borderRadius: 8, padding: 6 }, statusText: { ...typography.captionBold, color: colors.primary }, meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }, body: { ...typography.caption, color: colors.textSecondary }, help: { flexDirection: 'row', gap: 10, marginTop: 10, padding: 16, borderRadius: 16, backgroundColor: '#EDF3EF' },
  hospitalsScroll: { gap: 14, paddingBottom: 16, paddingTop: 4 },
  hospitalCardMini: {
    width: 230,
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  hospitalCardImage: { width: '100%', height: 105, backgroundColor: colors.surfaceMuted },
  hospitalEmergencyTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hospitalEmergencyText: { ...typography.tiny, fontSize: 9, fontWeight: '800', color: colors.white },
  hospitalCardBody: { padding: 10 },
  hospitalRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 3 },
  hospitalRatingNum: { ...typography.captionBold, fontSize: 11, color: colors.textPrimary },
  hospitalCityText: { ...typography.tiny, fontSize: 11, color: colors.textSecondary },
  hospitalCardTitle: { ...typography.captionBold, fontSize: 13, color: colors.textPrimary, marginBottom: 2 },
  hospitalCardAddress: { ...typography.tiny, fontSize: 11, color: colors.textSecondary, marginBottom: 8 },
  hospitalCardActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hospitalMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  hospitalMapBtnText: { ...typography.captionBold, fontSize: 11, color: colors.primary },
  hospitalOpdTag: { backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  hospitalOpdText: { ...typography.tiny, fontSize: 10, fontWeight: '600', color: '#15803D' },
});
