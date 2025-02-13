import Realm from 'realm';

const LogPatrolSchema = {
  name: 'LogPatrol',
  primaryKey: 'id',
  properties: {
    id: 'int',
    dateTime: 'date',
    picture: 'string',
    situationType: 'string',
    checkpointID: 'int',
  },
};

// Create a Realm instance
const realm = new Realm({ 
  schema: [LogPatrolSchema],
  path: 'log_patrol.realm' // Unique path for the main database
});


// Get the next ID for auto-increment
const getNextId = () => {
  const logs = realm.objects('LogPatrol');
  if (logs.length > 0) {
    return logs.max('id') + 1; // Get the max ID and increment by 1
  }
  return 1; 
};

export const saveLogPatrol = (dateTime, picture, situationType, checkpointID) => {
  try {
    const id = getNextId(); 
    realm.write(() => {
      realm.create('LogPatrol', {
        id,
        dateTime,
        picture,
        situationType,
        checkpointID: Number(checkpointID),
      });
    });
    console.log('Log saved:', { id, dateTime, checkpointID, situationType });
  } catch (error) {
    console.error('Error saving log:', error);
  }
};

export const getAllLogsPatrol = () => {
  try {
    const logs = realm.objects('LogPatrol');
    return logs.map(log => ({
      id: log.id,
      dateTime: log.dateTime,
      picture: log.picture,
      situationType: log.situationType,
      checkpointID: log.checkpointID
    }));
  } catch (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
};

export const deleteLogPatrolById = (id) => {
  try {
    realm.write(() => {
      const log = realm.objectForPrimaryKey('LogPatrol', id);
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

export const deleteAllLogsPatrol = () => {
  try {
    realm.write(() => {
      const allLogs = realm.objects('LogPatrol');
      realm.delete(allLogs); // Deletes all logs
    });
    console.log('All logs deleted.');
  } catch (error) {
    console.error('Error deleting all logs:', error);
  }
};

export const getLogPatrolRealmInstance = () => realm;
