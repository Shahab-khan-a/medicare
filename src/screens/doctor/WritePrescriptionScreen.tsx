import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, fonts } from '../../theme';
import Icon from '../../components/Icon';
import Header from '../../components/Header';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import { PrescriptionMedicine } from '../../types';
import { useApp } from '../../context/AppContext';

interface WritePrescriptionScreenProps {
  navigation: any;
  route: any;
}

export const WritePrescriptionScreen: React.FC<WritePrescriptionScreenProps> = ({
  navigation,
  route,
}) => {
  const { savePrescription, appointments, currentUser } = useApp();

  const targetPatientName = route?.params?.patientName;
  const linkedAppointment = appointments.find(
    (a) =>
      (targetPatientName && a.patientName.toLowerCase().includes(targetPatientName.toLowerCase())) ||
      a.status === 'In Consultation' ||
      a.status === 'Your Turn'
  );
  const patientName: string = targetPatientName || linkedAppointment?.patientName || 'Consultation Patient';

  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([]);

  // Form states for new medicine
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('500mg');
  const [newMedFrequency, setNewMedFrequency] = useState('2 times daily');
  const [newMedDuration, setNewMedDuration] = useState('5 days');
  const [newMealTiming, setNewMealTiming] = useState<'Before meal' | 'After meal' | 'With meal' | 'Anytime'>('After meal');
  const [newMedInstruction, setNewMedInstruction] = useState('After meals');

  const [advice, setAdvice] = useState(
    'Drink warm water, take complete vocal rest for 48 hours, avoid chilled beverages.'
  );
  const [followUpDate, setFollowUpDate] = useState('05 Oct, 2026');

  const handleAddMedicine = () => {
    if (!newMedName.trim()) {
      Alert.alert('Required', 'Please enter a medicine name.');
      return;
    }

    const newMed: PrescriptionMedicine = {
      id: `med-${Date.now()}`,
      name: newMedName.trim(),
      dosage: newMedDosage.trim() || '1 tablet',
      frequency: newMedFrequency,
      duration: newMedDuration.trim() || '5 days',
      mealTiming: newMealTiming,
      instruction: newMedInstruction.trim() || 'As directed',
    };

    setMedicines([...medicines, newMed]);
    setNewMedName('');
    setNewMedInstruction('');
  };

  const handleRemoveMedicine = (id: string) => {
    setMedicines(medicines.filter((m) => m.id !== id));
  };

  const handleSendPrescription = () => {
    if (!diagnosis.trim()) {
      Alert.alert('Required', 'Please enter a clinical diagnosis.');
      return;
    }
    if (medicines.length === 0) {
      Alert.alert('Required', 'Please add at least one prescribed medicine.');
      return;
    }

    const doctorSignature = currentUser?.medicalLicenseNumber
      ? `${currentUser.name}, Reg #${currentUser.medicalLicenseNumber}`
      : `${currentUser?.name || 'Physician'}, MBBS`;

    savePrescription({
      appointmentId: linkedAppointment?.id,
      patientId: (linkedAppointment as any)?.patientId,
      doctorId: currentUser?.uid || 'doc-1',
      doctorName: currentUser?.name || 'Consultant Physician',
      doctorSpecialty: currentUser?.specialty || 'General Physician',
      doctorHospital: currentUser?.hospital || 'MediCare Central Clinic',
      patientName: patientName,
      patientAge: linkedAppointment?.patientAge || 29,
      patientGender: linkedAppointment?.patientGender || 'Male',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      diagnosis: diagnosis,
      medicines: medicines,
      advice: [advice],
      followUpDate: followUpDate,
      doctorSignature,
    });

    Alert.alert(
      'Digital Prescription Issued 🎉',
      `Prescription for ${patientName} generated with QR authenticity seal and dispatched to patient profile.`,
      [{ text: 'Return to Dashboard', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <Header
        title="Write E-Prescription"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Patient Summary Card */}
        <View style={styles.patientBanner}>
          <View style={styles.patientAvatar}>
            <Icon name="person" size={24} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.patientName}>{patientName}</Text>
            <Text style={styles.patientMeta}>
              Age: {linkedAppointment?.patientAge || 29} • Gender: {linkedAppointment?.patientGender || 'Male'} • OPD Room #204
            </Text>
          </View>
          <View style={styles.rxBadge}>
            <Text style={styles.rxBadgeText}>Rx Active</Text>
          </View>
        </View>

        {/* Diagnosis Field */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionHeading}>Clinical Diagnosis</Text>
          <InputField
            placeholder="e.g. Acute Pharyngitis, Hypertension"
            value={diagnosis}
            onChangeText={setDiagnosis}
            leftIcon="medkit-outline"
          />
        </View>

        {/* Active Prescribed Medicines List */}
        <View style={styles.cardSection}>
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionHeading}>Prescribed Medicines ({medicines.length})</Text>
          </View>

          {medicines.length === 0 ? (
            <View style={{ paddingVertical: 16, alignItems: 'center' }}>
              <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center' }}>
                {"No medicines added yet. Fill in the medicine details below and tap '+ Add to Prescription'."}
              </Text>
            </View>
          ) : (
            medicines.map((med, idx) => (
            <View key={med.id} style={styles.medicineCard}>
              <View style={styles.medHeader}>
                <View style={styles.medIndexBadge}>
                  <Text style={styles.medIndexText}>{idx + 1}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.medTitle}>{med.name}</Text>
                  <Text style={styles.medDetails}>
                    {med.dosage} • {med.frequency} • {med.duration}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveMedicine(med.id)}
                  style={styles.deleteBtn}
                >
                  <Icon name="trash-outline" size={18} color={colors.error} />
                </TouchableOpacity>
              </View>

              <View style={styles.medFooterRow}>
                <View style={styles.mealBadge}>
                  <Icon name="restaurant-outline" size={12} color={colors.accentText} />
                  <Text style={styles.mealBadgeText}>{med.mealTiming || 'After meal'}</Text>
                </View>
                {med.instruction && (
                  <Text style={styles.instructionText}>Note: {med.instruction}</Text>
                )}
              </View>
            </View>
          )))}
        </View>

        {/* Add New Medicine Form */}
        <View style={styles.addMedCard}>
          <Text style={styles.addMedTitle}>+ Add Another Medicine</Text>

          <InputField
            label="Medicine Name"
            placeholder="e.g. Paracetamol, Ciprofloxacin"
            value={newMedName}
            onChangeText={setNewMedName}
            leftIcon="bandage-outline"
          />

          <View style={styles.rowTwo}>
            <View style={{ flex: 1 }}>
              <InputField
                label="Dosage"
                placeholder="e.g. 500mg, 1 tablet"
                value={newMedDosage}
                onChangeText={setNewMedDosage}
              />
            </View>
            <View style={{ flex: 1 }}>
              <InputField
                label="Duration"
                placeholder="e.g. 5 days, 1 week"
                value={newMedDuration}
                onChangeText={setNewMedDuration}
              />
            </View>
          </View>

          <Text style={styles.selectorLabel}>Frequency</Text>
          <View style={styles.pillsRow}>
            {['Once daily', '2 times daily', '3 times daily', 'SOS (As needed)'].map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.freqPill, newMedFrequency === f && styles.freqPillActive]}
                onPress={() => setNewMedFrequency(f)}
              >
                <Text style={[styles.freqPillText, newMedFrequency === f && styles.freqPillTextActive]}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.selectorLabel}>Meal Timing</Text>
          <View style={styles.pillsRow}>
            {(['Before meal', 'After meal', 'With meal', 'Anytime'] as const).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.freqPill, newMealTiming === m && styles.freqPillActive]}
                onPress={() => setNewMealTiming(m)}
              >
                <Text style={[styles.freqPillText, newMealTiming === m && styles.freqPillTextActive]}>
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <InputField
            label="Specific Instruction"
            placeholder="e.g. Take with warm milk at bedtime"
            value={newMedInstruction}
            onChangeText={setNewMedInstruction}
          />

          <Button
            title="Add Medicine to Rx"
            variant="secondary"
            onPress={handleAddMedicine}
            iconName="add-circle-outline"
            style={{ marginTop: 8 }}
          />
        </View>

        {/* Clinical Advice & Follow-Up Date */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionHeading}>Clinical Advice & Patient Instructions</Text>
          <InputField
            placeholder="Dietary precautions, fluid intake, physical rest..."
            value={advice}
            onChangeText={setAdvice}
            multiline
            numberOfLines={3}
          />

          <Text style={[styles.sectionHeading, { marginTop: 12 }]}>Follow-up Date</Text>
          <InputField
            placeholder="e.g. 05 Oct, 2026 or After 1 week"
            value={followUpDate}
            onChangeText={setFollowUpDate}
            leftIcon="calendar-outline"
          />
        </View>

        {/* Issue Button */}
        <Button
          title="Sign & Issue Digital Prescription"
          variant="primary"
          onPress={handleSendPrescription}
          iconName="checkmark-done"
          size="lg"
          style={styles.issueButton}
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
  patientBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.md,
    gap: 12,
  },
  patientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientName: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  patientMeta: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rxBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  rxBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: '#15803D',
  },
  cardSection: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.md,
  },
  sectionHeading: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicineCard: {
    backgroundColor: colors.surfaceMuted,
    padding: 12,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    marginBottom: 8,
  },
  medHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medIndexBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medIndexText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.primary,
  },
  medTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  medDetails: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  deleteBtn: {
    padding: 6,
  },
  medFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  mealBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accentLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  mealBadgeText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.accentText,
  },
  instructionText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
  },
  addMedCard: {
    backgroundColor: '#F8FAFC',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    marginBottom: spacing.md,
  },
  addMedTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.primary,
    marginBottom: 10,
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 10,
  },
  selectorLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.textPrimary,
    marginBottom: 6,
    marginTop: 4,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  freqPill: {
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  freqPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  freqPillText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textSecondary,
  },
  freqPillTextActive: {
    fontFamily: fonts.bold,
    color: colors.white,
  },
  issueButton: {
    marginTop: 8,
    marginBottom: 20,
  },
});

export default WritePrescriptionScreen;
