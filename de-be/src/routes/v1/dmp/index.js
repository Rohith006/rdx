import {Router} from 'express';
import {getDMPSegments, getSegmentDetails} from '../../../middlewares/v1/dmp';
const keycloak = require('../../../../config/keycloak-config').getKeycloak();

const router = Router();

router.get('/segments/:dmp', keycloak.protect('desk-advertiser'), getDMPSegments);

router.get('/segments/:dmp/:segmentId', keycloak.protect('desk-advertiser'), getSegmentDetails);

export default router;