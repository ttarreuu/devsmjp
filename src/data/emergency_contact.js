import realmInstance from './realmConfig'; 

const getNextId = () => {
  const data = realmInstance.objects('EmergencyContact');
  if (data.length > 0) {
    return data.max('id') + 1;
  }
  return 1; 
};

export const saveData = (name, number) => {
  try {
    const id = getNextId(); 
    realmInstance.write(() => {
      realmInstance.create('EmergencyContact', {
        id,
        name, 
        number,
      });
    });
    console.log('Data saved:', { id, name, number});
  } catch (error) {
    console.error('Error saving emergency contact:', error);
  }
};

export const getAllData = () => {
  try {
    const data = realmInstance.objects('EmergencyContact');
    return data.map(data => ({
      id: data.id,
      name: data.name,
      number: data.number    
    }));
  } catch (error) {
    console.error('Error fetching emergency contact:', error);
    return [];
  }
};

export const deleteDataById = (id) => {
  try {
    realmInstance.write(() => {
      const data = realmInstance.objectForPrimaryKey('EmergencyContact', id);
      if (data) {
        realmInstance.delete(data);
        console.log('Data deleted:', id);
      } else {
        console.log('Data not found:', id);
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