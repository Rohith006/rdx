import {Router} from 'express';
import {
    getPublisherBidreq,
    getPublisherRtb,
    loadPublishers,
    loadPublishersDropdown,
} from '../../../middlewares/v1/publishers';
import isAcceptedAgreement from '../../../middlewares/v1/validation/requireAcceptAgreement';
import {getUser} from "../../../utils/scanUser";

const router = Router();

const keycloak = require('../../../../config/keycloak-config').getKeycloak();

router.get('/publishers-list',keycloak.protect('desk-advertiser'), getUser, isAcceptedAgreement, loadPublishers);

router.get('/publishers-list-dropdown',keycloak.protect('desk-advertiser'), getUser, isAcceptedAgreement, loadPublishersDropdown);

router.get('/publisher-rtb/:id', getPublisherRtb);

router.get('/publisher-bidreq/:id', getPublisherBidreq);

export default router;
