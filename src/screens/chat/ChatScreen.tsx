import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import realmInstance from '../../data/realmConfig';
import Checkgreen from '../../assets/checklist-read.svg';
import Checkblack from '../../assets/checklist-unread.svg';
import SendIcon from '../../assets/send-icon.svg';
import AttachmentIcon from '../../assets/attachment-icon.svg';

export default function ChatScreen({ route }) {
  const { recipient } = route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [companyID, setCompanyID] = useState('');
  const flatListRef = useRef(null);
  const [isScrollingToBottom, setIsScrollingToBottom] = useState(true); // For controlling auto-scroll

  const loadMessages = async () => {
    if (!currentUser || !companyID) return;

    try {
      const response = await fetch(
        `https://672fc91b66e42ceaf15eb4cc.mockapi.io/company/${companyID}/messages`,
      );
      const allMessages = await response.json();

      const chatMessages = allMessages.filter(
        (msg) =>
          (msg.senderID === currentUser.userID && msg.recipientID === recipient.userID) ||
          (msg.senderID === recipient.userID && msg.recipientID === currentUser.userID),
      );

      const sortedMessages = chatMessages.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      );

      setMessages(sortedMessages);

      // Auto mark as read
      sortedMessages.forEach(async (msg) => {
        if (msg.recipientID === currentUser.userID && !msg.read) {
          try {
            await fetch(
              `https://672fc91b66e42ceaf15eb4cc.mockapi.io/company/${companyID}/messages/${msg.id}`,
              {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ read: true }),
              },
            );
          } catch (error) {
            console.error('Error marking message as read:', error);
          }
        }
      });
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  useEffect(() => {
    const loadUserAndStart = async () => {
      const user = await AsyncStorage.getItem('user');
      const parsedUser = JSON.parse(user);
      setCurrentUser(parsedUser);

      try {
        const company = realmInstance.objects('Company')[0];
        const companyIDFromRealm = company?.companyID;

        if (!companyIDFromRealm) {
          console.warn('CompanyID not found in Realm.');
          return;
        }

        setCompanyID(companyIDFromRealm);
      } catch (error) {
        console.error('Error getting companyID:', error);
      }
    };

    loadUserAndStart();
  }, []);

  useEffect(() => {
    let interval;
    if (currentUser && companyID) {
      loadMessages();
      interval = setInterval(loadMessages, 1000);
    }
    return () => clearInterval(interval);
  }, [currentUser, companyID, recipient]);

  // Automatically scroll to the bottom when messages are updated
  useEffect(() => {
    if (isScrollingToBottom) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages, isScrollingToBottom]); // Trigger scroll on new messages

  const handleAttachment = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const uri = response.assets[0].uri;
        setImageUri(uri);
      }
    });
  };

  const sendMessage = async () => {
    if ((input.trim() === '' && !imageUri) || !currentUser || !companyID) return;

    const newMessage = {
      senderID: currentUser.userID,
      recipientID: recipient.userID,
      content: input.trim(),
      image: imageUri || null,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(
        `https://672fc91b66e42ceaf15eb4cc.mockapi.io/company/${companyID}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMessage),
        },
      );

      const savedMessage = await res.json();
      setMessages((prev) => [...prev, savedMessage]);
      setInput('');
      setImageUri(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderItem = ({ item }) => {
    const isSentByCurrentUser = item.senderID === currentUser?.userID;
    return (
      <View
        style={[
          styles.messageBubble,
          isSentByCurrentUser ? styles.sentBubble : styles.receivedBubble,
        ]}
      >
        {item.content ? <Text style={styles.messageText}>{item.content}</Text> : null}

        {item.image && <Image source={{ uri: item.image }} style={styles.messageImage} />}

        <View style={styles.messageMeta}>
          <Text style={styles.timestamp}>
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}
          </Text>

          <View style={styles.checklistIcon}>
            {item.read ? (
              <Checkgreen width={16} height={16} style={{ marginLeft: 6 }} />
            ) : (
              <Checkblack width={16} height={16} style={{ marginLeft: 6 }} />
            )}
          </View>
        </View>
      </View>
    );
  };

  const handleScroll = () => {
    setIsScrollingToBottom(false); // Disable auto-scrolling when user scrolls manually
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.recipientInfo}>
        <Text style={styles.recipientName}>{recipient.name}</Text>
        <Image
          source={{
            uri: recipient.photo
              ? recipient.photo.startsWith('http')
                ? recipient.picture 
                : `data:image/jpeg;base64,${recipient.photo}` 
              : 'https://via.placeholder.com/60',
          }}
          style={styles.recipientImage}
        />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.messageList}
        onScrollBeginDrag={handleScroll}
      />

      {imageUri && (
        <View style={styles.previewContainer}>
          <Image source={{uri: imageUri}} style={styles.previewImage} />
          <TouchableOpacity
            onPress={() => setImageUri(null)}
            style={styles.removeImageButton}>
            <Text style={styles.removeImageText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputArea}>
        <TouchableOpacity
          onPress={handleAttachment}
          style={styles.attachmentButton}>
          <View style={styles.attachmentIconWrapper}>
            <AttachmentIcon width={16} height={16} />
          </View>
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message"
            style={styles.input}
            placeholderTextColor="#888"
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <SendIcon width={24} height={24} color="#1185C8" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 12,
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 10,
    justifyContent: 'flex-end',
    alignContent: 'center' 
  },
  recipientName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    marginRight: 5,
  },
  recipientImage: {
    width: 50,
    height: 50,
    borderRadius: 20,
    marginRight: 10,
  },
  messageList: {
    padding: 10,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  sentBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#e4e4e4',
  },
  receivedBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#4ca7a83b',
  },
  messageText: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
  messageImage: {
    width: 150,
    height: 150,
    marginTop: 5,
    borderRadius: 10,
  },
  timestamp: {
    fontSize: 10,
    color: '#002251',
    marginTop: 4,
    textAlign: 'right',
    fontFamily: 'Poppins-Regular',
  },
  attachmentButton: {
    marginRight: 8,
    backgroundColor: 'transparent',
    padding: 10,
    borderRadius: 25,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  input: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    paddingHorizontal: 10,
    color: '#000',
  },
  sendButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  removeImageButton: {
    backgroundColor: '#ff4d4d',
    borderRadius: 20,
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  messageMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  checklistIcon: {
    marginLeft: 6,
    marginTop: 2,
  },
  attachmentIconWrapper: {
    backgroundColor: '#1185C8',
    padding: 10,
    borderRadius: 25,
  },
});
