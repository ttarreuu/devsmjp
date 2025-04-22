import realmInstance from './realmConfig'; 

const getNextId = () => {
  const data = realmInstance.objects('EmergencyContact');
  if (data.length > 0) {
    return data.max('contactID') + 1;
  }
  return 1; 
};

export const saveData = async (name, number) => {
  try {
    const contactID = getNextId(); 
    realmInstance.write(() => {
      realmInstance.create('EmergencyContact', {
        contactID,
        name, 
        number,
      });
    });
    console.log('Data saved:', { contactID, name, number});
  } catch (error) {
    console.error('Error saving emergency contact:', error);
  }
};

export const getAllData = () => {
  try {
    const data = realmInstance.objects('EmergencyContact');
    return data.map(data => ({
      contactID: data.contactID,
      name: data.name,
      number: data.number    
    }));
  } catch (error) {
    console.error('Error fetching emergency contact:', error);
    return [];
  }
};

export const deleteDataById = (contactID) => {
  try {
    realmInstance.write(() => {
      const data = realmInstance.objectForPrimaryKey('EmergencyContact', contactID);
      if (data) {
        realmInstance.delete(data);
        console.log('Data deleted:', contactID);
      } else {
        console.log('Data not found:', contactID);
      }
    });
  } catch (error) {
    console.error('Error deleting data:', error);
  }
};

export const deleteAllData = () => {
  try {
    realmInstance.write(() => {
      const allData = realmInstance.objects('EmergencyContact');
      realmInstance.delete(allData);
    });
    console.log('All data deleted.');
  } catch (error) {
    console.error('Error deleting all data:', error);
  }
};

export const getRealmInstance = () => realmInstance;