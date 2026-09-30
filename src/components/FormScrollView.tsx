import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';

interface FormScrollViewProps extends ScrollViewProps {
  /** Height of anything fixed above the form (e.g. a custom header) on iOS. */
  keyboardOffset?: number;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Scrollable form container that keeps the focused input above the keyboard.
 * Taps on buttons still register while the keyboard is open, and dragging
 * the form dismisses the keyboard. Works in Expo Go (no native module needed).
 */
export const FormScrollView: React.FC<FormScrollViewProps> = ({
  children,
  keyboardOffset = 0,
  containerStyle,
  contentContainerStyle,
  ...rest
}) => (
  <KeyboardAvoidingView
    style={[styles.flex, containerStyle]}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    keyboardVerticalOffset={keyboardOffset}
  >
    <ScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      {...rest}
    >
      {children}
    </ScrollView>
  </KeyboardAvoidingView>
);

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});

export default FormScrollView;
