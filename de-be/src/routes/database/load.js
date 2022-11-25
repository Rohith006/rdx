import {Router} from 'express';
import {passportJwt} from '../../auth/passportMiddlewares';
import isAcceptedAgreement from '../../middlewares/v1/validation/requireAcceptAgreement';
import {
  loadAdmins,
  loadAdvertiserDetails,
  loadAllPartnerFees,
  loadAllUsers,
  loadAvailableAdvertisers,
  loadBilling,
  loadBudgets,
  loadCampaignDetails,
  loadCampaigns,
  loadCampaignsByService,
  loadCommonStatistics,
  loadCountCampaigns,
  loadCreativesInfo,
  loadCurrentBilling,
  loadInventories,
  loadPartnerlist,
  loadPartnerTypes,
  loadPublisherDetails,
  loadUserActivationSettings,
  loadUserActivityLogs,
  loadAdvertiserUsage,
  loadAvailableDataPartners,
} from '../../middlewares/v1/database/load';
import {getUser} from "../../utils/scanUser";

const router = Router();
const keycloak = require('../../../config/keycloak-config').getKeycloak();


router.get('/campaigns', keycloak.protect('desk-advertiser'), getUser, loadCampaigns);

router.get('/inventories', keycloak.protect('desk-advertiser'), getUser, loadInventories);

router.post('/count-campaigns', loadCountCampaigns);

router.post('/campaigns-for-service', passportJwt, loadCampaignsByService);

router.get('/budgets', keycloak.protect('desk-advertiser'), getUser, isAcceptedAgreement, loadBudgets);

router.get('/admins', keycloak.protect('desk-admin'), getUser, isAcceptedAgreement, loadAdmins);

router.get('/billingDetails', keycloak.protect('desk-admin'), getUser, isAcceptedAgreement, loadBilling);

router.get('/common-statistics', keycloak.protect('desk-admin'), getUser, isAcceptedAgreement, loadCommonStatistics);

router.get('/advertiser-billing', loadCurrentBilling);

router.post('/user-activity-logs', keycloak.protect('desk-advertiser'), getUser, loadUserActivityLogs);

router.get('/all-users', keycloak.protect('desk-admin'), getUser, loadAllUsers);

router.get('/advertiser-details',  keycloak.protect('desk-advertiser'), getUser, loadAdvertiserDetails);

router.get('/publisher-details', keycloak.protect('desk-admin'), getUser, loadPublisherDetails);

router.get('/campaign-details', keycloak.protect('desk-advertiser'), getUser, loadCampaignDetails);

router.get('/creatives-info/:campaignId', loadCreativesInfo);

router.get('/settings/user-activation', loadUserActivationSettings);

router.get('/partner-types', keycloak.protect('desk-admin'), getUser, loadPartnerTypes); // GET /database/load/partner-types

router.get('/partner-list', keycloak.protect('desk-admin'), getUser, loadPartnerlist); // GET /database/load/partner-list

router.get('/available-advertisers', keycloak.protect('desk-admin'), getUser, loadAvailableAdvertisers); // GET /database/load/available-advertisers

router.get('/advertiser-usage/:id', keycloak.protect('desk-advertiser'), getUser,loadAdvertiserUsage); // GET /database/load/advertiser-usage/:id?date={DATE}

router.get('/partner-fees/:feesId?', keycloak.protect('desk-admin'), getUser, loadAllPartnerFees); // GET /database/load/partnerfees (feesId is optional)

router.get('/datapartners-list', keycloak.protect('desk-admin'), getUser,loadAvailableDataPartners)
export default router;