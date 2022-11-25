import axios from 'axios';
import compareVersions from 'compare-versions';
import {campaign as Campaign} from '../models';
import {ANDROID, IOS, MOBILE, MOBILE_AND_TABLETS, TABLETS} from '../constants/campaign';

export default async (campaignId, userAgentInfo, req) => {
  const campaign = await Campaign.findOne({
    where: {
      id: campaignId,
    },
  });

  let isGeographyMatches; let isPlatformMatches; let isDeviceTypeMatches; let isMinIosVersionMatches; let isMaxIosVersionMatches; let isMinAndroidVersionMatches; let isMaxAndroidVersionMatches;

  if (campaign.geography && campaign.geography.length) {
    try {
      const response = await axios.get(`https://ipinfo.io/${req.ip}/country`);
      const countryCode = response.data.replace(/\n|\r/g, '');
      isGeographyMatches = campaign.geography.find((geographyCode) => countryCode.toUpperCase() === geographyCode.toUpperCase());
    } catch (e) {
      isGeographyMatches = true; // REMOVE_IN_PRODUCTION ?
    }
  } else {
    isGeographyMatches = true;
  }

  if (campaign.platform) {
    isPlatformMatches = userAgentInfo.platform === campaign.platform;
  } else {
    isPlatformMatches = true;
  }

  if (campaign.deviceType) {
    if (campaign.deviceType === userAgentInfo.deviceType) {
      isDeviceTypeMatches = true;
    } else if (campaign.deviceType === MOBILE_AND_TABLETS && (userAgentInfo.deviceType === MOBILE || userAgentInfo.deviceType === TABLETS)) {
      isDeviceTypeMatches = true;
    }
  } else {
    isDeviceTypeMatches = true;
  }

  if (campaign.minIosVersion && userAgentInfo.platform === IOS) {
    const compareResult = compareVersions(userAgentInfo.osVersion, campaign.minIosVersion);
    isMinIosVersionMatches = compareResult === -1 ? false : compareResult;
  } else {
    isMinIosVersionMatches = true;
  }

  if (campaign.maxIosVersion && userAgentInfo.platform === IOS) {
    const compareResult = compareVersions(campaign.maxIosVersion, userAgentInfo.osVersion);
    isMaxIosVersionMatches = compareResult === -1 ? false : compareResult;
  } else {
    isMaxIosVersionMatches = true;
  }

  if (campaign.minAndroidVersion && userAgentInfo.platform === ANDROID) {
    const compareResult = compareVersions(userAgentInfo.osVersion, campaign.minAndroidVersion);
    isMinAndroidVersionMatches = compareResult === -1 ? false : compareResult;
  } else {
    isMinAndroidVersionMatches = true;
  }

  if (campaign.maxAndroidVersion && userAgentInfo.platform === ANDROID) {
    const compareResult = compareVersions(campaign.maxAndroidVersion, userAgentInfo.osVersion);
    isMaxAndroidVersionMatches = compareResult === -1 ? false : compareResult;
  } else {
    isMaxAndroidVersionMatches = true;
  }

  return isGeographyMatches && isPlatformMatches && isDeviceTypeMatches && isMinIosVersionMatches && isMaxIosVersionMatches && isMinAndroidVersionMatches && isMaxAndroidVersionMatches;
};
