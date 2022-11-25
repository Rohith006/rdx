import passport from 'passport';
import {ExtractJwt, Strategy} from 'passport-jwt';
import {admin as Admin, advertiser as Advertiser, publisher as Publisher, Sequelize} from '../models';
import {JWT_SECRET} from '../../config';
import {roles, statuses} from '../constants/user';

const configUser = {
  advertiser: Advertiser,
  publisher: Publisher,
  owner: Admin,
  admin: Admin,
  account_manager: Admin,
};
const Op = Sequelize.Op;

passport.use(new Strategy(
    {
      jwtFromRequest: ExtractJwt.fromHeader('authorization'),
      secretOrKey: JWT_SECRET,
    },
    async (payload, done) => {
      const role = payload.role || 'null';

      const Model = configUser[role.toLowerCase()];

      const user = await Model.findOne({
        where: {id: payload.sub, status: {[Op.not]: statuses.REMOVED}},
      });

      if (!user) return done(null, false);

      if (role === roles.ADVERTISER) {
        const manager = await Admin.findOne({where: {id: user.managerId}});
        user.dataValues.managerName = manager && manager.name;
      }

      done(null, user.get());
    },
));
