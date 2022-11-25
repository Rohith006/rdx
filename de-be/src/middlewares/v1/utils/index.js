import googlePlayScrapper from 'google-play-scraper';
import followRedirects from 'follow-redirects';
import url from 'url';
import axios from 'axios';
import loadJsonFile from 'load-json-file';
import _ from 'underscore';
import log from '../../../../logger'

let redisClient;

export const getAndroidAppInfo = async (req, res, next) => {
  try {
    const response = await googlePlayScrapper.app({appId: req.params.appId});
    res.send(response);
  } catch (e) {
    log.error('getting android app info failed')
    next(e);
  }
};

export const getIOSAppInfo = async (req, res, next) => {
  try {
    const geo = req.params.geo;
    const response = geo && geo !== 'om' ?
        await axios.get(`https://itunes.apple.com/${ geo }/lookup?id=${ req.params.appId }`) :
        await axios.get(`https://itunes.apple.com/lookup?id=${ req.params.appId }`);

    res.send(response.data);
  } catch (e) {
    log.error('getting IOS App info failed')
    next(e);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await redisClient.getAsync('categories');
    res.send(JSON.parse(categories));
  } catch (e) {
   log.error('getting categories failed')
    next(e);
  }
};

export const getStates = async (req, res, next) => {
  const {countryCodes} = req.query;
  try {
    const codes = countryCodes ? countryCodes.split(',') : [];
    // TODO Get states by country code. For now - we use only USA states
    if (codes.length === 0 || !codes.includes('US')) {
      return res.send({});
    }
    const states = await loadJsonFile(`${process.cwd()}/assets/files/states/USA.json`);
    res.send(states);
  } catch (e) {
    log.error('getting states failed')
    next(e);
  }
};

export const getCitiesSearch = async (req, res, next) => {
  try {
    let cities = [];
    let {countryCodes, words} = req.query;
    if (_.isEmpty(countryCodes)) {
      return res.send([]);
    }
    countryCodes = countryCodes.split(',');
    for (const cC of countryCodes) {
      const path = `${process.cwd()}/assets/files/cities/${cC}.json`;
      cities.push(...await loadJsonFile(path));
    }
    if (!words) {
      cities = cities.filter((city) => city.name).slice(0, 10);
    } else {
      cities = cities.filter((city) => city.name.toLowerCase().includes(words)).slice(0, 10);
    }

    res.send(cities);
  } catch (e) {
    log.error('getting cities search')
    next(e);
  }
};

export const getLanguages = async (req, res, next) => {
  try {
    const languages = await loadJsonFile(`${process.cwd()}/assets/files/languages.json`);
    res.send(languages);
  } catch (e) {
    log.error('getting languages failed')
    next(e);
  }
};

export const testLink = (req, res, next) => {
  const options = url.parse(req.body.url);

  options.trackRedirects = true;
  options.followRedirects = true;

  followRedirects[options.protocol === 'https:' ? 'https' : 'http'].get(options, (response) => {
    const redirectUrls = response.redirects.map((redirect) => redirect.url);

    res.send({redirectUrls});
  }).on('error', (e) => {
    log.error('testing link failed')
    next(e);
  });
};

export const getCurrentSubIds = () => {
  try {
    return redisClient.hgetallAsync('currentSubIds');
  } catch (e) {
    next(e);
  }
};

export const setRedisClient = (redis) => {
  redisClient = redis;
};
