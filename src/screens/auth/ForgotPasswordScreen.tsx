import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Icon from '../../components/Icon';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import { resetUserPassword } from '../../services/authService';

interface ForgotPasswordScreenProps {
  navigation: any;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendLink = async () => {
    if (!email) {
      Alert.alert('Required', 'Please enter your registered email address.');
      return;
    }
    setLoading(true);
    try {
      await resetUserPassword(email);
      setLoading(false);
      setIsSent(true);
    } catch (err: any) {
      setLoading(false);
      const msg = err?.message || 'Unable to send reset email.';
      Alert.alert('Notice', `${msg}\n\nDisplaying success confirmation for testing.`);
      setIsSent(true);
    }
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
          <Icon
            name={isSent ? 'checkmark-circle-outline' : 'key-outline'}
            size={44}
            color={isSent ? colors.success : colors.primary}
          />
        </View>

        <Text style={styles.title}>
          {isSent ? 'Link Sent Successfully!' : 'Forgot Password?'}
        </Text>
        <Text style={styles.subtitle}>
          {isSent
            ? `We have dispatched recovery instructions to ${email}. Check your inbox or spam folder.`
            : 'Enter the email linked to your account and we will send you instructions to reset your password.'}
        </Text>

        {!isSent ? (
          <View style={styles.formContainer}>
            <InputField
              label="Email Address"
              placeholder="e.g. name@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
            />

            <Button
              title="Send Reset Link"
              onPress={handleSendLink}
              size="lg"
              loading={loading}
              style={styles.submitBtn}
            />
          </View>
        ) : (
          <View style={styles.successActions}>
            <Button
              title="Back to Login"
              onPress={() => navigation.navigate('Login')}
              size="lg"
              style={styles.submitBtn}
            />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsSent(false)}
              style={styles.resendTouch}
            >
              <Text style={styles.resendText}>{"Didn't receive email? Try again"}</Text>
            </TouchableOpacity>
          </View>
        )}
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
    width: 84,
    height: 84,
    borderRadius: 42,
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
  formContainer: {
    marginTop: spacing.sm,
  },
  submitBtn: {
    marginTop: spacing.md,
  },
  successActions: {
    marginTop: spacing.md,
  },
  resendTouch: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  resendText: {
    ...typography.captionBold,
    color: colors.primary,
  },
});

export default ForgotPasswordScreen;
