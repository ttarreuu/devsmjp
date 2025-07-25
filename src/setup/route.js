import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import DashboardScreen from '../screens/DashboardScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ProfileScreen from '../screens/ProfileScreen';

import ForgotPwScreen from '../screens/ForgotPwScreen.tsx';
import UpdatePwScreen from '../screens/UpdatePwScreen.tsx';
import LoginScreen from '../screens/LoginScreen.tsx';

import AttendanceScreen from '../screens/attendance/AttendanceScreen';
import EmergencyScreen from '../screens/emergency/EmergencyScreen';
import PatrolScreen from '../screens/patrol/PatrolScreen';
import ScheduleScreen from '../screens/schedule/ScheduleScreen';
import NfcConfirmScreen from '../screens/patrol/NfcConfirmScreen';
import ConfirmScreen from '../screens/patrol/ConfirmScreen';
import ChatListScreen from '../screens/chat/ChatListScreen.tsx';
import ChatScreen from '../screens/chat/ChatScreen.tsx';
import ImageViewScreen from '../screens/chat/ImageViewScreen.tsx'

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
        tabBarActiveTintColor: '#1185C8',
        tabBarLabelStyle: { fontFamily: 'Poppins-SemiBold' },
        tabBarShowLabel: false
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
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPwScreen} options={getDefaultHeaderOptions('')} />
      <Stack.Screen name="UpdatePassword" component={UpdatePwScreen} options={getDefaultHeaderOptions('')} />

      <Stack.Screen name="MainTabs" component={BottomTabs} />

      <Stack.Screen name="ImageView" component={ImageViewScreen} options={getDefaultHeaderOptions('ImageView')} />
      <Stack.Screen name="ChatList" component={ChatListScreen} options={getDefaultHeaderOptions('Message')} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} options={getDefaultHeaderOptions('')} />
      <Stack.Screen name="Attendance" component={AttendanceScreen} options={getDefaultHeaderOptions('Attendance')} />
      <Stack.Screen name="Emergency" component={EmergencyScreen} options={getDefaultHeaderOptions('Emergency')} />
      <Stack.Screen name="Patrol" component={PatrolScreen} options={getDefaultHeaderOptions('Patrol')} />
      <Stack.Screen name="Schedule" component={ScheduleScreen} options={getDefaultHeaderOptions('Schedule')} />
      <Stack.Screen name="NfcConfirmScreen" component={NfcConfirmScreen} options={getDefaultHeaderOptions('Patrol NFC')} />
      <Stack.Screen name="ConfirmScreen" component={ConfirmScreen} options={getDefaultHeaderOptions('Patrol GPS')} />
      <Stack.Screen name="QRConfirmScreen" component={QRConfirmScreen} options={getDefaultHeaderOptions('Patrol QR')} />
    </Stack.Navigator>
  );
}
