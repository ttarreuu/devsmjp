import RNFS from 'react-native-fs';
import RNSecureStorage from 'rn-secure-storage';
import CryptoJS from 'react-native-crypto-js';
import { Alert } from 'react-native';

const rootPath = RNFS.ExternalStorageDirectoryPath + '/SMJP';

export const initializeFolderStorage = async () => {
  try {
    const rootExists = await RNFS.exists(rootPath);
    if (!rootExists) {
      await RNFS.mkdir(rootPath);
      console.log('Folder created: ', rootPath);
    }
  } catch (error) {
    console.error("Error initializing folder:", error);
  }
};

export const getFilePath = async (method) => {
  const folderPath = `${rootPath}/${method}`;
  const folderExists = await RNFS.exists(folderPath);
  if (!folderExists) {
    await RNFS.mkdir(folderPath);
    console.log('Folder created:', folderPath);
  }

  const now = new Date();
  const formattedDate = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}_${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;

  return `${folderPath}/${formattedDate}_${method}.aes`;
};

export const saveLogsToFile = async (logs, method) => {
  try {
    await initializeFolderStorage();
    const filePath = await getFilePath(method);

    const initialData = JSON.stringify({ method: [] });
    await RNFS.writeFile(filePath, initialData, 'utf8');

    const key = await RNSecureStorage.getItem('encryptKey');
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(logs), key).toString();
    
    await RNFS.writeFile(filePath, encryptedData, 'utf8');
    Alert.alert('Success', `File written successfully: ${filePath}`);
  } catch (error) {
    console.error('Error saving logs to file:', error);
  }
};