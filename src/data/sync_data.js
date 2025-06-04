import realmInstance from './realmConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchData = async () => {
  try {
    const response = await fetch('https://672fc91b66e42ceaf15eb4cc.mockapi.io/Checkpoint');
    const data = await response.json();

    const company = realmInstance.objects('Company')[0];
    const companyID = company?.companyID;

    if (!companyID) {
      console.error('No company ID found in Realm');
      return;
    }

    const checkpointURL = `https://672fc91b66e42ceaf15eb4cc.mockapi.io/company/${encodeURIComponent(companyID)}/Checkpoint`;

    const checkpointResponse = await fetch(checkpointURL);
    const checkpointData = await checkpointResponse.json();

    realmInstance.write(() => {
      const oldCheckpoints = realmInstance.objects('Checkpoint');
      realmInstance.delete(oldCheckpoints);

      checkpointData.forEach(item => {
        realmInstance.create('Checkpoint', item);
      });
    });

    console.log('Checkpoint Data stored in Realm:', checkpointData);
  } catch (error) {
    console.error('Error fetching Checkpoint:', error);
  }

  try {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    console.log('Formatted Date:', formattedDate);

    const user = realmInstance.objects('User')[0];
    const userID = user?.userID;

    if (!userID) {
      console.error('No user ID found in Realm');
      return;
    }

    const scheduleURL = `https://672fc91b66e42ceaf15eb4cc.mockapi.io/user/${encodeURIComponent(userID)}/schedule/${encodeURIComponent(formattedDate)}/schedul-detail`;

    const scheduleResponse = await fetch(scheduleURL);
    const scheduleData = await scheduleResponse.json();
    console.log('Schedule Data:', scheduleData);

    realmInstance.write(() => {
      const oldSchedules = realmInstance.objects('Schedule');
      realmInstance.delete(oldSchedules);

      scheduleData.forEach(item => {
        realmInstance.create('Schedule', {
          ...item,
          id: parseInt(item.id, 10),
        });
      });
    });

    console.log('Data stored in Realm (Schedule):', scheduleData);
  } catch (error) {

  }

  try {
    const company = realmInstance.objects('Company')[0];
    const companyID = company?.companyID;

    if (!companyID) {
      console.error('No company ID found in Realm');
      return;
    }

    const shiftURL = `https://672fc91b66e42ceaf15eb4cc.mockapi.io/company/${encodeURIComponent(companyID)}/shift`;

    const shiftResponse = await fetch(shiftURL);
    const shiftData = await shiftResponse.json();

    realmInstance.write(() => {
      const oldShift = realmInstance.objects('Shift');
      realmInstance.delete(oldShift);

      shiftData.forEach((shift) => {
        realmInstance.create('Shift', {
          shiftID: shift.shiftID,
          name: shift.name,
          startTime: shift.startTime,
          endTime: shift.endTime,
        });
      });
    });


    console.log('Shift Data stored in Realm:', shiftData);
  } catch (error) {
    console.error('Error fetching Shift:', error);
  }


  try {
    const contactResponse = await fetch('https://672fc91b66e42ceaf15eb4cc.mockapi.io/Contact');
    const contactData = await contactResponse.json();

    realmInstance.write(() => {
      const oldContacts = realmInstance.objects('EmergencyContact');
      realmInstance.delete(oldContacts);

      contactData.forEach((contact) => {
        realmInstance.create('EmergencyContact', {
          contactID: contact.contactID,
          name: contact.name,
          number: contact.number,
        });
      });
    });

    console.log('Emergency contact data saved to Realm:', contactData);

    const company = realmInstance.objects('Company')[0];
    const companyID = company?.companyID;

    if (!companyID) {
      console.error('No company ID found in Realm');
      return;
    }

    const companyContactURL = `https://672fc91b66e42ceaf15eb4cc.mockapi.io/company/${encodeURIComponent(companyID)}/Contact-local`;

    const companyContactResponse = await fetch(companyContactURL);
    const companyContactData = await companyContactResponse.json();

    realmInstance.write(() => {
      companyContactData.forEach((contact) => {
        realmInstance.create('EmergencyContact', {
          contactID: contact.contactID,
          name: contact.name,
          number: contact.number.startsWith('0') ? contact.number : '0' + contact.number,
        });
      });
    });

    console.log('Emergency contact data saved to Realm:', companyContactData);
  } catch (error) {
    console.error('Error fetching emergency contact data:', error);
  }

  try {
    const currentDateTime = new Date().toISOString();
    await AsyncStorage.setItem('lastUpdateFetch', currentDateTime);
    console.log('Current Date-Time stored in AsyncStorage:', currentDateTime);
  } catch (error) {
    console.error('Error storing current Date-Time in AsyncStorage:', error);
  }
};
