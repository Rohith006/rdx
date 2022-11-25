import {Router} from 'express';
import {passportJwt, passportLocal, passportSignInAsLocal} from '../../auth/passportMiddlewares';
import {backToAdmin, getLogin, logout, signIn, signInAs, signUp} from '../../middlewares/v1/auth';
import {sendActivationEmail} from '../../middlewares/v1/user';
import {logActivity} from '../../middlewares/v1/logging';
import {getUser} from "../../utils/scanUser";

const router = Router();

const keycloak = require('../../../config/keycloak-config').initKeycloak();

router.post('/signup', signUp, sendActivationEmail);

router.post('/signin', passportLocal, signIn, logActivity);

router.post('/signin-as', passportSignInAsLocal, signInAs);

router.post('/back-to-admin', backToAdmin);

router.post('/get-user', keycloak.protect('desk-advertiser'), getUser, getLogin, logActivity);

router.post('/logout', keycloak.protect('desk-advertiser'), getUser, logout, logActivity);
export default router;
