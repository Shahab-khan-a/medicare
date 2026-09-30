import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/patient/HomeScreen';
import MyAppointmentsScreen from '../screens/patient/MyAppointmentsScreen';
import LiveQueueTrackerScreen from '../screens/patient/LiveQueueTrackerScreen';
import ProfileScreen from '../screens/patient/ProfileScreen';
import {
  FeaturedTabIcon,
  TabIcon,
  featuredTabLabelStyle,
  tabHapticListeners,
  useTabBarOptions,
} from './tabBar';

const Tab = createBottomTabNavigator();

export const PatientTabs: React.FC = () => {
  const tabBarOptions = useTabBarOptions();

  return (
    <Tab.Navigator screenOptions={tabBarOptions} screenListeners={tabHapticListeners}>
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="MyAppointments"
        component={MyAppointmentsScreen}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'calendar' : 'calendar-outline'} focused={focused} />
          ),
        }}
      />

      {/* Live Queue is the app's signature feature, so its tab is always highlighted */}
      <Tab.Screen
        name="LiveQueueTracker"
        component={LiveQueueTrackerScreen}
        options={{
          tabBarLabel: 'Live Queue',
          tabBarAccessibilityLabel: 'Live Queue, track your turn',
          tabBarIcon: ({ focused }) => <FeaturedTabIcon name="pulse" focused={focused} />,
          tabBarLabelStyle: [tabBarOptions.tabBarLabelStyle, featuredTabLabelStyle],
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
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

export default PatientTabs;
