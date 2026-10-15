import React from 'react';
import { Tabs } from 'expo-router';
import { TabIcon, useTabBarOptions, tabHapticListeners } from '../../navigation/tabBar';
export default function DoctorLayout() {
  const options = useTabBarOptions();
  return <Tabs screenOptions={options} screenListeners={tabHapticListeners}>
    <Tabs.Screen name="index" options={{ title: 'Clinic', tabBarIcon: ({ focused }) => <TabIcon name="grid-outline" focused={focused} /> }} />
    <Tabs.Screen name="appointments" options={{ title: 'Patients', tabBarIcon: ({ focused }) => <TabIcon name="calendar-outline" focused={focused} /> }} />
    <Tabs.Screen name="earnings" options={{ title: 'Earnings', tabBarIcon: ({ focused }) => <TabIcon name="wallet-outline" focused={focused} /> }} />
    <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ focused }) => <TabIcon name="person-outline" focused={focused} /> }} />
  </Tabs>;
}
