import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { startBackgroundJob, stopBackgroundJob } from '../../utils/background_task';
import { Camera, useCameraDevice, useCameraDevices } from 'react-native-vision-camera';

const AttendanceScreen = () => {
  const [playing, setPlaying] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [imageData, setImageData] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const devices = useCameraDevices();
  const device = useCameraDevice('back'); // Get the back camera device
  const camera = useRef<Camera>(null);

  useEffect(() => {
    const getBackgroundStatus = async () => {
      try {
        const status = await AsyncStorage.getItem('backgroundTaskStatus');
        if (status !== null) {
          setPlaying(status === 'true');
        }
      } catch (error) {
        console.error('Error retrieving background task status:', error);
      }
    };

    getBackgroundStatus();
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const cameraPermission = await Camera.requestCameraPermission();
    if (cameraPermission !== 'granted') {
      console.error('Camera permission is not granted!');
    } else {
      console.log('Camera permission granted');
    }
  };

  const toggleBackground = async () => {
    // const newStatus = !playing;
    try {
      if (!playing) {
        setCameraActive(true);
        // await startBackgroundJob();
        // await AsyncStorage.setItem('backgroundTaskStatus', 'true');
      } else {
        await stopBackgroundJob();
        await AsyncStorage.setItem('backgroundTaskStatus', 'false');
        setCameraActive(false);
        setPreviewVisible(false);
        setConfirmVisible(false);
        setPlaying(false);
      }

    } catch (error) {
      console.error('Error toggling background task:', error);
    }
  };

  const takePicture = async () => {
    if (camera.current) {
      const photo = await camera.current.takePhoto();
      setImageData(photo.path);
      setCameraActive(false); // Deactivate the camera
      setPreviewVisible(true); // Show photo preview
      setConfirmVisible(false);
    }
  };

  const handleConfirm = async () => {
    await startBackgroundJob();
    await AsyncStorage.setItem('backgroundTaskStatus', 'true');
    setCameraActive(false); // Hide camera after confirmation
    setPreviewVisible(false);
    setConfirmVisible(false); // Hide confirm button
    setPlaying(true);
  };

  // const startPhotoTaking = () => {
  //   setCameraActive(true); // Activate the camera
  //   setPhotoTakingMode(true); // Enter photo-taking mode
  // };

  if (cameraActive && device == null) {
    return (
      <View style={styles.body}>
        <Text>Loading Camera...</Text>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {!cameraActive && (
        <TouchableOpacity style={styles.button} onPress={toggleBackground}>
          <Text style={styles.buttonText}>
            {playing ? 'Stop Background Task' : 'Start Background Task'}
          </Text>
        </TouchableOpacity>
      )}

      {cameraActive && device ? (
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
