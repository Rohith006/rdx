import moment from 'moment';

import {publisherTypes, roles} from '../../../constants/user';
import {advertiser as Advertiser, partnerFees as PartnerFees, sequelize} from '../../../models';
import {Op} from 'sequelize';
import chCluster from '../../../utils/client/chCluster';
import {getAdvertiserCountSql} from '../../../utils/clickhouseQq';
import {getAdvertiserSql, getAllAdvertiserSql} from '../../../utils/clickhouseQq2';
import {getAdvertiserListSql} from '../../../utils/postgresqlQq';
import {REMOVED} from '../../../constants/campaign';
import {clients} from '../../../services/clients';
import log from '../../../../logger';
import _ from 'lodash'


export const loadAdvertisers = async (req, res, next) => {
  try {
    const {
      limit,
      offset,
      selectedStatus,
      selectedManager,
      selectedCountry,
      startDate,
      endDate,
      isName
    } = req.query;

    console.log(JSON.stringify(req.query));
    if (req.user.role !== roles.PUBLISHER && req.user.type !== publisherTypes.SSP) {
      if(isName){
        const condition = roles.ACCOUNT_MANAGER === req.user.role ? ` where "managerId" = ${req.user.id}` : '';
        const data = await sequelize.query(`select "id", "name", "companyName", "status", "apiKey" from advertisers ${condition}`);
        res.send({users:data[0]});
        return;
      }

      let manager = req.user.role === roles.ACCOUNT_MANAGER ? req.user.id : selectedManager;
      let where = '';

      if (selectedStatus === REMOVED) {
        where = whereFilter('=', selectedStatus, manager, selectedCountry);
      } else {
        where = whereFilter('!=', selectedStatus, manager, selectedCountry);
      }

      const sqlQuery = getAdvertiserListSql(where, limit, offset);

      const advertisers = await sequelize.query(sqlQuery, {type: sequelize.QueryTypes.SELECT});
      const adverIds = advertisers.map((item) => item.id);
      const firstDay = moment().startOf('month').format('YYYY-MM-DD');
      const lastDay = moment().format('YYYY-MM-DD');
      let data;

      if(!startDate && !endDate){
        console.log(`Advertiser spends query when no startDate and endDate`)
        if(!_.isEmpty(adverIds)){
          let response = await chCluster.querying(getAllAdvertiserSql(adverIds));
          data = response.data;
        } else {
          data = [];
        }
      } else if((firstDay === startDate && lastDay === endDate)) {
        let cacheData = await clients.redisClient.getAsync('cache-advertiser-data');
        data = JSON.parse(cacheData) || [];
      } else {
        if(!_.isEmpty(adverIds)) {
          let response = await chCluster.querying(getAdvertiserSql(adverIds, startDate, endDate))
          data = response.data;
        } else {
          data = [];
        }
      }
      const users = advertisers.map((adver) => {
        const stat = data.find((item) => item.advertiserId === adver.id);
        return {
          ...adver,
          spend: stat? stat.spend : 0
        }
      });

      let count = await sequelize.query(getAdvertiserCountSql(where))
      count = count[1].rowCount;

      res.send({users, count});
    } else {
      res.send([]);
    }
  } catch (e) {
    log.error(`loading advertisers \n ${e.stack}`)
  }
};
export const getAvailableAdvertisers = async (partnerType, partnerName) => {
  if(!partnerType || !partnerName){
    return {availableAdvertisers:[], error:'Bad Request', msg:"Please provide partnerType and partnerName"}
  }
  try{
    const advertisersList = await Advertiser.findAll({
      attributes: ['id', 'name'],})
      // create a dictionary of advertisers with key as id and value as name from advertisersList
    const advertisersDict = _.keyBy(advertisersList, 'id');
    const allAdvertisers = advertisersList.map(item => {
      return {
        id: item.id,
        name: item.name
      }
    })
    // fetch all partner fees with given partner type and partner name from partnerFees table
    let partnerFees = [];
    const partnerFeesList = await PartnerFees.findAll({
      where:{
        [Op.and]: [
        {partnerTypeName : partnerType},
        {partnerName : partnerName},
        {status:{
          [Op.ne]:"REMOVED"
        }}]
      }
    })
    if(partnerFeesList.length == 0){
      return {availableAdvertisers:allAdvertisers, error:null, msg:"No partner fees found with given partnerType and partnerName"}
    }
    partnerFees = partnerFeesList.map(item => {
      return {
        feesId: item.feesId,
        partnerTypeName: item.partnerTypeName,
        partnerName: item.partnerName,
        advertisers: item.advertisers,
      }
    })
    const combinedAdvertisersId = [];
    for(let i=0;i<partnerFees.length;i++){
      const currentFees = partnerFees[i];
      const currentAdvertisers = JSON.parse(currentFees.advertisers); // {advertisers:[1,2,3]}
      const advertisersList = JSON.parse(currentAdvertisers.advertisers) // [1,2,3]
      for(let j=0;j<advertisersList.length;j++){
        if(!combinedAdvertisersId.includes(advertisersList[j])){
          combinedAdvertisersId.push(advertisersList[j])
        }
      }
    }
    // create a combined list of combined advertisers with  id and name using the combinedAdvertisersId
    const combinedAdvertisersWithName = [];
    for(let i=0;i<combinedAdvertisersId.length;i++){
      const currentAdvertiserId = combinedAdvertisersId[i];
      combinedAdvertisersWithName.push({
        id: currentAdvertiserId,
        name: advertisersDict[currentAdvertiserId].dataValues.name
      })
    }
    // remove  advertisers from allAdvertisers array that are present in combinedAdvertisersWithName
    const availableAdvertisers = _.differenceWith(allAdvertisers, combinedAdvertisersWithName, _.isEqual);

    return {availableAdvertisers, error:null, msg:"success"}
  }catch(err){
    return {availableAdvertisers:[], error:err, msg:"Error while fetching available advertisers"}
  }
}
function whereFilter(condition, selectedStatus, selectedManager, selectedCountry, startDate, endDate) {
  return `where a."status" ${condition} 'REMOVED'${selectedStatus ? ` and a."status"='${selectedStatus}'` : ''}${selectedManager ? ` and a."managerId"='${selectedManager}'` : ''}${startDate && endDate ? ` and a."createdAt" >= '${startDate}' and a."createdAt" <= '${endDate}'` : ''}${selectedCountry ? ` and b."country"='${selectedCountry}'` : ''}`;
}
