import AsyncStorage from '@react-native-async-storage/async-storage';
import realmInstance from './realmConfig';
import { saveLogsToFile } from './storageUtils';

export const getNextTempId = () => {
  const logs = realmInstance.objects('LogPatrolTemp');
  return logs.length > 0 ? logs.max('id') + 1 : 1;
};

export const saveLogPatrolTempLog = (dateTime, picture, situationType, checkpointID) => {
  try {
    const id = getNextTempId();
    realmInstance.write(() => {
      realmInstance.create('LogPatrolTemp', {
        id,
        dateTime,
        picture,
        situationType,
        checkpointID: Number(checkpointID),
      });
    });
    console.log('Temporary patrol log saved:', { id, checkpointID });
  } catch (error) {
    console.error('Error saving patrol temporary log:', error);
  }
};

export const getAllLogPatrolTempLogs = () => {
  try {
    return realmInstance.objects('LogPatrolTemp').map(log => ({
      id: log.id,
      dateTime: log.dateTime,
      picture: log.picture,
      situationType: log.situationType,
      checkpointID: log.checkpointID
    }));
  } catch (error) {
    console.error('Error fetching patrol temporary logs:', error);
    return [];
  }
};

export const deleteLogPatrolTempLogById = async (id) => {
  try {
    realmInstance.write(() => {
      const log = realmInstance.objectForPrimaryKey('LogPatrolTemp', id);
      if (log) {
        realmInstance.delete(log);
        console.log('Temporary patrol log deleted:', id);
      } else {
        console.log('Temporary patrol log not found:', id);
      }
    });
  } catch (error) {
    console.error('Error deleting patrol temporary log:', error);
  }
};

// export const deleteLogPatrolAllTempLogs = async () => {
//   try {
//     const logs = getAllLogPatrolTempLogs();
//     saveLogsToFile(logs, 'logPatrol'); 
//     await sendDataToApi(logs);

//     realmInstance.write(() => {
//       const allLogs = realmInstance.objects('LogPatrolTemp');
//       realmInstance.delete(allLogs);
//     });
//     console.log('All temporary patrol logs deleted.');
//   } catch (error) {
//     console.error('Error deleting all temporary patrol logs:', error);
//   }
// };

// const sendDataToApi = async (logs) => {
//   try {
//     const AttendanceID = await AsyncStorage.getItem('attendanceID');
//     if (!AttendanceID) {
//       console.error('AttendanceID not found in AsyncStorage');
//       return;
//     }

//     const apiURL = `https://672fc91b66e42ceaf15eb4cc.mockapi.io/Attendance/${AttendanceID}/LogPatrol`;
//     const logPatrolID = Date.now(); // Unique ID based on timestamp

//     let existingData = {
//       logPatrolID,
//       attendanceID: AttendanceID,
//       logPatrol: logs.map(({ dateTime, picture, situationType, checkpointID }) => ({
//         dateTime,
//         picture,
//         situationType,
//         checkpointID
//       })),
//     };

//     const postResponse = await fetch(apiURL, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(existingData),
//     });

//     if (postResponse.ok) {
//       const createdData = await postResponse.json(); 
//       console.log('New data created successfully:', createdData);
//     } else {
//       console.error('Error creating new data:', postResponse.statusText);
//     }
//   } catch (error) {
//     console.error('Error sending data to API:', error);
//   }
// };

export const deleteAllTempPatrolLogs = () => {
  try {
    const logs = getAllLogPatrolTempLogs();
    saveLogsToFile(logs, 'logPatrol'); 

    realmInstance.write(() => {
      const allLogs = realmInstance.objects('LogPatrolTemp');
      realmInstance.delete(allLogs);
    });
    console.log('All temporary logs patrol deleted.');
  } catch (error) {
    console.error('Error deleting all temporary logs patrol:', error);
  }
};

export const getTempLogPatrolRealmInstance = () => realmInstance;
