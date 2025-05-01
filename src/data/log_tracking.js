import AsyncStorage from '@react-native-async-storage/async-storage';
import { realmInstance } from './realm_config';  

export const addLogTracking = async (logTrackingData) => {
  try {
    const attendanceID = await AsyncStorage.getItem('attendanceID');
    if (!attendanceID) {
      throw new Error('Attendance ID not found in AsyncStorage');
    }

    const log = realmInstance.objects('Log').filtered('attendanceID == $0', attendanceID)[0];
    if (!log) {
      throw new Error('Log not found for the given attendanceID');
    }

    realmInstance.write(() => {
      log.LogTracking.push(logTrackingData);
    });

    console.log('LogTracking data added successfully');
  } catch (error) {
    console.error('Error adding LogTracking data:', error);
  }
};

export const addLogTrackingTemp = async (logTrackingTempData) => {
  try {
    const attendanceID = await AsyncStorage.getItem('attendanceID');
    if (!attendanceID) {
      throw new Error('Attendance ID not found in AsyncStorage');
    }

    const log = realmInstance.objects('Log').filtered('attendanceID == $0', attendanceID)[0];
    if (!log) {
      throw new Error('Log not found for the given attendanceID');
    }

    realmInstance.write(() => {
      log.LogTrackingTemp.push(logTrackingTempData);
    });

    console.log('LogTrackingTemp data added successfully');
  } catch (error) {
    console.error('Error adding LogTrackingTemp data:', error);
  }
};

export const getOldestLogTrackingTempAndStoreToAPI = async () => {
  try {
    const attendanceID = await AsyncStorage.getItem('attendanceID');
    if (!attendanceID) {
      throw new Error('Attendance ID not found in AsyncStorage');
    }

    const log = realmInstance.objects('Log').filtered('attendanceID == $0', attendanceID)[0];
    if (!log) {
      throw new Error('Log not found for the given attendanceID');
    }

    if (log.LogTrackingTemp.length === 0) {
      console.log('No LogTrackingTemp data available');
      return;
    }

    const oldestData = log.LogTrackingTemp.sorted('dateTime')[0];
    console.log('Oldest LogTrackingTemp:', oldestData);

    const response = await fetch('https://your-api-endpoint.com/your-api-route', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateTime: oldestData.dateTime,
        latitude: oldestData.latitude,
        longitude: oldestData.longitude,
        altitude: oldestData.altitude,
        speed: oldestData.speed,
        accuracy: oldestData.accuracy,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send data to API');
    }

    realmInstance.write(() => {
      const index = log.LogTrackingTemp.indexOf(oldestData);
      if (index !== -1) {
        log.LogTrackingTemp.splice(index, 1); 
      }
    });

    console.log('Oldest data sent to API and removed from LogTrackingTemp');
  } catch (error) {
    console.error('Error retrieving and sending LogTrackingTemp data:', error);
  }
};
