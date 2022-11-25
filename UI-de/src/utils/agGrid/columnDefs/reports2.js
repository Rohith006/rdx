import {
  DAILY, CLICKS, CONVERSIONS, ADVERTISERS,
  CAMPAIGNS, PUBLISHERS, SUB_ID, IMPRESSIONS,
  GOALS, PUBLISHER_ERRORS,
  APPS, SITES, OS, COUNTRY,
  HOURLY, CREATIVES, PUB_NO_MATCH_CAMPAIGN, SIZES,
} from '../../../constants/reports';

import {columnsConversionsTabPerformance} from './reports2/performance/conversions';
import {columnsDailyTabPerformance} from './reports2/performance/daily';
import {columnsHourlyTabPerformance} from './reports2/performance/hourly';
import {columnsAdvertisersTabPerformance} from './reports2/performance/advertisers';
import {columnsPublishersTabPerformance} from './reports2/performance/publishers';
import {columnsCampaignsTabPerformance} from './reports2/performance/campaigns';
import {columnsClicksTabPerformance} from './reports2/performance/clicks';
import {columnsImpressionsTabPerformance} from './reports2/performance/impressions';
import {columnsSubIdsTabPerformance} from './reports2/performance/subids';
import {columnsGoalsTabPerformance} from './reports2/performance/goals';
import {columnsErrorsPublishersTabPerformance} from './reports2/performance/publisherErrors';
import {columnsAppsTabPerformance} from './reports2/performance/apps';
import {columnsSitesTabPerformance} from './reports2/performance/sites';
import {columnsOsTabPerformance} from './reports2/performance/os';
import {columnsCountryTabPerformance} from './reports2/performance/country';
import {columnsPublishersNoMatchCampaignTab} from './reports2/performance/pubNoMatchCampaign';
import {columnsCreativesTabPerformance} from './reports2/performance/creatives';
import {columnsSizesTabPerformance} from './reports2/performance/sizes';

export default (props, state) => {
  const {role, permissions} = props.auth.currentUser;

  let columns;

  switch (state.tableType) {
    case DAILY: {
      columns = columnsDailyTabPerformance[role];
      break;
    }
    case HOURLY: {
      columns = columnsHourlyTabPerformance[role];
      break;
    }
    case IMPRESSIONS: {
      columns = columnsImpressionsTabPerformance[role];
      break;
    }
    case CLICKS: {
      columns = columnsClicksTabPerformance[role];
      break;
    }
    case CONVERSIONS: {
      columns = columnsConversionsTabPerformance[role];
      break;
    }
    case GOALS: {
      columns = columnsGoalsTabPerformance[role];
      break;
    }
    case ADVERTISERS: {
      columns = columnsAdvertisersTabPerformance[role];
      break;
    }
    case PUBLISHERS: {
      columns = columnsPublishersTabPerformance[role];
      break;
    }
    case CAMPAIGNS: {
      columns = columnsCampaignsTabPerformance[role];
      break;
    }
    case PUBLISHER_ERRORS: {
      columns = columnsErrorsPublishersTabPerformance[role];
      break;
    }
    case PUB_NO_MATCH_CAMPAIGN: {
      columns = columnsPublishersNoMatchCampaignTab[role];
      break;
    }
    case SUB_ID: {
      columns = columnsSubIdsTabPerformance[role];
      break;
    }
    case APPS: {
      columns = columnsAppsTabPerformance[role];
      break;
    }
    case SITES: {
      columns = columnsSitesTabPerformance[role];
      break;
    }
    case OS: {
      columns = columnsOsTabPerformance[role];
      break;
    }
    case CREATIVES: {
      columns = columnsCreativesTabPerformance[role];
      break;
    }
    case SIZES: {
      columns = columnsSizesTabPerformance[role];
      break;
    }
    case COUNTRY: {
      columns = columnsCountryTabPerformance[role];
      break;
    }
    default:
      columns = [];
  }

  if (role === 'ACCOUNT_MANAGER') {
    columns = columns.filter((item) => {
      if (!permissions.includes('ADVERTISERS') && item.headerName.includes('Revenue')) {
        return false;
      }
      if (!permissions.includes('PUBLISHERS') && item.headerName.includes('Payout')) {
        return false;
      }
      if (!permissions.includes('SEE_PROFIT') && item.headerName.includes('Profit')) {
        return false;
      }
      if (permissions.includes('SEE_PROFIT') && (!permissions.includes('ADVERTISERS') || !permissions.includes('PUBLISHERS')) &&
          item.headerName.includes('Profit')) {
        return false;
      }
      return true;
    });
  }

  return columns;
};
