import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import DashboardScreen from '../screens/DashboardScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ProfileScreen from '../screens/ProfileScreen';

import AttendanceScreen from '../screens/attendance/AttendanceScreen';
import EmergencyScreen from '../screens/emergency/EmergencyScreen';
import PatrolScreen from '../screens/patrol/PatrolScreen';
import ScheduleScreen from '../screens/schedule/ScheduleScreen';
import NfcConfirmScreen from '../screens/patrol/NfcConfirmScreen';

import { getDefaultHeaderOptions } from '../components/Header';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Bottom Tab Navigator (for Dashboard, Notification, Profile only)
function BottomTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Notification" component={NotificationScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Stack Navigator (Main Navigation)
export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Bottom Tab Screens */}
      <Stack.Screen name="MainTabs" component={BottomTabs} />

      {/* Other Screens (No Bottom Tabs) */}
      <Stack.Screen 
        name="Attendance" 
        component={AttendanceScreen} 
        options={getDefaultHeaderOptions('Attendance')} 
      />
      <Stack.Screen 
        name="Emergency" 
        component={EmergencyScreen} 
        options={getDefaultHeaderOptions('Emergency')} 
      />
      <Stack.Screen 
        name="Patrol" 
        component={PatrolScreen} 
        options={getDefaultHeaderOptions('Patrol')} 
      />
      <Stack.Screen 
        name="Schedule" 
        component={ScheduleScreen} 
        options={getDefaultHeaderOptions('Schedule')} 
      />
      <Stack.Screen 
        name="NfcConfirmScreen" 
        component={NfcConfirmScreen} 
        options={getDefaultHeaderOptions('Patrol NFC')} 
      />
    </Stack.Navigator>
  );
}
