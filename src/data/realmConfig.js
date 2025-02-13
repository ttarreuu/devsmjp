import Realm from 'realm';

const LogTrackingSchema = {
  name: 'LogTracking',
  primaryKey: 'id',
  properties: {
    id: 'int',
    dateTime: 'date',
    latitude: 'double',
    longitude: 'double',
    altitude: 'double',
    speed: 'double',
    accuracy: 'double',
  },
};


const LogTrackingTempSchema = {
  name: 'LogTrackingTemp',
  primaryKey: 'id',
  properties: {
    id: 'int',
    dateTime: 'date',
    latitude: 'double',
    longitude: 'double',
    altitude: 'double',
    speed: 'double',
    accuracy: 'double',
  },
};

const LogPatrolSchema = {
  name: 'LogPatrol',
  primaryKey: 'id',
  properties: {
    id: 'int',
    dateTime: 'date',
    picture: 'string',
    situationType: 'string',
    checkpointID: 'int',
  }
};

const LogPatrolTempSchema = {
  name: 'LogPatrolTemp',
  primaryKey: 'id',
  properties: {
    id: 'int',
    dateTime: 'date',
    picture: 'string',
    situationType: 'string',
    checkpointID: 'int',
  }
};

const realmInstance = new Realm({
  schema: [LogTrackingTempSchema, LogPatrolTempSchema, LogPatrolSchema, LogTrackingSchema],
  path: 'log_temp.realm', // Use a single Realm file for both schemas
});

export default realmInstance;
