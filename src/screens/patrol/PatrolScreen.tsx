import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Mapbox, { MapView, Camera, ShapeSource, LineLayer, PointAnnotation } from "@rnmapbox/maps";
import Geolocation from "react-native-geolocation-service";
import { getAllTempLogs } from "../../data/log_tracking_temp"; // Update the path

Mapbox.setAccessToken('pk.eyJ1IjoiYnJhZGkyNSIsImEiOiJjbHloZXlncTUwMmptMmxvam16YzZpYWJ2In0.iAua4xmCQM94oKGXoW2LgA');

const PatrolScreen = () => {
  const [logData, setLogData] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false); // Control when to load the map

  useEffect(() => {
    // Simulate Mapbox initialization delay
    const timeout = setTimeout(() => {
      setMapLoaded(true);
    }, 1000); // Delay MapView rendering for 1 second

    // Fetch logs from Realm
    const logs = getAllTempLogs();
    setLogData(logs);

    // Start watching the user's location in real time
    const watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
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
      clearTimeout(timeout);
      if (watchId) Geolocation.clearWatch(watchId);
    };
  }, []);

  // Convert logs to GeoJSON for LineLayer
  const getGeoJSONLine = () => ({
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: logData.map(log => [log.longitude, log.latitude]),
    },
  });

  if (!mapLoaded) {
    return <View style={styles.loadingContainer}><Text>Loading Map...</Text></View>;
  }

  return (
    <View style={styles.page}>
      <MapView
        style={styles.map}
        styleURL={Mapbox.StyleURL.Street}
        onMapLoaded={() => console.log("Map loaded successfully")}
      >
        {/* Camera to focus on the current location */}
        {currentLocation && (
          <Camera
            zoomLevel={14}
            centerCoordinate={[currentLocation.longitude, currentLocation.latitude]}
          />
        )}

        {/* Line layer for the path */}
        {logData.length > 1 && (
          <ShapeSource id="lineSource" shape={getGeoJSONLine()}>
            <LineLayer id="lineLayer" style={styles.lineLayer} />
          </ShapeSource>
        )}

        {/* Point for the current location */}
        {currentLocation && (
          <PointAnnotation
            id="currentLocation"
            coordinate={[currentLocation.longitude, currentLocation.latitude]}
          >
            <View style={styles.point} />
          </PointAnnotation>
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    flex: 1,
    width: "100%",
  },
  lineLayer: {
    lineColor: "#FF0000",
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
});

export default PatrolScreen;
