import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, fonts } from '../../theme';
import Icon from '../../components/Icon';
import Header from '../../components/Header';
import EmptyState from '../../components/EmptyState';
import { useApp } from '../../context/AppContext';
import { NotificationItem } from '../../types';

interface NotificationsScreenProps {
  navigation: any;
}

type CategoryType = 'all' | 'appointment' | 'queue' | 'prescription' | 'payment' | 'system';

const CATEGORIES: { key: CategoryType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'queue', label: 'Queue & Turn' },
  { key: 'appointment', label: 'Appointments' },
  { key: 'prescription', label: 'Prescriptions' },
  { key: 'payment', label: 'Payments' },
];

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  navigation,
}) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');

  const filtered = notifications.filter((n) => {
    if (selectedCategory === 'all') return true;
    return n.type === selectedCategory;
  });

  const getIconForType = (type: NotificationItem['type']) => {
    switch (type) {
      case 'queue':
        return { icon: 'pulse', color: '#0284C7', bg: '#E0F2FE' };
      case 'appointment':
        return { icon: 'calendar', color: colors.primary, bg: colors.primaryLight };
      case 'prescription':
        return { icon: 'document-text', color: '#9333EA', bg: '#F3E8FF' };
      case 'payment':
        return { icon: 'card', color: colors.success, bg: colors.successLight };
      case 'chat':
        return { icon: 'chatbubble-ellipses', color: colors.accent, bg: colors.accentLight };
      case 'system':
      default:
        return { icon: 'notifications', color: '#F59E0B', bg: '#FEF3C7' };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <Header
        title="Notification Center"
        showBack
        onBack={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity activeOpacity={0.7} onPress={markAllNotificationsRead}>
            <Text style={styles.markReadText}>Mark all read</Text>
          </TouchableOpacity>
        }
      />

      {/* Category Filter Chips */}
      <View style={styles.categoriesRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 8 }}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.key;
            return (
              <TouchableOpacity
                style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(item.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="notifications-off-outline"
            title="No Notifications in this tab"
            subtitle="You are all caught up! New reminders, live turn calls, and e-prescriptions will appear here."
          />
        }
        renderItem={({ item }) => {
          const iconConfig = getIconForType(item.type);

          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                markNotificationRead(item.id);
                if (item.type === 'queue') {
                  navigation.navigate('LiveQueueTracker');
                } else if (item.type === 'prescription') {
                  navigation.navigate('Prescription');
                } else if (item.type === 'appointment') {
                  navigation.navigate('PatientTabs', { screen: 'MyAppointments' });
                }
              }}
              style={[styles.notifItem, item.isUnread && styles.notifItemUnread]}
            >
              <View style={[styles.notifIconBox, { backgroundColor: iconConfig.bg }]}>
                <Icon name={iconConfig.icon} size={20} color={iconConfig.color} />
              </View>

              <View style={styles.notifContent}>
                <View style={styles.notifHeader}>
                  <Text style={styles.notifTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.notifTime}>{item.time}</Text>
                </View>

                <Text style={styles.notifDesc} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>

              {item.isUnread && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  markReadText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.primary,
  },
  categoriesRow: {
    paddingVertical: 10,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    fontFamily: fonts.bold,
    color: colors.white,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  notifItemUnread: {
    backgroundColor: '#F8FAFC',
    borderColor: colors.primaryMuted,
  },
  notifIconBox: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifContent: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.xs,
  },
  notifTime: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  notifDesc: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});

export default NotificationsScreen;
