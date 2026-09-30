import React, { useImperativeHandle, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, fonts, hitSlop, motion } from '../theme';
import { triggerHaptic } from '../utils/haptics';
import { Icon } from './Icon';

interface InputFieldProps extends TextInputProps {
  label?: string;
  /** Shown below the field in red; also marks the field invalid for screen readers. */
  error?: string;
  /** Helper text shown below the field when there is no error. */
  hint?: string;
  required?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  isPassword?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  /** Forwarded to the underlying TextInput, e.g. to focus the next field. */
  ref?: React.Ref<TextInput>;
}

type FocusEvent = Parameters<NonNullable<TextInputProps['onFocus']>>[0];
type BlurEvent = Parameters<NonNullable<TextInputProps['onBlur']>>[0];

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  hint,
  required = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  isPassword = false,
  containerStyle,
  style,
  multiline,
  editable = true,
  onFocus,
  onBlur,
  ref,
  ...props
}) => {
  const inputRef = useRef<TextInput>(null);
  useImperativeHandle(ref, () => inputRef.current as TextInput, []);

  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const focus = useSharedValue(0);
  const hasError = !!error;

  const animatedBox = useAnimatedStyle(
    () => ({
      borderColor: hasError
        ? colors.error
        : interpolateColor(focus.get(), [0, 1], [colors.border, colors.primary]),
      backgroundColor: interpolateColor(focus.get(), [0, 1], [colors.surfaceMuted, colors.card]),
    }),
    [hasError],
  );

  const handleFocus = (event: FocusEvent) => {
    setIsFocused(true);
    focus.set(withTiming(1, { duration: motion.duration.fast }));
    onFocus?.(event);
  };

  const handleBlur = (event: BlurEvent) => {
    setIsFocused(false);
    focus.set(withTiming(0, { duration: motion.duration.base }));
    onBlur?.(event);
  };

  const iconColor = hasError ? colors.error : isFocused ? colors.primary : colors.textSecondary;
  const message = error ?? hint;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.requiredMark}> *</Text> : null}
        </Text>
      ) : null}

      <Pressable
        onPress={() => inputRef.current?.focus()}
        disabled={!editable}
        accessible={false}
      >
        <Animated.View
          style={[
            styles.inputContainer,
            multiline && styles.multilineContainer,
            !editable && styles.inputDisabled,
            animatedBox,
          ]}
        >
          {leftIcon ? (
            <View style={styles.leftIcon}>
              <Icon name={leftIcon} size={20} color={iconColor} />
            </View>
          ) : null}

          <TextInput
            ref={inputRef}
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.primary}
            cursorColor={colors.primary}
            accessibilityLabel={label ?? props.placeholder}
            accessibilityHint={message}
            {...props}
            editable={editable}
            secureTextEntry={isPassword ? !showPassword : props.secureTextEntry}
            onFocus={handleFocus}
            onBlur={handleBlur}
            multiline={multiline}
            style={[styles.input, multiline && styles.multilineInput, style]}
          />

          {isPassword ? (
            <Pressable
              onPress={() => {
                triggerHaptic('selection');
                setShowPassword((prev) => !prev);
              }}
              hitSlop={hitSlop}
              style={styles.rightIcon}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            >
              <Icon
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.textSecondary}
              />
            </Pressable>
          ) : rightIcon ? (
            <Pressable
              onPress={onRightIconPress}
              disabled={!onRightIconPress}
              hitSlop={hitSlop}
              style={styles.rightIcon}
              accessibilityRole={onRightIconPress ? 'button' : undefined}
            >
              <Icon name={rightIcon} size={20} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </Animated.View>
      </Pressable>

      {message ? (
        <Animated.View
          key={hasError ? 'error' : 'hint'}
          entering={FadeIn.duration(motion.duration.fast)}
          exiting={FadeOut.duration(motion.duration.fast)}
          style={styles.messageRow}
          accessibilityLiveRegion={hasError ? 'polite' : 'none'}
        >
          {hasError ? <Icon name="alert-circle" size={14} color={colors.error} /> : null}
          <Text style={[styles.messageText, hasError && styles.errorText]}>{message}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    width: '100%',
  },
  label: {
    ...typography.captionBold,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: spacing.xs + 2,
  },
  requiredMark: {
    color: colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: borderRadius.md + 2,
    paddingHorizontal: spacing.md + 2,
    minHeight: 52,
  },
  multilineContainer: {
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    minHeight: 110,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: 0,
    // The field container already shows focus; drop the browser's own outline on web.
    // (RN's types don't list 'none', but react-native-web passes it through to CSS.)
    ...Platform.select({ web: { outlineStyle: 'none' } as unknown as TextStyle }),
  },
  multilineInput: {
    textAlignVertical: 'top',
    minHeight: 90,
  },
  leftIcon: {
    marginRight: spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightIcon: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs + 2,
    marginLeft: 2,
  },
  messageText: {
    ...typography.caption,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  errorText: {
    color: colors.errorText,
  },
});

export default InputField;
