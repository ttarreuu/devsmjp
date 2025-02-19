import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, Alert, TouchableOpacity, Image } from "react-native";
import Mapbox, { MapView, Camera, ShapeSource, LineLayer, PointAnnotation } from "@rnmapbox/maps";
import Geolocation from "react-native-geolocation-service";
import { Camera as VisionCamera, useCameraDevice } from "react-native-vision-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ImageResizer from 'react-native-image-resizer';
import RNFS from "react-native-fs";
import { saveLogPatrolTempLog } from "../../data/log_patrol_temp";
import { saveLogPatrol } from "../../data/log_patrol";
import { getAllTempLogs } from "../../data/log_tracking_temp";
import { getCheckpoints } from "../../data/checkpoint_data";

Mapbox.setAccessToken("pk.eyJ1IjoiYnJhZGkyNSIsImEiOiJjbHloZXlncTUwMmptMmxvam16YzZpYWJ2In0.iAua4xmCQM94oKGXoW2LgA");

const PatrolScreen = () => {
  const [logData, setLogData] = useState([]);
  const [checkpoints, setCheckpoints] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [photoUri, setPhotoUri] = useState('');
  const [situationType, setSituationType] = useState('');
  const [picture, setPicture] = useState('');
  const [nearestCheckpoint, setNearestCheckpoint] = useState(null);

  const [cameraVisible, setCameraVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [isAttendance, setIsAttendance] = useState(false);
  const [isCheckIn, setIsCheckIn] = useState(false);

  const device = useCameraDevice('back');
  const cameraRef = useRef<VisionCamera>(null);

  useEffect(() => {
    readStatus();
    setLogData(getAllTempLogs());

    const fetchCheckpoints = async () => {
      const data = await getCheckpoints();
      setCheckpoints(data);
    };
    fetchCheckpoints();

    const watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        if (isAttendance) {
          setSituationType('');
          checkProximity(latitude, longitude);
        }
      },
      (error) => console.error("Error watching position:", error),
      { enableHighAccuracy: true, distanceFilter: 1, interval: 1000, fastestInterval: 500 }
    );

    return () => {
      if (watchId) Geolocation.clearWatch(watchId);
    };
  }, [checkpoints]);

  const readStatus = async () => {
    const statusAttendance = await AsyncStorage.getItem('status');
    setIsAttendance(statusAttendance === 'true');
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

    if (nearest) {
      setNearestCheckpoint(nearest);
      setIsCheckIn(true);
    } else {
      setNearestCheckpoint(null);
      setIsCheckIn(false);
    }
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000; // Radius of the Earth in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePhoto();
      setPhotoUri(photo.path);

      const compressedImage = await ImageResizer.createResizedImage(photo.path, 800, 600, 'JPEG', 50, 0);
      const base64Image = await RNFS.readFile(compressedImage.uri, 'base64');
      setPicture(base64Image);

      setCameraVisible(false);
      setPreviewVisible(true);
    }
  };

  const handleConfirm = async () => {
    try {
      const dateTime = new Date().toISOString();
      saveLogPatrolTempLog(dateTime, picture, situationType, nearestCheckpoint?.checkpointID);
      saveLogPatrol(dateTime, picture, situationType, nearestCheckpoint?.checkpointID);
      setIsCheckIn(false);
      setPreviewVisible(false);
    } catch (err) {
      console.log(err);
    }
  };

  const getGeoJSONLine = () => ({
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: logData.map(log => [log.longitude, log.latitude]),
    },
  });

  return (
    <View style={styles.page}>
      <MapView style={styles.map} styleURL={Mapbox.StyleURL.Street}>
        {currentLocation && (
          <Camera
            zoomLevel={19}
            centerCoordinate={[currentLocation.longitude, currentLocation.latitude]}
          />
        )}

        {/* Line marker for logData path */}
        {logData.length > 1 && (
          <ShapeSource id="lineSource" shape={getGeoJSONLine()}>
            <LineLayer id="lineLayer" style={styles.lineLayer} />
          </ShapeSource>
        )}

        {/* Current location marker */}
        {currentLocation && (
          <PointAnnotation
            id="currentLocation"
            coordinate={[currentLocation.longitude, currentLocation.latitude]}
          >
            <View style={styles.point} />
          </PointAnnotation>
        )}

        {/* Checkpoint markers */}
        {checkpoints.map((checkpoint) => (
          <PointAnnotation
            key={checkpoint.checkpointID}
            id={checkpoint.checkpointID}
            coordinate={[checkpoint.longitude, checkpoint.latitude]}
          >
            <View style={styles.checkpoint} />
          </PointAnnotation>
        ))}

        {/* Directions from current location to the nearest checkpoint */}
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
              style={styles.routeLineLayer}
            />
          </ShapeSource>
        )}
        
      </MapView>

      {isAttendance && isCheckIn && !previewVisible &&(
        <TouchableOpacity style={styles.floatingButton} onPress={() => setCameraVisible(true)}>
          <Text style={styles.buttonText}>Check-in</Text>
        </TouchableOpacity>
      )}

      {cameraVisible && device && (
        <>
          <VisionCamera ref={cameraRef} style={styles.camera} device={device} isActive={true} photo={true} />
          <TouchableOpacity style={styles.captureButton} onPress={takePicture} />
        </>
      )}

      {previewVisible && (
        <View style={styles.previewContainer}>
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
  floatingButton: { 
    position: "absolute", 
    bottom: 30, 
    right: 20, 
    backgroundColor: "blue", 
    padding: 15, 
    borderRadius: 10 
  },
  buttonText: { 
    color: "white", 
    fontSize: 16, 
    textAlign: "center" 
  },
  camera: { 
    width: "100%", 
    height: "100%" 
  },
  previewContainer: { 
    position: "absolute", 
    bottom: 100, 
    alignSelf: "center" 
  },
  imagePreview: { 
    width: 200, 
    height: 200, 
    marginBottom: 10 
  },
  confirmButton: { 
    backgroundColor: "green", 
    padding: 10, 
    borderRadius: 5 
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
  modalText: { 
    fontSize: 18, 
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
  lineLayer: {
    lineColor: "#FF0000", // Log path color
    lineWidth: 3,
  },
  point: {
    height: 20,
    width: 20,
    backgroundColor: "blue",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "white",
  },
  routeLineLayer: {
    lineColor: "#00FF00", // Direction line color
    lineWidth: 2,
    lineDasharray: [2, 2], // Dashed line
  }
});

export default PatrolScreen;