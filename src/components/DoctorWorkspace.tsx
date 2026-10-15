import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../theme';
import { Header } from './Header';
import { Icon } from './Icon';

export function DoctorPage({ title, children, back, right, scroll = true }: { title: string; children: React.ReactNode; back?: () => void; right?: React.ReactNode; scroll?: boolean }) {
  return <SafeAreaView style={doctorStyles.screen} edges={back ? ['top', 'bottom', 'left', 'right'] : ['top', 'left', 'right']}>
    <StatusBar barStyle="dark-content" /><Header title={title} showBack={!!back} onBack={back} rightComponent={right} />
    {scroll ? <ScrollView contentContainerStyle={doctorStyles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">{children}</ScrollView> : children}
  </SafeAreaView>;
}
export function DoctorSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return <View style={doctorStyles.card}>{title && <Text style={doctorStyles.sectionTitle}>{title}</Text>}{children}</View>;
}
export function DoctorMetric({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return <View style={doctorStyles.metric}><Icon name={icon} size={22} color={colors.primary} /><Text style={doctorStyles.metricValue}>{value}</Text><Text style={doctorStyles.caption}>{label}</Text></View>;
}
export function DoctorLink({ title, subtitle, icon, onPress }: { title: string; subtitle?: string; icon: string; onPress: () => void }) {
  return <TouchableOpacity accessibilityRole="button" onPress={onPress} style={doctorStyles.linkRow}><View style={doctorStyles.linkIcon}><Icon name={icon} size={22} color={colors.primary} /></View><View style={{ flex: 1 }}><Text style={doctorStyles.name}>{title}</Text>{!!subtitle && <Text style={doctorStyles.caption}>{subtitle}</Text>}</View><Icon name="chevron-forward" size={18} color={colors.textSecondary} /></TouchableOpacity>;
}
export function DoctorSheet({ title, visible, close, children }: { title: string; visible: boolean; close: () => void; children: React.ReactNode }) {
  return <Modal visible={visible} animationType="slide" transparent onRequestClose={close}><View style={doctorStyles.backdrop}><SafeAreaView style={doctorStyles.sheet} edges={['bottom']}><View style={doctorStyles.sectionRow}><Text style={doctorStyles.title}>{title}</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel="Close dialog" onPress={close} style={doctorStyles.iconButton}><Icon name="close" size={23} color={colors.textPrimary} /></TouchableOpacity></View><ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">{children}</ScrollView></SafeAreaView></View></Modal>;
}
export const doctorStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background }, content: { padding: 22, paddingBottom: 28, width: '100%', maxWidth: 720, alignSelf: 'center' },
  title: { ...typography.h1, color: colors.textPrimary }, heading: { ...typography.display, color: colors.textPrimary }, name: { ...typography.bodySemibold, color: colors.textPrimary }, body: { ...typography.body, color: colors.textSecondary, marginTop: 7 }, caption: { ...typography.caption, color: colors.textSecondary, marginTop: 5, lineHeight: 19 }, eyebrow: { ...typography.overline, color: colors.primary }, sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: 14 },
  card: { padding: 20, backgroundColor: colors.white, borderRadius: 20, borderWidth: 1, borderColor: colors.border, marginBottom: 16 }, sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14 }, row: { flexDirection: 'row', alignItems: 'center', gap: 10 }, metricRow: { flexDirection: 'row', gap: 10, marginBottom: 22 }, metric: { flex: 1, backgroundColor: '#EDF3EF', padding: 15, borderRadius: 17 }, metricValue: { ...typography.h2, color: colors.textPrimary, marginTop: 10 },
  hero: { backgroundColor: '#174D43', padding: 22, borderRadius: 24, marginBottom: 22 }, heroTitle: { ...typography.h1, color: colors.white, marginTop: 10 }, heroText: { ...typography.caption, color: '#D4E8E2', marginTop: 8, lineHeight: 20 }, heroEyebrow: { ...typography.overline, color: '#C7F3E6' }, heroNumber: { ...typography.display, fontSize: 48, lineHeight: 60, color: colors.white, marginVertical: 8 },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.primaryLight }, linkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }, linkIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9, backgroundColor: colors.primaryLight, alignSelf: 'flex-start' }, badgeText: { ...typography.captionBold, color: colors.primary }, notice: { padding: 16, borderRadius: 16, backgroundColor: colors.warningLight, marginBottom: 18 }, noticeText: { ...typography.caption, color: colors.warningText, lineHeight: 20, marginTop: 5 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginVertical: 12 }, chip: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.white }, chipSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight }, divider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay }, sheet: { padding: 22, backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' }, error: { ...typography.caption, color: colors.error, marginTop: 8 }, empty: { alignItems: 'center', paddingVertical: 25 },
});
