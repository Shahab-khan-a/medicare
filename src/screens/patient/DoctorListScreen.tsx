import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Icon from '../../components/Icon';
import Header from '../../components/Header';
import DoctorCard from '../../components/DoctorCard';
import EmptyState from '../../components/EmptyState';
import { Doctor } from '../../types';
import { useApp } from '../../context/AppContext';

interface DoctorListScreenProps {
  navigation: any;
  route: any;
}

const filterOptions = [
  'All',
  'Available Today',
  'Online Now',
  'Top Rated',
  'Price: Low-High',
];

export const DoctorListScreen: React.FC<DoctorListScreenProps> = ({
  navigation,
  route,
}) => {
  const { doctors } = useApp();
  const initialCategory = route?.params?.category || '';
  const [searchQuery, setSearchQuery] = useState(initialCategory);
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Filter & sort doctors
  let filtered = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.hospital.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'Online Now') return doc.isOnline;
    if (selectedFilter === 'Top Rated') return doc.rating >= 4.8;
    return true;
  });

  if (selectedFilter === 'Price: Low-High') {
    filtered = [...filtered].sort((a, b) => a.fees - b.fees);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <Header
        title="Find Doctors"
        showBack
        onBack={() => navigation.goBack()}
        rightIcon="options-outline"
        onRightPress={() => {}}
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search-outline" size={20} color={colors.textSecondary} />
          <TextInput
            placeholder="Search by name, specialty, or clinic..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Chips Horizontal Scroll */}
      <View style={styles.filterScrollWrapper}>
        <FlatList
          data={filterOptions}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.75}
              style={[
                styles.filterChip,
                selectedFilter === item && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(item)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === item && styles.filterChipTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.resultsBar}>
        <Text style={styles.resultsCount}>
          <Text style={styles.boldCount}>{filtered.length} doctors</Text> available
        </Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No Doctors Found"
            subtitle="Try adjusting your filter or search query to find available specialists."
            actionTitle="Clear Search"
            onAction={() => {
              setSearchQuery('');
              setSelectedFilter('All');
            }}
          />
        }
        renderItem={({ item }: { item: Doctor }) => (
          <DoctorCard
            doctor={item}
            variant="vertical"
            onPress={() => navigation.navigate('DoctorDetail', { doctorId: item.id })}
            onBookPress={() => navigation.navigate('BookAppointment', { doctor: item })}
          />
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
    paddingTop: spacing.xs,
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
  filterScrollWrapper: {
    paddingBottom: spacing.sm,
  },
  filterScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterChip: {
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  resultsBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  resultsCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  boldCount: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.huge,
  },
});

export default DoctorListScreen;
