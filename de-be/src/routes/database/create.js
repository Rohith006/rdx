import {Router} from 'express';
import {passportJwt} from '../../auth/passportMiddlewares';
import isAcceptedAgreement from '../../middlewares/v1/validation/requireAcceptAgreement';
import {
  addDataToPartner,
  createAdmin,
  createAdvertiser,
  createBillingDetails,
  createCreatives,
  createIntegrationCampaign,
  createPartnerFees,
  createPartnerTypes,
  createPublisher,
  registerAdvertiser,
  restorePassword,
} from '../../middlewares/v1/database/create';

import CampaignCtrl from '../../controllers/campaign.controller';

import {logActivity} from '../../middlewares/v1/logging';
import {getUser} from "../../utils/scanUser";

const router = Router();

const keycloak = require('../../../config/keycloak-config').getKeycloak();


router.post('/billing-details', passportJwt, createBillingDetails);

router.post('/campaign', keycloak.protect('desk-advertiser'), getUser, CampaignCtrl.createCampaign, logActivity); // TODO Ad logActivity

router.post('/integration-campaign', passportJwt, isAcceptedAgreement, createIntegrationCampaign);

router.post('/restore-password', restorePassword);

router.post('/advertiser', passportJwt, isAcceptedAgreement, createAdvertiser, logActivity);

router.post('/publisher', keycloak.protect('desk-admin'), getUser, isAcceptedAgreement, createPublisher, logActivity);

router.post('/admin',keycloak.protect('desk-admin'), createAdmin);

router.post('/creatives', createCreatives);

router.post('/partner-fees', keycloak.protect('desk-admin'), getUser, createPartnerFees); // POST /database/create/partner-fees

// router.post('/add-data-to-partner', addDataToPartner); // POST /database/create/add-data-to-partner

// router.post('/add-data-to-partnertypes', createPartnerTypes); // POST /database/create/add-data-to-partnertypes

router.post('/register',keycloak.protect('desk-admin') , getUser, registerAdvertiser,logActivity);

export default router;