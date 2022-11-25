import {Router} from 'express';
import {getUser} from "../../utils/scanUser";
import {
    setSubscription, setDailyLimit, transactionDetails, updateDailyLimit
} from '../../middlewares/v1/console/payg';

const router = Router();

const keycloak = require('../../../config/keycloak-config').getKeycloak();

router.post('/set-subscription', keycloak.protect('desk-admin'), getUser, setSubscription); //, logActivity);

router.post('/set-dailylimit', keycloak.protect('desk-admin'), setDailyLimit);

router.put('/set-dailylimit', keycloak.protect('desk-admin'),updateDailyLimit)

router.post('/transaction-details', keycloak.protect('desk-admin'), transactionDetails)

export default router;