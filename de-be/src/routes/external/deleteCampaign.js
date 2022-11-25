import {Router} from 'express';
import {deleteExternalCampaign} from '../../middlewares/v1/database/delete';

const router = Router();

router.delete('/campaign', deleteExternalCampaign); // TODO implement logging

export default router;