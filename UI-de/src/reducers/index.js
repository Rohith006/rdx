import {combineReducers} from 'redux';
import {reducer as reduxFormReducer} from 'redux-form';
import auth from './auth';
import campaigns from './campaigns';
import budgets from './budgets';
import countries from './countries';
import trackingTest from './trackingTest';
import users from './users';
import forgotPassword from './forgotPassword';
import billingDetails from './billingDetails';
import reports from './reports';
import statistic from './statistic';
import notification from './notification';
import summary from './summary';
import caps from './caps';
import topCampaigns from './topCampaigns';
import topCountries from './topCountries';
import topEarnings from './topEarnings';
import topSpent from './topSpent';
import campaignsStatistics from './campaignsStatistics';
import publishersStatistics from './publishersStatistics';
import subIdWhiteBlackLists from './subIdWhiteBlackLists';
import userActivity from './userActivity';
import conversion from './conversion';
import impression from './impression';
import pagination from './pagination';
import platformSettings from './platformSettings';
import click from './click';
import app from './app';
import audience from './audience';
import dsp from './dsp';
import {LOG_OUT} from '../constants/auth';

const appReducers = combineReducers({
  notification,
  app,
  auth,
  campaigns,
  budgets,
  countries,
  click,
  trackingTest,
  users,
  billingDetails,
  forgotPassword,
  reports,
  statistic,
  summary,
  caps,
  topCampaigns,
  topCountries,
  topEarnings,
  topSpent,
  campaignsStatistics,
  publishersStatistics,
  subIdWhiteBlackLists,
  userActivity,
  conversion,
  impression,
  pagination,
  platformSettings,
  audience,
  dsp,
  form: reduxFormReducer,
});

export default (state, action) => {
  if (action.type === LOG_OUT) {
    state = undefined;
  }

  return appReducers(state, action);
};
