import Realm from 'realm';

const LogSchema = {
  name: 'Log',
  primaryKey: 'attendanceID',
  properties: {
    attendanceID: 'string',
    startDateTime: 'string',
    startPicture: 'string',
    endDateTime: 'string',
    endPicture: 'string',
    LogTracking: 'LogTracking[]',
    LogTrackingTemp: 'LogTrackingTemp[]'
  }
};

const LogTrackingSchema = {
  name: 'LogTracking',
  properties: {
    dateTime: 'date',
    latitude: 'double',
    longitude: 'double',
    altitude: 'double',
    speed: 'double',
    accuracy: 'double',
  }
};

const LogTrackingTempSchema = {
  name: 'LogTrackingTemp',
  properties: {
    dateTime: 'date',
    latitude: 'double',
    longitude: 'double',
    altitude: 'double',
    speed: 'double',
    accuracy: 'double',
  }
};


{/*

  const LogTrackingTempSchema = {
    name: 'LogTrackingTemp',
    primaryKey: 'id',
    properties: {
      id: 'int',
      attendanceID: 'string',
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

*/}


const EmergencyContactSchema = {
  name: 'EmergencyContact', 
  properties: {
    contactID: 'string',
    name: 'string',
    number: 'int',
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

const UserSchema = {
  name: 'User',
  primaryKey: 'userID',
  properties: {
    userID: 'string',
    name: 'string',
    photo: 'string', 
    email: 'string',
    phone: 'string',
  },
};

const CompanySchema = {
  name: 'Company',
  primaryKey: 'companyID',
  properties: {
    companyID: 'string',
    name: 'string',
    Lat: 'double',
    Long: 'double',
    radius: 'int',
  },
};

const realmInstance = new Realm({
  schema: [LogSchema, LogTrackingSchema, LogTrackingTempSchema, CheckpointSchema, EmergencyContactSchema, ScheduleSchema, UserSchema, CompanySchema],
  path: 'log_temp.realm', 
});

export default realmInstance;
