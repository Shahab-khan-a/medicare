import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { colors, spacing, borderRadius, fonts, typography, hitSlop } from '../../theme';
import Icon from '../../components/Icon';
import Button from '../../components/Button';
import { LinearGradient } from '../../components/LinearGradient';
import { useApp } from '../../context/AppContext';

interface ProfileScreenProps {
  navigation: any;
}

type TabMode = 'settings' | 'history' | 'family';

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const {
    familyMembers,
    addFamilyMember,
    medicalReports,
    uploadMedicalReport,
    prescriptions,
    appointments,
    currentUser,
  } = useApp();


  const [activeTab, setActiveTab] = useState<TabMode>('settings');
  const [isAlertsOn, setIsAlertsOn] = useState(true);

  // Real Add Family Member Modal State
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState<'Myself' | 'Father' | 'Mother' | 'Brother' | 'Sister' | 'Spouse' | 'Child' | 'Other'>('Sister');
  const [newMemberAge, setNewMemberAge] = useState('');
  const [newMemberGender, setNewMemberGender] = useState<'Male' | 'Female' | 'Other'>('Female');

  // Real Upload Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [newReportTitle, setNewReportTitle] = useState('');
  const [newReportType, setNewReportType] = useState<'Lab Report' | 'X-Ray / MRI' | 'Previous Prescription' | 'Document'>('Lab Report');
  const [newReportNotes, setNewReportNotes] = useState('');

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            const { logoutUser } = await import('../../services/authService');
            await logoutUser();
          } catch (e) {
            console.warn('Sign out warning:', e);
          }
          navigation.replace('AuthStack');
        },
      },
    ]);
  };

  const handleAddMember = () => {
    setShowMemberModal(true);
  };

  const handleUploadReport = () => {
    setShowReportModal(true);
  };

  const submitAddMember = () => {
    if (!newMemberName.trim()) {
      Alert.alert('Name Required', 'Please enter member full name.');
      return;
    }
    addFamilyMember({
      name: newMemberName.trim(),
      relationship: newMemberRelation,
      age: Number(newMemberAge) || 25,
      gender: newMemberGender,
    });
    setNewMemberName('');
    setNewMemberAge('');
    setShowMemberModal(false);
    Alert.alert('Family Member Added', `${newMemberName} (${newMemberRelation}) added to your family profiles.`);
  };

  const submitUploadReport = () => {
    if (!newReportTitle.trim()) {
      Alert.alert('Title Required', 'Please enter report title.');
      return;
    }
    uploadMedicalReport({
      patientName: currentUser?.name || 'Verified Patient',
      title: newReportTitle.trim(),
      type: newReportType,
      fileFormat: 'PDF',
      fileSize: '1.5 MB',
      doctorNotes: newReportNotes.trim() || undefined,
    });
    setNewReportTitle('');
    setNewReportNotes('');
    setShowReportModal(false);
    Alert.alert('Medical Report Saved', `${newReportTitle} added to your clinical vault.`);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Hero Header */}
      <LinearGradient colors={['#0A1428', '#0F172A']} style={styles.heroHeader}>
        <View style={styles.heroContent}>
          <View style={styles.titleRow}>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => navigation.goBack()}
              hitSlop={hitSlop}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={styles.backBtn}
            >
              <Icon name="chevron-back" size={20} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.pageTitle}>My Health Profile</Text>
          </View>

          {/* Avatar & User Details */}
          <View style={styles.avatarRow}>
            <View style={styles.avatarWrap}>
              <Image
                source={{
                  uri:
                    currentUser?.photoUrl ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
                }}
                style={styles.avatar}
              />
              <View style={styles.cameraBadge}>
                <Icon name="logo-google" size={12} color="#EA4335" />
              </View>
            </View>

            <View style={styles.heroUserInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.heroName}>{currentUser?.name || 'Verified Patient'}</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    paddingHorizontal: 7,
                    paddingVertical: 2,
                    borderRadius: 10,
                    gap: 4,
                  }}
                >
                  <Icon name="shield-checkmark" size={10} color="#38BDF8" />
                  <Text style={{ color: '#E0F2FE', fontSize: 10, fontWeight: '700' }}>Active</Text>
                </View>
              </View>
              <Text style={styles.heroEmail}>{currentUser?.email || 'Verified Account'}</Text>
              <View style={styles.heroPhoneRow}>
                <Icon name="shield-checkmark-outline" size={12} color="#38BDF8" />
                <Text style={styles.heroPhone}>OPD Patient Profile • Live Token Sync</Text>
              </View>
            </View>
          </View>


          {/* Top Segment Controls */}
          <View style={styles.segmentRow}>
            <TouchableOpacity
              style={[styles.segmentBtn, activeTab === 'settings' && styles.segmentBtnActive]}
              onPress={() => setActiveTab('settings')}
            >
              <Text style={[styles.segmentText, activeTab === 'settings' && styles.segmentTextActive]}>
                Account
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segmentBtn, activeTab === 'history' && styles.segmentBtnActive]}
              onPress={() => setActiveTab('history')}
            >
              <Text style={[styles.segmentText, activeTab === 'history' && styles.segmentTextActive]}>
                Medical History
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segmentBtn, activeTab === 'family' && styles.segmentBtnActive]}
              onPress={() => setActiveTab('family')}
            >
              <Text style={[styles.segmentText, activeTab === 'family' && styles.segmentTextActive]}>
                Family & Reports
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Main Body */}
      <ScrollView
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* TAB 1: Account & OPD Settings */}
        {activeTab === 'settings' && (
          <View>
            {/* OPD Alert Toggle Banner */}
            <View style={styles.alertBanner}>
              <View style={styles.alertBannerLeft}>
                <View style={styles.alertIcon}>
                  <Icon name="alarm-outline" size={18} color="#38BDF8" />
                </View>
                <View>
                  <Text style={styles.alertTitle}>Queue Turn Alerts</Text>
                  <Text style={styles.alertSub}>Sound alert when 2 turns remain</Text>
                </View>
              </View>
              <Switch
                value={isAlertsOn}
                onValueChange={setIsAlertsOn}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(56,189,248,0.4)' }}
                thumbColor={isAlertsOn ? '#38BDF8' : '#64748B'}
              />
            </View>

            {/* Quick Links */}
            <View style={styles.menuCard}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('MyAppointments')}
              >
                <View style={[styles.menuIconBox, { backgroundColor: 'rgba(56,189,248,0.15)' }]}>
                  <Icon name="calendar-outline" size={18} color="#38BDF8" />
                </View>
                <Text style={styles.menuText}>My OPD Bookings</Text>
                <Icon name="chevron-forward" size={16} color="#64748B" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('LiveQueueTracker')}
              >
                <View style={[styles.menuIconBox, { backgroundColor: 'rgba(74,222,128,0.15)' }]}>
                  <Icon name="pulse" size={18} color="#4ADE80" />
                </View>
                <Text style={styles.menuText}>Live OPD Queue Tracker</Text>
                <Icon name="chevron-forward" size={16} color="#64748B" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('Prescription')}
              >
                <View style={[styles.menuIconBox, { backgroundColor: 'rgba(192,132,252,0.15)' }]}>
                  <Icon name="document-text-outline" size={18} color="#C084FC" />
                </View>
                <Text style={styles.menuText}>Prescriptions & Records</Text>
                <Icon name="chevron-forward" size={16} color="#64748B" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('Notifications')}
              >
                <View style={[styles.menuIconBox, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
                  <Icon name="notifications-outline" size={18} color="#FBBF24" />
                </View>
                <Text style={styles.menuText}>Notification Center</Text>
                <Icon name="chevron-forward" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Doctor Portal Switch */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('DoctorTabs')}
              style={styles.doctorPortalCard}
            >
              <View style={styles.doctorPortalLeft}>
                <Icon name="medkit" size={20} color="#4ADE80" />
                <View>
                  <Text style={styles.doctorPortalTitle}>Switch to Doctor Portal</Text>
                  <Text style={styles.doctorPortalSub}>OPD Clinical Management & Queue</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={18} color="#4ADE80" />
            </TouchableOpacity>

            {/* Logout */}
            <TouchableOpacity activeOpacity={0.85} onPress={handleLogout} style={styles.logoutBtn}>
              <Icon name="log-out-outline" size={18} color="#EF4444" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 2: Medical History Timeline */}
        {activeTab === 'history' && (
          <View style={styles.timelineContainer}>
            <Text style={styles.timelineHeaderTitle}>Clinical Journey Timeline</Text>
            <Text style={styles.timelineHeaderSub}>
              End-to-end medical records across OPD visits, prescriptions, and follow-ups.
            </Text>

            {appointments.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Icon name="calendar-outline" size={48} color="#64748B" />
                <Text style={{ color: colors.white, fontSize: 16, fontWeight: '700', marginTop: 12 }}>
                  No Clinical Visits Yet
                </Text>
                <Text style={{ color: '#94A3B8', fontSize: 12, textAlign: 'center', marginTop: 6, paddingHorizontal: 20 }}>
                  Your past and completed OPD consultations will appear here in chronological order.
                </Text>
              </View>
            ) : (
              appointments.map((apt) => (
                <View key={apt.id} style={styles.timelineItem}>
                  <View style={styles.timelineDotLine}>
                    <View style={[styles.timelineCircle, { backgroundColor: apt.status === 'Completed' ? '#4ADE80' : '#38BDF8' }]} />
                    <View style={styles.timelineVLine} />
                  </View>
                  <View style={styles.timelineCard}>
                    <Text style={styles.timelineDate}>{apt.date} • {apt.time}</Text>
                    <Text style={styles.timelineDoctor}>{apt.doctorName} ({apt.doctorSpecialty})</Text>
                    <Text style={styles.timelineHospital}>{apt.opdRoom || 'OPD Room'}</Text>

                    <View style={styles.timelineBlock}>
                      <Text style={styles.timelineBlockTitle}>Patient:</Text>
                      <Text style={styles.timelineBlockText}>{apt.patientName} • Token #{apt.tokenNumber}</Text>
                    </View>

                    {apt.symptoms ? (
                      <View style={styles.timelineBlock}>
                        <Text style={styles.timelineBlockTitle}>Symptoms:</Text>
                        <Text style={styles.timelineBlockText}>{apt.symptoms}</Text>
                      </View>
                    ) : null}

                    <View style={styles.timelineFollowUp}>
                      <Icon name="checkmark-done" size={13} color="#4ADE80" />
                      <Text style={[styles.timelineFollowUpText, { color: '#4ADE80' }]}>
                        {apt.status} • Fee: Rs. {apt.fees}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 3: Family Members & Medical Reports */}
        {activeTab === 'family' && (
          <View>
            {/* Family Members Section */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>Registered Family Members</Text>
              <TouchableOpacity onPress={handleAddMember} style={styles.actionLinkBtn}>
                <Text style={styles.actionLinkText}>+ Add Member</Text>
              </TouchableOpacity>
            </View>

            {familyMembers.length === 0 ? (
              <View style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 16 }}>
                <Icon name="people-outline" size={32} color="#64748B" />
                <Text style={{ color: '#94A3B8', fontSize: 13, marginTop: 8, textAlign: 'center' }}>
                  No family members added yet. Add profiles to book OPD tokens for parents or children.
                </Text>
                <TouchableOpacity onPress={handleAddMember} style={{ marginTop: 12, backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 }}>
                  <Text style={{ color: colors.white, fontSize: 12, fontWeight: '700' }}>+ Add Family Profile</Text>
                </TouchableOpacity>
              </View>
            ) : (
              familyMembers.map((member) => (
                <View key={member.id} style={styles.memberCard}>
                  <View style={styles.memberAvatar}>
                    <Icon
                      name={member.relationship === 'Myself' ? 'person' : 'people'}
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      <View style={styles.relationBadge}>
                        <Text style={styles.relationBadgeText}>{member.relationship}</Text>
                      </View>
                    </View>
                    <Text style={styles.memberMeta}>
                      {member.age} yrs • {member.gender}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('DoctorList')}
                    style={styles.bookForBtn}
                  >
                    <Text style={styles.bookForText}>Book OPD</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}

            {/* Medical Reports Section */}
            <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
              <Text style={styles.sectionHeaderTitle}>Medical Reports (PDF / JPG / PNG)</Text>
              <TouchableOpacity onPress={handleUploadReport} style={styles.actionLinkBtn}>
                <Text style={styles.actionLinkText}>+ Upload Report</Text>
              </TouchableOpacity>
            </View>

            {medicalReports.length === 0 ? (
              <View style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 16 }}>
                <Icon name="document-attach-outline" size={32} color="#64748B" />
                <Text style={{ color: '#94A3B8', fontSize: 13, marginTop: 8, textAlign: 'center' }}>
                  No medical documents uploaded yet. Safely store lab reports, ECGs, and past prescriptions here.
                </Text>
                <TouchableOpacity onPress={handleUploadReport} style={{ marginTop: 12, backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 }}>
                  <Text style={{ color: colors.white, fontSize: 12, fontWeight: '700' }}>+ Upload Document</Text>
                </TouchableOpacity>
              </View>
            ) : (
              medicalReports.map((report) => (
                <View key={report.id} style={styles.reportCard}>
                  <View style={styles.reportIconBox}>
                    <Icon
                      name={report.fileFormat === 'PDF' ? 'document-text' : 'image'}
                      size={22}
                      color={colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.reportTitle}>{report.title}</Text>
                    <Text style={styles.reportMeta}>
                      {report.fileFormat} • {report.fileSize} • {report.uploadDate}
                    </Text>
                    {report.doctorNotes ? (
                      <Text style={styles.reportDoctorNote} numberOfLines={1}>
                        Note: {report.doctorNotes}
                      </Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert(
                        'Report Details',
                        `Title: ${report.title}\nFormat: ${report.fileFormat}\nSize: ${report.fileSize}\nNotes: ${report.doctorNotes || 'None'}`
                      )
                    }
                    style={styles.viewReportBtn}
                  >
                    <Icon name="eye-outline" size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        <Text style={styles.versionText}>MediCare OPD System v2.4.0 • Central Clinic Network</Text>
      </ScrollView>

      {/* Add Family Member Modal */}
      <Modal visible={showMemberModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#1E293B', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: colors.white, fontSize: 18, fontWeight: '700' }}>Add Family Member</Text>
              <TouchableOpacity onPress={() => setShowMemberModal(false)}>
                <Icon name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <Text style={{ color: '#94A3B8', fontSize: 12, marginBottom: 4 }}>Full Name</Text>
            <TextInput
              placeholder="e.g. Fatima Khan"
              placeholderTextColor="#64748B"
              value={newMemberName}
              onChangeText={setNewMemberName}
              style={{ backgroundColor: '#0F172A', color: colors.white, borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#334155' }}
            />

            <Text style={{ color: '#94A3B8', fontSize: 12, marginBottom: 4 }}>Relationship</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {(['Father', 'Mother', 'Spouse', 'Child', 'Brother', 'Sister', 'Other'] as const).map((rel) => (
                <TouchableOpacity
                  key={rel}
                  onPress={() => setNewMemberRelation(rel)}
                  style={{
                    backgroundColor: newMemberRelation === rel ? colors.primary : '#0F172A',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#334155',
                  }}
                >
                  <Text style={{ color: colors.white, fontSize: 12, fontWeight: '600' }}>{rel}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#94A3B8', fontSize: 12, marginBottom: 4 }}>Age</Text>
                <TextInput
                  placeholder="e.g. 32"
                  placeholderTextColor="#64748B"
                  keyboardType="numeric"
                  value={newMemberAge}
                  onChangeText={setNewMemberAge}
                  style={{ backgroundColor: '#0F172A', color: colors.white, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#334155' }}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ color: '#94A3B8', fontSize: 12, marginBottom: 4 }}>Gender</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {(['Male', 'Female'] as const).map((g) => (
                    <TouchableOpacity
                      key={g}
                      onPress={() => setNewMemberGender(g)}
                      style={{
                        flex: 1,
                        backgroundColor: newMemberGender === g ? colors.primary : '#0F172A',
                        paddingVertical: 12,
                        borderRadius: 8,
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#334155',
                      }}
                    >
                      <Text style={{ color: colors.white, fontSize: 12, fontWeight: '600' }}>{g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <Button title="Save Family Member" onPress={submitAddMember} />
          </View>
        </View>
      </Modal>

      {/* Upload Medical Report Modal */}
      <Modal visible={showReportModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#1E293B', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: colors.white, fontSize: 18, fontWeight: '700' }}>Upload Medical Report</Text>
              <TouchableOpacity onPress={() => setShowReportModal(false)}>
                <Icon name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <Text style={{ color: '#94A3B8', fontSize: 12, marginBottom: 4 }}>Report Title</Text>
            <TextInput
              placeholder="e.g. CBC Blood Test or Chest X-Ray"
              placeholderTextColor="#64748B"
              value={newReportTitle}
              onChangeText={setNewReportTitle}
              style={{ backgroundColor: '#0F172A', color: colors.white, borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#334155' }}
            />

            <Text style={{ color: '#94A3B8', fontSize: 12, marginBottom: 4 }}>Report Category</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {(['Lab Report', 'X-Ray / MRI', 'Previous Prescription', 'Document'] as const).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setNewReportType(cat)}
                  style={{
                    backgroundColor: newReportType === cat ? colors.primary : '#0F172A',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#334155',
                  }}
                >
                  <Text style={{ color: colors.white, fontSize: 12, fontWeight: '600' }}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ color: '#94A3B8', fontSize: 12, marginBottom: 4 }}>{"Doctor's Notes (Optional)"}</Text>
            <TextInput
              placeholder="e.g. Normal readings, follow up in 2 weeks"
              placeholderTextColor="#64748B"
              value={newReportNotes}
              onChangeText={setNewReportNotes}
              style={{ backgroundColor: '#0F172A', color: colors.white, borderRadius: 8, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#334155' }}
            />

            <Button title="Save Document" onPress={submitUploadReport} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  heroHeader: {
    width: '100%',
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: spacing.lg,
  },
  heroContent: {
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  pageTitle: {
    ...typography.h2,
    color: colors.white,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primaryLight,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.primary,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  heroUserInfo: {
    flex: 1,
  },
  heroName: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.white,
  },
  heroEmail: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 1,
  },
  heroPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  heroPhone: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#38BDF8',
  },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: borderRadius.md,
    padding: 3,
    marginTop: 8,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  segmentBtnActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: '#94A3B8',
  },
  segmentTextActive: {
    fontFamily: fonts.bold,
    color: colors.white,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.huge,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderRadius: borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    marginBottom: spacing.md,
  },
  alertBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alertIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitle: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.white,
  },
  alertSub: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  menuCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  menuIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.white,
  },
  doctorPortalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
    padding: 14,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    marginBottom: spacing.md,
  },
  doctorPortalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  doctorPortalTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: '#4ADE80',
  },
  doctorPortalSub: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: '#86EFAC',
    marginTop: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    marginBottom: 20,
  },
  logoutText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: '#EF4444',
  },
  versionText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  timelineContainer: {
    paddingVertical: 6,
  },
  timelineHeaderTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.white,
  },
  timelineHeaderSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    marginBottom: 16,
  },
  yearBadge: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 10,
  },
  yearBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.white,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineDotLine: {
    alignItems: 'center',
    marginRight: 12,
    width: 20,
  },
  timelineCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#38BDF8',
    marginTop: 4,
  },
  timelineVLine: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(56, 189, 248, 0.3)',
    marginTop: 4,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  timelineDate: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: '#38BDF8',
  },
  timelineDoctor: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.white,
    marginTop: 2,
  },
  timelineHospital: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: '#94A3B8',
  },
  timelineBlock: {
    marginTop: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 8,
    borderRadius: 6,
  },
  timelineBlockTitle: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: '#E2E8F0',
  },
  timelineBlockText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    lineHeight: 16,
  },
  timelineFollowUp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: '#E0F2FE',
    padding: 6,
    borderRadius: 6,
  },
  timelineFollowUpText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: '#0369A1',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeaderTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.white,
  },
  actionLinkBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionLinkText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: '#38BDF8',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 8,
  },
  memberAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberName: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.white,
  },
  relationBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  relationBadgeText: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: '#0369A1',
  },
  memberMeta: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  bookForBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bookForText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.white,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 8,
  },
  reportIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportTitle: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.white,
  },
  reportMeta: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  reportDoctorNote: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: '#38BDF8',
    marginTop: 2,
  },
  viewReportBtn: {
    padding: 8,
  },
});

export default ProfileScreen;
