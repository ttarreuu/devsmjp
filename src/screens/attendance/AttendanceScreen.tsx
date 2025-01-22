import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import Geolocation from 'react-native-geolocation-service'; 
import { saveLog, getAllLogs, deleteAllLogs } from '../../data/log_tracking';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AttendanceScreen = () => {
  const [logs, setLogs] = useState([]);
  const [trackingStatus, setTrackingStatus] = useState(false);
  const [watchId, setWatchId] = useState(null);

  
  
  useEffect(() => {
    loadLogs();
    readStatus();
  }, []);

  const readStatus = async () => {
    const status = await AsyncStorage.getItem('status');
    if(status == 'true') {
      setTrackingStatus(true);
    } else if(status == 'false') {
      setTrackingStatus(false);
    }
  }

  const handleSaveLog = () => {
    const num = Geolocation.watchPosition(
      position => {
        const currentDate = new Date();
        const dateTime = currentDate.toUTCString();
        const { latitude, longitude, altitude, speed, accuracy } = position.coords;
        
        if(accuracy <= 15) {
          saveLog(dateTime, latitude, longitude, altitude, speed, accuracy);
        }
        loadLogs(); 
      },
      error => {
        console.error('Error getting location:', error);
      },
      { 
        enableHighAccuracy: true,
        interval: 10000, 
        fastestInterval: 10000,
        forceRequestLocation: true,
        distanceFilter: 0
      }
    );
    setWatchId(num);
    setTrackingStatus(true);
    AsyncStorage.setItem('status', 'true');
  };

  const loadLogs = () => {
    const data = getAllLogs();
    setLogs(data);
  };

  const handleDeleteAllLogs = () => {
    deleteAllLogs();
    loadLogs();
  };

    const toggleTracking = () => {
    if (trackingStatus) {
      stopWatching();
      setTrackingStatus(false);
      AsyncStorage.setItem('status', 'false');
    } else {
      handleSaveLog();
      setTrackingStatus(true);
      AsyncStorage.setItem('status', 'true');
    }
  };

  const stopWatching = () => {
    if (watchId !== null) {
      Geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    console.log(isAttendance);
  };


  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Button title={trackingStatus ? "Stop Tracking" : "Start Tracking"} onPress={toggleTracking} />
      <FlatList
        data={logs}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 10 }}>
            <Text>ID: {item.id}</Text>
            <Text>Latitude: {item.latitude}</Text>
            <Text>Longitude: {item.longitude}</Text>
            <Text>DateTime: {item.dateTime.toString()}</Text>
          </View>
        )}
      />
      <Button title="Delete All Logs" onPress={handleDeleteAllLogs} />
    </View>
  );
};

export default AttendanceScreen;
