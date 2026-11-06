import React from 'react';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { useApp } from '../context/AppContext';

export const routePaths: Record<string, string> = {
  AuthStack: '/auth/Login', Splash: '/auth/Splash', Onboarding: '/auth/Onboarding',
  Login: '/auth/Login', Signup: '/auth/Signup', OTP: '/auth/OTP', ForgotPassword: '/auth/ForgotPassword',
  PatientTabs: '/patient', HomeScreen: '/patient', DoctorList: '/patient/find',
  MyAppointments: '/patient/appointments', LiveQueueTracker: '/patient/queue', Profile: '/patient/profile',
  DoctorTabs: '/doctor', DoctorDashboard: '/doctor', DoctorAppointments: '/doctor/appointments',
  DoctorEarningsTab: '/doctor/earnings', DoctorProfileTab: '/doctor/profile',
  DoctorDetail: '/DoctorDetail', BookAppointment: '/BookAppointment', Payment: '/Payment',
  AppointmentSuccess: '/AppointmentSuccess', HospitalDetail: '/HospitalDetail', HospitalMap: '/HospitalMap',
  Chat: '/Chat', WaitingRoom: '/WaitingRoom', VideoCall: '/VideoCall',
  Prescription: '/Prescription', Notifications: '/Notifications',
  DoctorAvailability: '/DoctorAvailability', DoctorVideoCall: '/DoctorVideoCall',
  WritePrescription: '/WritePrescription', DoctorEarnings: '/doctor/earnings',
  DoctorProfile: '/doctor/profile', DoctorVerification: '/DoctorVerification',
};

// Keep patient details in memory rather than in URLs or browser history.
const privateParams = new Map<string, Record<string, unknown>>();
let sequence = 0;
function destination(name: string, params: Record<string, any> = {}): Href {
  const pathname = routePaths[params.screen || name];
  if (!pathname) throw new Error('Unknown screen: ' + name);
  const publicParams: Record<string, string> = {};
  for (const key of ['doctorId', 'hospitalId', 'appointmentId', 'prescriptionId', 'initialQuery', 'category', 'specialtyId', 'city', 'filter', 'initialTab']) {
    if (params[key] !== undefined) publicParams[key] = String(params[key]);
  }
  if (params.doctor?.id) publicParams.doctorId = params.doctor.id;
  if (params.hospital?.id) publicParams.hospitalId = params.hospital.id;
  if (params.appointment?.id) publicParams.appointmentId = params.appointment.id;
  if (Object.keys(params).some(key => !['screen', ...Object.keys(publicParams)].includes(key))) {
    const key = 'route-' + ++sequence;
    privateParams.set(key, params);
    if (privateParams.size > 80) privateParams.delete(privateParams.keys().next().value!);
    publicParams.contextKey = key;
  }
  return { pathname, params: publicParams } as Href;
}

const navigation = {
  navigate: (name: string, params?: Record<string, any>) => router.navigate(destination(name, params)),
  replace: (name: string, params?: Record<string, any>) => {
    if (name === 'AuthStack') privateParams.clear();
    if (['AuthStack', 'PatientTabs', 'DoctorTabs'].includes(name) && router.canDismiss()) router.dismissAll();
    router.replace(destination(name, params));
  },
  goBack: () => router.canGoBack() ? router.back() : router.replace('/patient' as Href),
  canGoBack: () => router.canGoBack(),
};

export function screenRoute(Screen: React.ComponentType<any>) {
  function ScreenRoute() {
    const params = useLocalSearchParams<Record<string, string>>();
    const { doctors, appointments } = useApp();
    const stored = params.contextKey ? privateParams.get(params.contextKey) : undefined;
    const routeParams = {
      ...params,
      ...stored,
      ...(params.doctorId ? { doctor: doctors.find(doctor => doctor.id === params.doctorId), doctorId: params.doctorId } : {}),
      ...(params.appointmentId ? { appointment: appointments.find(appointment => appointment.id === params.appointmentId) || stored?.appointment } : {}),
    };
    return <Screen navigation={navigation} route={{ params: routeParams }} />;
  }
  ScreenRoute.displayName = 'Route(' + (Screen.displayName || Screen.name) + ')';
  return ScreenRoute;
}
