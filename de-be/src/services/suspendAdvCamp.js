import {
    advertiser as Advertiser,
    campaign as Campaign,
} from '../models'
import log from '../../logger';
export const suspendAdvCamp = async(advId, REASON)=>{
    try{
        // suspend the campaign and advertisers with the REASON
        log.info(`suspendAdvCamp started for advertiserId: ${advId}`);
        await Advertiser.update({
            status: 'SUSPENDED',
            statusReason: REASON
        }, {
            where: {
                id: advId
            }
        });
        log.info(`Advertiser ${advId} suspended, reason: ${REASON}`);
        await Campaign.update({
            status: 'SUSPENDED',
            statusReason: REASON
        }, {
            where: {
                advertiserId: advId,
                status: 'ACTIVE'
            }
        });
        log.info(`Campaigns of advertiser ${advId} suspended, reason: ${REASON}`);
    }catch(err){
        log.error(`suspendAdvCamp FAILED: ${err.stack}`);
    }
}