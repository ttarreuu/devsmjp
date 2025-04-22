import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Mapbox, { MapView, Camera } from '@rnmapbox/maps';
import AsyncStorage from '@react-native-async-storage/async-storage';

Mapbox.setAccessToken("pk.eyJ1IjoiYnJhZGkyNSIsImEiOiJjbHloZXlncTUwMmptMmxvam16YzZpYWJ2In0.iAua4xmCQM94oKGXoW2LgA");

const ProfileScreen = () => {
  const [isOfflineAvailable, setIsOfflineAvailable] = useState(false);

  useEffect(() => {
    const checkOfflineMap = async () => {
      const downloaded = await AsyncStorage.getItem('offlineMapDownloaded');
      setIsOfflineAvailable(downloaded === 'true');
    };
    checkOfflineMap();
  }, []);

  if (!isOfflineAvailable) {
    return (
      <View style={styles.centered}>
        <Text>Offline map not available. Please download it first.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        styleURL="mapbox://styles/mapbox/streets-v12"
        localizeLabels={true}
      >
        <Camera
          zoomLevel={17}
          centerCoordinate={[106.8225, -6.1899]} 
        />
      </MapView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
