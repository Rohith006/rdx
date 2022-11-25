import * as reportsConstants from '../constants/reports';

export const normalizeBoolean = (value) => {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return value;
};

export const normalizeGroupBy = (groupBy) => groupBy.map((orderName) => {
  switch (orderName) {
    case reportsConstants.DAILY:
      return 'day';
    case reportsConstants.ADVERTISERS:
      return 'advertiserId';
    case reportsConstants.CAMPAIGNS:
      return 'campaignId';
    case reportsConstants.OS:
      return 'platform';
    case reportsConstants.DEVICES:
      return 'device';
    case reportsConstants.COUNTRIES:
      return 'country';
    case reportsConstants.SUB_ID:
      return 'subId';
    // case reportsConstants.PUBLISHERS:
    //   return 'publisherId';
  }
});

export const normalizeNumber = (value) => value && Number(value) ? Number(value) : value;
