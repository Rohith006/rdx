import _ from 'lodash';

/**
 * Use when we don't need the details of the updated entity.
 * For example: sign in, sign out, password recovery, reports export etc.
 */
export const prepareSimpleLogInfo = (user, eventType) => {
  // const logData = {user, eventType};
  const log = {
    role: user.role,
    name: user.name,
    email: user.email,
    id: user.id,
  }
  // console.log("loggedObject",JSON.stringify(loggedObject))
  return {eventType, userId: user.id, details: [log], name: user.email};
};

/**
 * For publishers and advertisers
 */
export const prepareChangeUserStatusLogInfo = (users, status, eventType) => {
  const names = [];
  const details = [];
  const userIds = []
  users.forEach((user)=>{
      names.push(user.get().email || user.get().name || user.get().campaignName);
      let log = {}
      if(user.get().status!==status){
        log = {
            id: user.get().id,
            status:{
              oldValue:user.get().status,
              newValue:status
            }
        }
      }
      if(!_.isEmpty(log)){
        userIds.push(user.get().id)
        details.push(log)
      }
  })
  return !_.isEmpty(details) ? {eventType, userId: userIds.join(','), name: names.toString(), details} : {};
};

/**
 * For admins and account managers
 */
export const prepareChangeManagerStatusLogInfo = (previousUserData, newStatus, eventType) => {
  const user = Object.assign({}, previousUserData.dataValues);
  // console.log(user)
  const details = [
    {
        id: user.id,
        status:{
          oldValue:user.status,
          newValue:newStatus
        }
    },
  ];
  // console.log(JSON.stringify(details))
  return {eventType, userId: user.id, details, name: user.email};
};

/**
 * For logger user's data, also it'll be used for the admin's data
 */
const getSerializedObj = (obj) => {
  for(let key in obj){
    if(obj[key]==='null'|| obj[key]===null || obj[key]==='' || _.isEmpty(obj[key])){
      delete obj[key]
    }
  }
  // console.log(obj)
  return obj
}
export const prepareUserLogInfo = (oldValue, anotherValue, eventType) => {
  
  let changedLog = {}

  const oldBilling = Object.assign({}, oldValue.billing);
  const anotherBilling = Object.assign({}, anotherValue.billing);

  const oldUser = Object.assign({}, oldValue.user);
  const anotherUser = Object.assign({}, anotherValue.user);
  const userId = JSON.stringify(anotherUser['id']);
  delete oldUser.password;
  delete oldUser.updatedAt;
  delete oldUser.createdAt;

  delete anotherUser.password;
  delete anotherUser.updatedAt;
  delete anotherUser.createdAt;

  if(eventType.includes('new')){
    // serialize the data
    const newUser = getSerializedObj(anotherUser)
    const newBilling = getSerializedObj(anotherBilling)
    if(!_.isEmpty(newBilling)){
      changedLog = {eventType, userId:userId, name:newUser.email, details:[{...newUser, ...newBilling}]}
    }else{
      changedLog = {eventType, userId:userId, name:newUser.email, details:[{...newUser}]}
    }
    return changedLog;
  }else{
    const isNotNull = (v1,v2)=>{
      let s1 = typeof(v1)=='string'?v1:JSON.stringify(v1)
      let s2 = typeof(v2)=='string'?v2:JSON.stringify(v2)
      return (s1==='null' && s2!=='null') || (s1!=='null' && s2==='null');
    }
    const isNull_ = (v1,v2)=>{
      let s1 = typeof(v1)=='string'?v1:JSON.stringify(v1)
      let s2 = typeof(v2)=='string'?v2:JSON.stringify(v2)
      return (s1==='null' && s2==='null')
    }
    if (!_.isEmpty(oldBilling) || !_.isEmpty(anotherBilling)) {
    
          for(let key in oldBilling) {
            if(!_.isEqual(oldBilling[key],anotherBilling[key]) && !isNull_(oldBilling[key],anotherBilling[key]) && key!=="createdAt" && key!=="updatedAt"){
              changedLog[key] = {
                oldValue: oldBilling[key],
                newValue: anotherBilling[key]
              }
            }
          }
    }

    /*
    {
      field:{
        oldValue: 'something',
        newValue: 'something else'
      }
    }
  */
    for(let key in oldUser) {
      if( isNotNull(oldUser[key], anotherUser[key]) ){
          changedLog[key] = 
          { 
            oldValue: oldUser[key], 
            newValue: anotherUser[key]
          }
        }
      // check is oldUser key is null and anotherUser key is not null
        else if((key!=="createdAt" && !_.isEqual(oldUser[key],anotherUser[key]) )) {
            if(Array.isArray(oldUser[key]) && Array.isArray(anotherUser[key])){
              // if field is an array
              // find all the new values in newUser
              if(oldUser[key].length!==anotherUser[key].length){
                changedLog[key] = {
                  oldValue: oldUser[key],
                  newValue: anotherUser[key]
                }
              }else{
                let diff = anotherUser[key].filter(x => !oldUser[key].includes(x))
                if(diff.length>0){
                  changedLog[key] = {
                    oldValue: oldUser[key],
                    newValue: anotherUser[key]
                  }
                }
              }
            }
            else if(!isNull_(oldUser[key], anotherUser[key])){
              changedLog[key] = {
                  oldValue: oldUser[key],
                  newValue: anotherUser[key]
              }
            }
        }
    }
  }
  return {eventType, name: anotherUser.email || anotherUser.campaignName, details: [changedLog]};
};

/**
 * For logger campaign's data
 */
export const prepareEntityLogInfo = (oldValue, anotherValue, eventType, type) => {
  const oldUser = Object.assign({}, oldValue.user);
  const another = Object.assign({}, anotherValue.user);
  const userId = JSON.stringify(another.id)
  // const info = {
  //   Object: {oldValue: oldUser, newValue: another},
  // };
  let changedLog = {}
  if(eventType.includes("new")){
    const newUser = getSerializedObj(another)
    changedLog = {eventType,userId:userId, name:newUser.name || another.campaignName, details:[{...newUser}]}
  }
  return changedLog;
};

export const prepareDeleteCampaignLogInfo = (campaigns, eventType) => {
  const names = []; 
  // const details = [];
  let details_ = []
  const userIds = []
  campaigns.map((item) => {
   
    names.push(item.campaignName);
    // log object modification
    let log = {
        name:item.campaignName,
        id:item.id,
        status:{
          oldValue:item.status,
          newValue:"REMOVED"
        }
    }
    userIds.push(item.id)
    details_.push(log)
  });
  return {details: details_, userId: userIds.join(','), eventType, name: names.toString()};
};

export const prepareSubscriptionLogInfo = (entity, subscription, eventType) => {
  const action = Object.assign({},entity);
  const userId = JSON.stringify(action.id);
  let changedLog = {};
  if(eventType.includes("new")){
    const newAction = getSerializedObj(action);
    changedLog = {eventType, userId,name:newAction.name || newAction.id, details:[{...subscription}]}
  }
  return changedLog;
}
