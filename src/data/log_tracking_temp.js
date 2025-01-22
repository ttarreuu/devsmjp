import Realm from 'realm';

// Define the schema for log tracking temp
const LogTrackingTempSchema = {
  name: 'LogTrackingTemp',
  primaryKey: 'id',
  properties: {
    id: 'int', // Auto-incrementing integer ID
    dateTime: 'date', // DateTime of the log
    latitude: 'double',
    longitude: 'double',
    altitude: 'double',
    speed: 'double',
    accuracy: 'double',
  },
};

// Create a Realm instance
const realm = new Realm({ 
  schema: [LogTrackingTempSchema],
  path: 'log_tracking_temp.realm' // Unique path for the temporary database
});


// Get the next ID for auto-increment
const getNextTempId = () => {
  const logs = realm.objects('LogTrackingTemp');
  if (logs.length > 0) {
    return logs.max('id') + 1; // Get the max ID and increment by 1
  }
  return 1; // Start with 1 if no records exist
};

// Save a new log to the temporary database
export const saveTempLog = (dateTime, latitude, longitude, altitude, speed, accuracy) => {
  try {
    const id = getNextTempId(); // Get the next auto-incremented ID
    realm.write(() => {
      realm.create('LogTrackingTemp', {
        id,
        dateTime,
        latitude,
        longitude,
        altitude,
        speed,
        accuracy,
      });
    });
    console.log('Temporary log saved:', { id, dateTime, latitude, longitude });
  } catch (error) {
    console.error('Error saving temporary log:', error);
  }
};

// Fetch all logs from the temporary database
export const getAllTempLogs = () => {
  try {
    const logs = realm.objects('LogTrackingTemp');
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
    console.error('Error fetching temporary logs:', error);
    return [];
  }
};

// Delete a specific temporary log by ID
export const deleteTempLogById = (id) => {
  try {
    realm.write(() => {
      const log = realm.objectForPrimaryKey('LogTrackingTemp', id);
      if (log) {
        realm.delete(log);
        console.log('Temporary log deleted:', id);
      } else {
        console.log('Temporary log not found:', id);
      }
    });
  } catch (error) {
    console.error('Error deleting temporary log:', error);
  }
};

// Delete all logs from the temporary database
export const deleteAllTempLogs = () => {
  try {
    realm.write(() => {
      const allLogs = realm.objects('LogTrackingTemp');
      realm.delete(allLogs); // Deletes all logs
    });
    console.log('All temporary logs deleted.');
  } catch (error) {
    console.error('Error deleting all temporary logs:', error);
  }
};

// Realm instance for advanced use cases
export const getTempRealmInstance = () => realm;
