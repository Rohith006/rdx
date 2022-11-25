import {Router} from 'express';
import {
    loadApps2,
    loadCampaigns2,
    loadCountry2,
    loadDaily2,
    loadSites2,
    loadSubId2
} from '../../middlewares/v2/reports';

const router = Router();

router.get('/daily', loadDaily2); // TODO implement logging

router.get('/sub-id', loadSubId2);

router.get('/country', loadCountry2);

router.get('/campaigns', loadCampaigns2);

router.get('/apps', loadApps2);

router.get('/sites', loadSites2);

export default router;