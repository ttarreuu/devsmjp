import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  downloadMapboxOfflineRegion,
  deleteOfflineMapboxRegions,
} from '../components/Maps';
import {fetchData} from '../data/sync_data';
import realmInstance from '../data/realmConfig';
import LogoutIcon from '../assets/logout-icon.svg';
import FetchIcon from '../assets/fetch-data.svg';
import MapsIcon from '../assets/download-maps.svg';
import CustomAlert from '../components/CustomAlert';
import {useNavigation} from '@react-navigation/native';
import {requestMultiplePermissions} from '../setup/permission';
import NetInfo from '@react-native-community/netinfo';
import DeviceInfo from 'react-native-device-info';
import Popup from '../components/Popup';
import networkSpeed from 'react-native-network-speed';

const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingData, setLoadingData] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupData, setPopupData] = useState<
    {[key: string]: string | number}[]
  >([]);


  const navigation = useNavigation();

  useEffect(() => {
    const getUserAndCompany = () => {
      const realmUser = realmInstance.objects('User')[0];
      const realmCompany = realmInstance.objects('Company')[0];
      if (realmUser) setUser(realmUser);
      if (realmCompany) setCompanyName(realmCompany.name);
    };
    getUserAndCompany();
  }, []);

  const handleRedownload = async () => {
    setDownloading(true);
    setProgress(0);
    await deleteOfflineMapboxRegions();
    await AsyncStorage.removeItem('offlineMapDownloaded');
    await downloadMapboxOfflineRegion(percentage => {
      setProgress(percentage);
    });
    setDownloading(false);
    setAlertTitle('Download Completed');
    setAlertMessage('Offline maps have been successfully downloaded.');
    setAlertVisible(true);
  };

  const handleFetchData = async () => {
    try {
      setLoadingData(true);
      await fetchData();
      setAlertTitle('Fetch Completed');
      setAlertMessage('Data has been successfully fetched and stored.');
    } catch (err) {
      setAlertTitle('Error');
      setAlertMessage('Failed to fetch data.');
    } finally {
      setLoadingData(false);
      setAlertVisible(true);
    }
  };

  const handleLogout = async () => {
    realmInstance.write(() => {
      realmInstance.deleteAll();
    });
    await AsyncStorage.clear();
    setAlertTitle('Logged Out');
    setAlertMessage('You have successfully logged out.');
    setAlertVisible(true);
    navigation.navigate('LoginScreen');
  };

  const handleCheckPermissions = async () => {
    await requestMultiplePermissions();
  };

  const handleDeviceInfo = async () => {
    const [
      deviceId,
      model,
      systemName,
      systemVersion,
      appVersion,
      brand,
      manufacturer,
      carrier,
      batteryLevel,
      isCharging,
      ipAddress,
    ] = await Promise.all([
      DeviceInfo.getDeviceId(),
      DeviceInfo.getModel(),
      DeviceInfo.getSystemName(),
      DeviceInfo.getSystemVersion(),
      DeviceInfo.getVersion(),
      DeviceInfo.getBrand(),
      DeviceInfo.getManufacturer(),
      DeviceInfo.getCarrier(),
      DeviceInfo.getBatteryLevel(),
      DeviceInfo.isBatteryCharging(),
      DeviceInfo.getIpAddress(),
    ]);

    const netInfo = await NetInfo.fetch();
    const timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = -new Date().getTimezoneOffset() / 60;
    const formattedOffset = offset >= 0 ? `+${offset}` : `${offset}`;

    // Manual download speed test
    const testDownloadSpeed = async () => {
      const testUrl = 'https://speed.hetzner.de/100MB.bin'; // A large test file
      const startTime = new Date().getTime();
      try {
        const response = await fetch(testUrl, {
          method: 'GET',
          headers: {Range: 'bytes=0-500000'},
        });
        const endTime = new Date().getTime();
        const durationInSeconds = (endTime - startTime) / 1000;
        const fileSizeInBits = 500000 * 8;
        const speedKbps = fileSizeInBits / durationInSeconds / 1000;
        return `${speedKbps.toFixed(2)} kbps`;
      } catch (error) {
        return 'Speed test failed';
      }
    };

    const downloadSpeed = await testDownloadSpeed();

    const deviceData = [
      {Key: 'Device ID', Value: deviceId},
      {Key: 'Model', Value: model},
      {Key: 'OS & Version', Value: `${systemName} ${systemVersion}`},
      {Key: 'App Version', Value: appVersion},
      {Key: 'Brand / Manufacturer', Value: `${brand} / ${manufacturer}`},
      {Key: 'IP Address', Value: ipAddress},
      {Key: 'Network Type', Value: netInfo.type},
      {Key: 'Timezone', Value: `${timezoneName} (UTC${formattedOffset})`},
      {Key: 'Carrier', Value: carrier || 'N/A'},
      {
        Key: 'Battery',
        Value: `${(batteryLevel * 100).toFixed(0)}% (${
          isCharging ? 'Charging' : 'Not Charging'
        })`,
      },
      {Key: 'Download Speed', Value: downloadSpeed},
    ];

    setPopupTitle('Device Information');
    setPopupData(deviceData);
    setPopupVisible(true);
  };



  return (
    <ScrollView contentContainerStyle={styles.container}>
      {user && (
        <View style={styles.header}>
          <Image
            source={{
              uri: user.photo
                ? `data:image/jpeg;base64,${user.photo}`
                : 'https://via.placeholder.com/60',
            }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{companyName}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.backgroundButton]}
          onPress={handleRedownload}
          disabled={downloading}>
          <MapsIcon width={40} height={40} />
          <Text style={styles.buttonText}>
            {downloading ? 'Downloading...' : 'Download Maps'}
          </Text>
          {downloading && (
            <Text style={styles.progressTextRight}>{progress.toFixed(2)}%</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.backgroundButton]}
          onPress={handleFetchData}
          disabled={loadingData}>
          <FetchIcon width={40} height={40} />
          <Text style={styles.buttonText}>
            {loadingData ? 'Fetching Data...' : 'Fetch Data'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.backgroundButton]}
          onPress={handleCheckPermissions}>
          <Text style={styles.buttonText}>Check Permissions</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.backgroundButton]}
          onPress={handleLogout}>
          <LogoutIcon width={40} height={40} />
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.backgroundButton]}
          onPress={handleDeviceInfo}>
          <Text style={styles.buttonText}>Device Info</Text>
        </TouchableOpacity>
      </View>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />

      <Popup
        visible={popupVisible}
        title={popupTitle}
        data={popupData}
        onClose={() => setPopupVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    marginBottom: 5,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    color: '#333',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  email: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  progressTextRight: {
    position: 'absolute',
    right: 10,
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  buttonContainer: {
    marginTop: 5,
    width: '90%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'flex-start',
    height: 50,
    position: 'relative',
  },
  backgroundButton: {
    // borderColor: '#007AFF',
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default ProfileScreen;
