import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import BackIcon from '../assets/button-back.svg'; 
import NFCIcon from '../assets/nfc.svg';
import CameraIcon from '../assets/camera.svg';

export default function NotificationScreen() {
  const [selectedValue, setSelectedValue] = useState('');
  const [notes, setNotes] = useState('');
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <BackIcon width={35} height={35}/>
        </TouchableOpacity>
        <Text style={styles.title}>Patrol NFC</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.box}>
          <NFCIcon width={150} height={150} />
          <Text style={styles.nfcStatus}>Approach NFC Tag</Text>
        </View>

        <Text style={styles.subtitle}>Status</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedValue}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedValue(itemValue)}
          >
            <Picker.Item label="" value=""/>
            <Picker.Item label="Safe" value="Safe" />
            <Picker.Item label="Not Safe" value="Not Safe"/>
          </Picker>
        </View>

        <Text style={styles.subtitle}>Description</Text>
        <TextInput
          style={styles.textInput}
          multiline
          value={notes}            
          onChangeText={setNotes}
        />

        <View>
          <TouchableOpacity style={styles.buttonOpenCamera}>
            <CameraIcon height={20} width={20}/>
            <Text style={styles.buttonTextOpenCamera}>Add Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
    marginTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
    marginBottom: 10,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -50 }],
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: 30,
  },
    box: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5, 
    marginTop: -10,
  },
  nfcStatus: {
    fontSize: 12, // Increased font size for better visibility
    color: 'red',
    marginTop: -20,
    marginBottom: 10 // Added margin for spacing
  },
  subtitle: {
    fontWeight: 'bold',
    color: '#6A6A6A',
    marginTop: 3,
  },
  pickerContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  picker: {
    width: '100%',
    // height: '10%',
    backgroundColor: 'white',
  },
  textInput: {
    width: '100%',
    height: '15%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    textAlignVertical: 'top',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  buttonOpenCamera: {
    width: '100%',
    padding: 12,
    backgroundColor: '#ffff',
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 15,
  },
  buttonTextOpenCamera: {
    marginLeft: 10,
    color: 'black',
    fontSize: 14,
  },
  button: {
    width: '100%',
    padding: 12,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});