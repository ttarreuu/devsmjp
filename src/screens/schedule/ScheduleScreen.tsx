import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import realmInstance from '../../data/realmConfig';

export default function ScheduleScreen() {
  const [selectedDate, setSelectedDate] = useState('');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeDate, setActiveDate] = useState({});

  useEffect(() => {
    const getAllScheduleDates = async () => {
      const realmSchedules = realmInstance.objects('Schedule');
      const realmDates = realmSchedules.map((item) => item.date); 

      try {
        const response = await fetch('https://672fc91b66e42ceaf15eb4cc.mockapi.io/schedule');
        const apiSchedules = await response.json();

        const apiDates = apiSchedules.map((item) => item.date); 

        const allDates = Array.from(new Set([...realmDates, ...apiDates]));

        const marked = {};
        allDates.forEach(date => {
          marked[date] = {
            selected: true,
            selectedColor: '#D0EFFF', // light background color for marked dates
            selectedTextColor: '#000'
          };
        });

        setActiveDate(marked);
      } catch (error) {
        console.error('Failed to fetch schedule dates:', error);
      }
    };

    getAllScheduleDates();
  }, []);

  const fetchActivities = async (date) => {
    setLoading(true);
    try {
      const scheduleToday = realmInstance.objects('Schedule').filtered('date == $0', date);
      let realmData = [...scheduleToday];

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const currentDate = `${yyyy}-${mm}-${dd}`;

      if (date !== currentDate) {
        const response = await fetch(`https://672fc91b66e42ceaf15eb4cc.mockapi.io/schedule/${date}/schedul-detail`);
        const apiData = await response.json();

        const validApiData = Array.isArray(apiData) ? apiData : [];

        const formattedApiData = validApiData.map(item => ({
          ...item,
          checkpoint: item.checkpoint || [],
        }));

        realmData = [...realmData, ...formattedApiData];
      }

      setActivities(realmData);
    } catch (error) {
      console.error('Fetch error:', error);
      setActivities([]);
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
      <Text style={styles.activityTime}>{`${item.timeStart} - ${item.timeEnd}`}</Text>
      {/* <Text style={styles.activityDescription}>
        Checkpoints: {item.checkpoint?.join(', ')}
      </Text> */}
    </View>
  );

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={onDayPress}
        markedDates={{
          ...activeDate,
          [selectedDate]: {
            ...(activeDate[selectedDate] || {}),
            selected: true,
            selectedColor: '#1185C8',
            selectedTextColor: '#fff',
          },
        }}
        theme={{
          textMonthFontFamily: 'Poppins-Regular',
          textDayFontFamily: 'Poppins-Regular',
          textDayHeaderFontFamily: 'Poppins-Regular',
          calendarBackground: 'transparent',
          textSectionTitleColor: '#000',
          dayTextColor: '#000',
          todayTextColor: 'blue',
          selectedDayTextColor: '#fff',
          selectedDayBackgroundColor: '#1185C8',
          arrowColor: 'black',
          monthTextColor: '#000',
        }}
        style={{
          backgroundColor: 'transparent',
        }}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#1185C8" />
      ) : activities.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20, fontFamily: 'Poppins-Regular' }}>
          No activities for this date.
        </Text>
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
    marginTop: 45,
    marginHorizontal: 15
  },
  activityList: { 
    marginTop: 5,
  },
  activityItem: {
    backgroundColor: '#dcdbdb',
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
  },
  activityTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold'
  },
  activityTime: {
    fontFamily: 'Poppins-Regular'
  },
  activityDescription: {
    fontFamily: 'Poppins-Regular'
  },
});
