import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Fuse from 'fuse.js';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import {
  Icon,
  Header,
  DoctorCard,
  HospitalCard,
  EmptyState,
  HospitalLocationMap,
} from '../../components';
import { Doctor, Hospital } from '../../types';
import { useApp } from '../../context/AppContext';
import { hospitals, categories, CITIES } from '../../data';
import { isDoctorDay } from '../../utils/booking';

export default function DoctorListScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { doctors } = useApp();
  const initialTabParam = route?.params?.initialTab;
  const [tab, setTab] = useState<'doctors' | 'hospitals' | 'map'>(
    initialTabParam === 'map'
      ? 'map'
      : initialTabParam === 'hospitals'
      ? 'hospitals'
      : 'doctors'
  );
  const [query, setQuery] = useState<string>(
    route?.params?.initialQuery || route?.params?.category || ''
  );
  const [city, setCity] = useState<string>(route?.params?.city || 'All Cities');
  const [specialty, setSpecialty] = useState<string>(route?.params?.specialtyId || '');
  const [sort, setSort] = useState<string>(route?.params?.filter || 'All');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedHospitalForMap, setSelectedHospitalForMap] = useState<string | undefined>(
    route?.params?.hospitalId || route?.params?.hospital?.id
  );

  useEffect(() => {
    setQuery(route?.params?.initialQuery || route?.params?.category || '');
    setSpecialty(route?.params?.specialtyId || '');
    setSort(route?.params?.filter || 'All');
    setCity(route?.params?.city || 'All Cities');
    if (route?.params?.initialTab) {
      setTab(route?.params?.initialTab);
    }
    if (route?.params?.hospitalId || route?.params?.hospital?.id) {
      setSelectedHospitalForMap(route?.params?.hospitalId || route?.params?.hospital?.id);
    }
  }, [
    route?.params?.initialQuery,
    route?.params?.category,
    route?.params?.specialtyId,
    route?.params?.filter,
    route?.params?.city,
    route?.params?.initialTab,
    route?.params?.hospitalId,
    route?.params?.hospital,
  ]);

  const doctorSearch = useMemo(
    () =>
      new Fuse(doctors, {
        keys: ['name', 'specialty', 'hospital', 'city', 'location'],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [doctors]
  );

  const hospitalSearch = useMemo(
    () =>
      new Fuse(hospitals, {
        keys: ['name', 'city', 'address', 'departments'],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    []
  );

  const results = useMemo(() => {
    let list = query.trim()
      ? doctorSearch.search(query.trim()).map((result) => result.item)
      : doctors;
    if (city !== 'All Cities') {
      list = list.filter(
        (doctor) =>
          doctor.city === city ||
          doctor.location.toLowerCase().includes(city.toLowerCase())
      );
    }
    if (specialty) list = list.filter((doctor) => doctor.specialtyId === specialty);
    if (sort === 'Top Rated') list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === 'Lowest fee') list = [...list].sort((a, b) => a.fees - b.fees);
    if (sort === 'Works today') {
      list = list.filter(
        (doctor) =>
          !!doctor.availableDays?.length && isDoctorDay(doctor, new Date())
      );
    }
    return list;
  }, [query, doctorSearch, doctors, city, specialty, sort]);

  const hospitalResults = useMemo(() => {
    const list = query.trim()
      ? hospitalSearch.search(query.trim()).map((result) => result.item)
      : hospitals;
    return city === 'All Cities'
      ? list
      : list.filter((hospital) => hospital.city === city);
  }, [query, city, hospitalSearch]);

  const reset = () => {
    setQuery('');
    setCity('All Cities');
    setSpecialty('');
    setSort('All');
  };

  const openHospital = (hospital: Hospital) =>
    navigation.navigate('HospitalDetail', { hospitalId: hospital.id, hospital });

  const chips = (
    items: { key: string; label: string }[],
    value: string,
    select: (key: string) => void
  ) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chips}
    >
      {items.map((item) => (
        <TouchableOpacity
          key={item.key}
          accessibilityRole="button"
          accessibilityState={{ selected: item.key === value }}
          onPress={() => select(item.key)}
          style={[styles.chip, item.key === value && styles.chipSelected]}
        >
          <Text
            style={[styles.chipText, item.key === value && { color: colors.primary }]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const listHeader = (
    <View>
      {/* Switch to Map View Banner for Hospitals */}
      {tab === 'hospitals' && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setTab('map')}
          style={styles.mapBanner}
        >
          <View style={styles.mapBannerIcon}>
            <Icon name="map" size={18} color={colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.mapBannerTitle}>Interactive Hospital Map</Text>
            <Text style={styles.mapBannerSub}>
              View {hospitalResults.length} hospital locations, pins & directions on map
            </Text>
          </View>
          <View style={styles.mapBannerBtn}>
            <Text style={styles.mapBannerBtnText}>View Map</Text>
            <Icon name="chevron-forward" size={14} color={colors.primary} />
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.filterRow}>
        <Text style={styles.resultCount}>
          {tab === 'doctors'
            ? results.length + ' doctors'
            : hospitalResults.length + ' hospitals'}
          {city !== 'All Cities' ? ' in ' + city : ''}
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityState={{ expanded: filtersOpen }}
          onPress={() => setFiltersOpen(!filtersOpen)}
          style={styles.filterButton}
        >
          <Icon name="options-outline" size={18} color={colors.primary} />
          <Text style={styles.link}>
            Filters{city !== 'All Cities' || specialty || sort !== 'All' ? ' · on' : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {filtersOpen && (
        <View style={styles.filterPanel}>
          <Text style={styles.label}>City</Text>
          {chips(
            CITIES.map((value) => ({ key: value, label: value })),
            city,
            setCity
          )}
          {tab === 'doctors' && (
            <>
              <Text style={styles.label}>Specialty</Text>
              {chips(
                [
                  { key: '', label: 'All specialties' },
                  ...categories.map((category) => ({
                    key: category.id,
                    label: category.name,
                  })),
                ],
                specialty,
                setSpecialty
              )}
              <Text style={styles.label}>Show doctors by</Text>
              {chips(
                ['All', 'Top Rated', 'Lowest fee', 'Works today'].map((value) => ({
                  key: value,
                  label: value,
                })),
                sort,
                setSort
              )}
              {sort === 'Works today' && (
                <Text style={styles.helper}>
                  Shows doctors with a published working day for today. Appointment
                  times are chosen during booking.
                </Text>
              )}
            </>
          )}
          <TouchableOpacity
            accessibilityRole="button"
            onPress={reset}
            style={styles.reset}
          >
            <Text style={styles.link}>Clear all filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {!!specialty && !filtersOpen && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Clear specialty filter"
          onPress={() => setSpecialty('')}
          style={styles.activeFilter}
        >
          <Text style={styles.link}>
            {categories.find((category) => category.id === specialty)?.name}
          </Text>
          <Icon name="close" size={17} color={colors.primary} />
        </TouchableOpacity>
      )}

      {!query && tab === 'doctors' && (
        <Text style={styles.helper}>
          Compare experience, patient reviews and fees to find your fit.
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      <Header title="Find your care" showBack={false} />

      {/* Top Search bar - shown on Doctors and Hospitals list tabs */}
      {tab !== 'map' && (
        <View style={styles.search}>
          <Icon name="search-outline" size={22} color={colors.primary} />
          <TextInput
            accessibilityLabel="Search doctors or hospitals"
            placeholder="Doctor, specialty, hospital or city"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {!!query && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              style={styles.clear}
              onPress={() => setQuery('')}
            >
              <Icon name="close-circle" size={21} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Segmented Tab Bar: Doctors | Hospitals | Hospital Map */}
      <View style={styles.tabs}>
        {[
          { key: 'doctors', label: 'Doctors', icon: 'person-outline' },
          { key: 'hospitals', label: 'Hospitals', icon: 'business-outline' },
          { key: 'map', label: 'Hospital Map', icon: 'map-outline' },
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === item.key }}
            onPress={() => setTab(item.key as any)}
            style={[styles.tab, tab === item.key && styles.tabActive]}
          >
            <View style={styles.tabContent}>
              <Icon
                name={item.icon}
                size={14}
                color={tab === item.key ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabText,
                  tab === item.key && { color: colors.primary, fontWeight: '700' },
                ]}
              >
                {item.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab 1: Doctors List */}
      {tab === 'doctors' && (
        <FlatList<Doctor>
          data={results}
          keyExtractor={(doctor) => doctor.id}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title="Let’s try another search"
              subtitle="Try a doctor’s name, another city, or clear your filters."
              actionTitle="Show all doctors"
              onAction={reset}
            />
          }
          renderItem={({ item }) => (
            <DoctorCard
              doctor={item}
              onPress={() =>
                navigation.navigate('DoctorDetail', { doctorId: item.id })
              }
              onBookPress={() =>
                navigation.navigate('BookAppointment', { doctor: item })
              }
            />
          )}
        />
      )}

      {/* Tab 2: Hospitals List */}
      {tab === 'hospitals' && (
        <FlatList<Hospital>
          data={hospitalResults}
          keyExtractor={(hospital) => hospital.id}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            <EmptyState
              icon="business-outline"
              title="No hospitals found"
              subtitle="Try a different name or city."
              actionTitle="Show all hospitals"
              onAction={reset}
            />
          }
          renderItem={({ item }) => (
            <HospitalCard
              hospital={item}
              onPress={() => openHospital(item)}
              onViewDoctors={() => openHospital(item)}
              onDoctorPress={(doctor) =>
                navigation.navigate('DoctorDetail', { doctorId: doctor.id })
              }
              onBookDoctor={(doctor) =>
                navigation.navigate('BookAppointment', { doctor })
              }
              onViewOnMap={() => {
                setSelectedHospitalForMap(item.id);
                setTab('map');
              }}
            />
          )}
        />
      )}

      {/* Tab 3: Hospital Location Map */}
      {tab === 'map' && (
        <View style={styles.mapFullWrapper}>
          <HospitalLocationMap
            hospitals={hospitals}
            initialHospitalId={selectedHospitalForMap}
            initialCity={city}
            onNavigateToHospitalDetail={(h) => openHospital(h)}
            showControls={true}
            showCityFilters={true}
            showSearchBar={true}
            showBottomCard={true}
            height="100%"
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  search: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    minHeight: 54,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.white,
    marginHorizontal: 22,
    paddingLeft: 15,
    marginBottom: 12,
  },
  input: {
    ...typography.body,
    flex: 1,
    minWidth: 0,
    color: colors.textPrimary,
    paddingVertical: 12,
  },
  clear: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  tabs: {
    flexDirection: 'row',
    padding: 4,
    marginHorizontal: 22,
    backgroundColor: '#EAEFE9',
    borderRadius: 14,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 11,
  },
  tabActive: { backgroundColor: colors.white, ...shadows.card },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  tabText: { ...typography.captionBold, color: colors.textSecondary, fontSize: 12 },
  list: {
    paddingHorizontal: 22,
    paddingBottom: 22,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  mapBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.sm + 2,
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.25)',
    gap: 10,
    marginBottom: 10,
    ...shadows.card,
  },
  mapBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapBannerTitle: {
    ...typography.captionBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  mapBannerSub: {
    ...typography.tiny,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  mapBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.round,
  },
  mapBannerBtnText: {
    ...typography.tiny,
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'center',
    paddingVertical: 8,
  },
  resultCount: { ...typography.bodySemibold, color: colors.textPrimary, flex: 1 },
  filterButton: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: 10,
  },
  link: { ...typography.captionBold, color: colors.primary },
  helper: { ...typography.caption, color: colors.textSecondary, marginBottom: 17 },
  filterPanel: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.white,
  },
  label: { ...typography.captionBold, color: colors.textPrimary },
  chips: { gap: 8, paddingVertical: 10 },
  chip: {
    minHeight: 44,
    paddingHorizontal: 13,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  chipText: { ...typography.captionMedium, color: colors.textSecondary },
  reset: { minHeight: 44, justifyContent: 'center', alignItems: 'flex-start' },
  activeFilter: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    alignSelf: 'flex-start',
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    marginBottom: 14,
  },
  mapFullWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
});
