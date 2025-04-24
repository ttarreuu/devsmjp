import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Mapbox, {MapView, Camera} from '@rnmapbox/maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  downloadMapboxOfflineRegion,
  deleteOfflineMapboxRegions,
} from '../components/Maps';
import { fetchData } from '../data/sync_data';

Mapbox.setAccessToken(
  'pk.eyJ1IjoiYnJhZGkyNSIsImEiOiJjbHloZXlncTUwMmptMmxvam16YzZpYWJ2In0.iAua4xmCQM94oKGXoW2LgA',
);

const ProfileScreen = () => {
  const [isOfflineAvailable, setIsOfflineAvailable] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    const checkOfflineMap = async () => {
      const downloaded = await AsyncStorage.getItem('offlineMapDownloaded');
      setIsOfflineAvailable(downloaded === 'true');
    };
    checkOfflineMap();
  }, []);

  const handleRedownload = async () => {
    setDownloading(true);
    setProgress(0);

    await deleteOfflineMapboxRegions();
    await AsyncStorage.removeItem('offlineMapDownloaded');

    await downloadMapboxOfflineRegion(percentage => {
      setProgress(percentage);
    });

    const downloaded = await AsyncStorage.getItem('offlineMapDownloaded');
    setIsOfflineAvailable(downloaded === 'true');
    setDownloading(false);
  };

  const handleFetchData = async () => {
    try {
      setLoadingData(true);
      await fetchData();
      Alert.alert('Success', 'Data has been fetched and stored.');
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch data.');
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.centered}>
        {downloading && (
          <View style={styles.progressContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.progressText}>{progress.toFixed(2)}%</Text>
          </View>
        )}

        <Button
          title={downloading ? 'Downloading...' : 'Re-download Offline Maps'}
          onPress={handleRedownload}
          disabled={downloading}
        />

        <View style={{marginTop: 20}}>
          <Button
            title={loadingData ? 'Fetching Data...' : 'Fetch Data'}
            onPress={handleFetchData}
            disabled={loadingData}
          />
        </View>
      </View>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {flex: 1},
  map: {flex: 1},
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  progressContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  progressText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
});
