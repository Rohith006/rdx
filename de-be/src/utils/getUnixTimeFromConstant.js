import * as campaignConstants from '../constants/campaign';

export default (timeConstant) => {
  switch (timeConstant) {
    case campaignConstants.ONE_HOUR:
      return 3600000;
    case campaignConstants.TWELVE_HOURS:
      return 43200000;
    case campaignConstants.ONE_DAY:
      return 86400000;
    case campaignConstants.SEVEN_DAYS:
      return 604800000;
    case campaignConstants.THIRTY_DAYS:
      return 2592000000;
  }
};
