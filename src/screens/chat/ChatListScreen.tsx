import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import realmInstance from '../../data/realmConfig';

export default function ChatListScreen() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
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
          user =>
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

  useEffect(() => {
    const newUnreadCounts = {};

    users.forEach(user => {
      const unreadCount = messages.filter(
        msg =>
          msg.recipientID === currentUser.userID && 
          msg.read === false && 
          msg.senderID === user.userID, 
      ).length;

      newUnreadCounts[user.userID] = unreadCount;
    });

    setUnreadCounts(newUnreadCounts);
  }, [messages, users, currentUser]);

  const handleSelectUser = user => {
    navigation.navigate('ChatScreen', {recipient: user});
  };

  const getLastMessage = otherUserID => {
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

    const lastMessage = sorted[0];

    if (lastMessage.image) {
      return '(Image)';
    }

    return lastMessage.content;
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#1185C8" />
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item.userID}
          renderItem={({item}) => {
            const unreadCount = unreadCounts[item.userID] || 0;

            return (
              <TouchableOpacity
                style={styles.userCard}
                onPress={() => handleSelectUser(item)}>
                <View style={styles.userInfo}>
                  <Image
                    source={{
                      uri: item.photo
                        ? item.photo.startsWith('http')
                          ? item.photo
                          : `data:image/jpeg;base64,${item.photo}`
                        : 'https://via.placeholder.com/60',
                    }}
                    style={styles.avatar}
                  />
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userEmail}>
                      {getLastMessage(item.userID) || 'No messages yet'}
                    </Text>
                  </View>
                  {unreadCount > 0 && (
                    <View style={styles.unreadCount}>
                      <Text style={styles.unreadText}>{unreadCount}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text>No other users found</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    paddingTop: 55,
  },
  userCard: {
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#f2f2f2',
    borderBottomWidth: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  unreadCount: {
    backgroundColor: '#4CA6A8',
    borderRadius: 15,
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
});
