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

import { getDefaultHeaderOptions } from '../screens/utils/header'; 

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function DashboardStack() {
  return (
    <Stack.Navigator initialRouteName="Dashboard">
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ headerShown: false }} 
      />
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
    </Stack.Navigator>
  );
}


export default function BottomTabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="DashboardTab" component={DashboardStack} />
      <Tab.Screen name="Notification" component={NotificationScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
