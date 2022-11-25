import {Router} from 'express';
import TrafficOptimizationCtrl from '../../../controllers/trafficOptimizations.controller';
import {getUser} from "../../../utils/scanUser";

const router = Router();

const keycloak = require('../../../../config/keycloak-config').getKeycloak();

/**
 * Application private routes
 */
router.get('/campaigns/sub-ids', keycloak.protect('desk-advertiser'), getUser, TrafficOptimizationCtrl.getCampaignListOfSubIds);

router.post('/campaigns/add/sub-ids', keycloak.protect('desk-advertiser'), getUser, TrafficOptimizationCtrl.addCampaignSubIdsToList);

router.delete('/campaigns/delete/sub-ids', keycloak.protect('desk-advertiser'), getUser, TrafficOptimizationCtrl.deleteCampaignSubIds);

export default router;
