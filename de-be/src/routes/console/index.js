import {Router} from 'express';
import paygRoutes from './payg';

const router = Router();

router.use('/payg', paygRoutes)

export default router;