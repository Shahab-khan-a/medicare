import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, fonts } from '../../theme';
import Header from '../../components/Header';
import AppointmentCard from '../../components/AppointmentCard';
import EmptyState from '../../components/EmptyState';
import { useApp } from '../../context/AppContext';

interface DoctorAppointmentsScreenProps {
  navigation: any;
  route: any;
}

type TabType = 'pending' | 'upcoming' | 'completed';

export const DoctorAppointmentsScreen: React.FC<DoctorAppointmentsScreenProps> = ({
  navigation,
  route,
}) => {
  const { appointments } = useApp();
  const initialTab = route?.params?.initialTab || 'upcoming';
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const filtered = appointments.filter((a) => {
    const s = (a.status || '').toLowerCase();
    if (activeTab === 'pending') return s === 'pending';
    if (activeTab === 'upcoming') {
      return (
        s === 'upcoming' ||
        s === 'confirmed' ||
        s === 'waiting' ||
        s === 'in queue' ||
        s === 'inqueue' ||
        s === 'your turn' ||
        s === 'in consultation'
      );
    }
    if (activeTab === 'completed') return s === 'completed';
    return true;
  });

  const handleAccept = (aptId: string) => {
    Alert.alert('Approved', 'Appointment slot confirmed and token assigned.');
  };

  const handleReject = (aptId: string) => {
    Alert.alert('Declined', 'Appointment request was rejected and slot released.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <Header title="Patient Appointments" showBack onBack={() => navigation.goBack()} />

      <View style={styles.tabContainer}>
        {(['pending', 'upcoming', 'completed'] as const).map((tab) => {
          const count = appointments.filter((a) => {
            const s = (a.status || '').toLowerCase();
            if (tab === 'pending') return s === 'pending';
            if (tab === 'upcoming') {
              return (
                s === 'upcoming' ||
                s === 'confirmed' ||
                s === 'waiting' ||
                s === 'in queue' ||
                s === 'inqueue' ||
                s === 'your turn' ||
                s === 'in consultation'
              );
            }
            if (tab === 'completed') return s === 'completed';
            return false;
          }).length;
          const label = tab === 'upcoming' ? 'Active OPD' : tab.charAt(0).toUpperCase() + tab.slice(1);

          return (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.7}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {label} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title={`No ${activeTab} appointments`}
            subtitle={`There are no ${activeTab} patient bookings for your OPD schedule right now.`}
          />
        }
        renderItem={({ item }) => (
          <AppointmentCard
            appointment={item}
            isDoctorView
            onAccept={() => handleAccept(item.id)}
            onReject={() => handleReject(item.id)}
            onViewPrescription={() =>
              navigation.navigate('WritePrescription', { patientName: item.patientName })
            }
            onJoinCall={() => navigation.navigate('DoctorDashboard')}
            onPress={() => {
              Alert.alert(
                'Patient OPD Details',
                `Patient: ${item.patientName}\nToken: #${item.tokenNumber || 15}\nSymptoms: ${item.symptoms || 'General Checkup'}\nCheck-in: ${item.checkInStatus || 'Waiting'}`
              );
            }}
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  tabButtonActive: {
    backgroundColor: colors.primaryLight,
  },
  tabText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  tabTextActive: {
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
  },
});

export default DoctorAppointmentsScreen;
