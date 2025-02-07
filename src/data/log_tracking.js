import Realm from 'realm';

// Define the schema for log tracking
const LogTrackingSchema = {
  name: 'LogTracking',
  primaryKey: 'id',
  properties: {
    id: 'int', // Auto-incrementing integer ID
    dateTime: 'date', // DateTime of the log
    latitude: 'double',
    longitude: 'double',
    altitude: 'double',
    speed: 'double',
    accuracy: 'double'
  },
};

// Create a Realm instance
const realm = new Realm({ 
  schema: [LogTrackingSchema],
  path: 'log_tracking.realm' // Unique path for the main database
});


// Get the next ID for auto-increment
const getNextId = () => {
  const logs = realm.objects('LogTracking');
  if (logs.length > 0) {
    return logs.max('id') + 1; // Get the max ID and increment by 1
  }
  return 1; 
};

export const saveLog = (dateTime, latitude, longitude, altitude, speed, accuracy) => {
  try {
    const id = getNextId(); 
    realm.write(() => {
      realm.create('LogTracking', {
        id,
        dateTime,
        longitude,
        latitude,
        altitude,
        speed,
        accuracy
      });
    });
    console.log('Log saved:', { id, latitude, longitude, dateTime });
  } catch (error) {
    console.error('Error saving log:', error);
  }
};

// Fetch all logs from the database
export const getAllLogs = () => {
  try {
    const logs = realm.objects('LogTracking');
    return logs.map(log => ({
      id: log.id,
      dateTime: log.dateTime,
      latitude: log.latitude,
      longitude: log.longitude,
      altitude: log.altitude,
      speed: log.speed,
      accuracy: log.accuracy,
    }));
  } catch (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
};

// Delete a specific log by ID
export const deleteLogById = (id) => {
  try {
    realm.write(() => {
      const log = realm.objectForPrimaryKey('LogTracking', id);
      if (log) {
        realm.delete(log);
        console.log('Log deleted:', id);
      } else {
        console.log('Log not found:', id);
      }
    });
  } catch (error) {
    console.error('Error deleting log:', error);
  }
};

// Delete all logs from the database
export const deleteAllLogs = () => {
  try {
    realm.write(() => {
      const allLogs = realm.objects('LogTracking');
      realm.delete(allLogs); // Deletes all logs
    });
    console.log('All logs deleted.');
  } catch (error) {
    console.error('Error deleting all logs:', error);
  }
};

// Realm instance for advanced use cases
export const getRealmInstance = () => realm;
