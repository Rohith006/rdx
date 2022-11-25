import {Router} from 'express';
import {updateExternalCampaign, updateExternalCampaignStatus} from '../../middlewares/v1/database/update';

const router = Router();

router.put('/campaign', updateExternalCampaign); // TODO implement logging

router.put('/campaign-status', updateExternalCampaignStatus);

export default router;