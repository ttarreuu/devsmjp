import AsyncStorage from '@react-native-async-storage/async-storage';
import Realm from './realmConfig';
import NetInfo from '@react-native-community/netinfo';
import uuid from 'react-native-uuid';
import realmInstance from './realmConfig';

const getUserIDFromRealm = () => {
  const user = realmInstance.objects('User')[0];
  return user?.userID || null;
};

const postAttendanceToAPI = async (userID, attendanceID, shiftID, startDateTime, startPicture, startLat, startLong) => {
  const url = `https://672fc91b66e42ceaf15eb4cc.mockapi.io/user/${userID}/Attendance`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      attendanceID,
      shiftID,
      startDateTime,
      startPicture,
      startLat,
      startLong,
    }),
  });

  if (!res.ok) return null;

  const responseData = await res.json();
  return responseData.Id; 
};

const putAttendanceUpdateToAPI = async (userID, apiId, endDateTime, endPicture, endLat, endLong) => {
  const url = `https://672fc91b66e42ceaf15eb4cc.mockapi.io/user/${userID}/Attendance/${apiId}`;

  const response = await fetch(url);
  if (!response.ok) return false;

  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endDateTime, endPicture, endLat, endLong }),
  });

  return res.ok;
};

const postFullAttendanceToAPI = async (userID, log) => {
  const postUrl = `https://672fc91b66e42ceaf15eb4cc.mockapi.io/user/${userID}/Attendance`;

  const res = await fetch(postUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attendanceID: log.attendanceID,
      shiftID: log.shiftID,
      
      startDateTime: log.startDateTime,
      startPicture: log.startPicture,
      startLat: log.startLat,
      startLong: log.startLong,

      endDateTime: log.endDateTime,
      endPicture: log.endPicture,
      endLat: log.endLat,
      endLong: log.endLong,
    }),
  });

  return res.ok;
};

export const handleClockIn = async (shiftID, startDateTime, startPicture, startLat, startLong) => {
  try {
    const userID = getUserIDFromRealm();
    if (!userID) {
      console.error('User ID not found in Realm');
      return;
    }

    const attendanceID = uuid.v4().toString();
    await AsyncStorage.setItem('attendanceID', attendanceID);
    console.log(attendanceID);

    Realm.write(() => {
      Realm.create('Log', {
        attendanceID,
        shiftID,

        startDateTime,
        startPicture,
        startLat,
        startLong,

        endDateTime: '',
        endPicture: '',
        endLat: '',
        endLong: '',

        LogTracking: [],
      });
    });

    const netState = await NetInfo.fetch();
    if (netState.isConnected) {
      const apiAttendanceID = await postAttendanceToAPI(userID, attendanceID, shiftID, startDateTime, startPicture, startLat, startLong);
      if (apiAttendanceID) {
        await AsyncStorage.setItem('apiId', apiAttendanceID);
        await AsyncStorage.setItem('clockInSynced', 'true');
        console.log(`Attendance ID from API: ${apiAttendanceID}`);
      } else {
        await AsyncStorage.setItem('clockInSynced', 'false');
      }
    } else {
      await AsyncStorage.setItem('clockInSynced', 'false');
    }

    console.log('Clock-In Successful!');
  } catch (error) {
    console.error('Clock-In Error:', error);
  }
};

export const handleClockOut = async (endDateTime, endPicture, endLat, endLong) => {
  try {
    const userID = getUserIDFromRealm();
    if (!userID) {
      console.error('User ID not found in Realm');
      return;
    }

    const attendanceID = await AsyncStorage.getItem('attendanceID');
    if (!attendanceID) {
      console.error('Attendance ID not found in AsyncStorage');
      return;
    }

    const log = Realm.objectForPrimaryKey('Log', attendanceID);
    if (!log) {
      console.error('Log not found in Realm');
      return;
    }

    Realm.write(() => {
      log.endDateTime = endDateTime;
      log.endPicture = endPicture;
      log.endlat = endLat;
      log.endLong = endLong;
    });

    const apiId = await AsyncStorage.getItem('apiId');
    const netState = await NetInfo.fetch();

    if (netState.isConnected) {
      let success = await putAttendanceUpdateToAPI(userID, apiId, endDateTime, endPicture, endLat, endLong);

      if (!success) {
        success = await postFullAttendanceToAPI(userID, log);
        if (!success) {
          await AsyncStorage.setItem('clockOutSynced', 'false');
          console.error('Failed to sync even with fallback POST');
          return;
        }
      }

      await AsyncStorage.setItem('clockOutSynced', 'true');

      realmInstance.write(() => {
        realmInstance.delete(log);
      });

      await AsyncStorage.removeItem('apiId');
      await AsyncStorage.removeItem('attendanceID');
      await AsyncStorage.removeItem('clockInSynced');

      console.log(`Synced and deleted log ${attendanceID}`);
    } else {
      await AsyncStorage.setItem('clockOutSynced', 'false');
      console.log('Offline — data saved to Realm and will sync later.');
    }
  } catch (error) {
    await AsyncStorage.setItem('clockOutSynced', 'false');
    console.error('Clock-Out Error:', error);
  }
};

export const syncRealmToApi = async () => {
  const userID = getUserIDFromRealm();
  if (!userID) {
    console.error('User ID not found in Realm');
    return;
  }

  const netState = await NetInfo.fetch();
  if (!netState.isConnected) return;

  const clockInSynced = await AsyncStorage.getItem('clockInSynced');
  const clockOutSynced = await AsyncStorage.getItem('clockOutSynced');
  const attendanceID = await AsyncStorage.getItem('attendanceID');

  if (!attendanceID) return;

  const log = Realm.objectForPrimaryKey('Log', attendanceID);
  if (!log) {
    console.warn('Log not found in Realm for syncing');
    return;
  }

  try {
    if (clockInSynced === 'false') {
      const apiAttendanceID = await postAttendanceToAPI(userID, attendanceID, log.shiftID, log.startDateTime, log.startPicture, log.startLat, log.startLong);
      if (apiAttendanceID) {
        await AsyncStorage.setItem('apiId', apiAttendanceID);
        await AsyncStorage.setItem('clockInSynced', 'true');
        console.log('Clock-in data re-synced');
      }
    }

    if (clockOutSynced === 'false' && log.endDateTime && log.endPicture && log.endLat && log.endLong) {
      const apiId = await AsyncStorage.getItem('apiId');
      let success = false;

      if (apiId) {
        success = await putAttendanceUpdateToAPI(userID, apiId, log.endDateTime, log.endPicture, log.endLat, log.endLong);
      }

      if (!success) {
        success = await postFullAttendanceToAPI(userID, log);
      }

      if (success) {
        await AsyncStorage.setItem('clockOutSynced', 'true');

        realmInstance.write(() => {
          realmInstance.delete(log);
        });

        await AsyncStorage.multiRemove(['apiId', 'attendanceID', 'clockInSynced', 'clockOutSynced']);
        console.log('Clock-out data re-synced and log deleted');
      }
    }
  } catch (error) {
    console.error('Sync error:', error);
  }
};
