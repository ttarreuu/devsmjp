import React, { useEffect } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform, Linking } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeForegroundService from '@supersami/rn-foreground-service';

const AttendanceScreen = () => {
  useEffect(() => {
    const initialize = async () => {
      await requestPermissions();
      initializedLocation();
    };

    initialize();

    // Cleanup on unmount
    return () => {
      stopForegroundService();
    };
  }, []);

  /**
   * Requests location permissions in stages: fine location first, then background location.
   * Redirects to app settings if background permission is denied.
   */
  const requestPermissions = async () => {
    try {
      // For Android 10+ (API 29+), background location permissions are handled separately
      const fineLocationGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Fine Location Permission',
          message:
            'This app requires access to your location to track your attendance.',
          buttonPositive: 'OK',
        }
      );

      if (fineLocationGranted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Fine location permission granted.');

        if (Number(Platform.Version) >= 29) {
          const backgroundLocationGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
            {
              title: 'Background Location Permission',
              message:
                'This app requires access to your location in the background to track your attendance accurately.',
              buttonPositive: 'OK',
            }
          );

          if (backgroundLocationGranted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Background location permission granted.');
            await AsyncStorage.setItem('PermissionStatus', JSON.stringify(true));
          } else {
            console.log('Background location permission denied.');
            await AsyncStorage.setItem('PermissionStatus', JSON.stringify(false));
            alert(
              'Background location permission is required. Please enable it in app settings.'
            );
            openAppSettings(); // Redirect user to app settings if permission is denied
          }
        } else {
          await AsyncStorage.setItem('PermissionStatus', JSON.stringify(true));
        }
      } else {
        console.log('Fine location permission denied.');
        await AsyncStorage.setItem('PermissionStatus', JSON.stringify(false));
        alert('Location permission is required to use this feature.');
      }
    } catch (err) {
      console.warn('Permission request error:', err);
    }
  };

  /**
   * Opens app settings for the user to manually enable permissions if denied.
   */
  const openAppSettings = () => {
    Linking.openSettings().catch(() => {
      console.warn('Unable to open app settings');
    });
  };

  /**
   * Initializes the location tracking process if permissions are granted.
   */
  const initializedLocation = async () => {
    try {
      const status = await readStatus();
      console.log('Permission Status:', status);
      if (status === true) {
        startForegroundService();
      }
    } catch (err) {
      console.warn('Initialization error:', err);
    }
  };

  /**
   * Reads the permission status from AsyncStorage.
   */
  const readStatus = async () => {
    try {
      const value = await AsyncStorage.getItem('PermissionStatus');
      return value != null ? JSON.parse(value) : null;
    } catch (e) {
      console.log('Error reading status:', e);
    }
  };

  /**
   * Starts the foreground service for location tracking.
   */
  const startForegroundService = () => {
    ReactNativeForegroundService.start({
      id: 144,
      title: 'Location Tracking',
      message: 'Your location is being tracked in the background.',
      icon: 'ic_notification', // Ensure this icon exists in res/drawable
    });

    ReactNativeForegroundService.add_task(() => getLocationPatrol(), {
      onLoop: false,
      taskId: 'getLocationPatrol',
      onError: (e) => console.log('Error in foreground task:', e),
    });
  };

  /**
   * Stops the foreground service for location tracking.
   */
  const stopForegroundService = () => {
    ReactNativeForegroundService.stop();
    ReactNativeForegroundService.remove_task('getLocationPatrol');
  };

  /**
   * Retrieves the user's current location and processes it.
   */
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
function alert(arg0: string) {
  throw new Error('Function not implemented.');
}

