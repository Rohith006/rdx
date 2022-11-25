import {Router} from 'express';
import {
    dashboardTrafficStatistics,
    loadCaps,
    loadSummary,
    loadTopCountries,
    loadTopEarningCampaignsForAdvertiser,
    loadTopEarningCampaignsForPublisher,
    loadTopEarnings,
    loadTopSpent,
} from '../../../middlewares/v1/dashboard';
import {passportJwt} from '../../../auth/passportMiddlewares';
import isAcceptedAgreement from '../../../middlewares/v1/validation/requireAcceptAgreement';
import {getUser} from "../../../utils/scanUser";

const router = Router();

const keycloak = require('../../../../config/keycloak-config').getKeycloak();

router.get('/traffic-statistics', keycloak.protect('desk-advertiser'), getUser, dashboardTrafficStatistics);

router.get('/summary', keycloak.protect('desk-advertiser'), getUser, isAcceptedAgreement, loadSummary);

router.get('/top-earnings', keycloak.protect('desk-admin'), getUser, isAcceptedAgreement, loadTopEarnings);

router.get('/top-spent', passportJwt, loadTopSpent);

router.get('/top-countries', keycloak.protect('desk-advertiser'),getUser, loadTopCountries);

router.get('/caps', keycloak.protect('desk-advertiser'), getUser, loadCaps);

router.get('/top-campaigns-for-publisher', passportJwt, loadTopEarningCampaignsForPublisher);

router.get('/top-campaigns-for-advertiser', keycloak.protect('desk-advertiser'), getUser, loadTopEarningCampaignsForAdvertiser);

export default router;
