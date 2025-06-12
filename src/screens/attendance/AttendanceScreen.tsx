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
import DropDownPicker from 'react-native-dropdown-picker';
import Geolocation from 'react-native-geolocation-service';
import CustomAlert from '../../components/CustomAlert';


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
  
  const [alertVisible, setAlertVisible] = useState(false);

  const [open, setOpen] = useState(false);
  const [shiftSelected, setShiftSelected] = useState(null);
  type ShiftItem = {
    label: string;
    value: string | number;
  };

  const [items, setItems] = useState<ShiftItem[]>([]);
  const [isWithinRadius, setIsWithinRadius] = useState(false);
  const [userLat, setUserLat] = useState('');
  const [userLong, setUserLong] = useState('');
  
  const checkProximity = () => {
    const realmLocation = realmInstance.objects('Company')[0];
    if (!realmLocation) return;

    const centerLat = realmLocation.Lat;
    const centerLon = realmLocation.Long;
    const radius = realmLocation.radius;

    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;

        setUserLat(latitude.toString());
        setUserLong(longitude.toString());

        const distance = getDistanceFromLatLonInMeters(
          latitude,
          longitude,
          centerLat,
          centerLon,
        );

        setIsWithinRadius(distance <= radius);
      },
      error => {
        console.error('Location error:', error);
        setIsWithinRadius(false);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };


  useEffect(() => {
    const shiftData = realmInstance.objects('Shift');
    const shiftArray = [...shiftData];
    setItems(
      shiftArray.map(shift => ({
        label: `${shift.name} (${shift.startTime.slice(
          0,
          5,
        )} - ${shift.endTime.slice(0, 5)})`,
        value: shift.shiftID as string | number,
      })),
    );
  }, []);

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
    checkProximity();
    loadClockTimes();
    const interval = setInterval(() => {
      loadClockTimes();
      checkProximity();
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
  
  const getShiftIDFromName = (shiftName: string) => {
    const shift = realmInstance
      .objects('Shift')
      .filtered('name == $0', shiftName)[0];
    return shift?.shiftID || null;
  };
  
  const checkPermission = () => {
    const newCameraPermission = Camera.requestCameraPermission;
    console.log(newCameraPermission);
  };

  const getDistanceFromLatLonInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000; 
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  
  const toggleTracking = () => {
    if (!shiftSelected) {
      setAlertVisible(true);
    } else {
      setIsHide(true);
      setCameraVisible(true);
    }
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
      Geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        console.log(latitude);
        console.log(longitude);
      })
      if (isAttendance) {
        await handleClockOut(now, endPic, userLat, userLong);
        setIsAttendance(false);
        await AsyncStorage.setItem('status', 'false');
        await AsyncStorage.setItem('clockOutTime', now);
        setShiftSelected(null);

        setTimeout(async () => {
          await AsyncStorage.removeItem('clockInTime');
          await AsyncStorage.removeItem('clockOutTime');
          setClockInTime('');
          setClockOutTime('');
          console.log('ClockIn & ClockOut data cleared from AsyncStorage');
        }, 60000);
      } else {
        console.log('Selected Shift ID:', shiftSelected);

        await handleClockIn(shiftSelected, now, startPic, userLat, userLong);
        setIsAttendance(true);
        await AsyncStorage.setItem('status', 'true');
        await AsyncStorage.setItem('clockInTime', now);
        
        await AsyncStorage.removeItem('clockOutTime');
        setClockOutTime('');
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
      <CustomAlert
        visible={alertVisible}
        title="No Shift Selected"
        message="Please select a shift before continuing."
        onClose={() => setAlertVisible(false)}
      />
      {!isHide && !cameraVisible && !previewVisible && (
        <View style={styles.centerContainer}>
          <Text style={styles.timeText}>{currentTime}</Text>
          <Text style={styles.dateText}>{currentDate}</Text>
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: isWithinRadius ? '#1185C8' : '#ccc',
                borderColor: isWithinRadius ? '#1185C8' : '#ccc',
              },
            ]}
            onPress={toggleTracking}
            disabled={!isWithinRadius}>
            {isAttendance ? (
              <View style={styles.iconTextContainer}>
                <Clockout width={60} height={60} />
                <Text style={styles.buttonText2}>Clock-out</Text>
              </View>
            ) : (
              <View style={styles.iconTextContainer}>
                <Clockin width={60} height={60} />
                <Text style={styles.buttonText2}>Clock-in</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={{width: '80%', marginTop: 5}}>
            <View style={{borderRadius: 5}}>
              <View style={styles.dropdownContainer}>
                <DropDownPicker
                  open={open}
                  value={shiftSelected}
                  items={items}
                  setOpen={setOpen}
                  setValue={setShiftSelected}
                  setItems={setItems}
                  placeholder="SELECT SHIFT"
                  style={{
                    borderColor: '#1185C8',
                    backgroundColor: '#1185C8',
                  }}
                  textStyle={{
                    fontFamily: 'Poppins-SemiBold',
                    color: open ? '#1185C8' : '#fff',
                    textAlign: open ? 'left' : 'center',
                  }}
                  dropDownContainerStyle={{
                    borderColor: '#ccc',
                  }}
                  ArrowDownIconComponent={({style}) => (
                    <Text style={[style, {color: 'white'}]}>▼</Text>
                  )}
                  ArrowUpIconComponent={({style}) => (
                    <Text style={[style, {color: 'white'}]}>▲</Text>
                  )}
                  disabled={isAttendance}
                />
              </View>
            </View>
          </View>
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
  dropdownContainer: {
    zIndex: 1000,
  },
  timeText: {
    fontSize: 50,
    color: 'black',
    fontFamily: 'Poppins-SemiBold',
    marginTop: 25,
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
    width: 150,
    height: 150,
    borderColor: '#1185C8',
    backgroundColor: '#1185C8',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 150,
    alignSelf: 'center',
    marginVertical: 15,
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
