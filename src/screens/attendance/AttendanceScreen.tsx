import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Button, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Geolocation from 'react-native-geolocation-service'; 
import { saveLog, getAllLogs, deleteAllLogs, deleteLogById } from '../../data/log_tracking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera, useCameraDevice, useCameraDevices } from 'react-native-vision-camera';
import ImageResizer from 'react-native-image-resizer';
import RNFS from "react-native-fs";
import { saveTempLog, deleteAllTempLogs } from '../../data/log_tracking_temp';

const AttendanceScreen = () => {
  const [logs, setLogs] = useState([]);
  const [watchId, setWatchId] = useState(null);
  
  const [imageData, setImageData] = useState('');
  const [isHide, setIsHide] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [isAttendance, setIsAttendance] = useState(Boolean);
  
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [startPicture, setStartPicture] = useState('');
  const [endPicture, setEndPicture] = useState('');

  const intervalRef = useRef<NodeJS.Timer | null>(null);
  
  useEffect(() => {
    loadLogs();
    readStatus();
    checkPermission();
  }, []);
  
  const loadLogs = () => {
    const data = getAllLogs();
    setLogs(data);
  };
  
  const readStatus = async () => {
    const status = await AsyncStorage.getItem('status');
    if(status == 'true') {
      setIsAttendance(true);
    } else if(status == 'false') {
      setIsAttendance(false);
    }
  };
  
  const checkPermission = () => {
    const newCameraPermission = Camera.requestCameraPermission;
    console.log(newCameraPermission);
  };
  
  const toggleTracking = () => {
    // if (isAttendance) {
    //   setEndDateTime(new Date().toISOString());
    // } else {
    //   setStartDateTime(new Date().toISOString());
    // }
    setIsHide(true);
    setCameraVisible(true);
  };
  
  const takePicture = async () => {
    if(camera.current) {
      const photo = await camera.current.takePhoto();
      setImageData(photo.path);

      const compressedImage = await ImageResizer.createResizedImage(
        photo.path,
        800,
        600,
        'JPEG',
        50,
        0
      );

      const base64Image = await RNFS.readFile(compressedImage.uri, 'base64');

      try {
        if (!isAttendance) {
          setStartPicture(base64Image);
        } else {
          setEndPicture(base64Image);
        }
      } catch (err) {
        console.log(err);
      }

      setCameraVisible(false);
      setPreviewVisible(true);
      
    }
  };
  
  const handleConfirm = async () => {
    try {
      const currentDateTime = new Date().toISOString(); // Get current timestamp

      if (isAttendance) {
        setEndDateTime(currentDateTime); // Set end time when stopping
      } else {
        setStartDateTime(currentDateTime); // Set start time when starting
      }

      const attendanceID = await AsyncStorage.getItem('attendanceID');
      const endpoint = isAttendance
        ? `https://672fc91b66e42ceaf15eb4cc.mockapi.io/Attendance/${attendanceID}`
        : 'https://672fc91b66e42ceaf15eb4cc.mockapi.io/Attendance';
      const method = isAttendance ? 'PUT' : 'POST';
      const body = isAttendance
        ? { endDateTime: currentDateTime, endPicture }
        : { startDateTime: currentDateTime, startPicture };

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        if (!isAttendance) {
          const data = await response.json();
          AsyncStorage.setItem('attendanceID', data.attendanceID.toString());
          startWatching();
        } else {
          stopWatching();
          AsyncStorage.removeItem('attendanceID');
          AsyncStorage.removeItem('logID');
        }
      }

      setIsHide(false);
      setPreviewVisible(false);
    } catch (error) {
      console.error('Error starting background task:', error);
    }
  };


  const startWatching = async () => {

    setIsAttendance(true);
    AsyncStorage.setItem('status', 'true');

    try {
      
      Geolocation.watchPosition(
        position => {
          const currentDate = new Date();
          const dateTime = currentDate.toUTCString();
          const { latitude, longitude, altitude, speed, accuracy } = position.coords;
  
          if (accuracy <= 15) {
            saveLog(dateTime, latitude, longitude, altitude, speed, accuracy);
            saveTempLog(dateTime, latitude, longitude, altitude, speed, accuracy);
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

      intervalRef.current = setInterval(() => {
        pushLogsToApi();
      }, 60000);
      
    } catch (error) {
      console.error('Error with AsyncStorage or geolocation:', error);
    }
  };

  const pushLogsToApi = async () => {
    try {
      const logData = await getAllLogs();
      if (logData && logData.length > 0) {
        for (const log of logData) {
          const newData = {
            dateTime: log.dateTime,
            latitude: log.latitude,
            longitude: log.longitude,
            altitude: log.altitude,
            speed: log.speed,
            accuracy: log.accuracy,
          };

          await sendDataToApi(newData);
          await deleteLogById(log.id);

        }
        loadLogs(); 
      }
    } catch (error) {
      console.error('Error pushing logs to API:', error);
    }
  };
  
  const sendDataToApi = async (newData: {
    dateTime: string;
    latitude: number;
    longitude: number;
    altitude: number;
    speed: number;
    accuracy: number;
  }) => {
    try {
      const AttendanceID = await AsyncStorage.getItem('attendanceID');
      if (!AttendanceID) {
        console.error('AttendanceID not found in AsyncStorage');
        return;
      }

      const logID = await AsyncStorage.getItem('id');
      if (!logID) {
        console.log('id not found in AsyncStorage');
      }

      const apiURL = `https://672fc91b66e42ceaf15eb4cc.mockapi.io/Attendance/${AttendanceID}/LogTracking`;

      const response = await fetch(apiURL + '/' + logID, {
        method: 'GET',
      });

      let existingData;

      if (!response.ok) {
        existingData = {
          logTrackingID: logID,
          attendanceID: AttendanceID,
          logTracking: [newData],
        };

        const postResponse = await fetch(apiURL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(existingData),
        });

        if (postResponse.ok) {
          const createdData = await postResponse.json(); 
          console.log('New data created successfully:', createdData);

          const { logTrackingID } = createdData;
          console.log('Generated logTrackingID:', logTrackingID);
          AsyncStorage.setItem('id', logTrackingID);
        } else {
          console.error('Error creating new data:', postResponse.statusText);
        }

        return;
      }

      existingData = await response.json();

      if (!Array.isArray(existingData.logTracking)) {
        existingData.logTracking = [];
      }

      existingData.logTracking.unshift(newData);

      await fetch(apiURL + '/' + logID, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(existingData),
      });
      
      console.log('Data updated successfully');
    } catch (error) {
      console.error('Error sending data to API:', error);
    }
  };
  
  const stopWatching = () => {
    handleDeleteAllLogs();
    deleteAllTempLogs();
    
    Geolocation.stopObserving(); 
    if (intervalRef.current) {
      clearInterval(intervalRef.current); 
      intervalRef.current = null;
    }

    setWatchId(null);
    setIsAttendance(false);
    AsyncStorage.setItem('status', 'false');
  };
  
  const handleDeleteAllLogs = () => {
    deleteAllLogs();
    loadLogs();
  };

  const devices = useCameraDevices();
  const device = useCameraDevice('back');
  const camera = useRef<Camera>(null);

  if(device == null) {
    return <ActivityIndicator/>;
  }

  return (
    <View style={{flex:1}}>
      {!isHide && !cameraVisible && !previewVisible && (
        <TouchableOpacity style={styles.button} onPress={toggleTracking}>
          <Text style={styles.buttonText}>
            {isAttendance ? 'Stop Background Task' : 'Start Background Task'}
          </Text>
        </TouchableOpacity>
      )}
      {isHide && cameraVisible && !previewVisible && device ? (
        <View style={{ flex: 1 }}>
          <Camera
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
            photo
          />
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
          />
        </View>
      ) : (
        <View style={styles.body}>
          {previewVisible && imageData !== '' && (
            <>
              <Image
                source={{ uri: 'file://' + imageData }}
                style={styles.imagePreview}
              />
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
              >
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  body: {
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    height: 50,
    width: 200,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 20,
  },
  confirmButton: {
    height: 50,
    width: 200,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagePreview: {
    width: '90%',
    height: 200,
    marginBottom: 20,
  },
  captureButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
});

export default AttendanceScreen;
