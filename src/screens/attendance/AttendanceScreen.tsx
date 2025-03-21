import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Geolocation from 'react-native-geolocation-service'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera, useCameraDevice, useCameraDevices } from 'react-native-vision-camera';
import ImageResizer from 'react-native-image-resizer';
import RNFS from "react-native-fs";
import { sendDataTrackingToApi, sendDataPatrolToApi } from '../../data/sendDataToApi';
import RNSecureStorage, { ACCESSIBLE } from 'rn-secure-storage';
import uuid from 'react-native-uuid';
import NetInfo from "@react-native-community/netinfo";

import { saveTempLog, deleteAllTempLogs } from '../../data/log_tracking_temp';
import { saveLog, getAllLogs, deleteAllLogs, deleteLogById } from '../../data/log_tracking';


import { deleteAllTempPatrolLogs } from '../../data/log_patrol_temp';
import { getAllLogsPatrol, deleteAllLogsPatrol, deleteLogPatrolById } from '../../data/log_patrol';
import { fetchData } from '../../data/checkpoint_data';
import realmInstance from '../../data/realmConfig';

const AttendanceScreen = () => {
  const [logs, setLogs] = useState([]);
  const [logsPatrol, setLogsPatrol] = useState([]);
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
  const [isConnected, setIsConnected] = useState(false);

  const intervalRef = useRef<NodeJS.Timer | null>(null);
  
  useEffect(() => {
    loadLogs();
    readStatus();
    checkPermission();

    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  const checkInternetConnection = async () => {
    return await NetInfo.fetch().then((state: { isConnected: any; }) => state.isConnected);
  };
  
  const loadLogs = () => {
    const data = getAllLogs();
    const dataPatrol = getAllLogsPatrol();
    setLogs(data);
    setLogsPatrol(dataPatrol);
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
      const currentDateTime = new Date().toISOString();

      if (isAttendance) {
        setEndDateTime(currentDateTime); 
      } else {
        setStartDateTime(currentDateTime); 
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

          fetchData();
        } else {
          // encryptAndStoreLogs();
          // saveLogsToStorage();

          realmInstance.write(() => {
            const allLogs = realmInstance.objects('Checkpoint');
            realmInstance.delete(allLogs);
          });

          await pushLogsToApi();

          stopWatching();
          AsyncStorage.removeItem('attendanceID');
          AsyncStorage.removeItem('logID');

          const key = uuid.v4();
          console.log(key);
          await RNSecureStorage.setItem('encryptKey', key, {accessible: ACCESSIBLE.WHEN_UNLOCKED});

          const print = await RNSecureStorage.getItem('encryptKey');
          console.log(print);
          
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
  
          if (accuracy < 15) {
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

      intervalRef.current = setInterval(async () => {
        if(await checkInternetConnection()) {
          pushLogsToApi();
        }
      }, 60000);
      
    } catch (error) {
      console.error('Error with AsyncStorage or geolocation:', error);
    }
  };

  const pushLogsToApi = async () => {
    try {
      const logTrackingData = getAllLogs();
      if (logTrackingData && logTrackingData.length > 0) {
        for (const log of logTrackingData) {
          const newDataTracking = {
            dateTime: log.dateTime,
            latitude: log.latitude,
            longitude: log.longitude,
            altitude: log.altitude,
            speed: log.speed,
            accuracy: log.accuracy,
          };

          await sendDataTrackingToApi(newDataTracking);
          deleteLogById(log.id);
        }
        loadLogs(); 
      }

      const logPatrolData = getAllLogsPatrol()
      if (logPatrolData && logPatrolData.length > 0) {
        for (const log of logPatrolData) {
          const newDataPatrol = {
            dateTime: log.dateTime,
            picture: log.picture,
            situationType: log.situationType,
            description: log.description,
            checkpointID: log.checkpointID,
            method: log.method
          };

          await sendDataPatrolToApi(newDataPatrol);
          deleteLogPatrolById(log.id);
        }
      }

    } catch (error) {
      console.error('Error pushing logs to API:', error);
    }
  };
  
  const stopWatching = async () => {
    handleDeleteAllLogs();
    deleteAllTempLogs();
    deleteAllTempPatrolLogs();
    
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
    deleteAllLogsPatrol();
    loadLogs();
  };

  const devices = useCameraDevices();
  const device = useCameraDevice('front');
  const camera = useRef<Camera>(null);

  if(device == null) {
    return <ActivityIndicator/>;
  }

  return (
    <View style={{flex:1}}>
      {!isHide && !cameraVisible && !previewVisible && (
        <TouchableOpacity 
          style={[styles.button, !isConnected && { opacity: 0.5 }]} 
          onPress={toggleTracking} 
          disabled={!isConnected}
          >
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
        <View style={styles.contentPreview}>
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
    backgroundColor: 'transparent',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  button: {
    width: 150,  
    height: 150, 
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 75, 
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -75 }], 
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
    confirmButton: {
        height: 50,
        width: 200,
        backgroundColor: 'green',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        position: 'absolute',
        bottom: -20,
        alignSelf: 'center',
        marginTop: 20
    },
    contentPreview: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginVertical: 40,
        marginBottom: 100,
        height: '80%',
        width: '100%',
    },
    imagePreview: {
        width: '85%',
        height: '75%',
        marginTop: 60,
        borderRadius: 10,
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
