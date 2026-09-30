import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, shadows, hitSlop, motion } from '../theme';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  children,
  contentStyle,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />

        <Animated.View
          entering={SlideInDown.duration(motion.duration.slow)}
          accessibilityViewIsModal
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.sm },
            contentStyle,
          ]}
        >
          <View style={styles.dragHandle} />

          <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <PressableScale
              onPress={onClose}
              haptic="selection"
              hitSlop={hitSlop}
              accessibilityLabel="Close"
              style={styles.closeBtn}
            >
              <Icon name="close" size={18} color={colors.textSecondary} />
            </PressableScale>
          </View>

          <View style={styles.body}>{children}</View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.xxl + 4,
    borderTopRightRadius: borderRadius.xxl + 4,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    maxHeight: '88%',
    ...shadows.large,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.borderStrong,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typography.h2,
    fontSize: 18,
    color: colors.textPrimary,
    flex: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    width: '100%',
  },
});

export default BottomSheet;
