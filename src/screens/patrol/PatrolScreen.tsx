import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import Mapbox, { MapView, Camera, ShapeSource, LineLayer, PointAnnotation } from "@rnmapbox/maps";
import Geolocation from "react-native-geolocation-service";
import { Camera as VisionCamera, useCameraDevice, useCodeScanner } from "react-native-vision-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAllTempLogs } from "../../data/log_tracking_temp";
import realmInstance from "../../data/realmConfig";
import { useNavigation } from '@react-navigation/native'; 
import GPSIcon from '../../assets/gps-icon.svg';
import QRIcon from '../../assets/qrcode-icon.svg';
import NFCIcon from '../../assets/nfc-icon.svg';
import LogIcon from '../../assets/log-icon.svg';
import OffIcon from '../../assets/power-off.svg';
import DropDownPicker from 'react-native-dropdown-picker';
import CustomAlert from '../../components/CustomAlert';

Mapbox.setAccessToken("pk.eyJ1IjoiYnJhZGkyNSIsImEiOiJjbHloZXlncTUwMmptMmxvam16YzZpYWJ2In0.iAua4xmCQM94oKGXoW2LgA");

const PatrolScreen = () => {
  const [logData, setLogData] = useState([]);
  const [checkpoints, setCheckpoints] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [nearestCheckpoint, setNearestCheckpoint] = useState(null);
  const [cameraQRVisible, setCameraQRVisible] = useState(false);
  const [isAttendance, setIsAttendance] = useState(false);
  const [isCheckIn, setIsCheckIn] = useState(false);
  const [isEnable, setIsEnable] = useState(false);
  const [isStart, setIsStart] = useState(false);
  const [isHide, setIsHide] = useState(false);
  const [patrolMode, setPatrolMode] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);

  const device = useCameraDevice('back');
  const cameraRef = useRef<VisionCamera>(null);
  const navigation = useNavigation();

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      const scannedCode = codes[0]?.value;
      if (scannedCode) {
        setCameraQRVisible(false);  
        console.log(`Scanned QR Code: ${scannedCode}`);
        if (nearestCheckpoint && scannedCode === nearestCheckpoint.checkpointID) {
          navigation.navigate('QRConfirmScreen', { nearestCheckpoint });
        } 
      }
    },
  });

  useEffect(() => {
    readStatus();
    readPatrolStatus();
    setLogData(getAllTempLogs());
    fetchCheckpoints();    
    const watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        if (isAttendance) {
          checkProximity(latitude, longitude);
        }
      },
      (error) => console.error("Error watching position:", error),
      { enableHighAccuracy: true, distanceFilter: 1, interval: 1000, fastestInterval: 500 }
    );
    
    return () => {
      if (watchId) Geolocation.clearWatch(watchId);
    };
  }, [isAttendance]);

  useEffect(() => {
    const enable = isAttendance && isCheckIn && currentLocation && nearestCheckpoint;
    setIsEnable(enable);
  }, [isAttendance, isCheckIn, currentLocation, nearestCheckpoint]);

  const fetchCheckpoints = async () => {
    const allCheckpoints = realmInstance.objects('Checkpoint');
    setCheckpoints(allCheckpoints);
  };

  const readStatus = async () => {
    const statusAttendance = await AsyncStorage.getItem('status');
    setIsAttendance(statusAttendance === 'true');
  };

  const readPatrolStatus = async () => {
    const storedPatrol = await AsyncStorage.getItem('patrolStarted');
    if (storedPatrol === 'true') {
      setIsStart(true);
      setIsHide(true);
    } else {
      setIsStart(false);
      setIsHide(false);
    }
  };

  
  const checkProximity = (lat: number, lon: number) => {
    let nearest = null;
    let minDistance = Infinity;
    
    checkpoints.forEach((checkpoint) => {
      const distance = getDistance(lat, lon, checkpoint.latitude, checkpoint.longitude);
      if (distance < checkpoint.radius && distance < minDistance) {
        minDistance = distance;
        nearest = checkpoint;
      }
    });

    if (nearest) { // Check if nearest is not null
      setNearestCheckpoint(nearest);
      setIsCheckIn(true);
    } else {
      setNearestCheckpoint(null);
      setIsCheckIn(false);
    }
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000; 
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const getGeoJSONLine = () => ({
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: logData.map(log => [log.longitude, log.latitude]),
    },
  });

  const toggleTracking = async () => {
    if (!isAttendance) {
      setAlertVisible(true);
      return;
    }

    const newIsStart = !isStart;
    setIsStart(newIsStart);
    setIsHide(newIsStart);

    if (!newIsStart) {
      setPatrolMode('');
      await AsyncStorage.removeItem('patrolStarted');
    }

    await AsyncStorage.setItem('patrolStarted', JSON.stringify(newIsStart));
};


  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'WALKING', value: 'walking' },
    { label: 'VEHICLE (MOTORCYCLE)', value: 'motorcycle' },
    { label: 'VEHICLE (CAR)', value: 'car' },
    { label: 'VEHICLE (BOAT)', value: 'boat' },
  ]);

  if (cameraQRVisible && device) {
    return (
      <View style={styles.cameraContainer}>
        <VisionCamera
          ref={cameraRef}
          style={styles.camera}
          device={device}
          isActive={true}
          codeScanner={codeScanner}
        />
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            setCameraQRVisible(false);
          }}
        >
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <CustomAlert
        visible={alertVisible}
        title='Attendance Required'
        message='You must mark attendance before starting patrol.'
        onClose={() => setAlertVisible(false)}
      />
      {!isStart && !isHide && (
        <View style={styles.centerContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={toggleTracking}
          >
            <Text style={styles.buttonText2}>Start Patrol</Text>
          </TouchableOpacity>
        </View>
      )}


      {isHide && (
        <>
          <View style={styles.topRightContainer}>
            <TouchableOpacity style={styles.offButton} onPress={toggleTracking}>
              <OffIcon height={30} width={30} />
            </TouchableOpacity>
          </View>
          <MapView style={styles.map} styleURL="mapbox://styles/mapbox/streets-v12" localizeLabels={true}>
            {currentLocation && (
              <Camera
                zoomLevel={17}
                centerCoordinate={[currentLocation.longitude, currentLocation.latitude]} />
            )}

            {logData.length > 1 && (
              <ShapeSource id="lineSource" shape={getGeoJSONLine()}>
                <LineLayer id="lineLayer" style={styles.lineLayer} />
              </ShapeSource>
            )}

            {currentLocation && (
              <PointAnnotation
                id="currentLocation"
                coordinate={[currentLocation.longitude, currentLocation.latitude]}
              >
                <View style={styles.point} />
              </PointAnnotation>
            )}

            {checkpoints.map((checkpoint) => (
              <PointAnnotation
                key={checkpoint.checkpointID}
                id={checkpoint.checkpointID}
                coordinate={[checkpoint.longitude, checkpoint.latitude]}
              >
                <View style={styles.checkpoint} />
              </PointAnnotation>
            ))}

            {currentLocation && nearestCheckpoint && (
              <ShapeSource
                id={`route-${nearestCheckpoint.checkpointID}`}
                shape={{
                  type: "Feature",
                  geometry: {
                    type: "LineString",
                    coordinates: [
                      [currentLocation.longitude, currentLocation.latitude],
                      [nearestCheckpoint.longitude, nearestCheckpoint.latitude],
                    ],
                  },
                }}
              >
                <LineLayer
                  id={`lineLayer-${nearestCheckpoint.checkpointID}`}
                  style={styles.routeLineLayer} />
              </ShapeSource>
            )}
          </MapView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.floatingButton}
              onPress={() => {
                if (isEnable) {
                  navigation.navigate('ConfirmScreen', { nearestCheckpoint });
                }
              }}>
              <GPSIcon height={50} width={50} />
              <Text style={[styles.buttonText, !isEnable && styles.disabledText]}>GPS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.floatingButton}
              onPress={() => {
                if (isEnable) {
                  navigation.navigate('NfcConfirmScreen', { nearestCheckpoint });
                }
              }}>
              <NFCIcon height={50} width={50} />
              <Text style={[styles.buttonText, !isEnable && styles.disabledText]}>NFC</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.floatingButton}
              onPress={() => {
                if (isEnable) {
                  setCameraQRVisible(true);
                }
              }}>
              <QRIcon height={50} width={50} />
              <Text style={[styles.buttonText, !isEnable && styles.disabledText]}>QR Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.floatingButton}
              onPress={() => {
                // navigate to log page
              }}>
              <LogIcon height={50} width={50} />
              <Text style={[styles.buttonText, !isAttendance && styles.disabledText]}>Log</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dropdownContainer}>
            <DropDownPicker
              open={open}
              value={patrolMode}
              items={items}
              setOpen={setOpen}
              setValue={setPatrolMode}
              setItems={setItems}
              placeholder="PATROL MODE"
              style={{ borderColor: '#1185C8', backgroundColor: '#1185C8' }}
              textStyle={{ fontFamily: 'Poppins-Regular', color: open ? '#1185C8' : '#ffff', textAlign: 'center' }}
              dropDownContainerStyle={{ borderColor: '#ccc'}}
              ArrowDownIconComponent={({ style }) => (
                <Text style={[style, { color: 'white' }]}>▼</Text>
              )}
              ArrowUpIconComponent={({ style }) => (
                <Text style={[style, { color: 'white' }]}>▲</Text>
              )}
            />
          </View>
        </>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  page: { 
    flex: 1,
    backgroundColor: '#ffff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 150,  
    height: 75, 
    backgroundColor: 'transparent',
    borderColor: '#1185C8',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25, 
    alignSelf: 'center',
  },
  buttonText2: {
    color: '#1185C8', 
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold'
  },
  map: { 
    height: '70%' 
  },
  title: {
    marginVertical: 15,
    textAlign: 'center',
    // fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    color: '#1185C8',
    fontSize: 16,
  },
  buttonContainer: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 15
  },
  floatingButton: { 
    marginHorizontal: 5 
  },
  topRightContainer: {
    position: 'absolute',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
  },
  offButton: {
    backgroundColor: '#ffff',
    padding: 8,
    borderRadius: 20,
    elevation: 5,
    zIndex: 10
  },
  buttonText: { 
    color: '#1185C8', 
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'Poppins-Medium'
  },
  disabledText: {
    color: 'grey', 
    textAlign: 'center'
  },
  camera: { 
    width: '100%', 
    height: '100%' 
  },
  lineLayer: {
    lineColor: '#FF0000', 
    lineWidth: 3,
  },
  point: {
    height: 20,
    width: 20,
    backgroundColor: 'blue',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  routeLineLayer: {
    lineColor: '#00FF00', 
    lineWidth: 2,
    lineDasharray: [2, 2], 
  },
  cameraContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  dropdownContainer: {
    marginHorizontal: 25,
    marginVertical: 10,
    zIndex: 1000,
  },
});

export default PatrolScreen;