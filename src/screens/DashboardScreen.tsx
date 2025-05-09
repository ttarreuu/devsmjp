import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  useWindowDimensions,
} from 'react-native';
import {menuData} from '../data/menu_data';
import realmInstance from '../data/realmConfig';

export default function DashboardScreen({navigation}) {
  const [user, setUser] = useState(null);
  const [companyName, setCompanyName] = useState(null);
  const {width} = useWindowDimensions();

  const MIN_CARD_WIDTH = 150;
  const numColumns = Math.floor(width / MIN_CARD_WIDTH);

  useEffect(() => {
    const realmUser = realmInstance.objects('User')[0];
    const realmCompany = realmInstance.objects('Company')[0];
    if (realmUser) {
      setUser(realmUser);
    }
    if (realmCompany) {
      setCompanyName(realmCompany.name);
    }
  }, []);

  const renderMenuItem = ({item}) => {
    const IconComponent = item.icon;

    return (
      <View style={[styles.cardContainer, {width: `${100 / numColumns}%`}]}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate(item.route)}>
          <IconComponent width={65} height={65} />
          <Text style={styles.cardText}>{item.name}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {user && (
        <View style={styles.header}>
          <View style={{flex: 1}}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{companyName}</Text>
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
        numColumns={numColumns}
        key={numColumns} 
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
    marginRight: 15,
    marginLeft: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    color: '#333',
    textAlign: 'right',
    textTransform: 'uppercase',
  },
  email: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    textAlign: 'right',
  },
  cardContainer: {
    padding: 5,
  },
  card: {
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1.5, 
    width: '100%',
  },
  cardText: {
    fontSize: 14,
    marginTop: 3,
    fontFamily: 'Poppins-SemiBold',
    color: '#4b4b4b',
    textAlign: 'center',
  },
});
