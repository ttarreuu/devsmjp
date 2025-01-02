import SQLite from 'react-native-sqlite-storage';

SQLite.Debug(true);
SQLite.enablePromise(true);

const database_name = 'Log.db';
const database_version = '1.0';
const database_displayname = 'Location Data';
const database_size = 200000;

let db;

export const initDatabase = async() => {
    try {
        db = await SQLite.openDatabase(
            database_name,
            database_version,
            database_displayname,
            database_size
        );

        await db.executeSql(
            `CREATE TABLE IF NOT EXISTS LogTracking (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                dateTime TEXT, 
                latitude REAL, 
                longitude REAL,
                altitude REAL,
                speed REAL,
                accuracy REAL
            );`
        );
        console.log("Database initialized successfully");
    } catch (error) {
    console.log("Error initializing database:", error);
  }
};

export const insertLocalDB = async (newData) => {
  const { dateTime, latitude, longitude, altitude, speed, accuracy } = newData;
  try {
    await db.executeSql(
      `INSERT INTO LogTracking (dateTime, latitude, longitude, altitude, speed, accuracy) VALUES (?, ?, ?, ?, ?, ?);`,
      [dateTime, latitude, longitude, altitude, speed, accuracy ]
    );
  } catch (error) {
    console.log('Error inserting location', error);
  }
};

export const getLocalDB = async () => {
  try {
    let results = await db.executeSql(`SELECT * FROM LogTracking;`);
    let data = [];
    results[0].rows.raw().forEach((row) => {
      data.push(row);
    });
    return data;
  } catch (error) {
    console.log('Error fetching data', error);
    return [];
  }
};

export const deleteLocalDB = async (id) => {
  try {
    await db.executeSql(`DELETE FROM LogTracking WHERE id = ?;`, [id]);
  } catch (error) {
    console.log('Error deleting data', error);
  }
};
