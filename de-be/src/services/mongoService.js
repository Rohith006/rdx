import moment from 'moment';
import {db} from '../utils/mongoDbClient';
import {eventTypes} from '../constants/eventType';

const DATE_MASK = 'YYYY-MM-DDTHH:mm:ss';

export const searchUserActivityLogs = async (filters, user) => {
    const collection = db.collection('activityLogs');
    const excludeFields = { fields: { userId: 0, userRole: 0 } };
    const query = prepareQuery(filters, user);
    return await collection.find(query, excludeFields).sort({ createdAt: -1 }).toArray();
};

const prepareQuery = (criteria, user) => {
  const query = {};
  if(user.role === "ADVERTISER"){
      query.userId = user.id;
      query.userRole = user.role;
  }
  console.log(query)
  Object.keys(criteria).forEach((filter) => {
    const params = criteria[filter];
    if (filter === 'user') {
      query.userId = params.id;
      query.userRole = params.role;
    }
    if (filter === 'eventType') {
      const types = params.map((item) => eventTypes[item]);
      if (types.length > 0) {
        query.eventType = {$in: types};
      }
    }
    if (filter === 'dateRange') {
      query.createdAt = {
        $gte: new Date(moment(params.startDate).format(DATE_MASK) + 'Z'),
        $lte: new Date(moment(params.endDate).endOf('day').format(DATE_MASK) + 'Z'),
      };
    }
  });
  return query;
};

export const saveUserActivity = async (activityLog) => {
  try {
    const collection = db.collection('activityLogs');
    await collection.insertOne(activityLog);
  } catch (e) {
    console.error('mongo error saveUserActivity');
  }
};