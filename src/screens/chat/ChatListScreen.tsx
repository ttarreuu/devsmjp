import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

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
        const [userRes, msgRes] = await Promise.all([
          fetch('https://672fc91b66e42ceaf15eb4cc.mockapi.io/user'),
          fetch('https://672fc91b66e42ceaf15eb4cc.mockapi.io/messages')
        ]);

        const allUsers = await userRes.json();
        const allMessages = await msgRes.json();

        const filteredUsers = allUsers.filter(user => user.userID !== parsedUser.userID);
        setUsers(filteredUsers);
        setMessages(allMessages);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelectUser = (user) => {
    navigation.navigate('ChatScreen', { recipient: user });
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const getLastMessage = (otherUserID) => {
    const relevantMessages = messages.filter(msg =>
      (msg.senderID === currentUser.userID && msg.recipientID === otherUserID) ||
      (msg.senderID === otherUserID && msg.recipientID === currentUser.userID)
    );

    if (relevantMessages.length === 0) return null;

    const sorted = relevantMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sorted[0].content;
  };

  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <Text style={styles.title}>Welcome, {currentUser?.name}</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View> */}

      {loading ? (
        <ActivityIndicator size="large" color="#1185C8" />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.userID}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userCard}
              onPress={() => handleSelectUser(item)}
            >
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
    paddingTop: 60
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  logoutText: {
    color: 'red',
    fontWeight: 'bold'
  },
  userCard: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  userEmail: {
    fontSize: 14,
    color: '#666'
  },
});
