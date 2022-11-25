import {Router} from 'express';
import requireApiKey from '../../middlewares/v1/validation/requireApiKey';
import {loadCampaigns, prepareLogs,} from '../../middlewares/v1/api';
import {passportJwt} from '../../auth/passportMiddlewares';
import {logActivity} from '../../middlewares/v1/logging';

const router = Router();

router.get('/offers', requireApiKey, loadCampaigns);

router.post('/log-activity', passportJwt, prepareLogs, logActivity);

export default router;
