import realmInstance from './realmConfig';

export const fetchData = async () => {
  try {
    const response = await fetch('https://672fc91b66e42ceaf15eb4cc.mockapi.io/Checkpoint');
    const data = await response.json();

    // Get companyID from Realm (new primaryKey in CompanySchema)
    const company = realmInstance.objects('Company')[0];
    const companyID = company?.companyID;

    if (!companyID) {
      console.error('No company ID found in Realm');
      return;
    }

    // Use companyID in the Checkpoint API URL
    const checkpointURL = `https://672fc91b66e42ceaf15eb4cc.mockapi.io/company/${encodeURIComponent(companyID)}/Checkpoint`;

    // Fetch the checkpoint data
    const checkpointResponse = await fetch(checkpointURL);
    const checkpointData = await checkpointResponse.json();

    // Store checkpoint data in Realm
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

    // Get userID from Realm (new primaryKey in UserSchema)
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
