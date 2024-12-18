import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { startBackgroundJob, stopBackgroundJob } from '../../utils/background_task';

const AttendanceScreen = () => {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const getBackgroundStatus = async () => {
      try {
        const status = await AsyncStorage.getItem('backgroundTaskStatus');
        if (status !== null) {
          setPlaying(status === 'true');
        }
      } catch (error) {
        console.error('Error retrieving background task status:', error);
      }
    };

    getBackgroundStatus();
  }, []);

  const toggleBackground = async () => {
    const newStatus = !playing;
    setPlaying(newStatus);

    try {
      if (newStatus) {
        await startBackgroundJob();
        await AsyncStorage.setItem('backgroundTaskStatus', 'true'); // Simpan status "start"
        
      } else {
        await stopBackgroundJob();
        await AsyncStorage.setItem('backgroundTaskStatus', 'false'); // Simpan status "stop"
      }
    } catch (error) {
      console.error('Error toggling background task:', error);
    }
  };

  return (
    <View style={styles.body}>
      <TouchableOpacity style={styles.button} onPress={toggleBackground}>
        <Text style={styles.buttonText}>
          {playing ? 'Stop Background Task' : 'Start Background Task'}
        </Text>
      </TouchableOpacity>
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
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AttendanceScreen;