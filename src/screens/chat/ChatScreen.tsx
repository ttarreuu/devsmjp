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

const API_URL = 'https://672fc91b66e42ceaf15eb4cc.mockapi.io/messages';

export default function ChatScreen({ route }) {
  const { recipient } = route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const flatListRef = useRef();

  useEffect(() => {
    const loadUserAndMessages = async () => {
      const user = await AsyncStorage.getItem('user');
      const parsedUser = JSON.parse(user);
      setCurrentUser(parsedUser);

      try {
        const res = await fetch(API_URL);
        const allMessages = await res.json();

        const chatMessages = allMessages.filter(
          (msg) =>
            (msg.senderID === parsedUser.userID && msg.recipientID === recipient.userID) ||
            (msg.senderID === recipient.userID && msg.recipientID === parsedUser.userID)
        );

        const sortedMessages = chatMessages.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );

        setMessages(sortedMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadUserAndMessages();
  }, [recipient]);

  const handleAttachment = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 1 },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else {
          const uri = response.assets[0].uri;
          setImageUri(uri);
        }
      }
    );
  };

  const sendMessage = async () => {
    if ((input.trim() === '' && !imageUri) || !currentUser) return;

    const newMessage = {
      senderID: currentUser.userID,
      recipientID: recipient.userID,
      content: input.trim(),
      image: imageUri || null,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage),
      });

      const savedMessage = await res.json();
      setMessages((prev) => [...prev, savedMessage]);
      setInput('');
      setImageUri(null);
      flatListRef.current?.scrollToEnd({ animated: true });
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
        <Text style={styles.messageText}>{item.content}</Text>
        {item.image && (
          <Image
            source={{ uri: item.image }}
            style={styles.messageImage}
          />
        )}
        <Text style={styles.timestamp}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {imageUri && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          <TouchableOpacity onPress={() => setImageUri(null)} style={styles.removeImageButton}>
            <Text style={styles.removeImageText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={handleAttachment} style={styles.attachmentButton}>
          <Text style={styles.attachmentButtonText}>📎</Text>
        </TouchableOpacity>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>SEND</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff',
    paddingTop: 55 
  },
  messageList: { 
    padding: 10 
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
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 25,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#1185C8',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  attachmentButton: {
    marginRight: 10,
    padding: 5,
  },
  attachmentButtonText: {
    fontSize: 22,
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
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
