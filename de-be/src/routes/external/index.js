import {Router} from 'express';
import create from './create';
import updateCampaign from './updateCampaign';
import deleteCampaign from './deleteCampaign';
import loadCampaign from './loadCampaign';
import WBlist from './WBlist';
import internal from './internal';
import reports from './reports';
import {token} from '../../utils/refreshToken';
import {passportJwt} from '../../auth/passportMiddlewares';

const router = Router();

router.use('/create', passportJwt ,create);

router.use('/update', passportJwt, updateCampaign);

router.use('/delete', passportJwt, deleteCampaign);

router.use('/load', passportJwt, loadCampaign);

router.use('/fetch', passportJwt, internal);

router.use('/wb-list', passportJwt, WBlist);

router.use('/reports', passportJwt, reports);

router.post('/refresh', token);

export default router;