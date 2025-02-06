import RNFS from 'react-native-fs';
import CryptoJS from 'crypto-js';
import uuid from 'react-native-uuid';
import { getAllTempLogs, deleteAllTempLogs } from './log_tracking_temp';
import EncryptedStorage from 'react-native-encrypted-storage';

const folderPath = RNFS.DownloadDirectoryPath + '/logTracking';
const filePath = `${folderPath}/logtracking`;

const getEncryptionKey = async () => {
  let encryptionKey = await EncryptedStorage.getItem('encryptionKey');
  if (!encryptionKey) {
      encryptionKey = uuid.v4();

      console.log(encryptionKey);
      await EncryptedStorage.setItem('encryptionKey', encryptionKey);
  }
  console.log (EncryptedStorage.getItem('encryptionKey'));
  return encryptionKey;
};

const encryptData = (data, key) => {
  const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
  return ciphertext;
};

const saveLogsToStorage = async () => {
  try {
    const folderExists = await RNFS.exists(folderPath);
    if (!folderExists) {
      await RNFS.mkdir(folderPath);
    }

    const logs = await getAllTempLogs();

    if (logs.length === 0) {
      console.log('Tidak ada log untuk disimpan.');
      return;
    }

    const encryptionKey = await getEncryptionKey();

    const encryptedLogs = encryptData(logs, encryptionKey);

    // Simpan ke file
    await RNFS.writeFile(filePath, encryptedLogs, 'utf8');
    console.log('Log berhasil disimpan dengan enkripsi AES.');

    deleteAllTempLogs();

    AsyncStorage.removeItem('attendanceID');
    AsyncStorage.removeItem('logID');
  } catch (error) {
    console.error('Gagal menyimpan log:', error);
  }
};

export { saveLogsToStorage };
