import Realm from 'realm';
import RNFS from 'react-native-fs';
import RNSecureStorage from 'rn-secure-storage';
import CryptoJS from 'react-native-crypto-js';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  return logs.length > 0 ? logs.max('id') + 1 : 1;
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
    return realm.objects('LogTrackingTemp').map(log => ({
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

const folderPath = RNFS.ExternalStorageDirectoryPath + '/logTracking';
const id = async () => {
  const att = await AsyncStorage.getItem('attendanceID');
  return
};
const filePath = folderPath + '/' + id + '.aes';

const initializeFolderStorage = async () => {
  try {
    const folderExists = await RNFS.exists(folderPath);
    if (!folderExists) {
      await RNFS.mkdir(folderPath);
      console.log('Folder created: ', folderPath);
    }
  } catch (error) {
    console.error("error initializing folder:", error);
  }
};


const initializeFileStorage = async () => {
  try {
    // const filePath = await getFilePath();
    const fileExists = await RNFS.exists(filePath);
    if (!fileExists) {
      const initialData = JSON.stringify({ logTracking: [] });
      await RNFS.writeFile(filePath, initialData, 'utf8');
      console.log('File created: ', filePath);
    }
  } catch (error) {
    console.error('Error initializing file:', error);
  }
};

export const deleteTempLogById = async (id) => {

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

export const deleteAllTempLogs = async () => {
  try {
    await initializeFolderStorage();
    await initializeFileStorage();

    const logs = getAllTempLogs();
    
    const key = await RNSecureStorage.getItem('encryptKey');
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(logs), key).toString();

    // const filePath = await getFilePath();
    await RNFS.writeFile(filePath, encryptedData, 'utf8');
    Alert.alert('Success', `File written successfully: ${filePath}`);

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
