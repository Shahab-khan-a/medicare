import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Icon from '../../components/Icon';
import Button from '../../components/Button';
import Header from '../../components/Header';
import { Doctor } from '../../types';
import { useApp } from '../../context/AppContext';

interface WaitingRoomScreenProps {
  navigation: any;
  route: any;
}

export const WaitingRoomScreen: React.FC<WaitingRoomScreenProps> = ({
  navigation,
  route,
}) => {
  const { doctors } = useApp();
  const doctor: Doctor = route?.params?.doctor || doctors[0];
  const [secondsRemaining, setSecondsRemaining] = useState(25);
  const [isReadyToEnter, setIsReadyToEnter] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsReadyToEnter(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `0${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const handleEnterRoom = () => {
    navigation.replace('VideoCall', { doctor });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <Header
        title="Clinic OPD Waiting Lounge"
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {/* Doctor Summary Card */}
        <View style={styles.doctorCard}>
          <Image source={{ uri: doctor.photo }} style={styles.doctorPhoto} />
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
            <Text style={styles.hospitalText}>{doctor.hospital} • Room #204</Text>
          </View>
        </View>

        {/* Live Token Status Section */}
        <View style={styles.tokenStatusCard}>
          <View style={styles.tokenHeaderRow}>
            <View>
              <Text style={styles.tokenLabel}>YOUR IN-CLINIC TOKEN</Text>
              <Text style={styles.tokenNumber}>#14</Text>
            </View>
            <View style={styles.roomBadge}>
              <Icon name="business" size={16} color={colors.primary} />
              <Text style={styles.roomBadgeText}>Room #204</Text>
            </View>
          </View>

          <View style={styles.counterDivider} />

          <View style={styles.counterRow}>
            <View style={styles.counterCol}>
              <Text style={styles.counterSmallLabel}>Currently Inside</Text>
              <Text style={styles.counterValueGreen}>Token #8</Text>
            </View>
            <View style={styles.counterCol}>
              <Text style={styles.counterSmallLabel}>Patients Ahead</Text>
              <Text style={styles.counterValueOrange}>5 Ahead</Text>
            </View>
            <View style={styles.counterCol}>
              <Text style={styles.counterSmallLabel}>Estimated Turn</Text>
              <Text style={styles.counterValue}>
                {isReadyToEnter ? 'Now' : `~${formatTimer(secondsRemaining)}`}
              </Text>
            </View>
          </View>
        </View>

        {/* In-Clinic Instructions Card */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeaderRow}>
            <Icon name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.tipsHeaderTitle}>Physical Clinic OPD Guidelines</Text>
          </View>

          <View style={styles.tipItem}>
            <Icon name="location-outline" size={18} color={colors.primary} />
            <Text style={styles.tipText}>
              Please remain seated in the 2nd-floor OPD waiting lounge near Room #204.
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Icon name="volume-high-outline" size={18} color={colors.primary} />
            <Text style={styles.tipText}>
              Watch the electronic display board. A chime will ring when Token #14 is called.
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Icon name="document-text-outline" size={18} color={colors.primary} />
            <Text style={styles.tipText}>
              Keep your previous physical prescriptions and lab test files ready for the doctor.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title={isReadyToEnter ? 'Proceed into Room #204' : 'Track Turn in Live Queue'}
            onPress={isReadyToEnter ? handleEnterRoom : () => navigation.navigate('LiveQueueTracker')}
            size="lg"
            iconName={isReadyToEnter ? 'walk-outline' : 'speedometer-outline'}
            style={styles.enterCallBtn}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>Back to Appointments</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    justifyContent: 'space-between',
    paddingBottom: spacing.xl,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  doctorPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.backgroundSecondary,
  },
  doctorInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  doctorName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  doctorSpecialty: {
    ...typography.captionBold,
    color: colors.primary,
    marginTop: 2,
  },
  hospitalText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tokenStatusCard: {
    backgroundColor: '#0F172A',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginVertical: spacing.sm,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  tokenHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tokenLabel: {
    ...typography.captionBold,
    color: '#94A3B8',
    letterSpacing: 1,
    fontSize: 11,
  },
  tokenNumber: {
    fontSize: 38,
    fontWeight: '900',
    color: '#38BDF8',
    marginTop: 2,
  },
  roomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    gap: 6,
  },
  roomBadgeText: {
    ...typography.captionBold,
    color: '#38BDF8',
    fontSize: 13,
  },
  counterDivider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: spacing.md,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  counterCol: {
    alignItems: 'center',
  },
  counterSmallLabel: {
    ...typography.caption,
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: 4,
  },
  counterValueGreen: {
    fontSize: 17,
    fontWeight: '800',
    color: '#4ADE80',
  },
  counterValueOrange: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FBBF24',
  },
  counterValue: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.white,
  },
  tipsCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  tipsHeaderTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.xs + 2,
  },
  tipText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  enterCallBtn: {
    width: '100%',
  },
  cancelButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  cancelText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
});

export default WaitingRoomScreen;
