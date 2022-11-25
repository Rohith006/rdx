import {advertiser as Advertiser, platformSettings as PlatformSettings, publisher as Publisher} from '../../../models';
import keygenerator from 'keygenerator';
import CryptoJS from 'crypto-js';
import {sendTemplatedEmail} from '../../../utils/sendEmail';
import {emailTypes} from '../../../constants/emails';
import {roles, statuses} from '../../../constants/user';
import {AES_SECRET, appHost, email, uiHost} from '../../../../config';
import {cachePublisherUpdate} from '../../../services/caching/create';
import log from '../../../../logger';

export const acceptAgreement = async (req, res, next) => {
  const {role, id} = req.body;
  const Model = role === roles.ADVERTISER ? Advertiser : Publisher;
  const options = {isAcceptedAgreement: true};
  try {
    await Model.update(options, {where: {id}});
    res.sendStatus(200);
  } catch (err) {
    log.error(` accepting agreement failed \n ${err}`)
    next(err);
  }
};

export const generateApiKey = async (req, res, next) => {
  try {
    const apiKey = keygenerator._({
      chars: true,
      sticks: true,
      numbers: true,
      specials: false,
      length: 48,
    });
    const id = req.query.pubId || req.user.id;
    const user = await Publisher.update({
      apiKey,
    }, {
      where: {
        id,
      },
      returning: true,
    });
    await cachePublisherUpdate(user[1][0].dataValues);
    res.send({apiKey});
  } catch (e) {
    log.error(` generating API key \n ${e}`)
    next(e);
  }
};

export const sendActivationEmail = async (req, res, next) => {
  if (res.locals.userData) {
    const {user} = res.locals.userData;
    const role = user.role.toLowerCase();

    if (![roles.ADVERTISER, roles.PUBLISHER].includes(user.role)) {
      res.send(res.locals.userData);
    } else {
      const hash = CryptoJS.AES.encrypt(JSON.stringify({email: user.email, date: Date.now()}), AES_SECRET);

      await sendTemplatedEmail({
        to: user.email,
        subject: 'Please confirm your registration',
      }, {
        name: user.name,
        url: `${appHost}/user/verify-${role}?hash=${hash}`,
        uiHost,
        adminEmail: email.authUser,
      }, emailTypes.ADVERTISER_SIGN_UP_TO_ADVERTISER);

      res.send(res.locals.userData);
    }
  } else if (req.user.role === roles.ADVERTISER) {
    const hash = CryptoJS.AES.encrypt(JSON.stringify({email: req.user.email, date: Date.now()}), AES_SECRET);

    await sendTemplatedEmail({
      to: req.user.email,
      subject: 'Please confirm your registration',
    }, {
      name: req.user.name,
      url: `${appHost}/user/verify-advertiser?hash=${hash}`,
      uiHost,
      adminEmail: email.authUser,
    }, emailTypes.ADVERTISER_SIGN_UP_TO_ADVERTISER);

    res.json({result: 'success', errors: null});
  }
};

export const verifyAdvertiserAccount = async (req, res, next) => {
  const hash = req.query.hash;

  try {
    const bytes = CryptoJS.AES.decrypt(hash.split(' ').join('+'), AES_SECRET);
    let decrypted = bytes.toString(CryptoJS.enc.Utf8);
    decrypted = JSON.parse(decrypted);
    const now = new Date(); const linkDate = new Date(decrypted.date);

    if (now.getFullYear() !== linkDate.getFullYear() || now.getMonth() !== linkDate.getMonth() || now.getDate() !== linkDate.getDate()) {
      res.redirect(`${uiHost}/activation/expired`);
    }

    const user = await Advertiser.findOne({where: {email: decrypted.email}});
    if (!user) throw 'No such user';

    const userActivationSettings = await PlatformSettings.findOne({where: {configuration: 'userActivation'}});
    const settings = userActivationSettings.get().setup;

    if (!settings.advertiserActivation) {
      await user.update({status: statuses.ACTIVE});
    }
    await sendTemplatedEmail({
      to: decrypted.email,
      subject: 'Your account is now verified',
    }, {
      name: user.name,
      uiHost,
      adminEmail: email.authUser,
    }, emailTypes.ADVERTISER_SIGN_UP_ACTIVATED_TO_ADVERTISER);

    res.redirect(`${uiHost}/activation/success`);
  } catch (e) {
    log.error('Activation link expired');
    res.redirect(`${uiHost}/activation/broken`);
  }
};

export const verifyPublisherAccount = async (req, res, next) => {
  const hash = req.query.hash;

  try {
    const bytes = CryptoJS.AES.decrypt(hash.split(' ').join('+'), AES_SECRET);
    let decrypted = bytes.toString(CryptoJS.enc.Utf8);
    decrypted = JSON.parse(decrypted);
    const now = new Date(); const linkDate = new Date(decrypted.date);

    if (now.getFullYear() !== linkDate.getFullYear() || now.getMonth() !== linkDate.getMonth() || now.getDate() !== linkDate.getDate()) {
      res.redirect(`${uiHost}/activation/expired`);
    }

    const user = await Publisher.findOne({where: {email: decrypted.email}});
    if (!user) throw 'No such user';

    const userActivationSettings = await PlatformSettings.findOne({where: {configuration: 'userActivation'}});
    const settings = userActivationSettings.get();

    if (!settings.publisherActivation) {
      await user.update({status: statuses.ACTIVE});
    }
    await sendTemplatedEmail({
      to: decrypted.email,
      subject: 'Your account is now verified',
    }, {
      name: user.name,
      uiHost,
      adminEmail: email.authUser,
    }, emailTypes.PUBLISHER_SIGN_UP_ACTIVATED_TO_PUBLISHER);

    res.redirect(`${uiHost}/activation/success`);
  } catch (e) {
    log.error(`verifying publisher \n ${e}`);
    res.redirect(`${uiHost}/activation/broken`);
  }
};
