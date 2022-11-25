import {
  DAILY,
  ADVERTISERS,
  CAMPAIGNS,
  COUNTRIES,
  OS,
  DEVICES,
  SUB_ID,
  PUBLISHERS,
  SERVERS_POSTBACKS,
  CLICKS,
  CONVERSIONS,
  IMPRESSIONS, GOALS, ERRORS,
} from '../constants/reports';

const getGroupRules = (groupName) => {
  switch (groupName) {
    case DAILY: {
      return [ADVERTISERS, CAMPAIGNS, COUNTRIES, OS, DEVICES, SUB_ID, PUBLISHERS];
    }
    case GOALS:
    case CONVERSIONS: {
      return [ADVERTISERS, CAMPAIGNS, COUNTRIES, OS, DEVICES, SUB_ID, PUBLISHERS];
    }
    case CLICKS: {
      return [ADVERTISERS, CAMPAIGNS, COUNTRIES, OS, DEVICES, SUB_ID, PUBLISHERS];
    }
    case IMPRESSIONS: {
      return [ADVERTISERS, CAMPAIGNS, COUNTRIES, OS, DEVICES, SUB_ID, PUBLISHERS];
    }
    case ADVERTISERS: {
      return [CAMPAIGNS, COUNTRIES, OS, DEVICES, SUB_ID, PUBLISHERS];
    }
    case PUBLISHERS: {
      return [ADVERTISERS, CAMPAIGNS, COUNTRIES, OS, DEVICES, SUB_ID];
    }
    case CAMPAIGNS: {
      return [COUNTRIES, OS, DEVICES, SUB_ID, PUBLISHERS];
    }
    case ERRORS: {
      return [COUNTRIES, OS, DEVICES, SUB_ID, PUBLISHERS];
    }
    case COUNTRIES: {
      return [ADVERTISERS, CAMPAIGNS, OS, DEVICES, SUB_ID, PUBLISHERS];
    }
    case OS: {
      return [ADVERTISERS, CAMPAIGNS, COUNTRIES, DEVICES, SUB_ID, PUBLISHERS];
    }
    case DEVICES: {
      return [ADVERTISERS, CAMPAIGNS, COUNTRIES, SUB_ID, PUBLISHERS];
    }
    case SERVERS_POSTBACKS: {
      return [ADVERTISERS, CAMPAIGNS, COUNTRIES, SUB_ID, PUBLISHERS];
    }
    case SUB_ID: {
      return [ADVERTISERS, CAMPAIGNS, COUNTRIES, OS, DEVICES, PUBLISHERS];
    }
  }
};

export default (groupBy) => {
  const groupReportsTypes = [DAILY, SERVERS_POSTBACKS, CLICKS, ADVERTISERS, CAMPAIGNS, COUNTRIES, OS, DEVICES, SUB_ID, PUBLISHERS, SERVERS_POSTBACKS, ERRORS];

  return groupReportsTypes.filter((groupReportType) => {
    const isNotDuplicate = !groupBy.find((groupName) => groupName === groupReportType);
    const allowedBySelectedGroups = groupBy.every((groupName) => getGroupRules(groupName).includes(groupReportType));
    return isNotDuplicate && allowedBySelectedGroups;
  });
};
