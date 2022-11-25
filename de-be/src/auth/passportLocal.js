import passport from 'passport';
import bcrypt from 'bcrypt';
import {admin as Admin, advertiser as Advertiser, publisher as Publisher} from '../models';
import {Strategy} from 'passport-local';
import {roles, statuses} from '../constants/user';
import createError from 'http-errors';
import logger from '../../logger';

const configUser = {
  advertiser: Advertiser,
  publisher: Publisher,
  owner: Admin,
  admin: Admin,
  account_manager: Admin,
};

passport.use(new Strategy(
    {
      usernameField: 'email',
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      logger.debug('sign in with local strategy')
      const {role} = req.body;
      const Model = configUser[role.toLowerCase()];
      let user = {};

      if (role === roles.ADMIN) {
        user = await Model.findOne({
          where: {email, role: [roles.ADMIN, roles.OWNER, roles.ACCOUNT_MANAGER]}
        });
        logger.debug('signin role: ADMIN')
      } else {
        user = await Model.findOne({
          where: {email, role},
        });
      }

      if (!user) {
        logger.debug('No user found')
        return done(null, false);
      }
      if (user.status !== statuses.ACTIVE) {
        logger.debug('user is not active')
        return done(
            createError(400, 'User is not active'), false);
      }

      if (role === roles.ADVERTISER) {
        const manager = await Admin.findOne({where: {id: user.managerId}});
        user.dataValues.managerName = manager && manager.name;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if(isMatch){
        logger.debug('Hash matched, user authenticated')
        return done(null, user)
      } else {
        logger.debug('Hash match failed, user not authenticated')
        return done(null, false)
      }
    },
));

passport.use('local-signin-as', new Strategy(
    {
      usernameField: 'adminEmail',
      passwordField: 'password',
      passReqToCallback: true,
    },
    async (req, adminEmail, password, done) => {
      logger.debug('sign in with local-signin-as strategy')
      const {role, email} = req.body.account;
      const admin = await Admin.findOne({where: {email: adminEmail}});
      if (!admin) {
        return done(null, false);
      }

      // Sign in Admin  as Advertiser / Publisher
      const Model = configUser[role.toLowerCase()];
      const user = await Model.findOne({where: {email, role}});

      if (!user) {
        logger.debug('user not found')
        return done(null, false);
      }

      const manager = await Admin.findOne({where: {id: user.managerId}});
      user.dataValues.managerName = manager && manager.name;
      done(null, {admin, account: user.get()});
    },
));
