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
import ConfirmScreen from '../screens/patrol/ConfirmScreen';

import { getDefaultHeaderOptions } from '../components/Header';
import QRConfirmScreen from '../screens/patrol/QRConfirmScreen';

import DashboardIcon from '../assets/home.svg';
import NotificationIcon from '../assets/notification.svg';
import ProfileIcon from '../assets/profile.svg';
import DashboardIconBlue from '../assets/home-blue.svg';
import NotificationIconBlue from '../assets/notification-blue.svg';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator screenOptions={{ 
        headerShown: false, 
        tabBarActiveTintColor: "#1185C8", // Active tab text color
      }}>
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{
          tabBarIcon: ({ focused, size }) => (
            focused ? <DashboardIconBlue width={size} height={size} /> : <DashboardIcon width={size} height={size} />
          ),
        }} 
      />
      <Tab.Screen 
        name="Notification" 
        component={NotificationScreen} 
        options={{
          tabBarIcon: ({ focused, size }) => (
            focused ? <NotificationIconBlue width={size*1.3} height={size*1.3} /> : <NotificationIcon width={size*1.3} height={size*1.3} />
          ),
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ size }) => (
            <ProfileIcon width={size} height={size} />
          ),
        }} 
      />
    </Tab.Navigator>
  );
}


export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={BottomTabs} />
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
      <Stack.Screen 
        name="ConfirmScreen" 
        component={ConfirmScreen} 
        options={getDefaultHeaderOptions('Patrol GPS')} 
      />
      <Stack.Screen 
        name="QRConfirmScreen" 
        component={QRConfirmScreen} 
        options={getDefaultHeaderOptions('Patrol QR')} 
      />
    </Stack.Navigator>
  );
}
