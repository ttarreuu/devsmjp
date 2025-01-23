import Realm from 'realm';

const LogTrackingTempSchema = {
  name: 'LogTrackingTemp',
  primaryKey: 'id',
  properties: {
    id: 'int', 
    dateTime: 'date', 
    latitude: 'double',
    longitude: 'double',
    altitude: 'double',
    speed: 'double',
    accuracy: 'double',
  },
};

const realm = new Realm({ 
  schema: [LogTrackingTempSchema],
  path: 'log_tracking_temp.realm' 
});


const getNextTempId = () => {
  const logs = realm.objects('LogTrackingTemp');
  if (logs.length > 0) {
    return logs.max('id') + 1; 
  }
  return 1; 
};

export const saveTempLog = (dateTime, latitude, longitude, altitude, speed, accuracy) => {
  try {
    const id = getNextTempId(); 
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

export const deleteAllTempLogs = () => {
  try {
    realm.write(() => {
      const allLogs = realm.objects('LogTrackingTemp');
      realm.delete(allLogs);
    });
    console.log('All temporary logs deleted.');
  } catch (error) {
    console.error('Error deleting all temporary logs:', error);
  }
};

export const getTempRealmInstance = () => realm;
