import { Linking, Platform, Alert } from 'react-native';

/**
 * Open external map directions to a hospital location
 */
export const openHospitalLocationInMaps = (
  hospitalName: string,
  address: string,
  city?: string
) => {
  const fullAddress = [hospitalName, address, city].filter(Boolean).join(', ');
  const encodedAddress = encodeURIComponent(fullAddress);

  const url = Platform.select({
    ios: `maps:0,0?q=${encodedAddress}`,
    android: `geo:0,0?q=${encodedAddress}`,
    default: `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
  });

  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(url);
      }
      return Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
      );
    })
    .catch(() => {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
      ).catch(() => {
        Alert.alert('Location', `${hospitalName}\n${address}, ${city || ''}`);
      });
    });
};
