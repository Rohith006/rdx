import {
    advertiser as Advertisers,
    plans as Plans,
    advertiserUsages as AdvertiserUsages,
    subscriptions as Subscriptions,
    transactionRequests as TransactionRequests, Sequelize
} from '../../../models';
import log from '../../../../logger';


const Moment = require('moment');
const MomentRange = require('moment-range');

const moment = MomentRange.extendMoment(Moment);
import _ from "lodash";
import {statuses} from "../../../constants/user";
const Op = Sequelize.Op;

export const setSubscription = async (req, res, next) => {
    try {
        const { advertiserId, planId } = req.body;
        if(!(_.isNumber(planId) && _.isNumber(advertiserId))){
            res.send({error:'Invalid planID or advertiserID'});
            return;
        }
        const startDate  = moment().utc().format('YYYY-MM-DD HH:mm:ss');
        const endDate = moment().utc().add(1,'month').format('YYYY-MM-DD HH:mm:ss');
        const isExistSubscription = await Subscriptions.findOne({
            where:{
                advertiserId,
                status:statuses.ACTIVE
            }
        });
        if(!_.isEmpty(isExistSubscription)){
            res.send({error:`Subscription already exists for this Advertiser`,isExistSubscription});
            return;
        }
        const subscription = await Subscriptions.create({
            advertiserId,
            planId,
            startDate,
            endDate,
            status:statuses.ACTIVE
        });
        res.send(subscription);
    }catch (e) {
        log.error(`Setting subscription:${e.stack}`);
        next(e);
    }
}

export const setDailyLimit = async (req, res, next) => {
    try{
        const {advertiserId, dailyLimit} = req.body;
        if (!(_.isNumber(advertiserId) && _.isNumber(dailyLimit))){
            res.send({error: 'Invalid payload'});
        } else {
            let subscribed = await Subscriptions.update({dailyLimit}, {where:{advertiserId}, returning:true});
            const newDailyLimit = await AdvertiserUsages.create({
                advertiserId,
                date: moment().format('YYYY-MM-DD'),
                dailySpendLimit: Number(dailyLimit).toFixed(2),
            });

            // change the advertiser status from PAUSED to ACTIVE
            await Advertisers.update({status:statuses.ACTIVE},{where:{id:advertiserId}});
            const updatedSubscription = subscribed[1][0].get();
            res.status(200).json({success:true,updatedSubscription,newDailyLimit})
        }
    }catch (e) {
        log.error(`Setting daily limit failed:${e.stack}`);
        next(e);
    }
}

export const updateDailyLimit = async (req, res, next) => {
    try{
        const {advertiserId, newDailyLimit } = req.body;
        if (!(_.isNumber(advertiserId) && _.isNumber(newDailyLimit))) {
            res.send({error: 'Invalid payload'});
        } else {
            //get the current daily limit
            const subscription = await Subscriptions.findOne({where: {[Op.and]: [{advertiserId}, {status: statuses.ACTIVE}]}});
            const currentDailyLimit = subscription && _.isNumber(subscription.dailyLimit) ? subscription.dailyLimit : 0;
            const difference = newDailyLimit - currentDailyLimit;

            //Set the new daily limit in subscriptions table
            let updatedSubs = await Subscriptions.update({
                dailyLimit: Number(newDailyLimit).toFixed(2)
            }, {
                where: {
                    advertiserId
                },
                returning: true
            });
            //increase the advertiserUsage
            let updateAdvUsage = await AdvertiserUsages.increment({dailySpendLimit: difference}, {where: {advertiserId,date:moment().format('YYYY-MM-DD')}});
            const updatedSubscription = updatedSubs[1][0].get();
            res.status(200).json({success:true, updatedSubscription, updateAdvUsage})
        }
    } catch (e) {
        log.error(`Updating daily limit failed: ${e.stack}`)
        next(e);
    }
}

export const transactionDetails = async (req, res, next) => {
    try{
         const {advertiserId} = req.body;
         if(!advertiserId){
             res.send({error:'Advertiser ID missing'});
             return;
         }
         let transactions;
         let usages;

         transactions = await TransactionRequests.findAll({
             where:{
                 advertiserId
             }
         });

         usages = await AdvertiserUsages.findAll({
             where:{
                 advertiserId
             }
         });

         transactions.map((transaction) => {
             transaction.actualSpend = usages.find((usage) => moment(usage.date).format('YYYY-MM-DD') === moment(transaction.requestTime).format('YYYY-MM-DD')).actualSpend
         });
         res.send(transactions);
    } catch (e) {
        log.error(`Transaction requests \n ${e.stack}`);
        next(e);
    }
}

