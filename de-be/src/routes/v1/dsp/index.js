import {Router} from 'express';
import {loadBannerResolutions, startLoggerBidreq, uploadLogo} from '../../../middlewares/v1/dsp';
import {getUser} from "../../../utils/scanUser";

const router = Router();

const keycloak = require('../../../../config/keycloak-config').getKeycloak();

router.get('/banner-resolutions', keycloak.protect('desk-advertiser'), getUser, loadBannerResolutions);

router.get('/take-bidreq/:entity/:entityId', startLoggerBidreq);

router.post('/upload/:entity', uploadLogo);

export default router;
