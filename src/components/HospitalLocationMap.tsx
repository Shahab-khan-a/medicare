import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  PanResponder,
  LayoutChangeEvent,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Icon } from './Icon';
import { Hospital } from '../types';
import { CITIES, CITY_COORDINATES } from '../data/hospitals';
import {
  openHospitalLocationInMaps,
  calculateDistanceKm,
  formatDistance,
  lonToX,
  latToY,
  getMapTiles,
} from '../utils/mapUtils';
import { triggerHaptic } from '../utils/haptics';

export interface HospitalLocationMapProps {
  hospitals: Hospital[];
  initialHospitalId?: string;
  initialCity?: string;
  onSelectHospital?: (hospital: Hospital) => void;
  onNavigateToHospitalDetail?: (hospital: Hospital) => void;
  showControls?: boolean;
  showCityFilters?: boolean;
  showSearchBar?: boolean;
  showBottomCard?: boolean;
  singleHospitalMode?: boolean;
  height?: number | string;
  style?: any;
}

const DEFAULT_CENTER = {
  latitude: 31.488,
  longitude: 74.32,
  zoom: 12,
};

export const HospitalLocationMap: React.FC<HospitalLocationMapProps> = ({
  hospitals,
  initialHospitalId,
  initialCity = 'All Cities',
  onSelectHospital,
  onNavigateToHospitalDetail,
  showControls = true,
  showCityFilters = true,
  showSearchBar = true,
  showBottomCard = true,
  singleHospitalMode = false,
  height = '100%',
  style,
}) => {
  // Viewport dimensions
  const [viewport, setViewport] = useState({ width: 360, height: 500 });

  // Map state
  const [centerLat, setCenterLat] = useState<number>(() => {
    if (initialHospitalId) {
      const match = hospitals.find((h) => h.id === initialHospitalId);
      if (match?.latitude) return match.latitude;
    }
    const cityCoord = CITY_COORDINATES[initialCity];
    return cityCoord ? cityCoord.latitude : DEFAULT_CENTER.latitude;
  });

  const [centerLon, setCenterLon] = useState<number>(() => {
    if (initialHospitalId) {
      const match = hospitals.find((h) => h.id === initialHospitalId);
      if (match?.longitude) return match.longitude;
    }
    const cityCoord = CITY_COORDINATES[initialCity];
    return cityCoord ? cityCoord.longitude : DEFAULT_CENTER.longitude;
  });

  const [zoom, setZoom] = useState<number>(() => {
    if (initialHospitalId || singleHospitalMode) return 14;
    const cityCoord = CITY_COORDINATES[initialCity];
    return cityCoord ? cityCoord.zoom : DEFAULT_CENTER.zoom;
  });

  // Filters & selection
  const [selectedCity, setSelectedCity] = useState<string>(initialCity);
  const [emergencyOnly, setEmergencyOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(
    initialHospitalId || (hospitals[0]?.id ?? null)
  );
  const [isTilesLoading, setIsTilesLoading] = useState<boolean>(false);

  // Sync when initialHospitalId or initialCity changes
  useEffect(() => {
    if (initialHospitalId) {
      const target = hospitals.find((h) => h.id === initialHospitalId);
      if (target?.latitude && target?.longitude) {
        setCenterLat(target.latitude);
        setCenterLon(target.longitude);
        setZoom(14);
        setSelectedHospitalId(target.id);
      }
    } else if (initialCity && CITY_COORDINATES[initialCity]) {
      const c = CITY_COORDINATES[initialCity];
      setCenterLat(c.latitude);
      setCenterLon(c.longitude);
      setZoom(c.zoom);
      setSelectedCity(initialCity);
    }
  }, [initialHospitalId, initialCity, hospitals]);

  // Selected hospital
  const selectedHospital = useMemo(() => {
    return hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0];
  }, [hospitals, selectedHospitalId]);

  // Filtered hospitals
  const filteredHospitals = useMemo(() => {
    if (singleHospitalMode && initialHospitalId) {
      return hospitals.filter((h) => h.id === initialHospitalId);
    }
    return hospitals.filter((h) => {
      const matchCity =
        selectedCity === 'All Cities' ||
        h.city.toLowerCase() === selectedCity.toLowerCase();
      const matchEmergency = !emergencyOnly || !!h.emergencyAvailable;
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        h.name.toLowerCase().includes(q) ||
        h.address.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        (h.departments && h.departments.some((d) => d.toLowerCase().includes(q)));
      return matchCity && matchEmergency && matchQuery;
    });
  }, [hospitals, selectedCity, emergencyOnly, searchQuery, singleHospitalMode, initialHospitalId]);

  // Calculate tiles
  const tiles = useMemo(() => {
    if (viewport.width === 0 || viewport.height === 0) return [];
    return getMapTiles(centerLat, centerLon, zoom, viewport.width, viewport.height);
  }, [centerLat, centerLon, zoom, viewport.width, viewport.height]);

  // Pan interaction
  const panStartRef = useRef({ lat: centerLat, lon: centerLon, zoom });
  panStartRef.current = { lat: centerLat, lon: centerLon, zoom };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dx) > 6 || Math.abs(gesture.dy) > 6;
      },
      onPanResponderGrant: () => {
        panStartRef.current = { lat: centerLat, lon: centerLon, zoom };
      },
      onPanResponderMove: (_, gesture) => {
        const { lat, lon, zoom: currentZoom } = panStartRef.current;
        const scale = Math.pow(2, Math.floor(currentZoom)) * 256;
        const dLon = (-gesture.dx / scale) * 360;
        const latRad = (lat * Math.PI) / 180;
        const dLat = (gesture.dy / scale) * (360 * Math.cos(latRad));

        const newLat = Math.max(-80, Math.min(80, lat + dLat));
        const newLon = ((lon + dLon + 540) % 360) - 180;
        setCenterLat(newLat);
        setCenterLon(newLon);
      },
    })
  ).current;

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    triggerHaptic('light');
    setZoom((z) => Math.min(16, z + 1));
  }, []);

  const handleZoomOut = useCallback(() => {
    triggerHaptic('light');
    setZoom((z) => Math.max(5, z - 1));
  }, []);

  const handleRecenter = useCallback(() => {
    triggerHaptic('medium');
    if (selectedHospital?.latitude && selectedHospital?.longitude) {
      setCenterLat(selectedHospital.latitude);
      setCenterLon(selectedHospital.longitude);
      setZoom(13);
    } else {
      const c = CITY_COORDINATES[selectedCity] || DEFAULT_CENTER;
      setCenterLat(c.latitude);
      setCenterLon(c.longitude);
      setZoom(c.zoom);
    }
  }, [selectedHospital, selectedCity]);

  const handleSelectHospital = useCallback(
    (hospital: Hospital) => {
      triggerHaptic('selection');
      setSelectedHospitalId(hospital.id);
      if (hospital.latitude && hospital.longitude) {
        setCenterLat(hospital.latitude);
        setCenterLon(hospital.longitude);
        setZoom(14);
      }
      if (onSelectHospital) {
        onSelectHospital(hospital);
      }
    },
    [onSelectHospital]
  );

  const handleCitySelect = useCallback(
    (city: string) => {
      triggerHaptic('selection');
      setSelectedCity(city);
      const coord = CITY_COORDINATES[city];
      if (coord) {
        setCenterLat(coord.latitude);
        setCenterLon(coord.longitude);
        setZoom(coord.zoom);
      }
      // If the currently selected hospital is not in this city, select first one from this city
      if (city !== 'All Cities') {
        const firstInCity = hospitals.find(
          (h) => h.city.toLowerCase() === city.toLowerCase()
        );
        if (firstInCity) {
          setSelectedHospitalId(firstInCity.id);
        }
      }
    },
    [hospitals]
  );

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setViewport({ width, height });
    }
  };

  const handleDirections = (hospital: Hospital) => {
    openHospitalLocationInMaps(
      hospital.name,
      hospital.address,
      hospital.city,
      hospital.latitude,
      hospital.longitude
    );
  };

  const handleCall = (phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`).catch(() => {
        Alert.alert('Phone', phone);
      });
    }
  };

  // Convert GPS coordinates to viewport screen pixel position
  const getMarkerPosition = (lat: number, lon: number) => {
    const intZoom = Math.floor(zoom);
    const centerX = lonToX(centerLon, intZoom);
    const centerY = latToY(centerLat, intZoom);
    const targetX = lonToX(lon, intZoom);
    const targetY = latToY(lat, intZoom);

    const x = viewport.width / 2 + (targetX - centerX);
    const y = viewport.height / 2 + (targetY - centerY);
    return { x, y };
  };

  // Distance from center / user
  const distanceToSelected = useMemo(() => {
    if (!selectedHospital?.latitude || !selectedHospital?.longitude) return null;
    const dist = calculateDistanceKm(
      centerLat,
      centerLon,
      selectedHospital.latitude,
      selectedHospital.longitude
    );
    return formatDistance(dist);
  }, [centerLat, centerLon, selectedHospital]);

  return (
    <View style={[styles.container, { height }, style]} onLayout={handleLayout}>
      {/* Map Interactive Viewport */}
      <View style={styles.mapViewport} {...panResponder.panHandlers}>
        {/* Fallback stylized medical map grid */}
        <View style={styles.gridBackdrop}>
          <View style={styles.gridPattern} />
          <View style={styles.compassCenter}>
            <View style={styles.radarRing} />
            <View style={[styles.radarRing, { width: 180, height: 180 }]} />
          </View>
        </View>

        {/* Raster Map Tiles */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          {tiles.map((tile) => (
            <Image
              key={tile.key}
              source={{ uri: tile.url }}
              style={[
                styles.tileImage,
                {
                  left: tile.left,
                  top: tile.top,
                  width: 256,
                  height: 256,
                },
              ]}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ))}
        </View>

        {/* Hospital Markers Layer */}
        {filteredHospitals.map((hospital) => {
          if (!hospital.latitude || !hospital.longitude) return null;
          const pos = getMarkerPosition(hospital.latitude, hospital.longitude);
          const isSelected = selectedHospitalId === hospital.id;

          // Render only if within visible or near-visible bounds
          const isVisible =
            pos.x >= -60 &&
            pos.x <= viewport.width + 60 &&
            pos.y >= -60 &&
            pos.y <= viewport.height + 60;

          if (!isVisible) return null;

          return (
            <TouchableOpacity
              key={hospital.id}
              activeOpacity={0.8}
              style={[
                styles.markerWrapper,
                {
                  left: pos.x - (isSelected ? 26 : 20),
                  top: pos.y - (isSelected ? 52 : 40),
                  zIndex: isSelected ? 100 : 10,
                },
              ]}
              onPress={() => handleSelectHospital(hospital)}
            >
              {/* Pulsing ring for selected marker or emergency */}
              {isSelected && <View style={styles.markerPulseRing} />}

              {/* Pin body */}
              <View
                style={[
                  styles.markerPin,
                  isSelected && styles.markerPinActive,
                  hospital.emergencyAvailable && styles.markerPinEmergency,
                ]}
              >
                <Icon
                  name={hospital.emergencyAvailable ? 'medkit' : 'business'}
                  size={isSelected ? 16 : 13}
                  color={colors.white}
                />
              </View>

              {/* Pin pointer tip */}
              <View
                style={[
                  styles.markerTip,
                  isSelected && styles.markerTipActive,
                  hospital.emergencyAvailable && styles.markerTipEmergency,
                ]}
              />

              {/* Name badge */}
              {(isSelected || zoom >= 13) && (
                <View
                  style={[
                    styles.markerLabelBadge,
                    isSelected && styles.markerLabelBadgeActive,
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.markerLabelText,
                      isSelected && styles.markerLabelTextActive,
                    ]}
                  >
                    {hospital.name.split(' ')[0]} {hospital.name.split(' ')[1] || ''}
                  </Text>
                  <View style={styles.markerRatingInline}>
                    <Icon name="star" size={9} color={colors.star} />
                    <Text style={styles.markerRatingText}>
                      {hospital.rating.toFixed(1)}
                    </Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Center crosshair dot indicator */}
        <View style={styles.centerDot} pointerEvents="none" />
      </View>

      {/* Top Floating Overlay: Search Bar & City Chips */}
      <View style={styles.topOverlayContainer}>
        {showSearchBar && !singleHospitalMode && (
          <View style={styles.searchBar}>
            <Icon name="search-outline" size={18} color={colors.primary} />
            <TextInput
              placeholder="Search hospital name, area or department..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="close-circle" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {showCityFilters && !singleHospitalMode && (
          <View style={styles.filterPillsRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cityPillsScroll}
            >
              {CITIES.map((city) => {
                const isSelected = selectedCity === city;
                return (
                  <TouchableOpacity
                    key={city}
                    activeOpacity={0.75}
                    style={[
                      styles.cityPill,
                      isSelected && styles.cityPillActive,
                    ]}
                    onPress={() => handleCitySelect(city)}
                  >
                    <Icon
                      name={city === 'All Cities' ? 'globe-outline' : 'location-sharp'}
                      size={11}
                      color={isSelected ? colors.white : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.cityPillText,
                        isSelected && styles.cityPillTextActive,
                      ]}
                    >
                      {city}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {/* Emergency Filter Toggle */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.cityPill,
                  emergencyOnly && styles.emergencyPillActive,
                ]}
                onPress={() => {
                  triggerHaptic('light');
                  setEmergencyOnly(!emergencyOnly);
                }}
              >
                <Icon
                  name="shield-checkmark"
                  size={12}
                  color={emergencyOnly ? colors.white : colors.error}
                />
                <Text
                  style={[
                    styles.cityPillText,
                    emergencyOnly && styles.cityPillTextActive,
                    !emergencyOnly && { color: colors.error },
                  ]}
                >
                  24/7 Emergency
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
      </View>

      {/* Floating Map Action Controls (Zoom in/out, Recenter, Count Badge) */}
      {showControls && (
        <View style={styles.controlsColumn}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.controlBtn}
            onPress={handleZoomIn}
            accessibilityLabel="Zoom in"
          >
            <Icon name="add" size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.controlBtn}
            onPress={handleZoomOut}
            accessibilityLabel="Zoom out"
          >
            <Icon name="remove" size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.controlBtn, styles.recenterBtn]}
            onPress={handleRecenter}
            accessibilityLabel="Recenter hospital"
          >
            <Icon name="locate" size={19} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Hospital Count Pill */}
      {!singleHospitalMode && (
        <View style={styles.countTag}>
          <Icon name="business-outline" size={12} color={colors.primary} />
          <Text style={styles.countTagText}>
            {filteredHospitals.length} hospital{filteredHospitals.length === 1 ? '' : 's'} on map
          </Text>
        </View>
      )}

      {/* Bottom Selected Hospital Sheet / Card */}
      {showBottomCard && selectedHospital && (
        <View style={styles.bottomCardContainer}>
          <View style={styles.bottomCard}>
            {/* Top row: Hospital Image + Details */}
            <View style={styles.cardHeaderRow}>
              {selectedHospital.image && (
                <Image
                  source={{ uri: selectedHospital.image }}
                  style={styles.hospitalThumb}
                  contentFit="cover"
                />
              )}

              <View style={styles.hospitalInfoCol}>
                <View style={styles.cardTitleRow}>
                  <Text numberOfLines={1} style={styles.cardHospitalName}>
                    {selectedHospital.name}
                  </Text>
                </View>

                <View style={styles.hospitalMetaRow}>
                  <View style={styles.ratingBadge}>
                    <Icon name="star" size={11} color={colors.star} />
                    <Text style={styles.ratingText}>
                      {selectedHospital.rating.toFixed(1)}
                    </Text>
                    {selectedHospital.reviewsCount && (
                      <Text style={styles.reviewsCountText}>
                        ({selectedHospital.reviewsCount})
                      </Text>
                    )}
                  </View>

                  <View style={styles.cityBadge}>
                    <Icon name="location-outline" size={11} color={colors.textSecondary} />
                    <Text style={styles.cityText}>{selectedHospital.city}</Text>
                  </View>

                  {selectedHospital.emergencyAvailable && (
                    <View style={styles.emergencyMiniBadge}>
                      <Text style={styles.emergencyMiniText}>24/7</Text>
                    </View>
                  )}
                </View>

                <Text numberOfLines={1} style={styles.cardAddress}>
                  {selectedHospital.address}
                </Text>
              </View>
            </View>

            {/* Timings & Departments */}
            <View style={styles.cardDetailsRow}>
              <View style={styles.timingPill}>
                <Icon name="time-outline" size={12} color={colors.textSecondary} />
                <Text style={styles.timingText}>
                  OPD Active • Mon - Sat
                </Text>
              </View>

              {selectedHospital.phone && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.phoneChip}
                  onPress={() => handleCall(selectedHospital.phone)}
                >
                  <Icon name="call-outline" size={11} color={colors.primary} />
                  <Text style={styles.phoneChipText}>{selectedHospital.phone}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Action Buttons: Get Directions & View Details */}
            <View style={styles.cardActionsRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.directionBtn}
                onPress={() => handleDirections(selectedHospital)}
              >
                <Icon name="navigate-outline" size={15} color={colors.white} />
                <Text style={styles.directionBtnText}>Directions</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.detailsBtn}
                onPress={() => {
                  if (onNavigateToHospitalDetail) {
                    onNavigateToHospitalDetail(selectedHospital);
                  }
                }}
              >
                <Text style={styles.detailsBtnText}>View Specialists & OPD</Text>
                <Icon name="chevron-forward" size={15} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#E8ECEF',
  },
  mapViewport: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: '#EBF2F5',
  },
  gridBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#EDF2F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
    backgroundColor: '#DDE5EB',
  },
  compassCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarRing: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.15)',
  },
  tileImage: {
    position: 'absolute',
  },
  markerWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPulseRing: {
    position: 'absolute',
    top: -6,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(2, 132, 199, 0.25)',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  markerPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: colors.white,
    ...shadows.card,
  },
  markerPinActive: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0369A1',
    transform: [{ scale: 1.1 }],
    ...shadows.primary,
  },
  markerPinEmergency: {
    backgroundColor: colors.error,
  },
  markerTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.primary,
    marginTop: -2,
  },
  markerTipActive: {
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderTopColor: '#0369A1',
  },
  markerTipEmergency: {
    borderTopColor: colors.error,
  },
  markerLabelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.round,
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  markerLabelBadgeActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  markerLabelText: {
    ...typography.tiny,
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  markerLabelTextActive: {
    color: colors.primary,
  },
  markerRatingInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  markerRatingText: {
    ...typography.tiny,
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  centerDot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(2, 132, 199, 0.4)',
    marginLeft: -3,
    marginTop: -3,
  },
  topOverlayContainer: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.md,
    right: spacing.md,
    zIndex: 50,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: 12,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
    gap: 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    fontSize: 13,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  filterPillsRow: {
    flexDirection: 'row',
  },
  cityPillsScroll: {
    gap: 6,
    paddingBottom: 4,
  },
  cityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cityPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  emergencyPillActive: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  cityPillText: {
    ...typography.tiny,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cityPillTextActive: {
    color: colors.white,
  },
  controlsColumn: {
    position: 'absolute',
    right: spacing.md,
    top: 110,
    gap: 8,
    zIndex: 40,
  },
  controlBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  recenterBtn: {
    marginTop: 4,
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  countTag: {
    position: 'absolute',
    top: 112,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
    zIndex: 40,
  },
  countTagText: {
    ...typography.tiny,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bottomCardContainer: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    zIndex: 60,
  },
  bottomCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.large,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  hospitalThumb: {
    width: 68,
    height: 68,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceMuted,
  },
  hospitalInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHospitalName: {
    ...typography.h3,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  hospitalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
    marginBottom: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    ...typography.captionBold,
    fontSize: 12,
    color: colors.textPrimary,
  },
  reviewsCountText: {
    ...typography.tiny,
    fontSize: 11,
    color: colors.textSecondary,
  },
  cityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cityText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
  emergencyMiniBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  emergencyMiniText: {
    ...typography.tiny,
    fontSize: 9,
    fontWeight: '800',
    color: colors.error,
  },
  cardAddress: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
  },
  cardDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  timingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timingText: {
    ...typography.tiny,
    fontSize: 11,
    color: colors.textSecondary,
  },
  phoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phoneChipText: {
    ...typography.tiny,
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  directionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: 14,
    height: 40,
    ...shadows.primary,
  },
  directionBtnText: {
    ...typography.captionBold,
    color: colors.white,
    fontSize: 12,
  },
  detailsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    height: 40,
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.25)',
  },
  detailsBtnText: {
    ...typography.captionBold,
    color: colors.primary,
    fontSize: 12,
  },
});

export default HospitalLocationMap;

