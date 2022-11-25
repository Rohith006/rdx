import {Router} from 'express';
import {
    acceptAgreement,
    generateApiKey,
    sendActivationEmail,
    verifyAdvertiserAccount,
    verifyPublisherAccount,
} from '../../middlewares/v1/user';
import {passportJwt} from '../../auth/passportMiddlewares';

const router = Router();

router.post('/accept-agreement', acceptAgreement);

router.get('/generate-api-key', passportJwt, generateApiKey);

router.get('/send-activation', passportJwt, sendActivationEmail);

router.get('/verify-advertiser', verifyAdvertiserAccount);

router.get('/verify-publisher', verifyPublisherAccount);

export default router;
