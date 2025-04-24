import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import realmInstance from '../../data/realmConfig'; 

export default function ChatListScreen() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      const userData = await AsyncStorage.getItem('user');
      const parsedUser = JSON.parse(userData);
      setCurrentUser(parsedUser);

      try {
        const company = realmInstance.objects('Company')[0];
        const companyID = company?.companyID;

        if (!companyID) {
          console.error('No company ID found in Realm');
          return;
        }

        const allUsersResponse = await fetch(
          'https://672fc91b66e42ceaf15eb4cc.mockapi.io/user',
        );
        const allUsers = await allUsersResponse.json();

        const filteredUsers = allUsers.filter(
          (          user: { userID: any; companyID: {}; }) =>
            user.userID !== parsedUser.userID && user.companyID === companyID,
        );
        setUsers(filteredUsers);

        const messagesResponse = await fetch(
          `https://672fc91b66e42ceaf15eb4cc.mockapi.io/company/${companyID}/messages`,
        );
        const allMessages = await messagesResponse.json();
        setMessages(allMessages);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelectUser = (user: never) => {
    navigation.navigate('ChatScreen', {recipient: user});
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    navigation.reset({index: 0, routes: [{name: 'Login'}]});
  };

  const getLastMessage = (otherUserID: any) => {
    const relevantMessages = messages.filter(
      msg =>
        (msg.senderID === currentUser.userID &&
          msg.recipientID === otherUserID) ||
        (msg.senderID === otherUserID &&
          msg.recipientID === currentUser.userID),
    );

    if (relevantMessages.length === 0) return null;

    const sorted = relevantMessages.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
    return sorted[0].content;
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#1185C8" />
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item.userID}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.userCard}
              onPress={() => handleSelectUser(item)}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userEmail}>
                {getLastMessage(item.userID) || 'No messages yet'}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text>No other users found</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    paddingTop: 60,
  },
  userCard: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
});