import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeForegroundService from "@supersami/rn-foreground-service";

const AttendanceScreen = () => {

  useEffect(() => {
    readStatus();
  }, []);

  const readStatus = async () => {
    try {
      const value = await AsyncStorage.getItem('PermissionStatus');
      return value;
    }catch (e) {
      console.log('data not found!');
    }
  };

  const startForegroundService = () => {
    if (readTracking() == true){
      
    }

    ReactNativeForegroundService.start({
      id: 1244,
      title: 'Location Tracking',
      message: 'Location Tracking',
      icon: 'ic_launcher',  
      button: false,
      button2: false,
      color: '#000000',
    });
 
    ReactNativeForegroundService.add_task(() => getCurrentLocation(),  {
      onLoop: false,
      taskId: "getLocation",
      onError: (e) => console.log(`Error logging:`, e),
    });
  };

  const getCurrentLocation = () => {
    // const numberOfSatellites = SatelliteModule.getSatelliteCount();
    Geolocation.watchPosition(
      position => {
        if (position.mocked === false) {
          const currentDate = new Date();
          const dateTime = currentDate.toLocaleString();
          console.log(dateTime);
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const altitude = position.coords.altitude;
          const speed = position.coords.speed;
          const accuracy = position.coords.accuracy;
          const newData = {
            dateTime,
            latitude,
            longitude,
            altitude,
            speed,
            accuracy,
            // numberOfSatellites,
          };
          
          console.log(newData);
          
          if (accuracy <= 15) {
            // sendDataToLocalDB(newData);
          }
          // setUserLocation([longitude, latitude]); 
        } else {
          const currentDate = new Date();
          const dateTime = currentDate.toLocaleString();
          console.log(dateTime);
          const latitude = 0;
          const longitude = 0;
          const altitude = 0;
          const speed = 0;
          const accuracy = 0;
          // const numberOfSatellites = 0;
          const newData = {
            dateTime,
            latitude,
            longitude,
            altitude,
            speed,
            accuracy,
            // numberOfSatellites,
          };

          console.log(dateTime);
          console.log("Fake GPS Detected");
          // sendDataToLocalDB(newData);
          // setModalVisible(true);
        }
      },
      error => {
        console.log(error.code, error.message);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 0,
        interval: 10000,
        fastestInterval: 10000,
        forceRequestLocation: true,
      }
    );
  };


  
  const updateTrackingStatus = async (val) => {
    try {
      await AsyncStorage.setItem('TrackingStatus', val);
    } catch (e) {
      console.log('saving error!')
    }
  };

  const readTracking = async () => {
    try {
      const value = await AsyncStorage.getItem('TrackingStatus');
      if(value == "true"){
        setIsServiceRunning(true);
      }
    }catch (e) {
      console.log('data not found!');
    }
  };

  const stopForegroundService = () => {
    ReactNativeForegroundService.stop();
    ReactNativeForegroundService.remove_task("getLocation");
    // ReactNativeForegroundService.remove_task("syncWithAPI");
  };

  const toggleTracking = () => {
    if (isServiceRunning == true ) {
      setIsServiceRunning(false);
      stopForegroundService();
    } else {
      setIsServiceRunning(true);
      startForegroundService();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.circleButton}
        onPress={toggleTracking}
      >
        <Text style={styles.buttonText}>
          {isServiceRunning ? 'Stop' : 'Start'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AttendanceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
  circleButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // For shadow on Android
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});