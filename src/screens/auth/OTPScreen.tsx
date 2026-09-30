import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Icon from '../../components/Icon';
import Button from '../../components/Button';

interface OTPScreenProps {
  navigation: any;
}

export const OTPScreen: React.FC<OTPScreenProps> = ({ navigation }) => {
  const [otp, setOtp] = useState(['5', '8', '2', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text.length > 0 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    navigation.replace('PatientTabs');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.container}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.iconCircle}>
          <Icon name="shield-checkmark-outline" size={44} color={colors.primary} />
        </View>

        <Text style={styles.title}>Verify Your Phone</Text>
        <Text style={styles.subtitle}>
          We have sent a 6-digit confirmation code to{' '}
          <Text style={styles.phoneHighlight}>+92 300 1234567</Text>
        </Text>

        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[
                styles.otpInput,
                digit.length > 0 && styles.otpInputFilled,
              ]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
            />
          ))}
        </View>

        <View style={styles.resendContainer}>
          {countdown > 0 ? (
            <Text style={styles.timerText}>
              Resend code in <Text style={styles.boldTimer}>{countdown}s</Text>
            </Text>
          ) : (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setCountdown(60)}
            >
              <Text style={styles.resendLink}>Resend Code</Text>
            </TouchableOpacity>
          )}
        </View>

        <Button
          title="Verify & Continue"
          onPress={handleVerify}
          size="lg"
          style={styles.verifyBtn}
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
  container: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xxl,
  },
  phoneHighlight: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xxl,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    textAlign: 'center',
    ...typography.h2,
    color: colors.textPrimary,
  },
  otpInputFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  timerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  boldTimer: {
    color: colors.primary,
    fontWeight: '700',
  },
  resendLink: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  verifyBtn: {
    marginTop: spacing.sm,
  },
});

export default OTPScreen;
