import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';

export default function ScheduleScreen() {
  const [selectedDate, setSelectedDate] = useState('');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchActivities = async (date) => {
    setLoading(true);
    try {
      const link = `https://672fc91b66e42ceaf15eb4cc.mockapi.io/schedule/${date}/schedul-detail`;
      const response = await fetch(link);
      const data = await response.json();
      console.log('Fetched Data:', data); 
      setActivities(data); 
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onDayPress = (day) => {
    const date = day.dateString;
    setSelectedDate(date);
    fetchActivities(date);
  };

  const renderActivityItem = ({ item }) => (
    <View style={styles.activityItem}>
      <Text style={styles.activityTitle}>{item.name}</Text>
      <Text style={styles.activityTime}>Time: {item.time}</Text>
      <Text style={styles.activityDescription}>Description: {item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={onDayPress}
        markedDates={{
          [selectedDate]: { selected: true, marked: true, selectedColor: 'blue' },
        }}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={activities}
          renderItem={renderActivityItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.activityList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    marginTop: 50 
  },
  activityList: { 
    marginTop: 20 
  },
  activityItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activityTime: {
    marginTop: 5,
    color: '#555',
  },
  activityDescription: {
    marginTop: 5,
    color: '#777',
  },
});
