import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, Alert } from 'react-native';
import PersonIcon from '../assets/person-login.svg';
import FingerPrintIcon from '../assets/finger-print.svg';
import UserIcon from '../assets/user-icon.svg';
import PwIcon from '../assets/pw-icon.svg';
import HiddenPwIcon from '../assets/hidden-pw.svg';
import UnhidePwIcon from '../assets/unhide-pw.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
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
      const response = await fetch('https://672fc91b66e42ceaf15eb4cc.mockapi.io/user');
      const users = await response.json();

      const foundUser = users.find((user: { name: string; password: string; }) => user.name === username && user.password === password);

      if (foundUser) {
        console.log('Login Successful:', foundUser);
        
        await AsyncStorage.setItem('user', JSON.stringify(foundUser));

        navigation.navigate('MainTabs');
      } else {
        Alert.alert('Login Failed', 'Invalid username or password!');
      }
    } catch (error) {
      console.error('Login Error:', error);
      Alert.alert('Error', 'Failed to connect to the server. Please try again.');
    }
};

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <PersonIcon height={300} width={300} />
        
        <View style={styles.fingerprintContainer}>
          <FingerPrintIcon width={45} height={45} />
          <View style={styles.fingerprintTextContainer}>
            <Text style={styles.fingerprintText}>Login</Text>
            <Text style={styles.fingerprintSubText}>Input your registered username and password!</Text>
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
          <PwIcon width={20} height={20} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry={!isPasswordVisible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            {isPasswordVisible ? <UnhidePwIcon width={20} height={20} /> : <HiddenPwIcon width={20} height={20} />}
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
        
        <View style={styles.forgotPasswordContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // marginTop: -50,
  },
  scrollContainer: {
    alignItems: 'center',
    // flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 35,
  },
  fingerprintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
    marginTop: -50,
  },
  fingerprintTextContainer: {
    marginLeft: 10,
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
    width: '100%',
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
    width: '100%',
  },
  loginText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  forgotPasswordContainer: {
    width: '100%',
    alignItems: 'flex-end',
    marginTop: 10,
  },
  forgotPasswordText: {
    color: '#1185C8',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    textDecorationLine: 'underline',
  },
});

