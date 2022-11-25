import moment from 'moment';
import {
    admin as Admin,
    campaign as Campaign,
    inventory as Inventory,
    publisher as Publisher,
    sequelize,
    Sequelize,
} from '../../../models';
import * as campaignConstants from '../../../constants/campaign';
import {REMOVED} from '../../../constants/campaign';
import {PUBLISHER} from '../../../constants/topEarnings';
import {publisherTypes, roles} from '../../../constants/user';
import {clickhouse, wlid} from '../../../../config';
import {publisher} from '../../../app';
import {getRtbFormat} from '../../../utils/common';
import log from '../../../../logger';
import chCluster from "../../../utils/client/chCluster";

const Op = Sequelize.Op;
const {versionTable} = clickhouse;
let redisClient;

export const loadPublishersDropdown = async (req, res, next) => {
  let options = {};

  if (req.user.role === roles.ACCOUNT_MANAGER) {
    options = {
      where: {managerId: req.user.id},
    };
  }

  try {
    let publishers = await Publisher.findAll({
      ...options,
      attributes: ['id', 'name'],
    });
    publishers = publishers.map((el) => ({value: el.get().id, label: el.get().name}));
    res.send(publishers);
  } catch (e) {
    log.error(`loading publisher dropdown \n ${e}`);
    next(e);
  }
};

/*
function whereFilter(condition, selectedStatus, selectedInventory, selectedTypeName, startDate, endDate) {
  return `where "status"${condition}'REMOVED' 
  ${selectedStatus ? ` and "status"='${selectedStatus.toUpperCase()}'` : ''}
  ${selectedInventory ? ` and "trafficType"='${selectedTypeName}'` : ''}
  ${startDate && endDate ? ` and "createdAt" >='${startDate}' and "createdAt"<='${endDate}'` : ''}`;
}
 */

export const loadPublishers = async (req, res, next) => {
  log.info('server.rest.publishers.publishers-list.loadPublishers');
  const {
    limit,
    offset,
    selectedTypeName,
    selectedStatus,
    selectedManager,
    isName,
    selectedProtocol,
    startDate,
    endDate,
    selectedInventory
  } = req.query;

  const firstDay = moment().startOf('month').format('YYYY-MM-DD');
  const lastDay = moment().format('YYYY-MM-DD');


  if(isName){
    const data = await sequelize.query(`select "id","name","companyName","status" from publishers`);
    res.send({users:data[0]});
    return;
  }
  const {role, type,id} = req.user;
  if(role !== PUBLISHER && type !== publisherTypes.SSP){

    let where = {};
    /*
    if(selectedStatus === REMOVED) {
      where = whereFilter('=', selectedStatus, selectedInventory,selectedTypeName, startDate, endDate)
    } else {
      where = whereFilter('!=', selectedStatus, selectedInventory, selectedTypeName, startDate, endDate)
    }
     */

    if(role === roles.ACCOUNT_MANAGER){
      where.managerId = id;
    }
    if(selectedTypeName){
      where.adType = [selectedTypeName];
    }
    if(selectedInventory){
      where.trafficType = selectedInventory;
    }
    if(selectedStatus !== 'REMOVED'){
      where.status = {[Op.ne]:'REMOVED'};
    }
    if(selectedStatus){
      where.status = selectedStatus.toUpperCase();
    }
    /*
    if(startDate && endDate){
      where.createdAt = {
        [Op.and]:[
          {[Op.gte]:startDate},
          {[Op.lte]:endDate}
        ]
      }
    }
     */
    let count;
    let users = await Publisher.findAll({
      where,
      limit,
      offset,
      attributes:{
        exclude:['password'],
      },
      order:[
          ['id','DESC']
      ],
      raw:true
    });

    if(selectedStatus !== 'REMOVED'){
      if (selectedStatus) {
        where.status = {
          [Op.and]: [
            {[Op.eq]: selectedStatus},
            {[Op.ne]: 'REMOVED'},
          ],
        };
      } else {
        where.status = {
          [Op.and]: [
            {[Op.ne]: 'REMOVED'},
          ],
        };
      }
      count = await Publisher.findAndCountAll({where});
    } else {
      count = await Publisher.findAndCountAll({where});
    }
    let admins = await Admin.findAll({where:{role: roles.ACCOUNT_MANAGER}, attributes:['id','name']});
    admins = admins.map((admin) => admin.get());

    const whiteLists = await Promise.all(users.map((user) => new Promise( async (resolve) => {
      const campaignCount = await Inventory.findAndCountAll({where:{
        campaignId:{
          [Op.ne]:null,
        },
          publisherId: user.id
        }});

      if(startDate && endDate && (startDate !== firstDay || lastDay !== endDate)){
        const sql = `
        SELECT t1.payout + t2.payout as payout
        FROM (
          SELECT
            publisherId,
            floor(sumIf(payout, status='APPROVED'), 6) as payout
          FROM dsp.impressions_${versionTable}
          WHERE publisherId=${user.id} and createdDate >= '${startDate}' and createdDate <= '${endDate}' and wlid='${wlid}'
          GROUP BY publisherId) as t1
          
          LEFT JOIN (
            SELECT
              publisherId,
              floor(sumIf(payout, status='APPROVED' and paymentModel='CPC'), 6) as payout
            FROM dsp.clicks_${versionTable}
            WHERE publisherId=${user.id} and createdDate >= '${startDate}' and createdDate <= '${endDate}' and wlid='${wlid}'
            GROUP BY publisherId
          ) as t2
          ON toUInt16(t1.publisherId) = toUInt16(t2.publisherId)
        `;
        const {data} = await chCluster.querying(sql);
        user.revenue = data[0]? data[0].payout:0;
      }

      user.publisherId = user.id;
      user.campaignsCount = campaignCount.count;

      const publicCampaigns = await Campaign.findAll({
        where:{
          accessStatus: campaignConstants.PUBLIC,
          status: campaignConstants.ACTIVE
        },
        attributes:['id']
      });

      const publicIds = publicCampaigns.map((c) => c.id);
      resolve({pub:user.id, count:publicIds.length});
    })));

    if(firstDay === startDate && lastDay === endDate){
      const cacheData = await redisClient.getAsync('cache-publisher-data');
      const data = JSON.parse(cacheData);

      if(data){
        users.map((user) => {
          const stats = data.find((item) => item.pid === user.id);
          user.revenue = stats ? stats.payout : 0;
        });
      }
    }

    users.map((user) => {
      user.connected = whiteLists.find((list) => list.pub === user.id).count;
    });

    users.map((user) => {
      if(user.managerId){
        user.managerName = admins.find((admin) => admin.id === user.managerId).name;
      }
    });

    users.map((el) => {
      el.createdAt = moment(el.createdAt).format('YYYY-MM-DD HH:mm:ss');
      el.updatedAt = moment(el.updatedAt).format('YYYY-MM-DD HH:mm:ss');
    })

    let results ={};

    results.users = users;
    results.count = count.count;
    res.send(results);
  } else {
    res.send({users:[]})
  }
};

