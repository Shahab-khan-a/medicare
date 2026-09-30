import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { colors, typography, spacing, hitSlop } from '../theme';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
  rightAccessibilityLabel?: string;
  rightComponent?: React.ReactNode;
  transparent?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  centerTitle?: boolean;
}

const HeaderIconButton: React.FC<{
  icon: string;
  onPress?: () => void;
  label: string;
}> = ({ icon, onPress, label }) => (
  <PressableScale
    onPress={onPress}
    haptic="selection"
    hitSlop={hitSlop}
    accessibilityLabel={label}
    style={styles.iconButton}
  >
    <Icon name={icon} size={20} color={colors.textPrimary} />
  </PressableScale>
);

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightIcon,
  onRightPress,
  rightAccessibilityLabel,
  rightComponent,
  transparent = false,
  containerStyle,
  titleStyle,
  centerTitle = true,
}) => {
  return (
    <View
      style={[styles.container, transparent ? styles.transparent : styles.solid, containerStyle]}
    >
      <View style={styles.side}>
        {showBack ? (
          <HeaderIconButton icon="chevron-back" onPress={onBack} label="Go back" />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <View style={[styles.titleContainer, centerTitle ? styles.centered : styles.leftAligned]}>
        {title ? (
          <Text numberOfLines={1} accessibilityRole="header" style={[styles.title, titleStyle]}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={[styles.side, styles.sideRight]}>
        {rightComponent ? (
          rightComponent
        ) : rightIcon ? (
          <HeaderIconButton
            icon={rightIcon}
            onPress={onRightPress}
            label={rightAccessibilityLabel ?? 'More options'}
          />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  solid: {
    backgroundColor: colors.background,
  },
  transparent: {
    backgroundColor: colors.transparent,
  },
  side: {
    minWidth: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  titleContainer: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  centered: {
    alignItems: 'center',
  },
  leftAligned: {
    alignItems: 'flex-start',
  },
  title: {
    ...typography.h3,
    fontSize: 17,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 44,
    height: 44,
  },
});

export default Header;
