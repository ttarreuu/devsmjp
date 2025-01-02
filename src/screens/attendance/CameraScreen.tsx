import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Camera, useCameraDevice, useCameraDevices } from "react-native-vision-camera";
import { startBackgroundJob, stopBackgroundJob } from "../../utils/background_task";
import RNFS from 'react-native-fs'; 
import ImageResizer from "react-native-image-resizer";

const CameraScreen = () => {
  const [imageData, setImageData] = useState('');
  const [isDisable, setIsDisable] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [startPicture, setStartPicture] = useState('');
  const [endPicture, setEndPicture] = useState('');
  const [isAttendance, setIsAttendance] = useState(false);

  const camera = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = useCameraDevice('back');

  useEffect(() => {
    const getBackgroundStatus = async () => {
      try {
        const status = await AsyncStorage.getItem('backgroundTaskStatus');
        if (status == 'true')
        setIsAttendance(status == 'true');
      } catch (error) {
        console.error('Error retrieving background task status:', error);
      }
    };
 
    getBackgroundStatus();
    Camera.requestCameraPermission();
  }, []);

  const toggleAttendance = () => {
    try {
      if (!isAttendance) {
        setStartDateTime(new Date().toISOString());
      } else {
        setEndDateTime(new Date().toISOString());
      }
      setIsDisable(true);
    } catch (err) {
      console.error(err);
    }
  };

  const takePicture = async () => {
    if (camera.current) {
      try {
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

        if (!isAttendance) setStartPicture(base64Image);
        else setEndPicture(base64Image);

        setPreviewVisible(true);
      } catch (error) {
        console.error("Error taking picture:", error);
      }
    }
  };

  const handleConfirm = async () => {
    setPreviewVisible(false);
    setIsDisable(false);

    try {
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
          await AsyncStorage.setItem('attendanceID', data.attendanceID.toString());
          await AsyncStorage.setItem('backgroundTaskStatus', 'true');
          setIsAttendance(true);
          startBackgroundJob(); // Start the background task when attendance starts
        } else {
          await stopBackgroundJob(); // Stop the background task when attendance ends
          await AsyncStorage.setItem('backgroundTaskStatus', 'false');
          await AsyncStorage.removeItem('attendanceID');
          setIsAttendance(false);
        }
      }
    } catch (error) {
      console.error("Error handling confirm:", error);
    }
  };

  if (isDisable && !device) return <ActivityIndicator />;

  return (
    <View style={{ flex: 1 }}>
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
          {previewVisible && imageData && (
            <>
              <Image source={{ uri: 'file://' + imageData }} style={styles.imagePreview} />
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

export default CameraScreen;