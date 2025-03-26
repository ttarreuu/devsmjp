import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import PersonIcon from '../assets/person-login.svg';
import KeyIcon from '../assets/key-icon.svg';
import EmailIcon from '../assets/email-icon.svg';
import HiddenEmailIcon from '../assets/hidden-pw.svg';
import UnhideEmailIcon from '../assets/unhide-pw.svg';

export default function ForgotPwScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [isEmailVisible, setIsEmailVisible] = useState(false);

  // const handleLogin = () => {
  //   console.log('Reset Passworrd with:', email);
  // };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <PersonIcon height={300} width={300} />
        
        <View style={styles.contentContainer}>
          <KeyIcon width={45} height={45} />
          <View style={styles.contentTextContainer}>
            <Text style={styles.contentText}>Reset Password</Text>
            <Text style={styles.contentSubText}>Input your registered email below</Text>
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <EmailIcon width={20} height={20} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            secureTextEntry={!isEmailVisible}
            value={email}
            onChangeText={setEmail}
          />
          <TouchableOpacity onPress={() => setIsEmailVisible(!isEmailVisible)}>
            {isEmailVisible ? <UnhideEmailIcon width={20} height={20} /> : <HiddenEmailIcon width={20} height={20} />}
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.button}  onPress={() => navigation.navigate('UpdatePassword')}>
          <Text style={styles.textButton}>Reset Password</Text>
        </TouchableOpacity>
      
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
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
    marginTop: -50,
  },
  contentTextContainer: {
    marginLeft: 10,
  },
  contentText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#1185C8', 
  },
  contentSubText: {
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
  button: {
    backgroundColor: '#1185C8',
    padding: 7,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    width: '100%',
  },
  textButton: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  forgotEmailContainer: {
    width: '100%',
    alignItems: 'flex-end',
    marginTop: 10,
  },
  forgotEmailText: {
    color: '#1185C8',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    textDecorationLine: 'underline',
  },
});

