import React, { useEffect } from 'react';
import { View, Text, StyleSheet, PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AttendanceScreen = () => {

  useEffect(() => {
    readStatus();
  });

  const readStatus = async () => {
    try {
      const value = await AsyncStorage.getItem('PermissionStatus');
      if(value == "granted"){
        getLocation();
      }
    }catch (e) {
      console.log('data not found!');
    }
  }

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const long = position.coords.longitude;
        console.log(lat, long);
      },
      error => {
          console.log(error.code, error.message);
      },
      {
          enableHighAccuracy: true,  
      }
    );
  };


  return (
    <View style={styles.container}>
      <Text style={styles.text}>Attendance Screen</Text>
    </View>
  )
}

export default AttendanceScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  text: { 
    fontSize: 24 
  },
});
