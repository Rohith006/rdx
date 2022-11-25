import {Router} from 'express';
import TrafficOptimizationCtrl from '../../controllers/trafficOptimizations.controller';

const router = Router();

router.get('/campaigns/sub-id', TrafficOptimizationCtrl.getCampaignListOfSubIds); // TODO implement logging

router.post('/campaigns/add/sub-ids', TrafficOptimizationCtrl.addCampaignSubIdsToList);

router.delete('/campaigns/delete/sub-ids', TrafficOptimizationCtrl.deleteCampaignSubIds);

export default router;