import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, Alert, Modal, TouchableOpacity, Image } from "react-native";
import Mapbox, { MapView, Camera, ShapeSource, LineLayer, PointAnnotation } from "@rnmapbox/maps";
import Geolocation from "react-native-geolocation-service";
import { Camera as VisionCamera, useCameraDevice, useCameraDevices } from "react-native-vision-camera";
import { getAllTempLogs } from "../../data/log_tracking_temp";
import { getCheckpoints } from "../../data/checkpoint_data";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ImageResizer from 'react-native-image-resizer';
import RNFS from "react-native-fs";

Mapbox.setAccessToken("pk.eyJ1IjoiYnJhZGkyNSIsImEiOiJjbHloZXlncTUwMmptMmxvam16YzZpYWJ2In0.iAua4xmCQM94oKGXoW2LgA");

const PatrolScreen = () => {
  const [logData, setLogData] = useState([]);
  const [checkpoints, setCheckpoints] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [photoUri, setPhotoUri] = useState(null);
  const [situationType, setSituationType] = useState(null);
  const [picture, setPicture] = useState('');
  const [nearestCheckpointID, setNearestCheckpointID] = useState(null);

  
  const [modalVisible, setModalVisible] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [isAttendance, setIsAttendance] = useState(false);
  const [isCheckIn, setIsCheckIn] = useState(false);

  const devices = useCameraDevices();
  const device = useCameraDevice('back');
  const cameraRef = useRef<VisionCamera>(null);

  useEffect(() => {
    readStatus();
    const logs = getAllTempLogs();
    setLogData(logs);

    const fetchCheckpoints = async () => {
      const data = await getCheckpoints();
      setCheckpoints(data);
    };
    fetchCheckpoints();

    const watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        checkProximity(latitude, longitude);
      },
      (error) => console.error("Error watching position:", error),
      {
        enableHighAccuracy: true,
        distanceFilter: 1,
        interval: 1000,
        fastestInterval: 500,
      }
    );

    return () => {
      if (watchId) Geolocation.clearWatch(watchId);
    };
  }, [checkpoints]);
  
  const readStatus = async () => {
    const statusAttendance = await AsyncStorage.getItem('status');
    if(statusAttendance) {
      setIsAttendance(true);
    } else if(!statusAttendance) {
      setIsAttendance(false);
    }
  };

  const checkProximity = async (lat: number, lon: number) => {
    let nearestCheckpoint = null;

    checkpoints.forEach((checkpoint) => {
      const distance = getDistance(lat, lon, checkpoint.latitude, checkpoint.longitude);
      const threshold = checkpoint.radius;
      if (distance < threshold) {
        nearestCheckpoint = checkpoint; 
      }
    });

    if (nearestCheckpoint) {
      const checkedInCheckpoints = await AsyncStorage.getItem('checkedInCheckpoints');
      const checkedInArray = checkedInCheckpoints ? JSON.parse(checkedInCheckpoints) : [];

      if (!checkedInArray.includes(nearestCheckpoint.checkpointID)) {
        setNearestCheckpointID(nearestCheckpoint.checkpointID);
        setIsCheckIn(true);
        setModalVisible(true);
      }
    }
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
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

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePhoto();
      setPhotoUri(photo.path);

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
        setPicture(base64Image)
      } catch (err) {
        console.log(err);
      }

      setCameraVisible(false);
      setPreviewVisible(true);
    };
  };

  const handleConfirm = async () => {
    const AttendanceID = await AsyncStorage.getItem('attendanceID');

    const data = {
      dateTime: new Date().toISOString(),
      picture: picture,
      status: situationType,
      checkpointID: nearestCheckpointID,
    };

    const newData = {
      attendanceID: AttendanceID,
      logPatrol: [data],
    }


    const apiURL = `https://672fc91b66e42ceaf15eb4cc.mockapi.io/Attendance/${AttendanceID}/LogPatrol`;

    const response = await fetch(apiURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newData),
    });

    if(response.ok) {
      const checkedInCheckpoints = await AsyncStorage.getItem('checkedInCheckpoints');
    const checkedInArray = checkedInCheckpoints ? JSON.parse(checkedInCheckpoints) : [];

    if (!checkedInArray.includes(nearestCheckpointID)) {
      checkedInArray.push(nearestCheckpointID);
      await AsyncStorage.setItem('checkedInCheckpoints', JSON.stringify(checkedInArray));
    }

    setIsCheckIn(false);
    setPreviewVisible(false);
    }
  };

  return (
    <View style={styles.page}>
      <MapView style={styles.map} styleURL={Mapbox.StyleURL.Street}>
        {currentLocation && (
          <Camera zoomLevel={19} centerCoordinate={[currentLocation.longitude, currentLocation.latitude]} />
        )}
        {logData.length > 1 && (
          <ShapeSource id="lineSource" shape={{
            type: "Feature",
            geometry: { type: "LineString", coordinates: logData.map(log => [log.longitude, log.latitude]) },
          }}>
            <LineLayer id="lineLayer" style={styles.lineLayer} />
          </ShapeSource>
        )}

        {checkpoints.map((checkpoint) => (
          <PointAnnotation key={checkpoint.checkpointID} id={checkpoint.checkpointID} coordinate={[checkpoint.longitude, checkpoint.latitude]}>
            <View style={styles.checkpoint} />
          </PointAnnotation>
        ))}
      </MapView>

      {isAttendance && isCheckIn && (
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          {cameraVisible && device ? (
            <><VisionCamera
                ref={cameraRef}
                style={styles.camera}
                device={device}
                isActive={true}
                photo={true} />
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture} />
            </>
          ) : photoUri ? (
            <View style={styles.modalContainer}>
              <Image source={{ uri: photoUri }} style={styles.imagePreview} />
              <Text style={styles.modalText}>Pilih Situasi:</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.optionButton, situationType === "aman" && styles.selected]} onPress={() => setSituationType("aman")}>
                  <Text style={styles.buttonText}>Aman</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.optionButton, situationType === "tidak aman" && styles.selected]} onPress={() => setSituationType("tidak aman")}>
                  <Text style={styles.buttonText}>Tidak Aman</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <Text style={styles.modalText}>Datetime: {nearestCheckpointID}</Text>
              <TouchableOpacity style={styles.takePhotoButton} onPress={() => setCameraVisible(true)}>
                <Text style={styles.buttonText}>Open Camera</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  page: { 
    flex: 1 
  },
  map: { 
    flex: 1 
  },
  modalContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "rgba(0,0,0,0.5)" 
  },
  formContainer: { 
    backgroundColor: "white", 
    padding: 20, 
    borderRadius: 10, 
    alignItems: "center" 
  },
  modalText: { 
    fontSize: 18, 
    marginBottom: 10 
  },
  takePhotoButton: { 
    backgroundColor: "blue", 
    padding: 10, 
    borderRadius: 5 
  },
  buttonText: { 
    color: "white", 
    fontSize: 16 
  },
  camera: { 
    width: "100%", 
    height: "100%" 
  },
  imagePreview: { 
    width: 200, 
    height: 200, 
    marginBottom: 10 
  },
  buttonContainer: { 
    flexDirection: "row", 
    justifyContent: "space-around", 
    width: "80%" 
  },
  optionButton: { 
    backgroundColor: "gray", 
    padding: 10, 
    borderRadius: 5, 
    marginHorizontal: 5 
  },
  selected: { 
    backgroundColor: "green" 
  },
  confirmButton: { 
    backgroundColor: "blue", 
    padding: 10, 
    borderRadius: 5, 
    marginTop: 10 
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
  lineLayer: {
    lineColor: "#FF0000", // Log path color
    lineWidth: 3,
  },
});

export default PatrolScreen;
