import {saveUserActivity} from '../../../services/mongoService';
import _ from 'lodash';
import log from '../../../../logger';

export const logActivity = async (req, res) => {
  const {response} = res.locals;
  try {
    const eventLogData = prepareEventLogData(req, res);
    if(!_.isEmpty(eventLogData['details'])){
        console.log('saving log event to mongo...')
        await saveUserActivity(eventLogData);
    }
    res.send(response);
  } catch (err) {
    log.error(` logging activity \n ${err}`);
  }
};

const prepareEventLogData = (req, res) => {
  const {loggedObject} = res.locals;
  const user = res.locals.user || req.user;
  console.log(`User in prepareEventLogData : ${JSON.stringify(user)}`)
  const note = `IP: ${req.ip} User-Agent: ${req.headers['user-agent']}`;
  const details = loggedObject && JSON.stringify(loggedObject.details) || '';
  // console.log(prepareEventLogData)
  return {
    userId: user.id, //loggedObject.userID
    userRole: user.role,
    userEmail: user.email,
    userName: user.name,
    eventType: loggedObject.eventType,
    note,
    createdAt: new Date(),
    changedObject: loggedObject && loggedObject.name || '',
    details,
  };
};
