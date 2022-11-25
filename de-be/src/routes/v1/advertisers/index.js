import {Router} from 'express';
import {loadAdvertisers} from '../../../middlewares/v1/advertisers';
import isAcceptedAgreement from '../../../middlewares/v1/validation/requireAcceptAgreement';
import {getUser} from "../../../utils/scanUser";

const router = Router();
const keycloak = require('../../../../config/keycloak-config').getKeycloak();

router.get('/advertisers-list', keycloak.protect('desk-advertiser'), getUser, isAcceptedAgreement, loadAdvertisers);

export default router;
