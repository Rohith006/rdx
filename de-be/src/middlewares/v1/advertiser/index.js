import {advertiser as Advertiser} from '../../../models';
import keygenerator from 'keygenerator';
import {cacheAdvertiserUpdate} from '../../../services/caching/create';
import log from '../../../../logger'

export const putAdvertiserApiKey = async (req, res, next) => {
  try {
    const apiKey = keygenerator._({
      chars: true,
      sticks: true,
      numbers: true,
      specials: false,
      length: 48,
    });
    const {id} = req.params;
    const user = await Advertiser.update({apiKey}, {where: {id}, returning: true});
    await cacheAdvertiserUpdate(user[1][0].dataValues);
    res.send({apiKey});
  } catch (e) {
    log.error(`put advertiser api key \n ${e}`);
    next(e);
  }
};
