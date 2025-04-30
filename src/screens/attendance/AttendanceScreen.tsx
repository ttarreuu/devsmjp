import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera, useCameraDevice, useCameraDevices } from 'react-native-vision-camera';
import ImageResizer from 'react-native-image-resizer';
import RNFS from "react-native-fs";
import NetInfo from "@react-native-community/netinfo";
import realmInstance from '../../data/realmConfig';
import { handleClockIn, handleClockOut, syncRealmToApi } from '../../data/handle_log';

const AttendanceScreen = () => {
  
  const [imageData, setImageData] = useState('');
  const [isHide, setIsHide] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [isAttendance, setIsAttendance] = useState(Boolean);

  const [startPic, setStartPic] = useState('');
  const [endPic, setEndPic] = useState('');
  
  useEffect(() => {
    readStatus();
    checkPermission();

    const interval = setInterval(() => {
      syncRealmToApi();
    }, 10000); // every 10 seconds

    return () => clearInterval(interval);

  }, []);

  const readStatus = async () => {
    const status = await AsyncStorage.getItem('status');
    if(status == 'true') {
      setIsAttendance(true);
    } else if(status == 'false') {
      setIsAttendance(false);
    }
  };

  const checkInternetConnection = async () => {
    return await NetInfo.fetch().then(
      (state: {isConnected: any}) => state.isConnected,
    );
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
          setStartPic(base64Image);
        } else {
          setEndPic(base64Image);
        }
      } catch (err) {
        console.log(err);
      }

      setCameraVisible(false);
      setPreviewVisible(true);
      
    }
  };

  const getUserIDFromRealm = () => {
    const user = realmInstance.objects('User')[0];
    return user?.userID || null;
  };
  
  const handleConfirm = async () => {
    try {
      const now = new Date().toISOString();
      if (isAttendance) {
        await handleClockOut(now, endPic);
        setIsAttendance(false);
        await AsyncStorage.setItem('status', 'false');
      } else {
        await handleClockIn(now, startPic);
        setIsAttendance(true);
        await AsyncStorage.setItem('status', 'true');
      }

      setIsHide(false);
      setPreviewVisible(false);
    } catch (error) {
      console.error('Error handling confirm:', error);
    }
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
          style={[styles.button]} 
          onPress={toggleTracking}
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
    fontFamily: 'Poppins-Bold',
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
