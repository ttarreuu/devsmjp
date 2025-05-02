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
import { requestMultiplePermissions } from '../setup/permission';

const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingData, setLoadingData] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const navigation = useNavigation(); 

  useEffect(() => {
    const getUserAndCompany = () => {
      const realmUser = realmInstance.objects('User')[0];
      const realmCompany = realmInstance.objects('Company')[0];

      if (realmUser) {
        setUser(realmUser);
      }
      if (realmCompany) {
        setCompanyName(realmCompany.name);
      }
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

    const downloaded = await AsyncStorage.getItem('offlineMapDownloaded');
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
  const realmUser = realmInstance.objects('User')[0];
  const realmCompany = realmInstance.objects('Company')[0];

  if (realmUser) {
    setUser(realmUser); 
  }
  if (realmCompany) {
    setCompanyName(realmCompany.name); 
  }

  console.log('User:', realmUser);
  console.log('Company:', realmCompany);

  realmInstance.write(() => {
    realmInstance.deleteAll();
  });

  await AsyncStorage.clear();

  setAlertTitle('Logged Out');
  setAlertMessage('You have successfully logged out.');

  navigation.navigate('LoginScreen');
};


  const handleCloseAlert = () => {
    setAlertVisible(false);
  };

  const handleCheckPermissions = async () => {
    await requestMultiplePermissions();
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

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={handleCloseAlert}
      />
    </ScrollView>
  );
};

export default ProfileScreen;

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
