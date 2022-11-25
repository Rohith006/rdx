import {Router} from 'express';
import {passportJwt} from '../../auth/passportMiddlewares';
import isAcceptedAgreement from '../../middlewares/v1/validation/requireAcceptAgreement';
import {
    deleteAdmin,
    deleteAllApiCampaign,
    deleteCampaign,
    deleteCreatives,
    deletePartnerFees,
    deleteUser
} from '../../middlewares/v1/database/delete';

import {logActivity} from '../../middlewares/v1/logging';
import {getUser} from "../../utils/scanUser";

const router = Router();

const keycloak = require('../../../config/keycloak-config').getKeycloak();

router.delete('/campaign', keycloak.protect('desk-advertiser'), getUser, isAcceptedAgreement, deleteCampaign, logActivity);

router.delete('/api-campaigns', deleteAllApiCampaign);

router.delete('/admin', passportJwt, isAcceptedAgreement, deleteAdmin);

router.delete('/creatives', deleteCreatives);

router.delete('/:user', keycloak.protect('desk-admin'), getUser, isAcceptedAgreement, deleteUser, logActivity);

router.delete('/partner-fees/:feesId?', keycloak.protect('desk-admin'), getUser, deletePartnerFees); // DELETE /database/delete/partner-fees/:feesId?
export default router;
