import {
    advertiser as Advertiser,
    advertiserUsages as AdvertiserUsages,
    campaign as Campaign, plans as Plans,
    Sequelize, subscriptions as Subscriptions
} from '../../models';
import _ from 'lodash';
import {statuses} from "../../constants/user";
import * as campaign from "../../constants/campaign";
import log from '../../../logger';
const Op = Sequelize.Op;
import moment from 'moment';
import * as plan from "../../constants/plan";

export default async function checkAdvertiserUsage() {
    try {
        //get advertisers with PAYG plan
        const planId = await Plans.findOne({
            where: {
                planName: {
                    [Op.eq]: 'PAYG'
                }
            }
        });
        let advs = await Subscriptions.findAll({
            where: {
                planId: planId.id,
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

        advs = advs.map((item) => item.get());
        const adverIds = advs.map((a) => a.advertiserId);
        // console.log(`Advertiser IDs with PAYG: ${adverIds}`)

        if (!adverIds.length) {
            return;
        }

        //Get the usage of advertisers since the start of day till current time
        const usage = await AdvertiserUsages.findAll({
            where: {
                advertiserId: {
                    [Op.in]: adverIds
                },
                date: moment().format('YYYY-MM-DD')
            }
        });
        advs.map(async (a) => {
            const obj = usage.find((i) => i.advertiserId === a.advertiserId);
            if (typeof obj !== "undefined" && _.isNumber(obj.actualSpend) && _.isNumber(obj.dailySpendLimit)) {
                if (obj.actualSpend >= obj.dailySpendLimit) { //no spend allowance, suspend advertiser and campaigns
                    await Advertiser.update({
                        status: campaign.SUSPENDED,
                        statusReason: plan.DL_EXHAUST
                    }, {
                        where: {
                            id: a.advertiserId,
                        }
                    });
                    await Campaign.update({
                        status: campaign.SUSPENDED,
                        statusReason: plan.DL_EXHAUST
                    }, {
                        where: {
                            advertiserId: a.advertiserId,
                            status: campaign.ACTIVE
                        }
                    });
                } else { //if advertiser has spent allowance, activate the advertiser and campaigns
                    const updatedAdvertiser = await Advertiser.update({
                        status: campaign.ACTIVE,
                        statusReason: plan.IS_ACTIVE
                    }, {
                        where: {
                            id: a.advertiserId,
                            statusReason: plan.DL_EXHAUST,
                        }, returning: true
                    });

                    const updatedCampaign = await Campaign.update({
                        status: campaign.ACTIVE,
                        statusReason: plan.IS_ACTIVE
                    }, {
                        where: {
                            advertiserId: a.advertiserId,
                            statusReason: {
                                [Op.eq]: plan.DL_EXHAUST
                            },
                            status: {
                                [Op.eq]: campaign.SUSPENDED
                            }
                        }, returning: true
                    });
                    if (updatedAdvertiser[0] > 0 && updatedCampaign[0] > 0) {
                        log.info(`Advertiser:${a.advertiserId} daily limit restored, activating advertiser and the campaigns`);
                    }
                }
            } else {
                //no entry found for today in advertiser usage table
                await Advertiser.update({
                    status: campaign.SUSPENDED,
                    statusReason: plan.DL_EXHAUST
                }, {
                    where: {
                        id: a.advertiserId,
                        status: {[Op.ne]: statuses.PENDING}
                    }
                });
                await Campaign.update({
                    status: campaign.SUSPENDED,
                    statusReason: plan.DL_EXHAUST
                }, {
                    where: {
                        advertiserId: a.advertiserId,
                        status: campaign.ACTIVE
                    }
                });
            }
        });
    } catch (e) {
        log.error(`CRON FAILED:checkAdvertiserUsage \n ${e.stack}`);
    }
}