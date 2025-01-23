import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Mapbox, { MapView, Camera, ShapeSource, LineLayer, PointAnnotation } from "@rnmapbox/maps";
import Geolocation from "react-native-geolocation-service";
import { getAllTempLogs } from "../../data/log_tracking_temp";
import { getCheckpoints } from "../../data/checkpoint_data"; 

Mapbox.setAccessToken('pk.eyJ1IjoiYnJhZGkyNSIsImEiOiJjbHloZXlncTUwMmptMmxvam16YzZpYWJ2In0.iAua4xmCQM94oKGXoW2LgA');

const PatrolScreen = () => {
  const [logData, setLogData] = useState([]); 
  const [checkpoints, setCheckpoints] = useState([]); 
  const [currentLocation, setCurrentLocation] = useState(null); 
  const [mapLoaded, setMapLoaded] = useState(false); 

  useEffect(() => {
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
      },
      (error) => console.error("Error watching position:", error),
      {
        enableHighAccuracy: true,
        distanceFilter: 1,
        interval: 1000,
        fastestInterval: 500,
      }
    );

    const timeout = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);

    return () => {
      clearTimeout(timeout);
      if (watchId) Geolocation.clearWatch(watchId);
    };
  }, []);

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

        {/* Directions from current location to each checkpoint */}
        {currentLocation && checkpoints.map((checkpoint) => (
          <ShapeSource
            key={`route-${checkpoint.checkpointID}`}
            id={`route-${checkpoint.checkpointID}`}
            shape={{
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: [
                  [currentLocation.longitude, currentLocation.latitude],
                  [checkpoint.longitude, checkpoint.latitude],
                ],
              },
            }}
          >
            <LineLayer
              id={`lineLayer-${checkpoint.checkpointID}`}
              style={styles.routeLineLayer}
            />
          </ShapeSource>
        ))}
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
    lineColor: "#FF0000", // Log path color
    lineWidth: 3,
  },
  routeLineLayer: {
    lineColor: "#00FF00", // Direction line color
    lineWidth: 2,
    lineDasharray: [2, 2], // Dashed line
  },
  point: {
    height: 20,
    width: 20,
    backgroundColor: "blue",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "white",
  },
  checkpoint: {
    height: 20,
    width: 20,
    backgroundColor: "red",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "white",
  },
});

export default PatrolScreen;