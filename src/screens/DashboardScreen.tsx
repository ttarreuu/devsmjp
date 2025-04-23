import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';
import {menuData} from '../data/menu_data';
import realmInstance from '../data/realmConfig';

export default function DashboardScreen({navigation}) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const realmUser = realmInstance.objects('User')[0];
    if (realmUser) {
      setUser(realmUser);
    }
  }, []);

  const renderMenuItem = ({item}) => {
    const IconComponent = item.icon;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate(item.route)}>
        <IconComponent width={65} height={65} />
        <Text style={styles.cardText}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {user && (
        <View style={styles.header}>
          <View style={{flex: 1}}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
            {/* <Text style={styles.phone}>{user.phone}</Text> */}
          </View>
          <Image
            source={{
              uri: user.photo
                ? `data:image/jpeg;base64,${user.photo}`
                : 'https://via.placeholder.com/60',
            }}
            style={styles.avatar}
          />
        </View>
      )}
      <FlatList
        data={menuData}
        renderItem={renderMenuItem}
        keyExtractor={item => item.route}
        numColumns={2}
        contentContainerStyle={{paddingTop: 10}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 15,
    borderRadius: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 30,
    marginHorizontal: 15,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    color: '#333',
    textAlign: 'right',
    textTransform: 'uppercase'
  },
  email: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    textAlign: 'right'
  },
  phone: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'Poppins-Regular',
  },
  card: {
    flex: 1,
    margin: 10,
    padding: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '45%'
  },
  cardText: {
    fontSize: 14,
    marginTop: 3,
    fontFamily: 'Poppins-SemiBold',
    color: '#4b4b4b'
  },
});
