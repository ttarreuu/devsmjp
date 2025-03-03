import realmInstance from './realmConfig'; 

const getNextId = () => {
  const logs = realmInstance.objects('LogTracking');
  if (logs.length > 0) {
    return logs.max('id') + 1;
  }
  return 1; 
};

export const saveLog = (dateTime, latitude, longitude, altitude, speed, accuracy) => {
  try {
    const id = getNextId(); 
    realmInstance.write(() => {
      realmInstance.create('LogTracking', {
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

export const getAllLogs = () => {
  try {
    const logs = realmInstance.objects('LogTracking');
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

export const deleteLogById = (id) => {
  try {
    realmInstance.write(() => {
      const log = realmInstance.objectForPrimaryKey('LogTracking', id);
      if (log) {
        realmInstance.delete(log);
        console.log('Log deleted:', id);
      } else {
        console.log('Log not found:', id);
      }
    });
  } catch (error) {
    console.error('Error deleting log:', error);
  }
};

export const deleteAllLogs = () => {
  try {
    realmInstance.write(() => {
      const allLogs = realmInstance.objects('LogTracking');
      realmInstance.delete(allLogs);
    });
    console.log('All logs deleted.');
  } catch (error) {
    console.error('Error deleting all logs:', error);
  }
};

export const getRealmInstance = () => realmInstance;