import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './src/setup/route';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid } from 'react-native';

const App = () => {
  
  useEffect(() => {
    requestLocationPermission();
  });

  const requestLocationPermission = async () => {
    Geolocation.requestAuthorization('always');
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'App needs access to your location.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
  
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission granted');
        updatePermissionStatus('granted');
      } else {
        console.log('Location permission denied');
        updatePermissionStatus('denied');
      }
  
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        {
          title: 'Background Location Permission',
          message: 'We need access to your location so you can get live quality updates.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      ); 
    } catch (err) {
      console.warn(err);
    }
  };

  const updatePermissionStatus = async (val: string) => {
    try {
      await AsyncStorage.setItem('PermissionStatus', val);
      // readStatus();
    } catch (e) {
      console.log('saving error!')
    }
  }
  
  {/* check permission status on async storage
  const readStatus = async () => {
    try {
      const value = await AsyncStorage.getItem('PermissionStatus');
      if(value !== null){
        console.log(value);
      }
    }catch (e) {
      console.log('data not found!');
    }
  } */}

  return (
    <NavigationContainer>
      <BottomTabNavigator />
    </NavigationContainer>
  )
};

export default App;
