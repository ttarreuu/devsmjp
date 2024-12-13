import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './src/setup/route';
import requestMultiplePermissions from './src/setup/permission';

export default function App() {
  requestMultiplePermissions();
  return (
    <NavigationContainer>
      <BottomTabNavigator />
    </NavigationContainer>
  );
}
