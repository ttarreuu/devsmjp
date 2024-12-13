import BackgroundJob from 'react-native-background-actions';
import Geolocation from 'react-native-geolocation-service';

const options = {
  taskName: 'Geolocation Task',
  taskTitle: 'Tracking User Location',
  taskDesc: 'Tracking location',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#ff00ff',
  // linkingURI: 'exampleScheme://chat/jane', 
  parameters: {
    delay: 1000, //delay update foreground
  },
};

// Variable untuk menyimpan watch ID
let watchId: number | null = null;

const taskRandom = async (taskData: any) => {
  const { delay } = taskData;

  const startWatchingPosition = () => {
    watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, altitude } = position.coords;
        console.log('Updated Position:', { latitude, longitude, accuracy, altitude });
      },
      (error) => {
        console.error('Error watching position:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 0,
        interval: 0,
      }
    );
  };

  startWatchingPosition();

  while (BackgroundJob.isRunning()) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  if (watchId !== null) {
    Geolocation.clearWatch(watchId);
    watchId = null;
  }
};

export const startBackgroundJob = async () => {
  try {
    console.log('Trying to start background service');
    await BackgroundJob.start(taskRandom, options);
    console.log('Background service started successfully!');
  } catch (e) {
    console.error('Error starting background service:', e);
  }
};

export const stopBackgroundJob = async () => {
  try {
    console.log('Stopping background service');
    await BackgroundJob.stop();

    if (watchId !== null) {
      Geolocation.clearWatch(watchId);
      watchId = null;
    }

    console.log('Background service stopped successfully!');
  } catch (e) {
    console.error('Error stopping background service:', e);
  }
};
