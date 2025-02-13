import realmInstance from './realmConfig';
import { saveLogsToFile } from './storageUtils';

export const getNextTempId = () => {
  const logs = realmInstance.objects('LogTrackingTemp');
  return logs.length > 0 ? logs.max('id') + 1 : 1;
};

export const saveTempLog = (dateTime, latitude, longitude, altitude, speed, accuracy) => {
  try {
    const id = getNextTempId();
    realmInstance.write(() => {
      realmInstance.create('LogTrackingTemp', {
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
    return realmInstance.objects('LogTrackingTemp').map(log => ({
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

export const deleteTempLogById = async (id) => {
  try {
    realmInstance.write(() => {
      const log = realmInstance.objectForPrimaryKey('LogTrackingTemp', id);
      if (log) {
        realmInstance.delete(log);
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
    const logs = getAllTempLogs();
    saveLogsToFile(logs, 'logTracking'); 

    realmInstance.write(() => {
      const allLogs = realmInstance.objects('LogTrackingTemp');
      realmInstance.delete(allLogs);
    });
    console.log('All temporary logs deleted.');
  } catch (error) {
    console.error('Error deleting all temporary logs:', error);
  }
};

export const getTempRealmInstance = () => realmInstance;
