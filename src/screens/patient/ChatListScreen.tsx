import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Icon from '../../components/Icon';
import Header from '../../components/Header';
import EmptyState from '../../components/EmptyState';
import { Chat } from '../../types';
import { useApp } from '../../context/AppContext';

interface ChatListScreenProps {
  navigation: any;
}

export const ChatListScreen: React.FC<ChatListScreenProps> = ({ navigation }) => {
  const { doctors } = useApp();
  const [search, setSearch] = useState('');

  const chatList: Chat[] = doctors.map((doc) => ({
    id: `chat-${doc.id}`,
    doctorId: doc.id,
    doctorName: doc.name,
    doctorPhoto: doc.photo,
    doctorSpecialty: doc.specialty,
    isOnline: !!doc.isOnline,
    lastMessage: `Room #${doc.roomNumber || '204'} • Consultation chat active`,
    lastMessageTime: 'Active',
    unreadCount: 0,
  }));

  const filteredChats = chatList.filter(
    (c) =>
      c.doctorName.toLowerCase().includes(search.toLowerCase()) ||
      c.doctorSpecialty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <Header title="Messages" showBack={false} />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search-outline" size={20} color={colors.textSecondary} />
          <TextInput
            placeholder="Search conversations..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>
      </View>

      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="chatbubbles-outline"
            title="No Conversations"
            subtitle="Start chatting with your doctors after booking a consultation."
          />
        }
        renderItem={({ item }: { item: Chat }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Chat', { chat: item })}
            style={styles.chatItem}
          >
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: item.doctorPhoto }} style={styles.avatar} />
              {item.isOnline && <View style={styles.onlineDot} />}
            </View>

            <View style={styles.chatDetails}>
              <View style={styles.topLine}>
                <Text numberOfLines={1} style={styles.doctorName}>
                  {item.doctorName}
                </Text>
                <Text style={styles.timeText}>{item.lastMessageTime}</Text>
              </View>

              <Text style={styles.specialtyText}>{item.doctorSpecialty}</Text>

              <View style={styles.bottomLine}>
                <Text numberOfLines={1} style={styles.lastMessageText}>
                  {item.lastMessage}
                </Text>
                {item.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unreadCount}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryLight,
  },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.card,
  },
  chatDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  doctorName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    flex: 1,
  },
  timeText: {
    ...typography.tiny,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  specialtyText: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 1,
  },
  bottomLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  lastMessageText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    marginRight: spacing.sm,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.round,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    ...typography.tiny,
    color: colors.white,
    fontWeight: '700',
  },
});

export default ChatListScreen;
