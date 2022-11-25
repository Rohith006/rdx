import {Router} from 'express';
import {putAdvertiserApiKey} from '../../../middlewares/v1/advertiser';

const router = Router();

router.put('/generate-api-key/:id', putAdvertiserApiKey);

export default router;
