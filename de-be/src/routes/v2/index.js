import reportsRouters from './reports';
import {Router} from 'express';

const router = Router();

router.use('/reports', reportsRouters);

export default router;
