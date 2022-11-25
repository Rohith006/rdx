import {Router} from 'express';
import logger from '../../../logger';
import {passportJwt} from '../../auth/passportMiddlewares';
import {
    getAndroidAppInfo,
    getCategories,
    getCitiesSearch,
    getIOSAppInfo,
    getLanguages,
    getStates
} from '../../middlewares/v1/utils';
import {getUser} from "../../utils/scanUser";

const router = Router();

const keycloak = require('../../../config/keycloak-config').getKeycloak();

router.get('/android-app-info/:appId', passportJwt, getAndroidAppInfo);

router.get('/ios-app-info/:geo/:appId', passportJwt, getIOSAppInfo);

router.get('/categories', keycloak.protect('desk-advertiser'), getUser, getCategories);

router.get('/cities-search', keycloak.protect('desk-advertiser'), getCitiesSearch);

router.get('/states', passportJwt, getStates);

router.get('/languages', keycloak.protect('desk-advertiser'), getUser, getLanguages);

router.put('/system-logs-level', logger.updateLevel);

export default router;
