import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackIcon from '../assets/back-icon.svg'; 

export const getDefaultHeaderOptions = (title) => {
  return {
    headerShown: true,
    headerTitleAlign: 'center',
    headerTitleStyle: { backgroundColor: 'transparent', fontFamily: 'Poppins-Medium' },
    headerTitle: title,
    headerTransparent: true,
    headerLeft: () => {
      const navigation = useNavigation();
      return (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 20 }}>
          <BackIcon width={35} height={35} />
        </TouchableOpacity>
      );
    },
  };
};
