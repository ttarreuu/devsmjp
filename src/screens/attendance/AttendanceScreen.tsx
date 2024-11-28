import React, { useEffect } from 'react';
import { View, StyleSheet, PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeForegroundService from '@supersami/rn-foreground-service';

const AttendanceScreen = () => {
  useEffect(() => {
    initializedLocation();
  }, []);

  const initializedLocation = async () => {
    try {
      const status = await readStatus();
      console.log(status);
      if (status === true) {
        startForegroundService();
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const readStatus = async () => {
    try {
      const value = await AsyncStorage.getItem('PermissionStatus');
      return value != null ? JSON.parse(value) : null;
    } catch (e) {
      console.log('Error reading status:', e);
    }
  };

  const startForegroundService = () => {
    ReactNativeForegroundService.start({
      id: 144,
      title: 'Location Tracking',
      message: 'Your location is being tracked in the background.',
      icon: 'ic_launcher',
    });

    ReactNativeForegroundService.add_task(() => getLocationPatrol(), {
      delay: 10000,
      onLoop: false,
      taskId: 'getLocationPatrol',
      onError: (e) => console.log('Error in foreground task:', e),
    });
  };

  const getLocationPatrol = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, altitude, speed, accuracy } = position.coords;
        const dateTime = new Date().toLocaleString();
        const newData = {
          dateTime,
          latitude,
          longitude,
          altitude,
          speed,
          accuracy,
        };
        console.log('Location Data:', newData);

        if (accuracy <= 15) {
          // Save data to local DB here
          console.log('Accurate location. Saving data.');
        } else {
          console.log('Low accuracy, data not saved.');
        }
      },
      (error) => console.log('Geolocation error:', error.message),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  const stopForegroundService = () => {
    ReactNativeForegroundService.stop();
    ReactNativeForegroundService.remove_task('getLocationPatrol');
  };

  return <View style={styles.container}></View>;
};

export default AttendanceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
