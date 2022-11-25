import MongoClient from 'mongodb';
import {mongoDB as mongoDbConfig} from '../../config';

const mongoDbClient = {};

const openConnection = async () => {
  try {
    const uri = `mongodb://${mongoDbConfig.user}:${mongoDbConfig.password}@${mongoDbConfig.host}:27017/${mongoDbConfig.dbName}`;
    console.log(uri)
    return await new MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  } catch (err) {
    console.log(`Error occurred while connecting to Mongo: ${err}`);
    // throw err;
  }
};

// Connect to user's activity logs storage (mongodb)
setTimeout(() => {
  console.info('try connect to mongo');
  openConnection().then((client) => {
    if (!client) {
      console.log(`Can't open connection to MongoDB`);
      return;
    }
    mongoDbClient.db = client.db(mongoDbConfig.dbName);
  });
},3000);

module.exports = mongoDbClient;
