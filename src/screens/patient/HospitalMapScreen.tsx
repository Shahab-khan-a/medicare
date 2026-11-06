import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme';
import { Header, HospitalLocationMap } from '../../components';
import { hospitals } from '../../data';
import { Hospital } from '../../types';

export interface HospitalMapScreenProps {
  navigation: any;
  route: any;
}

export const HospitalMapScreen: React.FC<HospitalMapScreenProps> = ({
  navigation,
  route,
}) => {
  const initialHospitalId = route?.params?.hospitalId || route?.params?.hospital?.id;
  const initialCity = route?.params?.city || 'All Cities';

  const handleNavigateToDetail = (hospital: Hospital) => {
    navigation.navigate('HospitalDetail', {
      hospitalId: hospital.id,
      hospital,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      <Header
        title="Hospital Location Map"
        showBack={navigation?.canGoBack ? navigation.canGoBack() : true}
        onBack={() => navigation.goBack()}
      />
      <View style={styles.mapContainer}>
        <HospitalLocationMap
          hospitals={hospitals}
          initialHospitalId={initialHospitalId}
          initialCity={initialCity}
          onNavigateToHospitalDetail={handleNavigateToDetail}
          showControls={true}
          showCityFilters={true}
          showSearchBar={true}
          showBottomCard={true}
          height="100%"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
});

export default HospitalMapScreen;

