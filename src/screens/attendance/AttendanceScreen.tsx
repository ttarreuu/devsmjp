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

  useEffect(() => {
    let intervalId = null;

    const fetchDataFromLocalDb = async () => {
      try {
        // Fetch data from the local database (log_tracking)
        const log_data = await getAllLogs(); // Replace this with your local database query logic

        if (log_data && log_data.length > 0) {
          for (const log of log_data) {
            const newData = {
              dateTime: log.dateTime, // Replace with actual field name from local DB
              latitude: log.latitude, // Replace with actual field name
              longitude: log.longitude, // Replace with actual field name
              altitude: log.altitude, // Replace with actual field name
              speed: log.speed, // Replace with actual field name
              accuracy: log.accuracy, // Replace with actual field name
            };

            // Send data to the API
            await sendDataToApi(newData);
            await deleteLogById(log.id);
          }
        }

        // Fetch logs from log_tracking.js for UI updates
        loadLogs();
      } catch (error) {
        console.error("Error fetching data from local database:", error);
      }
    };

    if (isAttendance) {
      // Start fetching data every 1 minute when attendance is active
      intervalId = setInterval(() => {
        fetchDataFromLocalDb();
      }, 60000); // 60000ms = 1 minute
    }

    return () => {
      // Clear the interval when attendance stops or component unmounts
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAttendance]);

  const sendDataToApi = async (newData: {
    dateTime: string;
    latitude: number;
    longitude: number;
    altitude: number;
    speed: number;
    accuracy: number;
  }) => {
    try {
      // Retrieve attendanceID from AsyncStorage
      const AttendanceID = await AsyncStorage.getItem('attendanceID');
      if (!AttendanceID) {
        console.error('AttendanceID not found in AsyncStorage');
        return;
      }

      const logID = await AsyncStorage.getItem('id');
      if (!logID) {
        console.log('id not found in AsyncStorage');
      }

      // Construct the API URL using the attendanceID
      const apiURL = `https://672fc91b66e42ceaf15eb4cc.mockapi.io/Attendance/${AttendanceID}/LogTracking`;

      // Try to fetch existing data for this attendanceID
      const response = await fetch(apiURL + '/' + logID, {
        method: 'GET',
      });

      let existingData;

      if (!response.ok) {
        // If the data does not exist, create a new record with the given logTracking data
        existingData = {
          logTrackingID: logID,
          attendanceID: AttendanceID,
          logTracking: [newData],
        };

        // Post new data to the API
        const postResponse = await fetch(apiURL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(existingData),
        });

        if (postResponse.ok) {
          const createdData = await postResponse.json(); // Parse the response body
          console.log('New data created successfully:', createdData);

          // Get the logTrackingID from the response
          const { logTrackingID } = createdData;
          console.log('Generated logTrackingID:', logTrackingID);
          AsyncStorage.setItem('id', logTrackingID);
        } else {
          console.error('Error creating new data:', postResponse.statusText);
        }

        return;
      }

      // Parse the existing data
      existingData = await response.json();

      // Ensure logTracking is an array
      if (!Array.isArray(existingData.logTracking)) {
        existingData.logTracking = [];
      }

      // Add the new log to the beginning of the array
      existingData.logTracking.unshift(newData);

      // Update the existing data using PUT
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
  
  useEffect(() => {
    loadLogs();
    readStatus();
    checkPermission();
  }, []);

  const readStatus = async () => {
    const status = await AsyncStorage.getItem('status');
    // console.log(status);
    if(status == 'true') {
      setIsAttendance(true);
    } else if(status == 'false') {
      setIsAttendance(false);
    }
    // console.log(status);
  }

  const checkPermission = () => {
    const newCameraPermission = Camera.requestCameraPermission;
    console.log(newCameraPermission);
  };

  const handleSaveLog = async () => {
    // if(isAttendance) {
      try {
        // Get the saved num from AsyncStorage, or use 0 if it's null or undefined
        let num = await AsyncStorage.getItem('num');
        num = num !== null ? parseInt(num) : 0; // Parse to integer or set to 0 if null
  
        // Now use num as your tracking value, and update it as needed in your app logic
        const watchId = Geolocation.watchPosition(
          position => {
            const currentDate = new Date();
            const dateTime = currentDate.toUTCString();
            const { latitude, longitude, altitude, speed, accuracy } = position.coords;
  
            if (accuracy <= 15) {
              saveLog(dateTime, latitude, longitude, altitude, speed, accuracy);
              saveTempLog(dateTime, latitude, longitude, altitude, speed, accuracy);
            }
            
            loadLogs(); 
            
            // After processing each position, you can increment num if needed
            num += 1;
  
            // Save the updated num back to AsyncStorage
            AsyncStorage.setItem('num', num.toString()); // Store the updated num
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
  
        setWatchId(watchId); // Use the watchId in your state
      } catch (error) {
        console.error('Error with AsyncStorage or geolocation:', error);
      }
    // }
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
    if (isAttendance) {
      setEndDateTime(new Date().toISOString());
    } else {
      setStartDateTime(new Date().toISOString());
    }
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
      setIsHide(false);
      setPreviewVisible(false);

      const attendanceID = await AsyncStorage.getItem('attendanceID');
      const endpoint = isAttendance
        ? `https://672fc91b66e42ceaf15eb4cc.mockapi.io/Attendance/${attendanceID}`
        : 'https://672fc91b66e42ceaf15eb4cc.mockapi.io/Attendance';
      const method = isAttendance ? 'PUT' : 'POST';
      const body = isAttendance
        ? { endDateTime, endPicture }
        : { startDateTime, startPicture };

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        if (!isAttendance) {
          const data = await response.json();
          AsyncStorage.setItem('attendanceID', data.attendanceID.toString());
          setIsAttendance(true);
          handleSaveLog(); 
          AsyncStorage.setItem('startPic', startPicture);
          AsyncStorage.setItem('startDate', startDateTime);
          AsyncStorage.setItem('status', 'true');
        } else {
          setIsAttendance(false);
          AsyncStorage.setItem('status', 'false');
          AsyncStorage.removeItem('attendanceID');
          AsyncStorage.removeItem('logID');
          deleteAllTempLogs();
          deleteAllLogs();
          stopWatching(); // Make sure to stop it properly when attendance is finished
        }
      }
    } catch (error) {
      console.error('Error starting background task:', error);
    }
  };

  const stopWatching = () => {
    if (watchId !== null) {
      Geolocation.clearWatch(watchId);  // Clear the watch
      setWatchId(null);  // Reset watchId to null
      AsyncStorage.removeItem('num'); // Remove the num tracking
      setIsAttendance(false); // Set isAttendance to false
      AsyncStorage.setItem('status', 'false'); // Update AsyncStorage status
    }
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
