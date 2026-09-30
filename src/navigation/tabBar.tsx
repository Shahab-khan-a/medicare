import React from 'react';
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { colors, fonts, spacing } from '../theme';
import { triggerHaptic } from '../utils/haptics';

// Tab items add 5px padding top and bottom: 5 + 30 (pill) + 2 + 14 (label) + 5, plus the bar's own top padding.
const TAB_CONTENT_HEIGHT = 64;

/**
 * Shared light tab bar. Height is derived from the device's bottom inset so the
 * bar never sits under the Android gesture/3-button nav bar or the iOS home indicator.
 */
export const useTabBarOptions = (): BottomTabNavigationOptions => {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, spacing.sm);

  return {
    headerShown: false,
    tabBarHideOnKeyboard: true,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textSecondary,
    tabBarStyle: [styles.tabBar, { height: TAB_CONTENT_HEIGHT + bottom, paddingBottom: bottom }],
    tabBarLabelStyle: styles.tabLabel,
    tabBarIconStyle: styles.tabIcon,
  };
};

export const tabHapticListeners = {
  tabPress: () => triggerHaptic('selection'),
};

export const TabIcon: React.FC<{ name: string; focused: boolean }> = ({ name, focused }) => (
  <View style={[styles.iconPill, focused && styles.iconPillActive]}>
    <Icon name={name} size={20} color={focused ? colors.primary : colors.textSecondary} />
  </View>
);

/** Always-filled pill used to highlight a tab's primary action (e.g. Live Queue). */
export const FeaturedTabIcon: React.FC<{ name: string; focused: boolean }> = ({ name, focused }) => (
  <View style={[styles.iconPill, styles.featuredPill, focused && styles.featuredPillActive]}>
    <Icon name={name} size={20} color={colors.white} />
  </View>
);

export const featuredTabLabelStyle = {
  fontFamily: fonts.bold,
  fontWeight: '700' as const,
  color: colors.primary,
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderStrong,
    paddingTop: spacing.xs + 2,
    ...Platform.select({
      android: { elevation: 12 },
      default: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
    }),
  },
  tabLabel: {
    fontFamily: fonts.semibold,
    fontWeight: '600',
    fontSize: 11,
    lineHeight: 14,
    marginTop: 2,
  },
  tabIcon: {
    width: 56,
    height: 30,
  },
  iconPill: {
    width: 56,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillActive: {
    backgroundColor: colors.primaryLight,
  },
  featuredPill: {
    backgroundColor: colors.primary,
  },
  featuredPillActive: {
    backgroundColor: colors.primaryDark,
  },
});
