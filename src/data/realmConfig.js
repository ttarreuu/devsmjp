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
    description: 'string',
    checkpointID: 'string',
    method: 'string',
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
    description: 'string',
    checkpointID: 'string',
    method: 'string',
  }
};

const CheckpointSchema = {
  name: 'Checkpoint',
  properties: {
    name: 'string',
    latitude: 'double',
    longitude: 'double',
    radius: 'int',
    checkpointID: 'string',
  },
};

const EmergencyContactSchema = {
  name: 'EmergencyContact', 
  primaryKey: 'contactID',
  properties: {
    name: 'string',
    number: 'int',
    contactID: 'int',
  },
};

const ScheduleSchema = {
  name: 'Schedule',
  primaryKey: 'id',
  properties: {
    id: 'int',
    name: 'string',
    date: 'string',
    timeStart: 'string',
    timeEnd: 'string',
    checkpoint: 'string[]', 
  }
};

const UserSchema = {
  name: 'User',
  primaryKey: 'email',
  properties: {
    name: 'string',
    photo: 'string', 
    email: 'string',
    phone: 'string',
  },
};

const realmInstance = new Realm({
  schema: [LogTrackingTempSchema, LogPatrolTempSchema, LogPatrolSchema, LogTrackingSchema, CheckpointSchema, EmergencyContactSchema, ScheduleSchema, UserSchema],
  path: 'log_temp.realm', // Use a single Realm file for both schemas
});

export default realmInstance;
