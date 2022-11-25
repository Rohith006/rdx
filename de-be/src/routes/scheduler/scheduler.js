import {Router} from "express";
import { updateDailySpendLimit } from "../../services/cron/updateDailySpendLimit";
import { syncTransactionRequestWithDIY } from "../../services/cron/syncTransactionRequestWithDIY";
const router = Router();
const getScheduler = {
    'updateDailySpendLimit':updateDailySpendLimit,
    'syncTransactionRequestWithDIY':syncTransactionRequestWithDIY
}
router.get('/:schedulerName?',(req, res)=>{
    const { schedulerName } = req.params;
    if(!schedulerName){
        return res.status(400).send({msg:'scheduler name not defined!'});
    }
    const scheduler = getScheduler[schedulerName];
    if(scheduler){
        scheduler()
        return res.status(200).send({msg:'scheduler started!'});
    }else{
        return res.status(400).send({msg:'invalid scheduler name!'})
    }
})
export default router;