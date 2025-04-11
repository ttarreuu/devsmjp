import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Linking } from 'react-native';
import Addcall from '../../assets/call.svg'; 
import { getAllData } from '../../data/emergency_contact'; // Import the function to get all emergency contacts
import realmInstance from '../../data/realmConfig';

export default function EmergencyScreen() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const fetchContacts = async () => {
      const allData = realmInstance.objects('EmergencyContact');
      setContacts(allData);
    };

    fetchContacts();
  }, []);

  const makeCall = (number) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <View style={styles.container}>
      {contacts.map(contact => (
        <View key={contact.id} style={styles.card}>
          <Text style={styles.contactText}>{contact.name}</Text>
          <TouchableOpacity style={styles.button} onPress={() => makeCall(contact.number)}>
            <Addcall height={20} width={20} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#f5f5f5',
    marginTop: 50
  },
  card: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    padding: 15, 
    marginVertical: 10, 
    borderRadius: 10, 
    backgroundColor: '#fff', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 2, 
    elevation: 2 
  },
  contactText: { 
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    alignSelf: 'center'
  },
  button: { 
    padding: 10 
  }
});