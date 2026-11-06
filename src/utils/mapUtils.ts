import { Linking, Platform, Alert } from 'react-native';

/**
 * Open external map directions to a hospital location
 */
export const openHospitalLocationInMaps = (
  hospitalName: string,
  address: string,
  city?: string,
  latitude?: number,
  longitude?: number
) => {
  const encodedName = encodeURIComponent(hospitalName);
  const fullAddress = [hospitalName, address, city].filter(Boolean).join(', ');
  const encodedAddress = encodeURIComponent(fullAddress);

  const url = Platform.select({
    ios:
      latitude !== undefined && longitude !== undefined
        ? `maps:0,0?q=${encodedName}&ll=${latitude},${longitude}`
        : `maps:0,0?q=${encodedAddress}`,
    android:
      latitude !== undefined && longitude !== undefined
        ? `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodedName})`
        : `geo:0,0?q=${encodedAddress}`,
    default:
      latitude !== undefined && longitude !== undefined
        ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
        : `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
  });

  const fallbackUrl =
    latitude !== undefined && longitude !== undefined
      ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

  Linking.canOpenURL(url || fallbackUrl)
    .then((supported) => {
      if (supported && url) {
        return Linking.openURL(url);
      }
      return Linking.openURL(fallbackUrl);
    })
    .catch(() => {
      Linking.openURL(fallbackUrl).catch(() => {
        Alert.alert('Location', `${hospitalName}\n${address}, ${city || ''}`);
      });
    });
};

/**
 * Calculate distance between two GPS coordinates using Haversine formula (km)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Web Mercator projection formulas for slippy maps
 */
export function lonToX(lon: number, zoom: number): number {
  return ((lon + 180) / 360) * Math.pow(2, zoom) * 256;
}

export function latToY(lat: number, zoom: number): number {
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const clampedSin = Math.max(-0.9999, Math.min(0.9999, sinLat));
  return (
    (0.5 - Math.log((1 + clampedSin) / (1 - clampedSin)) / (4 * Math.PI)) *
    Math.pow(2, zoom) *
    256
  );
}

export function xToLon(x: number, zoom: number): number {
  return (x / (Math.pow(2, zoom) * 256)) * 360 - 180;
}

export function yToLat(y: number, zoom: number): number {
  const n = Math.PI - (2 * Math.PI * y) / (Math.pow(2, zoom) * 256);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

export interface MapTile {
  x: number;
  y: number;
  z: number;
  key: string;
  left: number;
  top: number;
  url: string;
}

/**
 * Compute the visible raster map tiles covering a given viewport
 */
export function getMapTiles(
  centerLat: number,
  centerLon: number,
  zoom: number,
  width: number,
  height: number
): MapTile[] {
  const intZoom = Math.floor(zoom);
  const maxTile = Math.pow(2, intZoom);
  const centerX = lonToX(centerLon, intZoom);
  const centerY = latToY(centerLat, intZoom);

  const startPixelX = centerX - width / 2;
  const startPixelY = centerY - height / 2;
  const endPixelX = centerX + width / 2;
  const endPixelY = centerY + height / 2;

  const minTileX = Math.max(0, Math.floor(startPixelX / 256));
  const maxTileX = Math.min(maxTile - 1, Math.floor(endPixelX / 256));
  const minTileY = Math.max(0, Math.floor(startPixelY / 256));
  const maxTileY = Math.min(maxTile - 1, Math.floor(endPixelY / 256));

  const tiles: MapTile[] = [];

  for (let tx = minTileX; tx <= maxTileX; tx++) {
    for (let ty = minTileY; ty <= maxTileY; ty++) {
      const tileLeft = tx * 256 - startPixelX;
      const tileTop = ty * 256 - startPixelY;
      // Using CartoDB Voyager raster tiles for high-quality, reliable, clean medical style map
      const subdomains = ['a', 'b', 'c', 'd'];
      const s = subdomains[(tx + ty) % subdomains.length];
      const url = `https://${s}.basemaps.cartocdn.com/rastertiles/voyager/${intZoom}/${tx}/${ty}@2x.png`;

      tiles.push({
        x: tx,
        y: ty,
        z: intZoom,
        key: `${intZoom}-${tx}-${ty}`,
        left: tileLeft,
        top: tileTop,
        url,
      });
    }
  }

  return tiles;
}
