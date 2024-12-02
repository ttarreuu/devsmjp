import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './src/setup/route';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid } from 'react-native';

const App = () => {
  useEffect(() => {
    // requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    Geolocation.requestAuthorization('always');
    try {
      const fineLocationGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'App needs access to your location.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        {
          title: 'Background Location Permission',
          message: 'App needs access to your background location.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (
        fineLocationGranted === PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log('Location permissions granted');
        updatePermissionStatus(true);
      } else {
        console.log('Location permissions denied');
        updatePermissionStatus(false);
      }
    } catch (err) {
      console.warn('Permission request error:', err);
    }
  };

  const updatePermissionStatus = async (val: boolean) => {
    try {
      await AsyncStorage.setItem('PermissionStatus', JSON.stringify(val));
    } catch (e) {
      console.log('Error saving permission status:', e);
    }
  };

  return (
    <NavigationContainer>
      <BottomTabNavigator />
    </NavigationContainer>
  );
};

export default App;
