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
import { colors, typography, spacing, borderRadius } from '../../theme';
import Icon from '../../components/Icon';
import Header from '../../components/Header';
import Button from '../../components/Button';
import { LinearGradient } from '../../components/LinearGradient';
import { useApp } from '../../context/AppContext';

interface DoctorEarningsScreenProps {
  navigation: any;
}

type FilterPeriod = 'Today' | 'Week' | 'Month' | 'Year';

interface Transaction {
  id: string;
  patientName: string;
  date: string;
  type: 'In-Clinic OPD' | 'Follow-up OPD';
  amount: number;
  paymentMethod: string;
}

const chartData = [
  { day: 'Mon', height: '65%', amount: '12.5k' },
  { day: 'Tue', height: '85%', amount: '16.0k' },
  { day: 'Wed', height: '40%', amount: '8.0k' },
  { day: 'Thu', height: '95%', amount: '18.5k' },
  { day: 'Fri', height: '70%', amount: '14.0k' },
  { day: 'Sat', height: '50%', amount: '9.5k' },
  { day: 'Sun', height: '30%', amount: '5.0k' },
];

export const DoctorEarningsScreen: React.FC<DoctorEarningsScreenProps> = ({
  navigation,
}) => {
  const { doctorEarnings, appointments, currentUser } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState<FilterPeriod>('Month');

  const transactions: Transaction[] = appointments
    .filter(
      (a) =>
        a.doctorId === currentUser?.uid ||
        (!!currentUser?.name && a.doctorName.toLowerCase().includes(currentUser.name.toLowerCase()))
    )
    .map((a) => ({
      id: `tx-${a.id}`,
      patientName: a.patientName,
      date: `${a.date}, ${a.time}`,
      type: 'In-Clinic OPD',
      amount: a.fees || 2500,
      paymentMethod: a.status === 'Completed' ? 'Direct Payout' : 'OPD Token Fee',
    }));

  const getAmountForPeriod = () => {
    switch (selectedPeriod) {
      case 'Today':
        return `Rs. ${doctorEarnings.today.toLocaleString()}`;
      case 'Week':
        return `Rs. ${doctorEarnings.weekly.toLocaleString()}`;
      case 'Month':
        return `Rs. ${doctorEarnings.monthly.toLocaleString()}`;
      case 'Year':
        return `Rs. ${(doctorEarnings.monthly * 12).toLocaleString()}`;
    }
  };

  const handleWithdraw = () => {
    Alert.alert(
      'Withdraw Funds',
      `Payout of available balance (Rs. ${doctorEarnings.withdrawable.toLocaleString()}) requested to verified bank account (Meezan Bank - ****4821). Processed within 24 business hours.`
    );
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <Header title="Earnings & Finance" showBack onBack={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Total Earnings Gradient Card */}
        <LinearGradient
          colors={['#2A9DF4', '#1B7FD1', '#00C9A7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCard}
        >
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceTitle}>Total Revenue ({selectedPeriod})</Text>
            <View style={styles.payoutBadge}>
              <Text style={styles.payoutBadgeText}>Ready to Withdraw</Text>
            </View>
          </View>

          <Text style={styles.balanceAmount}>{getAmountForPeriod()}</Text>

          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.cardFooterLabel}>Completed Consultations</Text>
              <Text style={styles.cardFooterValue}>148 visits</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleWithdraw}
              style={styles.withdrawBtn}
            >
              <Icon name="arrow-up-circle" size={18} color={colors.primaryDark} />
              <Text style={styles.withdrawText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Period Filter Tabs */}
        <View style={styles.periodTabs}>
          {(['Today', 'Week', 'Month', 'Year'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              activeOpacity={0.8}
              onPress={() => setSelectedPeriod(period)}
              style={[
                styles.periodTab,
                selectedPeriod === period && styles.periodTabActive,
              ]}
            >
              <Text
                style={[
                  styles.periodText,
                  selectedPeriod === period && styles.periodTextActive,
                ]}
              >
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bar Chart Section */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Earnings Trend</Text>
            <Text style={styles.chartSub}>Average: Rs. 12,000 / day</Text>
          </View>

          <View style={styles.barsContainer}>
            {chartData.map((bar, idx) => (
              <View key={idx} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { height: bar.height as any }]} />
                </View>
                <Text style={styles.barDay}>{bar.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Transactions List */}
        <Text style={styles.sectionHeading}>Recent Payout Transactions</Text>

        {transactions.length === 0 ? (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Icon name="receipt-outline" size={40} color={colors.textMuted} />
            <Text style={{ ...typography.body, color: colors.textSecondary, marginTop: 8 }}>
              No transactions recorded yet. Completed appointments will appear here.
            </Text>
          </View>
        ) : (
          transactions.map((tx) => (
            <View key={tx.id} style={styles.txCard}>
              <View style={styles.txIconBox}>
                <Icon
                  name="business"
                  size={20}
                  color={colors.primary}
                />
              </View>

              <View style={styles.txInfo}>
                <Text style={styles.txPatientName}>{tx.patientName}</Text>
                <Text style={styles.txDate}>
                  {tx.date} • {tx.paymentMethod}
                </Text>
              </View>

              <View style={styles.txAmountCol}>
                <Text style={styles.txAmount}>+Rs. {tx.amount}</Text>
                <Text style={styles.txSuccessText}>Credited</Text>
              </View>
            </View>
          ))
        )}
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
  gradientCard: {
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: spacing.lg,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceTitle: {
    ...typography.captionBold,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  payoutBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: borderRadius.round,
  },
  payoutBadgeText: {
    ...typography.tiny,
    color: colors.white,
    fontWeight: '700',
  },
  balanceAmount: {
    ...typography.h1,
    fontSize: 34,
    fontWeight: '800',
    color: colors.white,
    marginVertical: spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
  },
  cardFooterLabel: {
    ...typography.tiny,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  cardFooterValue: {
    ...typography.bodyBold,
    color: colors.white,
  },
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: borderRadius.round,
    gap: 4,
  },
  withdrawText: {
    ...typography.captionBold,
    color: colors.primaryDark,
  },
  periodTabs: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  periodTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  periodTabActive: {
    backgroundColor: colors.primary,
  },
  periodText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  periodTextActive: {
    color: colors.white,
  },
  chartCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  chartTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  chartSub: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: spacing.sm,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    width: 22,
    height: 110,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  barDay: {
    ...typography.tiny,
    color: colors.textSecondary,
    marginTop: 6,
  },
  sectionHeading: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  txIconBox: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  txPatientName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  txDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  txAmountCol: {
    alignItems: 'flex-end',
  },
  txAmount: {
    ...typography.bodyBold,
    color: colors.success,
  },
  txSuccessText: {
    ...typography.tiny,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default DoctorEarningsScreen;
