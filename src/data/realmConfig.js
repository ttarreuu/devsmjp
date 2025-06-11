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

const EmergencyContactSchema = {
  name: 'EmergencyContact', 
  properties: {
    contactID: 'string',
    name: 'string',
    number: 'string',
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

const ShiftSchema = {
  name: 'Shift',
  properties: {
    shiftID: 'string',
    name: 'string',
    startTime: 'string',
    endTime: 'string',
  },
};

const realmInstance = new Realm({
  schema: [LogSchema, LogTrackingSchema, LogTrackingTempSchema, CheckpointSchema, EmergencyContactSchema, ScheduleSchema, UserSchema, CompanySchema, ShiftSchema],
  path: 'log_temp.realm', 
});

export default realmInstance;
