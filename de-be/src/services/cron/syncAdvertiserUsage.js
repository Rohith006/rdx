import moment from 'moment';
import _ from 'lodash';
import {
    advertiser as Advertiser,
    advertiserUsages as AdvertiserUsages,
    subscriptions as Subscriptions,
    plans as Plans,Sequelize
} from '../../models';
import chCluster from '../../utils/client/chCluster';
import {getAdvertiserSql} from '../../utils/clickhouseQq2';
import * as plan from "../../constants/plan";
import {statuses} from "../../constants/user";
import log from '../../../logger';
const Op = Sequelize.Op;


export const syncAdvertiserUsage = async () => {
    try{
        //log.debug(`syncAdvertiserUsage started at ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
        const startDate = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
        const endDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const planId = await Plans.findOne({
            where:{
                planName: {
                    [Op.eq]:plan.PAYG
                }
            }
        });
        let advs = await Subscriptions.findAll({
            where:{
                planId:planId.id
            }
        });
        advs = advs.map((item) => item.get());
        const adverIds = advs.map((a) => a.advertiserId);
        if(!adverIds.length){
            log.info(`can't find any advertiser with plan ${plan.PAYG}`)
            return;
        }
        const response = await chCluster.querying(getAdvertiserSql(adverIds, startDate, endDate));
        if(response){
            advs.map((a) => {
                const obj = response.data.find((i) => i.advertiserId === a.advertiserId);
                if(obj && _.isNumber(obj.spend)){
                    const spend = obj.spend;
                    AdvertiserUsages.update({actualSpend: spend}, {where: {advertiserId: a.advertiserId, date: moment().format('YYYY-MM-DD')}});
                    //log.debug(`update advertiser usage for advertiser ${a.advertiserId} with spend ${spend}`);
                }
            });
        }
    }catch(err){
        log.error(`CRON FAILED: syncAdvertiserUsage \n${err.stack}`);
    }
}