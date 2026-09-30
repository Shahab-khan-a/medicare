import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type HapticType = 'none' | 'selection' | 'light' | 'medium' | 'success' | 'warning' | 'error';

/**
 * Fire-and-forget haptic feedback. Skipped on web (desktop browsers have no
 * haptics and some vibrate the whole device), and never throws.
 */
export const triggerHaptic = (type: HapticType = 'light') => {
  if (type === 'none' || Platform.OS === 'web') return;

  const run = () => {
    switch (type) {
      case 'selection':
        return Haptics.selectionAsync();
      case 'medium':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      case 'success':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      case 'warning':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      case 'error':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      case 'light':
      default:
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  run().catch(() => {});
};
