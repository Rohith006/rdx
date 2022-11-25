import {roles} from '../../../constants/user';
import log from '../../../../logger';

export default (req, res, next) => {
  const {role, isAcceptedAgreement} = req.user;

  if ((role === roles.PUBLISHER || role === roles.ADVERTISER) && !isAcceptedAgreement) {
    log.warn('User did not accept the agreement');
    res.status(400).send('User did\'nt accept the agreement');
  } else {
    next();
  }
};
