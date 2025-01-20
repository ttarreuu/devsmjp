import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Camera, useCameraDevice, useCameraDevices } from "react-native-vision-camera";
import { startBackgroundJob, stopBackgroundJob } from "../../utils/background_task";
import ImageResizer from "react-native-image-resizer";
import RNFS from "react-native-fs";


const AttendanceScreen = () => {

  const [imageData, setImageData] = useState('');
  const [isHide, setIsHide] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [isAttendance, setIsAttendance] = useState(Boolean);
 
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [startPicture, setStartPicture] = useState('');
  const [endPicture, setEndPicture] = useState('');

  useEffect  (() => {
    getBackgroundStatus();
    checkPermission();
  }, []);
    
  const getBackgroundStatus = async () => {
    console.log(isAttendance);
    const status = await AsyncStorage.getItem('backgroundTaskStatus');
    if(status == 'true') {
      setIsAttendance(true);
    } else {
      setIsAttendance(false);
    }
    console.log(isAttendance);
  };

  const checkPermission = () => {
    const newCameraPermission = Camera.requestCameraPermission;
    console.log(newCameraPermission);
  };

  const toggleAttendance = () => {
    console.log(isAttendance);
    try {
      if (!isAttendance) {
        setStartDateTime(new Date().toISOString());
      } else {
        setEndDateTime(new Date().toISOString());
      }
    } catch (err) {
      console.log(err)
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
        console.log(err)
      }

      setCameraVisible(false);
      setPreviewVisible(true);

      // convert to base 64 format
    }
  };
      
  const handleConfirm = async () => {
    try {
      setIsHide(false);
      setPreviewVisible(false);

      
      // const startDateTime = AsyncStorage.getItem('startDT');
      // const endDateTime = AsyncStorage.getItem('endDT');
      
      
      // const startPicture = AsyncStorage.getItem('startPic');
      // const endPicture = AsyncStorage.getItem('endPic');
      
      
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

        if (!isAttendance) {
          const data = await response.json();
          await AsyncStorage.setItem('attendanceID', data.attendanceID.toString());
          await AsyncStorage.setItem('backgroundTaskStatus', 'true');
          setIsAttendance(true);
          startBackgroundJob(); 
        } else {
          await stopBackgroundJob(); 
          await AsyncStorage.setItem('backgroundTaskStatus', 'false');
          await AsyncStorage.removeItem('attendanceID');
          setIsAttendance(false);
        }
      
    } catch (error) {
      console.error('Error starting background task:', error);
    }
    console.log(isAttendance);
  };

  const devices = useCameraDevices();
  const device = useCameraDevice('back');
  const camera = useRef<Camera>(null)

  if(device == null) {      
    return <ActivityIndicator/>
  }

  return (
    <View style={{flex:1}}>
      {!isHide && !cameraVisible && !previewVisible && (
        <TouchableOpacity style={styles.button} onPress={toggleAttendance}>
          <Text style={styles.buttonText}>
            {isAttendance ? 'Stop Background Task' : 'Start Background Task'}
          </Text>
        </TouchableOpacity>
      )}
      {isHide && cameraVisible &&!previewVisible && device ? (
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