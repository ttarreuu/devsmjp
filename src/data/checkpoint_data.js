import realmInstance from './realmConfig';

export const fetchData = async () => {
  try {
    const response = await fetch('https://672fc91b66e42ceaf15eb4cc.mockapi.io/Checkpoint');
    const data = await response.json();

    realmInstance.write(() => {
      data.forEach(item => {
      realmInstance.create('Checkpoint', item);
      });
    });

    console.log('Data stored in Realm:', data);
  } catch (error) {
    console.error(error);
  }
};
