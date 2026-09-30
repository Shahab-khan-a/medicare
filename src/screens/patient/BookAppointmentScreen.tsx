import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
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
import TimeSlotChip from '../../components/TimeSlotChip';
import { ConsultationType, Doctor, FamilyMember } from '../../types';
import { useApp } from '../../context/AppContext';

interface BookAppointmentScreenProps {
  navigation: any;
  route: any;
}

const getBookingDates = () => {
  const list = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    list.push({
      day: dayNames[d.getDay()],
      date: String(d.getDate()).padStart(2, '0'),
      full: `${d.getDate()} ${monthNames[d.getMonth()]}, ${d.getFullYear()}`,
    });
  }
  return list;
};

const morningSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'];
const eveningSlots = ['02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '05:00 PM'];

export const BookAppointmentScreen: React.FC<BookAppointmentScreenProps> = ({
  navigation,
  route,
}) => {
  const { familyMembers, addFamilyMember, queueStatus, doctors, currentUser } = useApp();
  const datesList = getBookingDates();
  const doctor: Doctor = route?.params?.doctor || doctors[0];

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState(datesList[0]?.full || 'Today');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [consultationType] = useState<ConsultationType>('in_clinic');
  const [selectedShift, setSelectedShift] = useState<'Morning OPD' | 'Evening OPD'>('Morning OPD');

  // Selected Family Member
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(familyMembers[0] || null);

  // Patient Details
  const [patientName, setPatientName] = useState(
    familyMembers[0]?.name || currentUser?.name || ''
  );
  const [patientAge, setPatientAge] = useState(
    familyMembers[0]?.age ? String(familyMembers[0].age) : '28'
  );
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(
    (familyMembers[0]?.gender as any) || 'Male'
  );
  const [symptoms, setSymptoms] = useState('');
  const [hasReportUploaded, setHasReportUploaded] = useState(false);

  const handleSelectMember = (member: FamilyMember) => {
    setSelectedMember(member);
    setPatientName(member.name);
    setPatientAge(String(member.age));
    setGender(member.gender);
  };

  const handleQuickAddMember = () => {
    if (Alert.prompt) {
      Alert.prompt('Add Family Member', 'Enter member name (e.g. Sister - Sara):', (text) => {
        if (text) {
          const newMem = addFamilyMember({
            name: text,
            relationship: 'Sister',
            age: 24,
            gender: 'Female',
          });
          handleSelectMember(newMem);
        }
      });
    } else {
      const newMem = addFamilyMember({
        name: 'Sara Khan',
        relationship: 'Sister',
        age: 24,
        gender: 'Female',
      });
      handleSelectMember(newMem);
      Alert.alert('Family Member Added', 'Added Sister (Sara Khan) to your family profiles.');
    }
  };

  const handleContinue = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Proceed to payment
      const nextTokenNum = (queueStatus.totalTokensToday || 20) + 1;
      navigation.navigate('Payment', {
        doctor,
        bookingDetails: {
          date: selectedDate,
          time: selectedTime,
          type: consultationType,
          patientName,
          patientAge: Number(patientAge) || 29,
          gender,
          familyMemberId: selectedMember?.id,
          familyMemberRelation: selectedMember?.relationship,
          symptoms,
          fees: doctor.fees,
          tokenNumber: selectedShift === 'Morning OPD' ? nextTokenNum : 42,
          currentServingNumber: queueStatus.currentServing,
          shift: selectedShift,
          opdRoom: 'Room #204',
          hasReportUploaded,
        },
      });
    }
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <Header
        title="Book Appointment"
        showBack
        onBack={() => {
          if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
          } else {
            navigation.goBack();
          }
        }}
      />

      {/* Top Doctor Summary Card */}
      <View style={styles.summaryCard}>
        <Image source={{ uri: doctor.photo }} style={styles.doctorThumb} />
        <View style={styles.summaryInfo}>
          <Text numberOfLines={1} style={styles.summaryDoctorName}>
            {doctor.name}
          </Text>
          <Text style={styles.summaryDoctorSpecialty}>{doctor.specialty}</Text>
          <View style={styles.summaryMetaRow}>
            <Icon name="calendar-outline" size={13} color={colors.primary} />
            <Text style={styles.summaryMetaText}>{selectedDate}</Text>
            <View style={styles.dot} />
            <Icon name="time-outline" size={13} color={colors.primary} />
            <Text style={styles.summaryMetaText}>{selectedTime}</Text>
          </View>
        </View>
        <View style={styles.feeBadge}>
          <Text style={styles.feeAmount}>Rs. {doctor.fees}</Text>
        </View>
      </View>

      {/* 4 Step Indicator */}
      <View style={styles.stepIndicator}>
        {[1, 2, 3, 4].map((step) => (
          <React.Fragment key={step}>
            <TouchableOpacity
              onPress={() => setCurrentStep(step)}
              style={[
                styles.stepCircle,
                currentStep >= step && styles.stepCircleActive,
                currentStep === step && styles.stepCircleCurrent,
              ]}
            >
              {currentStep > step ? (
                <Icon name="checkmark" size={14} color={colors.white} />
              ) : (
                <Text
                  style={[
                    styles.stepNumber,
                    currentStep >= step && styles.stepNumberActive,
                  ]}
                >
                  {step}
                </Text>
              )}
            </TouchableOpacity>
            {step < 4 && (
              <View
                style={[
                  styles.stepLine,
                  currentStep > step && styles.stepLineActive,
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Step 1: Select Date */}
        {currentStep === 1 && (
          <View style={styles.stepSection}>
            <Text style={styles.stepTitle}>Step 1: Select Date</Text>
            <Text style={styles.stepSubtitle}>Choose your preferred consultation date</Text>

            <View style={styles.datesGrid}>
              {datesList.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  onPress={() => setSelectedDate(item.full)}
                  style={[
                    styles.dateSelectCard,
                    selectedDate === item.full && styles.dateSelectCardActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.dateDayText,
                      selectedDate === item.full && styles.dateDayTextActive,
                    ]}
                  >
                    {item.day}
                  </Text>
                  <Text
                    style={[
                      styles.dateNumText,
                      selectedDate === item.full && styles.dateNumTextActive,
                    ]}
                  >
                    {item.date}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 2: Select Time */}
        {currentStep === 2 && (
          <View style={styles.stepSection}>
            <Text style={styles.stepTitle}>Step 2: Select Time Slot</Text>
            <Text style={styles.stepSubtitle}>Choose an open slot on {selectedDate}</Text>

            <Text style={styles.slotGroupTitle}>Morning Slots</Text>
            <View style={styles.slotGrid}>
              {morningSlots.map((time) => (
                <TimeSlotChip
                  key={time}
                  time={time}
                  isAvailable={time !== '11:00 AM'}
                  isSelected={selectedTime === time}
                  onPress={() => setSelectedTime(time)}
                />
              ))}
            </View>

            <Text style={styles.slotGroupTitle}>Afternoon & Evening Slots</Text>
            <View style={styles.slotGrid}>
              {eveningSlots.map((time) => (
                <TimeSlotChip
                  key={time}
                  time={time}
                  isAvailable={time !== '03:00 PM'}
                  isSelected={selectedTime === time}
                  onPress={() => setSelectedTime(time)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Step 3: Physical OPD Shift & Token */}
        {currentStep === 3 && (
          <View style={styles.stepSection}>
            <Text style={styles.stepTitle}>Step 3: Physical Clinic OPD Shift</Text>
            <Text style={styles.stepSubtitle}>
              Select your shift for in-person consultation at {doctor.hospital}
            </Text>

            {/* In-Clinic Physical Guarantee Banner */}
            <View style={styles.physicalNoticeBox}>
              <View style={styles.physicalNoticeIcon}>
                <Icon name="business" size={22} color={colors.primary} />
              </View>
              <View style={styles.physicalNoticeTextCol}>
                <Text style={styles.physicalNoticeTitle}>100% In-Clinic Physical Visit</Text>
                <Text style={styles.physicalNoticeDesc}>
                  All appointments are in-person at {doctor.hospital}, Room #204. Your digital OPD token gives you direct access without standing in line.
                </Text>
              </View>
            </View>

            {/* Shift 1: Morning OPD */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setSelectedShift('Morning OPD')}
              style={[
                styles.typeCard,
                selectedShift === 'Morning OPD' && styles.typeCardActive,
              ]}
            >
              <View
                style={[
                  styles.typeIconBox,
                  selectedShift === 'Morning OPD' && styles.typeIconBoxActive,
                ]}
              >
                <Icon
                  name="sunny-outline"
                  size={26}
                  color={selectedShift === 'Morning OPD' ? colors.white : colors.primary}
                />
              </View>
              <View style={styles.typeDetails}>
                <View style={styles.shiftHeaderRow}>
                  <Text style={styles.typeTitle}>Morning OPD Shift</Text>
                  <View style={styles.tokenPill}>
                    <Text style={styles.tokenPillText}>Next: #15</Text>
                  </View>
                </View>
                <Text style={styles.typeDesc}>
                  09:00 AM – 01:00 PM • Room #204 • Physical In-Clinic
                </Text>
              </View>
              {selectedShift === 'Morning OPD' && (
                <Icon name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>

            {/* Shift 2: Evening OPD */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setSelectedShift('Evening OPD')}
              style={[
                styles.typeCard,
                selectedShift === 'Evening OPD' && styles.typeCardActive,
              ]}
            >
              <View
                style={[
                  styles.typeIconBox,
                  selectedShift === 'Evening OPD' && styles.typeIconBoxActive,
                ]}
              >
                <Icon
                  name="moon-outline"
                  size={26}
                  color={selectedShift === 'Evening OPD' ? colors.white : colors.primary}
                />
              </View>
              <View style={styles.typeDetails}>
                <View style={styles.shiftHeaderRow}>
                  <Text style={styles.typeTitle}>Evening OPD Shift</Text>
                  <View style={styles.tokenPill}>
                    <Text style={styles.tokenPillText}>Next: #42</Text>
                  </View>
                </View>
                <Text style={styles.typeDesc}>
                  04:00 PM – 08:00 PM • Room #204 • Physical In-Clinic
                </Text>
              </View>
              {selectedShift === 'Evening OPD' && (
                <Icon name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Step 4: Patient Details */}
        {currentStep === 4 && (
          <View style={styles.stepSection}>
            <Text style={styles.stepTitle}>Step 4: Patient Details</Text>
            <Text style={styles.stepSubtitle}>Provide medical details for doctor preparation</Text>

            {/* Book For Family Member Selector */}
            <View style={styles.familySelectBox}>
              <View style={styles.familyHeaderRow}>
                <Text style={styles.familyHeaderTitle}>Book Appointment For:</Text>
                <TouchableOpacity onPress={handleQuickAddMember} style={styles.addMemberBtn}>
                  <Text style={styles.addMemberBtnText}>+ Add Member</Text>
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.familyChipsRow}>
                {familyMembers.map((member) => {
                  const isChosen = selectedMember?.id === member.id;
                  return (
                    <TouchableOpacity
                      key={member.id}
                      style={[styles.memberChip, isChosen && styles.memberChipActive]}
                      onPress={() => handleSelectMember(member)}
                      activeOpacity={0.7}
                    >
                      <Icon
                        name={member.relationship === 'Myself' ? 'person' : 'people'}
                        size={14}
                        color={isChosen ? colors.white : colors.primary}
                      />
                      <Text style={[styles.memberChipText, isChosen && styles.memberChipTextActive]}>
                        {member.name} ({member.relationship})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <InputField
              label="Patient Full Name"
              placeholder="Enter name"
              value={patientName}
              onChangeText={setPatientName}
              leftIcon="person-outline"
            />


            <InputField
              label="Patient Age"
              placeholder="e.g. 29"
              value={patientAge}
              onChangeText={setPatientAge}
              keyboardType="number-pad"
              leftIcon="calendar-outline"
            />

            <Text style={styles.fieldLabel}>Gender</Text>
            <View style={styles.genderRow}>
              {(['Male', 'Female', 'Other'] as const).map((g) => (
                <TouchableOpacity
                  key={g}
                  activeOpacity={0.8}
                  onPress={() => setGender(g)}
                  style={[
                    styles.genderPill,
                    gender === g && styles.genderPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.genderText,
                      gender === g && styles.genderTextActive,
                    ]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <InputField
              label="Symptoms / Reason for Visit"
              placeholder="Briefly describe what issues you are experiencing..."
              value={symptoms}
              onChangeText={setSymptoms}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setHasReportUploaded(!hasReportUploaded);
                Alert.alert(
                  hasReportUploaded ? 'Report Removed' : 'Report Attached',
                  hasReportUploaded
                    ? 'Lab report detached.'
                    : 'CBC_Blood_Report.pdf attached successfully!'
                );
              }}
              style={[
                styles.uploadButton,
                hasReportUploaded && styles.uploadButtonSuccess,
              ]}
            >
              <Icon
                name={hasReportUploaded ? 'checkmark-circle' : 'cloud-upload-outline'}
                size={22}
                color={hasReportUploaded ? colors.success : colors.primary}
              />
              <Text
                style={[
                  styles.uploadText,
                  hasReportUploaded && styles.uploadTextSuccess,
                ]}
              >
                {hasReportUploaded
                  ? 'CBC_Blood_Report.pdf (Attached)'
                  : 'Upload Medical Reports (Optional)'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Continue Button */}
      <View style={styles.bottomBar}>
        <Button
          title={currentStep === 4 ? 'Proceed to Payment' : `Continue to Step ${currentStep + 1}`}
          onPress={handleContinue}
          size="lg"
          iconName="arrow-forward"
          iconPosition="right"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  doctorThumb: {
    width: 54,
    height: 54,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
  },
  summaryInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  summaryDoctorName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  summaryDoctorSpecialty: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 1,
  },
  summaryMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  summaryMetaText: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textMuted,
    marginHorizontal: 2,
  },
  feeBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  feeAmount: {
    ...typography.captionBold,
    color: colors.primaryDark,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
  },
  stepCircleCurrent: {
    borderWidth: 2,
    borderColor: colors.primaryDark,
  },
  stepNumber: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  stepNumberActive: {
    color: colors.white,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: colors.primary,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  stepSection: {
    marginTop: spacing.xs,
  },
  stepTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  stepSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.lg,
  },
  datesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dateSelectCard: {
    width: '30%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  dateSelectCardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dateDayText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  dateDayTextActive: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  dateNumText: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: 4,
  },
  dateNumTextActive: {
    color: colors.white,
  },
  slotGroupTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  typeCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  typeIconBox: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIconBoxActive: {
    backgroundColor: colors.primary,
  },
  typeDetails: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  typeTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  typeDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  fieldLabel: {
    ...typography.captionBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs + 2,
  },
  genderRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  genderPill: {
    flex: 1,
    backgroundColor: colors.card,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  genderPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  genderTextActive: {
    color: colors.white,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  uploadButtonSuccess: {
    borderColor: colors.success,
    backgroundColor: colors.successLight,
  },
  uploadText: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
  uploadTextSuccess: {
    color: colors.success,
    fontWeight: '700',
  },
  physicalNoticeBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  physicalNoticeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  physicalNoticeTextCol: {
    flex: 1,
  },
  physicalNoticeTitle: {
    ...typography.bodyBold,
    color: colors.primary,
    fontSize: 14,
  },
  physicalNoticeDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  shiftHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  tokenPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  tokenPillText: {
    ...typography.captionBold,
    color: colors.white,
    fontSize: 11,
  },
  familySelectBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.md,
  },
  familyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  familyHeaderTitle: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  addMemberBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  addMemberBtnText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.primary,
  },
  familyChipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.border,
  },
  memberChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  memberChipText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textPrimary,
  },
  memberChipTextActive: {
    fontFamily: fonts.bold,
    color: colors.white,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});


export default BookAppointmentScreen;
