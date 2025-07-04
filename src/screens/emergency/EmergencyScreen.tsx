import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  FlatList,
} from 'react-native';
import Addcall from '../../assets/call.svg';
import realmInstance from '../../data/realmConfig';

export default function EmergencyScreen() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const getEmergencyContacts = () => {
      try {
        const realmContacts = realmInstance.objects('EmergencyContact');
        const plainContacts = realmContacts.map(contact => ({
          id: contact.contactID,
          name: contact.name,
          number: contact.number,
        }));
        setContacts(plainContacts);
      } catch (error) {
        console.error('Error getting emergency contacts:', error);
        setContacts([]);
      }
    };

    getEmergencyContacts();
  }, []);

  const makeCall = number => {
    Linking.openURL(`tel:${number}`);
  };

  const renderItem = ({item}) => (
    <View style={styles.card}>
      <Text style={styles.contactText}>{item.name}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => makeCall(item.number)}>
        <Addcall height={20} width={20} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={contacts}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
    marginTop: 50,
  },
  listContent: {
    paddingBottom: 20,
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
  },
  contactText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    alignSelf: 'center',
  },
  button: {
    padding: 10,
  },
});
