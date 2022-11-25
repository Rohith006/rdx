import JWT from 'jsonwebtoken';
import {JWT_INTEGRATIONS_SECRET, JWT_SECRET} from '../../config';

const ISS = 'dsp-core-token';

export const generateToken = (user) => {
  return JWT.sign({
    iss: ISS,
    sub: user.id,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60*60*24),
  }, JWT_SECRET);
};

export const generateRefreshToken = (user) => {
  return JWT.sign({
    iss: ISS,
    sub: user.id,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
  }, JWT_INTEGRATIONS_SECRET);
};

export const generateAdministratorToken = ({admin, account}) => {
  return JWT.sign({
    iss: ISS,
    sub: account.id,
    idAdmin: admin.id,
    idAccount: account.id,
    emailAccount: account.email,
    role: account.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60*60*24),
  }, JWT_SECRET);
};
