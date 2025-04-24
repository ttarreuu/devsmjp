import realmInstance from './realmConfig';

export const fetchData = async () => {
  try {
    const response = await fetch('https://672fc91b66e42ceaf15eb4cc.mockapi.io/Checkpoint');
    const data = await response.json();

    realmInstance.write(() => {
      const oldCheckpoints = realmInstance.objects('Checkpoint');
      realmInstance.delete(oldCheckpoints);

      data.forEach(item => {
        realmInstance.create('Checkpoint', item);
      });
    });

    console.log('Data stored in Realm:', data);
  } catch (error) {
    console.error(error);
  }

  try {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    console.log('Formatted Date:', formattedDate);

    const scheduleResponse = await fetch(`https://672fc91b66e42ceaf15eb4cc.mockapi.io/schedule/${formattedDate}/schedul-detail`);
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

    if (scheduleData.length === 0) {
      console.log('Today is free day');
    } else {
      console.log('Data stored in Realm (Schedule):', scheduleData);
    }
  } catch (error) {
    // console.error('Error fetching Schedule:', error);
  }

  try {
    const contactResponse = await fetch('https://672fc91b66e42ceaf15eb4cc.mockapi.io/Contact');
    const contactData = await contactResponse.json();

    realmInstance.write(() => {
      const oldContacts = realmInstance.objects('EmergencyContact');
      realmInstance.delete(oldContacts);

      contactData.forEach(item => {
        realmInstance.create('EmergencyContact', {
          ...item,
          contactID: parseInt(item.contactID, 10),
          number: parseInt(item.number, 10),
        });
      });
    });

    console.log('Data stored in Realm:', contactData);
  } catch (error) {
    console.error('Error fetching Contact:', error);
  }
};

