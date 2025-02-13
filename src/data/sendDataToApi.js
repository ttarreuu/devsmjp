import AsyncStorage from '@react-native-async-storage/async-storage';


export const sendDataTrackingToApi = async (newData) => {
  try {
    const AttendanceID = await AsyncStorage.getItem('attendanceID');
    if (!AttendanceID) {
      console.error('AttendanceID not found in AsyncStorage');
      return;
    }

    const logID = await AsyncStorage.getItem('id');
    if (!logID) {
      console.log('id not found in AsyncStorage');
    }

    const apiURL = `https://672fc91b66e42ceaf15eb4cc.mockapi.io/Attendance/${AttendanceID}/LogTracking`;

    const response = await fetch(`${apiURL}/${logID}`, {
      method: 'GET',
    });

    let existingData;

    if (!response.ok) {
        existingData = {
        logTrackingID: logID,
        attendanceID: AttendanceID,
        logTracking: [newData],
    };

    const postResponse = await fetch(apiURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(existingData),
    });

    if (postResponse.ok) {
        const createdData = await postResponse.json();
        console.log('New data created successfully:', createdData);

        const { logTrackingID } = createdData;
        console.log('Generated logTrackingID:', logTrackingID);
        AsyncStorage.setItem('id', logTrackingID);
    } else {
        console.error('Error creating new data:', postResponse.statusText);
    }

      return;
    }

    existingData = await response.json();

    if (!Array.isArray(existingData.logTracking)) {
      existingData.logTracking = [];
    }

    existingData.logTracking.unshift(newData);

    await fetch(`${apiURL}/${logID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(existingData),
    });

    console.log('Data updated successfully');
  } catch (error) {
    console.error('Error sending data to API:', error);
  }
};

export const sendDataPatrolToApi = async (newDataPatrol) => {
  try {
    const AttendanceID = await AsyncStorage.getItem('attendanceID');
    if (!AttendanceID) {
      console.error('AttendanceID not found in AsyncStorage');
      return;
    }

    const patrolLogID = await AsyncStorage.getItem('Patrolid');
    if (!patrolLogID) {
      console.log('id patrol not found in AsyncStorage');
    }

    const apiURL = `https://672fc91b66e42ceaf15eb4cc.mockapi.io/Attendance/${AttendanceID}/LogPatrol`;

    const response = await fetch(`${apiURL}/${patrolLogID}`, {
      method: 'GET',
    });

    let existingData;

    if (!response.ok) {
        existingData = {
            logPatrolID: patrolLogID,
            attendanceID: AttendanceID,
            logPatrol: [newDataPatrol],
        };

        const postResponse = await fetch(apiURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(existingData),
      });

      if (postResponse.ok) {
        const createdData = await postResponse.json();
        console.log('New data created successfully:', createdData);

        const { logPatrolID } = createdData;
        console.log('Generated logPatrolID:', logPatrolID);
        await AsyncStorage.setItem('Patrolid', logPatrolID);
      } else {
        console.error('Error creating new data:', postResponse.statusText);
      }

      return;
    }

    existingData = await response.json();

    if (!Array.isArray(existingData.logPatrol)) {
      existingData.logPatrol = [];
    }

    existingData.logPatrol.unshift(newDataPatrol);

    await fetch(`${apiURL}/${patrolLogID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(existingData),
    });

    console.log('Data updated successfully');
  } catch (error) {
    console.error('Error sending data to API:', error);
  }
};
