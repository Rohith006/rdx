import {Router} from 'express';
import {
    changeAudienceStatus,
    getAudience,
    getAudiences,
    saveAudience,
    updateAudience
} from '../../../middlewares/v1/audiences';
import {getUser} from "../../../utils/scanUser";

const router = Router();

const keycloak = require('../../../../config/keycloak-config').getKeycloak();

router.get('/load/list', keycloak.protect('desk-advertiser'), getUser, getAudiences);

router.get('/load/:id', keycloak.protect('desk-advertiser'), getUser, getAudience);

router.post('/create', keycloak.protect('desk-advertiser'), getUser, saveAudience);

router.put('/edit/:id', keycloak.protect('desk-advertiser'), getUser, updateAudience);

router.put('/update/status', keycloak.protect('desk-advertiser'), getUser, changeAudienceStatus);

//router.get('/:id/users', downloadAudience);

export default router;
