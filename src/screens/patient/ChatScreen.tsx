import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Icon from '../../components/Icon';
import ChatBubble from '../../components/ChatBubble';
import { Chat, Message } from '../../types';
import { useApp } from '../../context/AppContext';
import { getChatMessages, sendChatMessage } from '../../services/dataService';

interface ChatScreenProps {
  navigation: any;
  route: any;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const { doctors } = useApp();
  const defaultChat: Chat = {
    id: `chat-${doctors[0]?.id || '1'}`,
    doctorId: doctors[0]?.id || '1',
    doctorName: doctors[0]?.name || 'Dr. Specialist',
    doctorPhoto: doctors[0]?.photo || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
    doctorSpecialty: doctors[0]?.specialty || 'General OPD',
    isOnline: true,
    lastMessage: 'Consultation chat',
    lastMessageTime: 'Today',
    unreadCount: 0,
  };
  const chat: Chat = route?.params?.chat || defaultChat;
  const [messageList, setMessageList] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    let isMounted = true;
    getChatMessages(chat.id).then((msgs) => {
      if (isMounted) {
        if (msgs.length > 0) {
          setMessageList(msgs);
        } else {
          // Welcome greeting from the clinic doctor
          const welcomeMsg: Message = {
            id: `msg-init-${chat.id}`,
            chatId: chat.id,
            sender: 'doctor',
            text: `Hello! I am ${chat.doctorName}. You can ask any pre-consultation questions or send your medical history here.`,
            time: 'Active now',
          };
          setMessageList([welcomeMsg]);
          sendChatMessage(chat.id, welcomeMsg, chat);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [chat.id]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      chatId: chat.id,
      sender: 'patient',
      text: inputText.trim(),
      time: 'Just now',
    };

    setMessageList((prev) => [...prev, newMessage]);
    sendChatMessage(chat.id, newMessage, chat);
    setInputText('');

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Doctor response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const doctorReply: Message = {
        id: `msg-rep-${Date.now()}`,
        chatId: chat.id,
        sender: 'doctor',
        text: 'Thank you for updating me. I will review this during our scheduled consultation.',
        time: 'Just now',
      };
      setMessageList((prev) => [...prev, doctorReply]);
      sendChatMessage(chat.id, doctorReply, chat);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Custom Chat Header */}
      <View style={styles.chatHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Icon name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.doctorInfoRow}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: chat.doctorPhoto }} style={styles.avatar} />
              {chat.isOnline && <View style={styles.onlineBadge} />}
            </View>

            <View style={styles.doctorTextCol}>
              <Text numberOfLines={1} style={styles.doctorName}>
                {chat.doctorName}
              </Text>
              <Text style={styles.doctorStatus}>
                {chat.isOnline ? 'Online now' : 'Offline'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('LiveQueueTracker')}
            style={styles.headerIconBtn}
          >
            <Icon name="speedometer-outline" size={22} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {}}
            style={styles.headerIconBtn}
          >
            <Icon name="ellipsis-vertical" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messageList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <ChatBubble message={item} />}
          ListFooterComponent={
            isTyping ? (
              <View style={styles.typingIndicator}>
                <View style={styles.typingDot} />
                <View style={[styles.typingDot, { animationDelay: '200ms' }]} />
                <View style={[styles.typingDot, { animationDelay: '400ms' }]} />
                <Text style={styles.typingText}>{chat.doctorName} is typing...</Text>
              </View>
            ) : null
          }
        />

        {/* Bottom Input Field */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {}}
            style={styles.attachBtn}
          >
            <Icon name="attach" size={22} color={colors.textSecondary} />
          </TouchableOpacity>

          <TextInput
            placeholder="Type your message..."
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            style={styles.textInput}
            multiline
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSend}
            style={[
              styles.sendBtn,
              inputText.trim().length > 0 && styles.sendBtnActive,
            ]}
          >
            <Icon name="send" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  doctorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryLight,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
    borderWidth: 1.5,
    borderColor: colors.card,
  },
  doctorTextCol: {
    marginLeft: spacing.sm + 2,
    flex: 1,
  },
  doctorName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  doctorStatus: {
    ...typography.tiny,
    color: colors.success,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  typingText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  attachBtn: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  textInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    maxHeight: 100,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  sendBtnActive: {
    backgroundColor: colors.primary,
  },
});

export default ChatScreen;
