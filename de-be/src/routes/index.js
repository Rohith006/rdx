import {Router} from 'express';
import createError from 'http-errors';
import authRoutes from './auth';
import userRoutes from './user';
import databaseRoutes from './database';
import apiRoutes from './api';
import utilsRoutes from './utils';
import externalRoutes from './external';
import consoleRoutes from './console'

import dashboardRouters from './v1/dashboard';
import advertisersRouters from './v1/advertisers';
import dspRouters from './v1/dsp';
import advertiserRouters from './v1/advertiser';
import {passportJwt} from '../auth/passportMiddlewares';
import campaignsRouters from './v1/campaigns';
import publishersRouter from './v1/publishers';
import audienceRouter from './v1/audiences';
import trafficOptimizationRouter from './v1/trafficOptimization';
import {getImpressionStatus} from '../middlewares/v1/impression';
import schedulerRoutes from './scheduler/scheduler';
import dmpRouters from './v1/dmp';
import routersVersion2 from './v2';

const router = Router();


// PUBLIC API

router.get('/', (req, res, next) => res.status(200).send({status: 'SUCCESS'}));

router.get('/error-test', (req, res, next) => next(createError(400, 'Bad Request Test Error')));

router.get('/impression/get-status/:id', getImpressionStatus);

// PRIVATE API v0.0.0

router.use('/auth', authRoutes);

router.use('/user', userRoutes);

router.use('/database', databaseRoutes);

router.use('/api', apiRoutes);

router.use('/utils', utilsRoutes);

// PRIVATE API v0.1.0

router.use('/dashboard', dashboardRouters);

router.use('/campaigns', campaignsRouters);

router.use('/advertisers', advertisersRouters);

router.use('/advertiser', passportJwt, advertiserRouters);

// router.use('/', passportJwt, publishersRouter);

router.use('/publishers', publishersRouter);

router.use('/audience', audienceRouter);

router.use('/traffic-optimization', trafficOptimizationRouter);

router.use('/dsp', dspRouters);

router.use('/dmp', dmpRouters);

router.use('/v2', routersVersion2);

// EXTERNAL ROUTES

router.use('/external', externalRoutes);
// testing route for PAYG
router.use('/start-scheduler', schedulerRoutes);

router.use('/console', consoleRoutes)



export default router;
