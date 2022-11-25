import moment from 'moment';
import _ from 'lodash';
import axios from 'axios';
import {
    advertiser as Advertiser,
    advertiserUsages as AdvertiserUsages,
    subscriptions as Subscription,
    transactionRequests as TransactionRequests,
} from '../../models';
import config from '../../../config'
import chCluster from '../../utils/client/chCluster';
import { getAdvertiserSql } from '../../utils/clickhouseQq2';
import {Op} from 'sequelize';
import { suspendAdvCamp } from '../suspendAdvCamp';
import * as plan from '../../constants/plan';
import log from '../../../logger';
const console_api_url = config.console_api_url + '/api/payg/payment/{ID}/status?date={DATE}';

export const updateDailySpendLimit = async ()=>{
    try{
        /* this cron job runs everyday at 23:58 or 12am ~ close to midnight */
        const today = moment();
        log.info(`cron.updateDailySpendLimit: started at ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
        
        const todayMidNight = today.format('YYYY-MM-DD 23:59:59');
        const todayElevenPm = today.format('YYYY-MM-DD 23:00:00');

        let subs = await Subscription.findAll({
            where:{
                status:'ACTIVE',
                dailyLimit:{[Op.gt]:0}
            },
            include:[
                {
                    model:Advertiser,
                    where:{
                        status:{[Op.notIn]:['PENDING','REMOVED']}
                    }
                }
            ]
        }); 
        subs = subs.map((item) => item.get());
        
        let newDailySpendLimit;

        if(!subs.length){
            log.info(`cron.updateDailySpendLimit: can't find subscription, \n subs=${JSON.stringify(subs)}`)
            return;
        }
        subs.map(async (sub) => {
            /* find record in transactionRequest table created by 11pm job*/
            const tReq = await TransactionRequests.findOne({
                where:{
                    'requestTime':{
                        [Op.between]:[today.format('YYYY-MM-DD 00:00:00'),today.format('YYYY-MM-DD 23:59:59')] // will return any request made between start of the day to end
                    },
                    'advertiserId':sub.advertiserId
                }
            });
        
            newDailySpendLimit = 0;
            log.debug(`cron.updateDailySpendLimit: tReq=${JSON.stringify(tReq)}, isEmpty: ${_.isEmpty(tReq)}`);
            if (_.isEmpty(tReq)) {
                /* no transaction request made */
                log.info(`cron.updateDailySpendLimit: No transaction request was made by 11pm job! For advertiser ${sub.advertiserId}`)
                const advUsage = await AdvertiserUsages.findOne({
                    where: {
                        advertiserId: sub.advertiserId,
                        date: today.format('YYYY-MM-DD')
                    }
                });
                if (advUsage) {
                    newDailySpendLimit = advUsage.dailySpendLimit - advUsage.actualSpend;
                    log.info(`cron.updateDailySpendLimit: Advertiser ${sub.advertiserId} has actualSpend ${advUsage.actualSpend} for ${today.format('YYYY-MM-DD')}`);
                } else {
                    log.info(`cron.updateDailySpendLimit: Advertiser ${sub.advertiserId} has no actualSpend for ${today.format('YYYY-MM-DD')}`);
                }
            } else {
                /* transaction request made */
                log.info(`cron.updateDailySpendLimit: Transaction was made by 11pm job ${JSON.stringify(tReq)} for advertiser ${sub.advertiserId}`)

                const url = console_api_url.replace('{ID}', sub.advertiserId).replace('{DATE}', today.format('YYYY-MM-DD'));
                const response = (await axios.get(url)).data; // get the response body
                if (String(response.paymentStatus).toLowerCase() === 'success') {
                    /* transaction request successful */
                    log.info(`cron.updateDailySpendLimit: Transaction successful for advertiser ${sub.advertiserId}, response=${JSON.stringify(response)}. Updating TransactionRequest table...`);

                    // get advertiser's spend between 11pm-12am from clickhouse
                    const adverIds = [sub.advertiserId];
                    let advObj = await chCluster.querying(getAdvertiserSql(adverIds, todayElevenPm, todayMidNight));
                    advObj = advObj.data.find((i) => i.advertiserId === sub.advertiserId)
                    let advSpend = 0
                    // update the daily spend limit
                    if(advObj && _.isNumber(advObj.spend)){
                        advSpend = advObj.spend;
                    }
                    newDailySpendLimit = sub.dailyLimit - advSpend;
                    // update entry in transactionRequest table
                    await TransactionRequests.update({success: true, response: JSON.stringify(response)}, {
                        where: {
                            advertiserId: sub.advertiserId,
                            requestTime: tReq.requestTime
                        }
                    })
                } else {
                    /* transaction request failed */
                    log.info(`cron.updateDailySpendLimit: Transaction failed for advertiser ${sub.advertiserId}, response=${JSON.stringify(response)}`)
                    /* Suspend advertiser and its campaign */
                    // await suspendAdvCamp(sub.advertiserId, plan.PAYMENT_FAILED)

                    log.info(`cron.updateDailySpendLimit: Advertiser ${sub.advertiserId} and its campaign suspended, reason: ${plan.PAYMENT_FAILED}`);

                    const advUsage = await AdvertiserUsages.findOne({
                        where: {
                            advertiserId: sub.advertiserId,
                            date: today.format('YYYY-MM-DD')
                        }
                    });
                    if (advUsage) {
                        newDailySpendLimit = advUsage.dailySpendLimit - advUsage.actualSpend;
                        log.info(`cron.updateDailySpendLimit: Advertiser ${sub.advertiserId} has actualSpend ${advUsage.actualSpend} for ${today.format('YYYY-MM-DD')}`);
                    } else {
                        log.info(`cron.updateDailySpendLimit: Advertiser ${sub.advertiserId} has no actualSpend for ${today.format('YYYY-MM-DD')}`);
                    }
                }
            }
            // create new entry for todays date
            await AdvertiserUsages.create({
                date: moment().add(1,'day').format('YYYY-MM-DD'),
                dailySpendLimit: newDailySpendLimit,
                actualSpend: 0,
                advertiserId: sub.advertiserId
            });
            log.info(`cron.updateDailySpendLimit: New entry created for advertiserId: ${sub.advertiserId} in AdvertiserUsages, with dailySpendLimit: ${newDailySpendLimit}`);
        })
    }catch(err){
        log.error(`CRON FAILED:updateDailySpendLimit \n${err.stack}`);
    }
}