import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera, useCameraDevice, useCameraDevices } from 'react-native-vision-camera';
import ImageResizer from 'react-native-image-resizer';
import RNFS from "react-native-fs";
import NetInfo from "@react-native-community/netinfo";
import realmInstance from '../../data/realmConfig';
import { handleClockIn, handleClockOut, syncRealmToApi } from '../../data/handle_log';
import Clockin from '../../assets/clock-in.svg';
import Clockout from '../../assets/clock-out.svg';
import ClockInSymbol from '../../assets/clock-in-sy.svg';
import ClockOutSymbol from '../../assets/clock-out-sy.svg';
import ClockHistory from '../../assets/clock-history.svg';

const AttendanceScreen = () => {
  
  const [imageData, setImageData] = useState('');
  const [isHide, setIsHide] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [isAttendance, setIsAttendance] = useState(Boolean);

  const [startPic, setStartPic] = useState('');
  const [endPic, setEndPic] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  const [clockInTime, setClockInTime] = useState('');
  const [clockOutTime, setClockOutTime] = useState('');

  const readClockTimes = async () => {
    const inTime = await AsyncStorage.getItem('clockInTime');
    const outTime = await AsyncStorage.getItem('clockOutTime');
    if (inTime)
      setClockInTime(
        new Date(inTime).toLocaleTimeString('en-GB', {hour12: false}),
      );
    if (outTime)
      setClockOutTime(
        new Date(outTime).toLocaleTimeString('en-GB', {hour12: false}),
      );
  };

  const loadClockTimes = async () => {
    try {
      const inTime = await AsyncStorage.getItem('clockInTime');
      const outTime = await AsyncStorage.getItem('clockOutTime');

      if (inTime)
        setClockInTime(
          new Date(inTime).toLocaleTimeString('en-GB', {hour12: false}),
        );
      if (outTime)
        setClockOutTime(
          new Date(outTime).toLocaleTimeString('en-GB', {hour12: false}),
        );
    } catch (error) {
      console.error('Error loading clock times:', error);
    }
  };

  useEffect(() => {
    readStatus();
    checkPermission();
    readClockTimes();

    const syncInterval = setInterval(() => {
      syncRealmToApi();
    }, 10000);

    const timeInterval = setInterval(() => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString('en-GB', {hour12: false});
      const formattedDate = now.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      setCurrentTime(formattedTime);
      setCurrentDate(formattedDate);
    }, 1000);

    return () => {
      clearInterval(syncInterval);
      clearInterval(timeInterval);
    };


  }, []);

  useEffect(() => {
    loadClockTimes();
    const interval = setInterval(() => {
      loadClockTimes();
    }, 1000);
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
        await AsyncStorage.setItem('clockOutTime', now);

        // Clear clock-in/out after 1 minute
        setTimeout(async () => {
          await AsyncStorage.removeItem('clockInTime');
          await AsyncStorage.removeItem('clockOutTime');
          setClockInTime('');
          setClockOutTime('');
          console.log('ClockIn & ClockOut data cleared from AsyncStorage');
        }, 60000); // 60000 ms = 1 minute
      } else {
        await handleClockIn(now, startPic);
        setIsAttendance(true);
        await AsyncStorage.setItem('status', 'true');
        await AsyncStorage.setItem('clockInTime', now);
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
    <View style={{flex: 1}}>
      {!isHide && !cameraVisible && !previewVisible && (
        <View style={styles.centerContainer}>
          <Text style={styles.timeText}>{currentTime}</Text>
          <Text style={styles.dateText}>{currentDate}</Text>
          <TouchableOpacity style={styles.button} onPress={toggleTracking}>
            {isAttendance ? (
              <View style={styles.iconTextContainer}>
                <Clockout width={75} height={75} />
                <Text style={styles.buttonText2}>Clock-out</Text>
              </View>
            ) : (
              <View style={styles.iconTextContainer}>
                <Clockin width={75} height={75} />
                <Text style={styles.buttonText2}>Clock-in</Text>
              </View>
            )}
          </TouchableOpacity>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              marginTop: 30,
              width: '80%',
            }}>
            <View style={{alignItems: 'center'}}>
              <ClockInSymbol width={40} height={40} />
              <Text
                style={{
                  fontSize: 12,
                  marginTop: 5,
                  fontFamily: 'Poppins-SemiBold',
                }}>
                Clock In
              </Text>
              <Text style={{fontSize: 14, fontFamily: 'Poppins-Regular'}}>
                {clockInTime || '-'}
              </Text>
            </View>
            <View style={{alignItems: 'center'}}>
              <ClockOutSymbol width={40} height={40} />
              <Text
                style={{
                  fontSize: 12,
                  marginTop: 5,
                  fontFamily: 'Poppins-SemiBold',
                }}>
                Clock Out
              </Text>
              <Text style={{fontSize: 14, fontFamily: 'Poppins-Regular'}}>
                {clockOutTime || '-'}
              </Text>
            </View>
            <View style={{alignItems: 'center'}}>
              <ClockHistory width={40} height={40} />
              <Text
                style={{
                  fontSize: 12,
                  marginTop: 5,
                  fontFamily: 'Poppins-SemiBold',
                }}>
                History
              </Text>
            </View>
          </View>
        </View>
      )}
      {isHide && cameraVisible && !previewVisible && device ? (
        <View style={{flex: 1}}>
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
                source={{uri: 'file://' + imageData}}
                style={styles.imagePreview}
              />
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}>
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
  page: {
    flex: 1,
    backgroundColor: '#ffff',
  },
  timeText: {
    fontSize: 50,
    color: 'black',
    fontFamily: 'Poppins-SemiBold',
  },
  centerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  button: {
    width: 200,
    height: 200,
    borderColor: '#1185C8',
    backgroundColor: '#1185C8',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 200,
    alignSelf: 'center',
    marginTop: 15,
  },
  iconTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText2: {
    marginTop: 10,
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
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
    marginTop: 20,
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
  dateText: {
    fontSize: 16,
    color: '#555',
    fontFamily: 'Poppins-SemiBold',
    marginTop: -20,
  },
});

export default AttendanceScreen;