/**
 * @api {get} /v1/publisher-rtb/:id Read a ssp rtb data
 * @apiParam {String} id The publisher ID
 * @apiHeader {String} authorization jwt-token
 * @apiVersion 0.1.0
 * @apiName GetPublisherRtbDetails
 * @apiGroup Publisher
 */
export const getPublisherRtb = async (req, res, next) => {
  try {
    const {id} = req.params;
    const data = await getRtbFormat('publisher', id);
    res.json(data);
  } catch (err) {
    log.error(`getting publisher RTB \n ${err}`)
    next(err);
  }
};

/**
 * @api {get} /v1/publisher-bidreq/:id Read a ssp bidrequest data
 * @apiParam {String} id The publisher ID
 * @apiHeader {String} authorization jwt-token
 * @apiVersion 0.1.0
 * @apiName GetPublisherBidreqDetails
 * @apiGroup Publisher
 */
export const getPublisherBidreq = async (req, res, next) => {
  try {
    const {id} = req.params;
    const task = {
      type: 'get bidreq',
      entity: 'ssp',
      id,
    };
    publisher.publish('bidder-task-channel', JSON.stringify(task));

    await redisClient.delAsync(`ssp-${id}-bidreq-format`);

    let ts = 10;
    // noinspection JSAnnotator
    async function recursiveGetBidreq() {
      const cacheData = await redisClient.getAsync(`ssp-${id}-bidreq-format`);
      if (!cacheData && ts > 0) {
        ts--;
        setTimeout(recursiveGetBidreq, 1000);
      } else if (cacheData) {
        let data = JSON.parse(cacheData);

        if (!data) {
          data = {bidrequest: data};
        }

        res.json({bidrequest: data});
      } else {
        res.json({bidrequest: {}});
      }
    }
    await recursiveGetBidreq();
  } catch (err) {
    log.error(`getting publisher bid request \n ${err}`)
    next(err);
  }
};

export const setRedisClient = (client) => {
  redisClient = client;
};
