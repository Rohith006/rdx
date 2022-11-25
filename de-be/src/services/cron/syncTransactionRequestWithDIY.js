import {
    transactionRequests as TransactionRequests,
    subscriptions as Subscription,
    advertiserUsages as AdvertiserUsages,
    Sequelize
} from '../../models';
import moment from 'moment';
import axios from 'axios';
import {console_payment_url,minSpend} from '../../../config'
import log from '../../../logger';
const Op = Sequelize.Op;

export const syncTransactionRequestWithDIY = async () => {
    try{
        log.info(`cron.syncTransactionRequestWithDIY: started at ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
        // initiates a transaction request to DIY & update the transaction request table
        // select * date=today from advertiserUsages;
        let advUsage = await AdvertiserUsages.findAll({
            where:{
                date:moment().format('YYYY-MM-DD')
            }
        });
        advUsage = advUsage.map((item) => item.get());
        if(!advUsage.length){
            log.info(`cron.syncTransactionRequestWithDIY: no advertiser usage found for today's date!`)
            return;
        }
        advUsage.map(async(usage)=>{
            let sub = await Subscription.findOne({
                where:{
                    advertiserId:usage.advertiserId,
                    status:'ACTIVE'
                }
            });
            // 
            const chargeableAmount = sub ? sub.dailyLimit - usage.dailySpendLimit + usage.actualSpend : 0;
            log.info(`cron.syncTransactionRequestWithDIY: chargeableAmount=${chargeableAmount}, advertiserId=${usage.advertiserId}`);
            if(chargeableAmount && chargeableAmount >= minSpend){ 
                log.info(`cron.syncTransactionRequestWithDIY: Advertiser ${usage.advertiserId} has actual spend >= ${minSpend}... \nInitiating transaction request to console`)
                /* create a transaction request */
                /* create new entry in transaction request table */
                
                const advertiserId = usage.advertiserId;
               
                const transactionUrl = console_payment_url + '/daily-charge'
                await axios.post(transactionUrl, {advId:advertiserId, amount:chargeableAmount});

               TransactionRequests.create({
                    amount: chargeableAmount,
                    requestTime: moment().format('YYYY-MM-DD HH:mm:ss'),
                    success: false, // update this field when the transaction is successful, done by 12AM job
                    retries: 0,
                    advertiserId,
                    response:'{}' 
               })
               log.info(`cron.syncTransactionRequestWithDIY: New entry created for advertiserId: ${usage.advertiserId} in TransactionRequests, with amount: ${usage.actualSpend}`);
            }else{
                log.info(`cron.syncTransactionRequestWithDIY: advertiserId: ${usage.advertiserId} has less than ${minSpend} today, no transaction request needed`);
            }
        })
    }catch(err){
        log.error(`CRON FAILED:updateTransactionRequestWithDIY \n${err.stack}`);
    }
}