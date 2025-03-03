import realmInstance from './realmConfig'; // Correct way to import default export

// Get the next ID for auto-increment
const getNextId = () => {
  const logs = realmInstance.objects('LogPatrol');
  if (logs.length > 0) {
    return logs.max('id') + 1; // Get the max ID and increment by 1
  }
  return 1; 
};

export const saveLogPatrol = (dateTime, picture, situationType, checkpointID, method) => {
  try {
    const id = getNextId(); 
    realmInstance.write(() => {
      realmInstance.create('LogPatrol', {
        id,
        dateTime,
        picture,
        situationType,
        checkpointID,
        method,
      });
    });
    console.log('Log saved:', { id, dateTime, checkpointID, situationType, method });
  } catch (error) {
    console.error('Error saving log:', error);
  }
};

export const getAllLogsPatrol = () => {
  try {
    const logs = realmInstance.objects('LogPatrol');
    return logs.map(log => ({
      id: log.id,
      dateTime: log.dateTime,
      picture: log.picture,
      situationType: log.situationType,
      checkpointID: log.checkpointID,
      method: log.method
    }));
  } catch (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
};

export const deleteLogPatrolById = (id) => {
  try {
    realmInstance.write(() => {
      const log = realmInstance.objectForPrimaryKey('LogPatrol', id);
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

export const deleteAllLogsPatrol = () => {
  try {
    realmInstance.write(() => {
      const allLogs = realmInstance.objects('LogPatrol');
      realmInstance.delete(allLogs); 
    });
    console.log('All logs deleted.');
  } catch (error) {
    console.error('Error deleting all logs:', error);
  }
};

export const getLogPatrolRealmInstance = () => realmInstance;