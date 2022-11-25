import {Router} from 'express';
import {externalLoadCampaignDetails} from '../../middlewares/v1/database/load';
import {loadCampaignsStatistics} from '../../middlewares/v1/campaigns';

const router = Router();

router.get('/campaign-details', externalLoadCampaignDetails); // TODO implement logging

router.get('/campaigns', loadCampaignsStatistics);

export default router;