import userAgentParser from 'useragent';
import deviceParser from 'device';
import {
    ANDROID,
    BLACK_BERRY,
    IOS,
    MOBILE,
    SYMBIAN,
    TABLETS,
    WINDOWS_8_TABLET,
    WINDOWS_PHONE
} from '../constants/campaign';
import {TABLET} from '../constants/click';

const getOsConstant = (family, deviceType, version) => {
  const defaultConstant = () => family.toUpperCase().replace(/\s/gm, '_');

  switch (true) {
    case /iOS/gm.test(family):
      return IOS;
    case /Android/gm.test(family):
      return ANDROID;
    case /BlackBerry OS/gm.test(family):
      return BLACK_BERRY;
    case /Windows/gm.test(family): {
      if (deviceType === TABLET && version.major.indexOf('8') === 0) {
        return WINDOWS_8_TABLET;
      } else {
        return defaultConstant();
      }
    }
    case /Windows Phone/gm.test(family):
      return WINDOWS_PHONE;
    case /Symbian/gm.test(family):
      return SYMBIAN;
    default:
      return defaultConstant();
  }
};

export default (userAgent) => {
  const parsedUserAgent = userAgentParser.parse(userAgent);
  const device = deviceParser(userAgent);
  const deviceType = device.type.toUpperCase() === 'PHONE' ? MOBILE : (device.type.toUpperCase() === 'TABLET' ? TABLETS : device.type.toUpperCase());

  const os = parsedUserAgent.os;
  const {family, major, minor, patch} = os;

  return {
    platform: getOsConstant(family, device.type.toUpperCase(), os),
    deviceType,
    osVersion: (+major || +minor || +patch) ? `${major}.${minor}.${patch}` : null,
  };
};
