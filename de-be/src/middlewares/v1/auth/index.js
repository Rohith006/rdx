import createError from 'http-errors';
import {
    admin as Admin,
    advertiser as Advertiser,
    billingDetails as BillingDetails,
    publisher as Publisher,
    subscriptions as Subscriptions,
    plans as Plans
} from '../../../models';
import {generateAdministratorToken, generateRefreshToken, generateToken} from '../../../utils/signToken';
import {sendTemplatedEmail} from '../../../utils/sendEmail';
import {emailTypes} from '../../../constants/emails';
import {roles} from '../../../constants/user';
import {eventTypes} from '../../../constants/eventType';
import {email as emailConfig, uiHost} from '../../../../config';
import {cacheAdvertiser, cachePublisher} from '../../../services/caching/create';
import {prepareSimpleLogInfo} from '../../../services/logging/create';

import log from '../../../../logger';

export const signUp = async (req, res, next) => {
  log.info('server.rest.endpoint.signup')
  const {email, role, name} = req.body;

  const Model = role === roles.ADVERTISER ? Advertiser : Publisher;

  try {
    let user = await Model.findOne({where: {email}});

    if (user) {
      log.warn(`User with ${role.toLowerCase()} role and this email already exists`)
      return next(createError(400, {
        errors: [{
          message: `User with ${role.toLowerCase()} role and this email already exists`,
          path: 'email',
        }],
      }));
    }

    user = await Model.create(req.body);

    if (role === roles.ADVERTISER) {
      await cacheAdvertiser(user);
    } else await cachePublisher(user);

    const token = generateToken(user);

    // TODO send to all admins
    sendTemplatedEmail({
      to: emailConfig.adminEmail,
      subject: `DSP - new ${role.toLowerCase()} registered`,
    },
    {
      role: role.toLowerCase(),
      name,
      id: user.id, uiHost,
      adminEmail: emailConfig.authUser,
    },
    emailTypes.CLIENT_SIGN_UP_TO_ADMIN,
    );

    res.locals.userData = {token, user, billingDetails: null};
    next();
  } catch (err) {
    return next(createError(400, err));
  }
};

export const signIn = async (req, res, next) => {
  const token = await generateToken(req.user);
  const refreshToken = await generateRefreshToken(req.user); 

  let billingDetails = {};

  try {
    if (req.body.role === roles.PUBLISHER || req.body.role === roles.ADVERTISER) {
      billingDetails = await BillingDetails.findOne({
        where: {
          userId: req.user.id,
          userType: req.body.role,
        },
      });
    }

    res.locals.loggedObject = prepareSimpleLogInfo(req.user, eventTypes.USER_LOGIN);
    res.locals.response = {token, refreshToken, user: req.user, billingDetails};
     log.info(`Signed in ${req.body.role}: ${req.user.id}`)
    next();
  } catch (err) {
    log.error(`Sign in failed for user = ${req.user} \n ${err}`)
    next(createError(400, err));
  }
};

export const signInAs = async (req, res, next) => {
  const token = generateAdministratorToken(req.user);

  const billingDetails = await BillingDetails.findOne({
    where: {
      userId: req.user.account.id,
      userType: req.user.account.role,
    },
  });

  res.json({user: req.user.account, token, billingDetails});

  // next();
};

export const backToAdmin = async (req, res, next) => {
  const {adminId} = req.body;

  const admin = await Admin.findOne({
    attributes: {exclude: ['password', 'createdAt', 'updatedAt']},
    where: {id: adminId},
  });

  const token = generateToken(admin);

  res.json({user: admin, token, billingDetails: {}});
};

export const getLogin = async (req, res, next) => {
  const { isFirstLogin } = req.body;
  let billingDetails = {};
  let subscription = {};
  let plan = {};
  try {

    if (req.user.role === roles.PUBLISHER || req.user.role  === roles.ADVERTISER) {
      billingDetails = await BillingDetails.findOne({
        where: {
          userId: req.user.id,
          userType: req.user.role,
        },
      });

      subscription = await Subscriptions.findOne({
        where:{
          advertiserId: req.user.id
        }
      });

      plan = await Plans.findOne({
        attributes:['planName'],
        where:{
          id:subscription.planId
        }
      })
    }
    if(isFirstLogin) {
      res.locals.response = {user:req.user,billingDetails, subscription, plan}
      res.locals.loggedObject = prepareSimpleLogInfo(req.user, eventTypes.USER_LOGIN);
      log.info(`User Login ${req.body.role}: ${req.user.id}`)
      next();
    } else {
      res.send({user:req.user,billingDetails, subscription, plan});
    }
  } catch (err) {
    log.error(`getting user = ${req.user.role}:${req.user.id} failed \n ${err} `)
    next(createError(400, err));
  }
};
export const logout = async (req, res, next) => {
  res.locals.loggedObject = prepareSimpleLogInfo(req.user, eventTypes.USER_LOGOUT);
  log.info(`User Logout ${req.body.role}: ${req.user.id}`)
  next();
}