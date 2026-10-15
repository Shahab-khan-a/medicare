import React from 'react';
import { Tabs } from 'expo-router';
import { TabIcon, useTabBarOptions, tabHapticListeners } from '../../navigation/tabBar';
export default function PatientLayout() {
  const options = useTabBarOptions();
  return <Tabs screenOptions={options} screenListeners={tabHapticListeners}>
    <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} /> }} />
    <Tabs.Screen name="find" options={{ title: 'Find care', tabBarIcon: ({ focused }) => <TabIcon name="search-outline" focused={focused} /> }} />
    <Tabs.Screen name="appointments" options={{ title: 'Bookings', tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'calendar' : 'calendar-outline'} focused={focused} /> }} />
    <Tabs.Screen name="queue" options={{ title: 'My turn', tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'ticket' : 'ticket-outline'} focused={focused} /> }} />
    <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} /> }} />
  </Tabs>;
}
