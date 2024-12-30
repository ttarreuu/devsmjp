import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Camera, useCameraDevice, useCameraDevices } from "react-native-vision-camera";
import { startBackgroundJob, stopBackgroundJob } from "../../utils/background_task";
import React from "react";


const AttendanceScreen = () => {

  const [isAttendance, setIsAttendance] = useState(false);
  const [imageData, setImageData] = useState('');
  const [isDisable, setIsDisable] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect  (() => {
    getBackgroundStatus();
    checkPermission();
  }, []);
    
  const getBackgroundStatus = async () => {
    const status = await AsyncStorage.getItem('backgroundTaskStatus');
    if(status !== null) {
      setIsAttendance(true);
    }
  };

  const checkPermission = async () => {
    const newCameraPermission = await Camera.requestCameraPermission;
    console.log(newCameraPermission);
  };

  const toggleAttendance = () => {
    try {
      if (!isAttendance) {
        attendanceBegin();
      } else {
        attendanceEnd();
      }
    } catch (err) {
      console.log(err)
    }
  };

  const attendanceBegin = () => {
    setIsDisable(true);
  };

  const attendanceEnd = async () => {
    setIsDisable(true);
  };
      
  const takePicture = async () => {
    if(camera.current) {
      const photo = await camera.current.takePhoto();
      setImageData(photo.path);
      setPreviewVisible(true);
    }
  };
      
  const handleConfirm = async () => {
    try {
      setPreviewVisible(false);
      setIsDisable(false);
      if (isAttendance == true) {
        await stopBackgroundJob();
        await AsyncStorage.setItem('backgroundTaskStatus', 'false');
        setIsAttendance(false)
      } else {
        await startBackgroundJob();
        await AsyncStorage.setItem('backgroundTaskStatus', 'true');
        setIsAttendance(true);
      }
    } catch (error) {
      console.error('Error starting background task:', error);
    }
  };

  const devices = useCameraDevices();
  const device = useCameraDevice('back');
  const camera = useRef<Camera>(null)

  if(isDisable && device == null) {      
    return <ActivityIndicator/>
  }

  return (
    <View style={{flex:1}}>
      {!isDisable && (
        <TouchableOpacity style={styles.button} onPress={toggleAttendance}>
          <Text style={styles.buttonText}>
            {isAttendance ? 'Stop Background Task' : 'Start Background Task'}
          </Text>
        </TouchableOpacity>
      )}
      {!previewVisible && isDisable && device ? (
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
  }
});

export default AttendanceScreen;