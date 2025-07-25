import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  useWindowDimensions,
} from 'react-native';

import PersonIcon from '../assets/person-login.svg';
import FingerPrintIcon from '../assets/finger-print.svg';
import UserIcon from '../assets/user-icon.svg';
import PwIcon from '../assets/pw-icon.svg';
import HiddenPwIcon from '../assets/hidden-pw.svg';
import UnhidePwIcon from '../assets/unhide-pw.svg';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {fetchData} from '../data/sync_data';
import {downloadMapboxOfflineRegion} from '../components/Maps';
import realmInstance from '../data/realmConfig';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const {width, height} = useWindowDimensions();
  const isLandscape = width > height;

  useEffect(() => {
    const checkLoginStatus = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        navigation.navigate('MainTabs');
      }
    };
    checkLoginStatus();
  }, []);

  const handleLogin = async () => {
    try {
      const res = await fetch(
        'https://672fc91b66e42ceaf15eb4cc.mockapi.io/user',
      );
      const users = await res.json();
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();

      const foundUser = users.find(
        (u: {name: string; email: string; password: string}) =>
          (u.name === trimmedUsername || u.email === trimmedUsername) &&
          u.password === trimmedPassword,
      );

      if (foundUser) {
        await AsyncStorage.setItem('user', JSON.stringify(foundUser));

        realmInstance.write(() => {
          realmInstance.create('User', {
            userID: foundUser.userID,
            name: foundUser.name,
            photo: foundUser.photo || '',
            email: foundUser.email,
            phone: foundUser.phone || '',
          });
        });

        const companyRes = await fetch(
          'https://672fc91b66e42ceaf15eb4cc.mockapi.io/company',
        );
        const companies = await companyRes.json();

        const userCompany = companies.find(
          (company: any) => company.companyID === foundUser.companyID,
        );

        if (userCompany) {
          realmInstance.write(() => {
            realmInstance.create('Company', {
              companyID: userCompany.companyID,
              name: userCompany.name,
              Lat: userCompany.Lat,
              Long: userCompany.Long,
              radius: userCompany.radius,
            });
          });

          await AsyncStorage.setItem('company', JSON.stringify(userCompany));
          console.log(
            'Company data saved to Realm and AsyncStorage:',
            userCompany,
          );
        } else {
          console.warn('Company not found for companyID:', foundUser.companyID);
        }

        await fetchData();
        downloadMapboxOfflineRegion();
        navigation.navigate('MainTabs');
      } else {
        Alert.alert('Login Failed', 'Incorrect username or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      Alert.alert('Error', 'Unable to connect to server');
    }
  };

  const content = (
    <ScrollView scrollEnabled={false}>
      <View style={styles.centeredContent}>
        <PersonIcon height={300} width={300} />
        <View style={styles.fingerprintContainer}>
          <FingerPrintIcon width={45} height={45} />
          <View style={styles.fingerprintTextContainer}>
            <Text style={styles.fingerprintText}>Login</Text>
            <Text style={styles.fingerprintSubText}>
              Input your registered username and password!
            </Text>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <UserIcon width={15} height={15} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <View style={styles.inputContainer}>
          <PwIcon width={15} height={20} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry={!isPasswordVisible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            {isPasswordVisible ? (
              <UnhidePwIcon width={20} height={20} />
            ) : (
              <HiddenPwIcon width={20} height={20} />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        <View style={styles.forgotPasswordContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      {isLandscape ? <ScrollView>{content}</ScrollView> : content}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // justifyContent: 'center',
  },
  centeredContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  fingerprintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
    marginTop: -50,
    width: '90%',
    maxWidth: 300,
  },
  fingerprintTextContainer: {
    marginLeft: 10,
    maxWidth: '80%'
  },
  fingerprintText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#1185C8',
  },
  fingerprintSubText: {
    marginTop: -5,
    fontSize: 11,
    color: '#888',
    fontFamily: 'Poppins-Medium',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: '#E5E5E5',
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 10,
    marginVertical: 10,
    width: '90%',
    maxWidth: 350,
  },
  input: {
    flex: 1,
    marginLeft: 10,
  },
  loginButton: {
    backgroundColor: '#1185C8',
    padding: 7,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    width: '90%',
    maxWidth: 350,
  },
  loginText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  forgotPasswordContainer: {
    width: '90%',
    maxWidth: 350,
    alignItems: 'flex-end',
    marginTop: 10,
  },
  forgotPasswordText: {
    color: '#1185C8',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    textDecorationLine: 'underline',
    marginBottom: 50
  },
});
