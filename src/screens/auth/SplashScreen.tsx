import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from '../../components/LinearGradient';
import Icon from '../../components/Icon';
import { colors, typography, spacing } from '../../theme';

interface SplashScreenProps {
  navigation: any;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2200);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#0A1428', '#0F172A', '#1E293B']}
        style={styles.gradient}
      >
        <View style={styles.centerBox}>
          <View style={styles.logoCircle}>
            <View style={styles.crossVertical} />
            <View style={styles.crossHorizontal} />
            <View style={styles.pulseInner}>
              <Icon name="heart" size={24} color={colors.white} />
            </View>
          </View>

          <Text style={styles.appName}>MediCare</Text>
          <View style={styles.badgeRow}>
            <Icon name="pulse-outline" size={14} color="#38BDF8" />
            <Text style={styles.tagline}>Hospital Clinic OPD & Token Network</Text>
          </View>
        </View>

        <View style={styles.bottomArea}>
          <ActivityIndicator size="small" color="#38BDF8" />
          <Text style={styles.loadingText}>Connecting to OPD live counter...</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1428',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.huge,
    paddingHorizontal: spacing.xxl,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    position: 'relative',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  crossVertical: {
    position: 'absolute',
    width: 14,
    height: 52,
    backgroundColor: colors.white,
    borderRadius: 7,
  },
  crossHorizontal: {
    position: 'absolute',
    width: 52,
    height: 14,
    backgroundColor: colors.white,
    borderRadius: 7,
  },
  pulseInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  appName: {
    ...typography.h1,
    fontSize: 36,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  tagline: {
    ...typography.captionBold,
    color: '#E0F2FE',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  bottomArea: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    ...typography.caption,
    color: '#94A3B8',
    fontSize: 12,
  },
});

export default SplashScreen;
