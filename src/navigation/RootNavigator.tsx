import React from 'react';
import { DefaultTheme, NavigationContainer, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors, fonts } from '../theme';

// Navigators
import AuthStack from './AuthStack';
import PatientTabs from './PatientTabs';
import DoctorTabs from './DoctorTabs';

// Patient Screens
import DoctorListScreen from '../screens/patient/DoctorListScreen';
import DoctorDetailScreen from '../screens/patient/DoctorDetailScreen';
import BookAppointmentScreen from '../screens/patient/BookAppointmentScreen';
import PaymentScreen from '../screens/patient/PaymentScreen';
import AppointmentSuccessScreen from '../screens/patient/AppointmentSuccessScreen';
import ChatScreen from '../screens/patient/ChatScreen';
import WaitingRoomScreen from '../screens/patient/WaitingRoomScreen';
import VideoCallScreen from '../screens/patient/VideoCallScreen';
import PrescriptionScreen from '../screens/patient/PrescriptionScreen';
import NotificationsScreen from '../screens/patient/NotificationsScreen';
import LiveQueueTrackerScreen from '../screens/patient/LiveQueueTrackerScreen';
import HospitalDetailScreen from '../screens/patient/HospitalDetailScreen';
import HospitalMapScreen from '../screens/patient/HospitalMapScreen';

// Doctor Screens
import DoctorAvailabilityScreen from '../screens/doctor/DoctorAvailabilityScreen';
import DoctorVideoCallScreen from '../screens/doctor/DoctorVideoCallScreen';
import WritePrescriptionScreen from '../screens/doctor/WritePrescriptionScreen';
import DoctorEarningsScreen from '../screens/doctor/DoctorEarningsScreen';
import DoctorProfileScreen from '../screens/doctor/DoctorProfileScreen';
import DoctorVerificationScreen from '../screens/doctor/DoctorVerificationScreen';

const Stack = createNativeStackNavigator();

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.card,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.error,
  },
  fonts: {
    regular: { fontFamily: fonts.regular, fontWeight: '400' },
    medium: { fontFamily: fonts.medium, fontWeight: '500' },
    bold: { fontFamily: fonts.bold, fontWeight: '700' },
    heavy: { fontFamily: fonts.extrabold, fontWeight: '800' },
  },
};

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="AuthStack"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {/* Auth Group */}
        <Stack.Screen name="AuthStack" component={AuthStack} />

        {/* Patient Tabs & Stack Screens */}
        <Stack.Screen name="PatientTabs" component={PatientTabs} />
        <Stack.Screen name="DoctorList" component={DoctorListScreen} />
        <Stack.Screen name="DoctorDetail" component={DoctorDetailScreen} />
        <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="AppointmentSuccess" component={AppointmentSuccessScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="WaitingRoom" component={WaitingRoomScreen} />
        <Stack.Screen name="VideoCall" component={VideoCallScreen} />
        <Stack.Screen name="Prescription" component={PrescriptionScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="LiveQueueTracker" component={LiveQueueTrackerScreen} />
        <Stack.Screen name="HospitalDetail" component={HospitalDetailScreen} />
        <Stack.Screen name="HospitalMap" component={HospitalMapScreen} />

        {/* Doctor Tabs & Stack Screens */}
        <Stack.Screen name="DoctorTabs" component={DoctorTabs} />
        <Stack.Screen name="DoctorAvailability" component={DoctorAvailabilityScreen} />
        <Stack.Screen name="DoctorVideoCall" component={DoctorVideoCallScreen} />
        <Stack.Screen name="WritePrescription" component={WritePrescriptionScreen} />
        <Stack.Screen name="DoctorEarnings" component={DoctorEarningsScreen} />
        <Stack.Screen name="DoctorProfile" component={DoctorProfileScreen} />
        <Stack.Screen name="DoctorVerification" component={DoctorVerificationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
