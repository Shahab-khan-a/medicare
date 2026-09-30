import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Icon from '../../components/Icon';
import Button from '../../components/Button';
import { LinearGradient } from '../../components/LinearGradient';

const { width, height } = Dimensions.get('window');

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  accentColor: string;
  glowColor: string;
  badgeText: string;
  badgeIcon: string;
}

const slides: Slide[] = [
  {
    id: '1',
    title: 'Find Top\nCertified Specialists',
    subtitle:
      'Browse verified OPD doctors by specialty, read real patient reviews, and check live availability across all departments.',
    icon: 'search-outline',
    accentColor: '#38BDF8',
    glowColor: 'rgba(56, 189, 248, 0.3)',
    badgeText: 'Verified Specialists',
    badgeIcon: 'shield-checkmark',
  },
  {
    id: '2',
    title: 'Book In-Clinic\nOPD Online',
    subtitle:
      'Reserve your physical clinic slot for the morning or evening OPD shift — no long reception queues or walk-in waiting.',
    icon: 'calendar-outline',
    accentColor: '#4ADE80',
    glowColor: 'rgba(74, 222, 128, 0.3)',
    badgeText: 'In-Person Clinic Visit',
    badgeIcon: 'business',
  },
  {
    id: '3',
    title: 'Track Live Queue\nFrom Home',
    subtitle:
      'Get your digital OPD token number instantly. Monitor live queue progress remotely and walk in exactly when your turn approaches.',
    icon: 'speedometer-outline',
    accentColor: '#C084FC',
    glowColor: 'rgba(192, 132, 252, 0.3)',
    badgeText: 'Real-Time OPD Tracker',
    badgeIcon: 'pulse',
  },
];

interface OnboardingScreenProps {
  navigation: any;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.navigate('Login');
    }
  };

  const handleSkip = () => {
    navigation.navigate('Login');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const currentSlide = slides[currentIndex];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Pure dark gradient background */}
      <LinearGradient
        colors={['#0A1428', '#0F172A', '#080E1D']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.miniLogo}>
            <View style={styles.crossV} />
            <View style={styles.crossH} />
          </View>
          <Text style={styles.brandName}>MediCare</Text>
        </View>

        <TouchableOpacity activeOpacity={0.7} onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slide FlatList */}
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.slideContainer}>
            {/* Large Glowing Icon Illustration */}
            <View style={[styles.illustrationArea, { shadowColor: item.glowColor }]}>
              <View
                style={[
                  styles.glowRingOuter,
                  { borderColor: item.glowColor, backgroundColor: `${item.glowColor}` },
                ]}
              />
              <View
                style={[
                  styles.glowRingMiddle,
                  { borderColor: item.accentColor, borderWidth: 1.5 },
                ]}
              />
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(30,41,59,0.9)' }]}>
                <Icon name={item.icon} size={70} color={item.accentColor} />
              </View>

              {/* Floating Badge */}
              <View style={[styles.floatingBadge, { borderColor: item.accentColor }]}>
                <Icon name={item.badgeIcon} size={13} color={item.accentColor} />
                <Text style={[styles.floatingBadgeText, { color: item.accentColor }]}>
                  {item.badgeText}
                </Text>
              </View>
            </View>

            {/* Text Content */}
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: colors.white }]}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />

      {/* Footer */}
      <View style={styles.footer}>
        {/* Pagination */}
        <View style={styles.paginationDots}>
          {slides.map((slide, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index
                  ? [styles.activeDot, { backgroundColor: currentSlide.accentColor }]
                  : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        <Button
          title={currentIndex === slides.length - 1 ? 'Continue with Google →' : 'Next →'}
          onPress={handleNext}
          size="lg"
          style={styles.nextBtn}
        />

        {currentIndex < slides.length - 1 && (
          <TouchableOpacity activeOpacity={0.7} onPress={handleSkip} style={styles.skipUnderBtn}>
            <Text style={styles.skipUnderText}>Already have an account? Sign in with Google</Text>
          </TouchableOpacity>
        )}
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A1428',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 16 : 56,
    paddingBottom: spacing.md,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniLogo: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  crossV: {
    position: 'absolute',
    width: 4,
    height: 18,
    backgroundColor: colors.white,
    borderRadius: 2,
  },
  crossH: {
    position: 'absolute',
    width: 18,
    height: 4,
    backgroundColor: colors.white,
    borderRadius: 2,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 0.5,
  },
  skipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  skipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  slideContainer: {
    width,
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    justifyContent: 'center',
    flex: 1,
  },
  illustrationArea: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
    position: 'relative',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 0,
  },
  glowRingOuter: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.12,
  },
  glowRingMiddle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.25,
  },
  iconCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  floatingBadge: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
    borderWidth: 1,
  },
  floatingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 34,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
  },
  paginationDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 28,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  nextBtn: {
    width: '100%',
    marginBottom: spacing.md,
  },
  skipUnderBtn: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  skipUnderText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
});


export default OnboardingScreen;
