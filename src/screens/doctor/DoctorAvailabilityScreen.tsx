import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, fonts } from '../../theme';
import Icon from '../../components/Icon';
import Header from '../../components/Header';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import { useApp } from '../../context/AppContext';
import { OPDShiftConfig } from '../../types';

interface DoctorAvailabilityScreenProps {
  navigation: any;
}

const ALL_WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DoctorAvailabilityScreen: React.FC<DoctorAvailabilityScreenProps> = ({
  navigation,
}) => {
  const { doctorAvailability, setDoctorAvailability } = useApp();

  const [workingDays, setWorkingDays] = useState<string[]>(doctorAvailability.workingDays);
  const [daysOff, setDaysOff] = useState<string[]>(doctorAvailability.daysOff);
  const [isEmergencyClosure, setIsEmergencyClosure] = useState(doctorAvailability.isEmergencyClosure);
  const [isTemporaryBreak, setIsTemporaryBreak] = useState(doctorAvailability.isTemporaryBreak);
  const [breakDuration, setBreakDuration] = useState('30');
  const [consultationFee, setConsultationFee] = useState(String(doctorAvailability.consultationFee || 2500));

  // Shifts Config
  const [shifts, setShifts] = useState<OPDShiftConfig[]>(doctorAvailability.shifts);

  const toggleDayWorking = (day: string) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter((d) => d !== day));
      if (!daysOff.includes(day)) {
        setDaysOff([...daysOff, day]);
      }
    } else {
      setWorkingDays([...workingDays, day]);
      setDaysOff(daysOff.filter((d) => d !== day));
    }
  };

  const updateShift = (index: number, updates: Partial<OPDShiftConfig>) => {
    setShifts((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, ...updates } : s))
    );
  };

  const handleSave = () => {
    setDoctorAvailability((prev) => ({
      ...prev,
      shifts,
      workingDays,
      daysOff,
      isEmergencyClosure,
      isTemporaryBreak,
      consultationFee: Number(consultationFee) || 2500,
    }));

    Alert.alert(
      'OPD Configuration Saved! 🩺',
      `Morning & Evening OPD slots updated. Working days: ${workingDays.join(', ')}.\nConsultation Fee: Rs. ${consultationFee}.`
    );
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <Header title="OPD Shifts & Availability" showBack onBack={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Emergency Closure & Temporary Break Card */}
        <View style={styles.specialStatusCard}>
          <Text style={styles.cardHeading}>Quick Schedule Controls</Text>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.switchTitleRow}>
                <Icon name="alert-circle" size={16} color={colors.error} />
                <Text style={styles.switchLabel}>Emergency Clinic Closure</Text>
              </View>
              <Text style={styles.switchDesc}>
                Freezes queue and alerts all booked patients for today.
              </Text>
            </View>
            <Switch
              value={isEmergencyClosure}
              onValueChange={(val) => {
                setIsEmergencyClosure(val);
                if (val) {
                  Alert.alert(
                    'Emergency Closure Activated',
                    'OPD queue paused and cancellation alert broadcast to waiting patients.'
                  );
                }
              }}
              trackColor={{ false: '#CBD5E1', true: colors.error }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.switchTitleRow}>
                <Icon name="cafe-outline" size={16} color="#D97706" />
                <Text style={styles.switchLabel}>Temporary OPD Break</Text>
              </View>
              <Text style={styles.switchDesc}>
                Pause tokens for {breakDuration} mins (e.g. prayer / tea round).
              </Text>
            </View>
            <Switch
              value={isTemporaryBreak}
              onValueChange={setIsTemporaryBreak}
              trackColor={{ false: '#CBD5E1', true: '#F59E0B' }}
            />
          </View>
        </View>

        {/* Working Days & Days Off */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Working Days & Days Off</Text>
          <Text style={styles.cardSubtitle}>
            Tap a day to toggle between Active Working and Day Off.
          </Text>

          <View style={styles.daysRow}>
            {ALL_WEEK_DAYS.map((day) => {
              const isWorking = workingDays.includes(day);
              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayChip, isWorking && styles.dayChipActive]}
                  onPress={() => toggleDayWorking(day)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dayChipText, isWorking && styles.dayChipTextActive]}>
                    {day}
                  </Text>
                  <Text style={[styles.dayStatusSub, isWorking && styles.dayStatusSubActive]}>
                    {isWorking ? 'ON' : 'OFF'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Shift 1: Morning OPD Shift */}
        {shifts.map((shift, idx) => (
          <View key={shift.shiftName} style={styles.card}>
            <View style={styles.shiftHeader}>
              <View style={styles.shiftTitleRow}>
                <Icon
                  name={idx === 0 ? 'sunny-outline' : 'moon-outline'}
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.shiftName}>{shift.shiftName}</Text>
              </View>
              <Switch
                value={shift.isActive}
                onValueChange={(val) => updateShift(idx, { isActive: val })}
                trackColor={{ false: '#CBD5E1', true: colors.primary }}
              />
            </View>

            {shift.isActive ? (
              <View style={styles.shiftForm}>
                <View style={styles.rowTwo}>
                  <View style={{ flex: 1 }}>
                    <InputField
                      label="Start Time"
                      value={shift.startTime}
                      onChangeText={(val) => updateShift(idx, { startTime: val })}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <InputField
                      label="End Time"
                      value={shift.endTime}
                      onChangeText={(val) => updateShift(idx, { endTime: val })}
                    />
                  </View>
                </View>

                <View style={styles.rowTwo}>
                  <View style={{ flex: 1 }}>
                    <InputField
                      label="Max Tokens"
                      value={String(shift.maxTokens)}
                      keyboardType="number-pad"
                      onChangeText={(val) => updateShift(idx, { maxTokens: Number(val) || 0 })}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <InputField
                      label="Avg Duration"
                      value={`${shift.consultationDurationMinutes} min`}
                      onChangeText={(val) =>
                        updateShift(idx, {
                          consultationDurationMinutes: parseInt(val, 10) || 7,
                        })
                      }
                    />
                  </View>
                </View>

                <InputField
                  label="OPD Room Number"
                  value={shift.roomNumber}
                  onChangeText={(val) => updateShift(idx, { roomNumber: val })}
                  leftIcon="location-outline"
                />
              </View>
            ) : (
              <Text style={styles.shiftInactiveNotice}>
                This shift is disabled. Patients will not see slots for {shift.shiftName}.
              </Text>
            )}
          </View>
        ))}

        {/* Consultation Fee */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>OPD Consultation Fee</Text>
          <InputField
            label="In-Clinic Fee (PKR)"
            value={consultationFee}
            onChangeText={setConsultationFee}
            keyboardType="number-pad"
            leftIcon="cash-outline"
          />
        </View>

        {/* Save Changes */}
        <Button
          title="Save Availability & Shifts"
          variant="primary"
          size="lg"
          onPress={handleSave}
          iconName="checkmark-circle-outline"
          style={{ marginTop: 8, marginBottom: 30 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.huge,
  },
  specialStatusCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.md,
  },
  cardHeading: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  switchTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  switchLabel: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  switchDesc: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginVertical: 10,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayChip: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 42,
  },
  dayChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayChipText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.textPrimary,
  },
  dayChipTextActive: {
    color: colors.white,
  },
  dayStatusSub: {
    fontFamily: fonts.medium,
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },
  dayStatusSubActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shiftTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shiftName: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  shiftForm: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 10,
  },
  shiftInactiveNotice: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default DoctorAvailabilityScreen;
