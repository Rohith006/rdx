import {Router} from 'express';
import {
    createCampaignTag,
    deleteCampaignTag,
    loadCampaignAudience,
    loadCampaignListDropdown,
    loadCampaignsCarriers,
    loadCampaignsStatistics,
    loadCampaignTag,
    loadCampaignTagsList,
    updateCampaignTag,
} from '../../../middlewares/v1/campaigns';
import {getUser} from "../../../utils/scanUser";

const router = Router();
const keycloak = require('../../../../config/keycloak-config').getKeycloak();

router.get('/campaigns-statistics', keycloak.protect('desk-advertiser'), getUser, loadCampaignsStatistics);

router.get('/:id/audiences', loadCampaignAudience);

router.get('/campaigns-carriers',keycloak.protect('desk-advertiser'), getUser, loadCampaignsCarriers);

router.post('/campaign-create-tag', keycloak.protect('desk-advertiser'), getUser, createCampaignTag);

router.get('/campaign-load-tag', loadCampaignTag);

router.get('/campaign-load-tags-list', keycloak.protect('desk-advertiser'), getUser, loadCampaignTagsList);

router.post('/campaign-update-tag', updateCampaignTag);

router.delete('/campaign-delete-tag', deleteCampaignTag);

router.get('/campaign-list-dropdown', keycloak.protect('desk-advertiser'), getUser, loadCampaignListDropdown);

export default router;
