import BackgroundJob from 'react-native-background-actions';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initDatabase,
  insertLocalDB,
  getLocalDB,
  deleteLocalDB,
} from '../data/log_tracking';

const options = {
  taskName: 'Geolocation Task',
  taskTitle: 'Tracking User Location',
  taskDesc: 'Tracking location',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#ff00ff',
  parameters: {
    locationDelay: 10000, // 10 seconds for location updates
    apiDelay: 60000, // 1 minute for API updates
  },
};

let watchId: number | undefined;

const sendDataToAPI = async (data: any[]) => {
  try {
    const response = await fetch('https://672fc91b66e42ceaf15eb4cc.mockapi.io/Attendance/${attendanceID}/LogTracking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Data sent to API:', responseData);
  } catch (error) {
    console.error('Error sending data to API:', error);
  }
};

const taskRandom = async (taskData: { locationDelay: any; apiDelay: any; }) => {
  const { locationDelay, apiDelay } = taskData;

  const watchPosition = () => {
    watchId = Geolocation.watchPosition(
      async (position) => {
        const datetime = new Date();
        const curr = datetime.toISOString();
        const { latitude, longitude, accuracy, altitude, speed } = position.coords;
        console.log('Updated Position:', { latitude, longitude, accuracy, altitude, curr });

        // Insert data into local DB every 10 seconds
        await insertLocalDB({ latitude, longitude, accuracy, altitude, curr, speed });
      },
      (error) => {
        console.error('Error watching position:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 0,
        interval: 5000,
        fastestInterval: 2000,
      }
    );
  };

  watchPosition();

  // Keep the task running
  while (BackgroundJob.isRunning()) {
    // Wait for location update interval
    await new Promise((resolve) => setTimeout(resolve, locationDelay));

    // Fetch data from local DB and send to API every minute
    const localData = await getLocalDB(); // Assuming this function fetches the data you want to send
    if (localData.length > 0) {
      await sendDataToAPI(localData);
      // Optionally, you can clear the local DB after sending
      // await deleteLocalDB(); // Uncomment if you want to clear the DB after sending
    }

    // Wait for API update interval
    await new Promise((resolve) => setTimeout(resolve, apiDelay));
  }
};

export const startBackgroundJob = async () => {
  try {
    console.log('Trying to start background service');
    await BackgroundJob.start(taskRandom, options);
    await AsyncStorage.setItem('backgroundJobRunning', 'true');
    console.log('Background service started successfully!');
  } catch (e) {
    console.error('Error starting background service:', e);
  }
};

export const stopBackgroundJob = async () => {
  try {
    console.log('Stopping background service');
    await BackgroundJob.stop();
    
    if (watchId !== undefined) {
      Geolocation.clearWatch(watchId);
      console.log('Location watch cleared');
    }

    await AsyncStorage.removeItem('backgroundJobRunning');
    console.log('Background service stopped successfully!');
  } catch (e) {
    console.error('Error stopping background service:', e);
  }
};

// Check if the background job should be started
export const checkBackgroundJobStatus = async () => {
  const isRunning = await AsyncStorage.getItem('backgroundJobRunning');
  if (isRunning === 'true') {
    console.log('Background job was running, restarting...');
    await startBackgroundJob();
  } else {
    console.log('Background job is not running.');
  }
};