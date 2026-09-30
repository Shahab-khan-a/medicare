import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Message } from '../types';
import { colors, typography, spacing, borderRadius, motion } from '../theme';
import { Icon } from './Icon';

interface ChatBubbleProps {
  message: Message;
  style?: StyleProp<ViewStyle>;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, style }) => {
  const isSent = message.sender === 'patient';

  return (
    <View
      style={[styles.container, isSent ? styles.sentContainer : styles.receivedContainer, style]}
    >
      <View
        accessible
        accessibilityLabel={`${isSent ? 'You' : 'Doctor'}: ${message.text || 'Image'}, ${message.time}`}
        style={[styles.bubble, isSent ? styles.sentBubble : styles.receivedBubble]}
      >
        {message.isImage && message.imageUrl ? (
          <Image
            source={{ uri: message.imageUrl }}
            style={styles.attachedImage}
            contentFit="cover"
            transition={motion.duration.base}
          />
        ) : null}

        {message.text ? (
          <Text style={[styles.text, isSent ? styles.sentText : styles.receivedText]}>
            {message.text}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          <Text style={[styles.time, isSent ? styles.sentTime : styles.receivedTime]}>
            {message.time}
          </Text>
          {isSent ? (
            <Icon name="checkmark-done" size={14} color="rgba(255, 255, 255, 0.85)" />
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 3,
    width: '100%',
    flexDirection: 'row',
  },
  sentContainer: {
    justifyContent: 'flex-end',
  },
  receivedContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm + 2,
  },
  sentBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: borderRadius.xs + 2,
  },
  receivedBubble: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: borderRadius.xs + 2,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  attachedImage: {
    width: 220,
    height: 140,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  text: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 21,
  },
  sentText: {
    color: colors.white,
  },
  receivedText: {
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    marginTop: 4,
  },
  time: {
    ...typography.tiny,
  },
  sentTime: {
    color: 'rgba(255, 255, 255, 0.82)',
  },
  receivedTime: {
    color: colors.textSecondary,
  },
});

export default ChatBubble;
