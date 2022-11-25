import {Router} from 'express';
import {
    loadAdvertisers2,
    loadApps2,
    loadCampaigns2,
    loadClicks2,
    loadConversions2,
    loadCountry2,
    loadCreativesSizes2,
    loadCsvApps2,
    loadDaily2,
    loadGoals2,
    loadHourly2,
    loadImpressions2,
    loadNoMatchStats2,
    loadOs2,
    loadPublisherErrorsRtb2,
    loadPublishers2,
    loadSites2,
    loadSubId2,
} from '../../../middlewares/v2/reports';
import {getUser} from "../../../utils/scanUser";

const router = Router();

const keycloak = require('../../../../config/keycloak-config').getKeycloak();

router.get('/daily', keycloak.protect('desk-advertiser'), getUser, loadDaily2);

router.get('/hourly', keycloak.protect('desk-admin'), getUser, loadHourly2);

router.get('/publishers', keycloak.protect('desk-admin'), getUser, loadPublishers2);

router.get('/advertisers', keycloak.protect('desk-admin'), getUser, loadAdvertisers2);

router.get('/campaigns', keycloak.protect('desk-advertiser'), getUser, loadCampaigns2);

router.get('/publisher-errors',keycloak.protect('desk-admin'), getUser, loadPublisherErrorsRtb2);

router.get('/no-match', keycloak.protect('desk-admin'), getUser, loadNoMatchStats2);

router.get('/no-match-campaign',keycloak.protect('desk-admin'), getUser, loadNoMatchStats2);

router.get('/country',keycloak.protect('desk-advertiser'), getUser, loadCountry2);

router.get('/sub-id', keycloak.protect('desk-advertiser'), getUser, loadSubId2);

router.get('/apps', keycloak.protect('desk-advertiser'), getUser, loadApps2);

router.get('/sites', keycloak.protect('desk-advertiser'), getUser, loadSites2);

router.get('/creatives', keycloak.protect('desk-advertiser'), getUser, loadCreativesSizes2);

router.get('/sizes', keycloak.protect('desk-advertiser'), getUser, loadCreativesSizes2);

router.get('/os', keycloak.protect('desk-advertiser'), getUser, loadOs2);

// TODO: need refactoring

router.get('/impressions', loadImpressions2);

router.get('/clicks', loadClicks2);

router.get('/conversions', loadConversions2);

router.get('/goals', loadGoals2);

router.get('/csv-apps', loadCsvApps2);

router.get('/sizes', loadNoMatchStats2);

export default router;
