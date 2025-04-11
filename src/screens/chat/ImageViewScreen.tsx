import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';

export default function ImageViewScreen({ route, navigation }) {
  const { imageUri } = route.params;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>
      <Image source={{ uri: imageUri }} style={styles.fullImage} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#000',
  },
});
