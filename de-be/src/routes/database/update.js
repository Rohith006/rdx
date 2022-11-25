import {Router} from 'express';
import {passportJwt} from '../../auth/passportMiddlewares';
import isAcceptedAgreement from '../../middlewares/v1/validation/requireAcceptAgreement';
import {
    submitCampaign,
    updateAdmin,
    updateAdminStatus,
    updateAdvertiser,
    updateAdvertiserStatus,
    updateCampaign,
    updateCampaignStatus,
    updatePartnerFees,
    updatePassword,
    updatePublisher,
    updatePublisherStatus,
    updateUserActivationSettings,
} from '../../middlewares/v1/database/update';

import {logActivity} from '../../middlewares/v1/logging';
import {getUser} from "../../utils/scanUser";

const router = Router();

const keycloak = require('../../../config/keycloak-config').getKeycloak();

router.put('/campaign', keycloak.protect('desk-advertiser'), getUser, isAcceptedAgreement, updateCampaign, logActivity);

router.put('/campaign-status', keycloak.protect('desk-advertiser'), getUser, isAcceptedAgreement, updateCampaignStatus, logActivity);

router.put('/submit-campaign', passportJwt, isAcceptedAgreement, submitCampaign);

router.put('/update-password', updatePassword, logActivity);

router.put('/update-publisher-status', keycloak.protect('desk-admin'), getUser, updatePublisherStatus, logActivity);

router.put('/update-advertiser-status', keycloak.protect('desk-admin'), getUser, updateAdvertiserStatus, logActivity);

router.put('/update-admin-status', passportJwt, updateAdminStatus, logActivity);

router.put('/publisher', keycloak.protect('desk-admin'), getUser, updatePublisher, logActivity);

router.put('/advertiser', passportJwt, updateAdvertiser, logActivity);

router.put('/admin', passportJwt, updateAdmin, logActivity);

router.put('/user-activation-settings', updateUserActivationSettings);

router.put('/partner-fees/:feesId?', keycloak.protect('desk-admin'), getUser, updatePartnerFees); // PUT /database/update/partner-fees/:feesId?

export default router;
