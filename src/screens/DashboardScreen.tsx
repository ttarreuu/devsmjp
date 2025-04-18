import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { menuData } from '../data/menu_data';

export default function DashboardScreen({ navigation }) {
  const renderMenuItem = ({ item }) => {
    const IconComponent = item.icon;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate(item.route)}
      >
        <IconComponent width={50} height={50} />
        <Text style={styles.cardText}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={menuData}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.route}
        numColumns={2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  card: {
    flex: 1,
    margin: 8,
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  cardText: {
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'Poppins-SemiBold',
  },
});
