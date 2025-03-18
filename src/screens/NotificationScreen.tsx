import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import BackIcon from '../assets/button-back.svg'; // Adjust path based on your file structure

export default function NotificationScreen() {
  const [selectedValue, setSelectedValue] = useState('');
  const [notes, setNotes] = useState('');
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <BackIcon width={35} height={35} color={'black'}/>
        </TouchableOpacity>
        <Text style={styles.title}>Patrol NFC</Text>
      </View>

      <View style={styles.box}>
      </View>

      <Picker
        selectedValue={selectedValue}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedValue(itemValue)}
      >
        <Picker.Item label="Select an option" value="" />
        <Picker.Item label="Option 1" value="option1" />
        <Picker.Item label="Option 2" value="option2" />
      </Picker>

      <TextInput
        style={styles.textInput}
        placeholder="Enter your notes here..."
        multiline
        value={notes}
        onChangeText={setNotes}
      />

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
  },
   header: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
    marginVertical: 15,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 10,
  },
  title: {
    fontFamily: 'sans-serif',
    fontSize: 20,
    fontWeight: 'bold',
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -50 }],
  },
  box: {
    width: '100%',
    height: '30%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5, 
    marginBottom: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  picker: {
    width: '100%',
    backgroundColor: 'white',
    marginBottom: 20,
  },
  textInput: {
    width: '100%',
    height: 150,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    textAlignVertical: 'top',
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#007BFF',
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

