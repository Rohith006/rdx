import {Router} from 'express';
import createRoutes from './create';
import loadRoutes from './load';
import updateRoutes from './update';
import deleteRoutes from './delete';

const router = Router();

router.use('/create', createRoutes);

router.use('/load', loadRoutes);

router.use('/update', updateRoutes);

router.use('/delete', deleteRoutes);


export default router;
