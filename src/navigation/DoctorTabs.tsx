import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';
import DoctorDashboardScreen from '../screens/doctor/DoctorDashboardScreen';
import DoctorAppointmentsScreen from '../screens/doctor/DoctorAppointmentsScreen';
import DoctorEarningsScreen from '../screens/doctor/DoctorEarningsScreen';
import DoctorProfileScreen from '../screens/doctor/DoctorProfileScreen';
import { TabIcon, tabHapticListeners, useTabBarOptions } from './tabBar';

const Tab = createBottomTabNavigator();

export const DoctorTabs: React.FC = () => {
  const tabBarOptions = useTabBarOptions();

  return (
    <Tab.Navigator screenOptions={tabBarOptions} screenListeners={tabHapticListeners}>
      <Tab.Screen
        name="DoctorDashboard"
        component={DoctorDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'grid' : 'grid-outline'} focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="DoctorAppointments"
        component={DoctorAppointmentsScreen}
        options={{
          tabBarLabel: 'Appointments',
          tabBarBadge: 3,
          tabBarBadgeStyle: styles.badgeStyle,
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'calendar' : 'calendar-outline'} focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="DoctorEarningsTab"
        component={DoctorEarningsScreen}
        options={{
          tabBarLabel: 'Earnings',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'wallet' : 'wallet-outline'} focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="DoctorProfileTab"
        component={DoctorProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  badgeStyle: {
    backgroundColor: colors.error,
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    lineHeight: 18,
  },
});

export default DoctorTabs;
