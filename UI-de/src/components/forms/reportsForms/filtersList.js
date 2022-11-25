import {ADVERTISER, PUBLISHER} from '../../../constants/user';
import {ADVERTISERS, CAMPAIGN, PUBLISHERS} from '../../../constants/app';
import {
  AD_TYPE, APPS, CAMPAIGNS,
  CLICKS, COUNTRY, DAILY,
  ERRORS, IMPRESSIONS,
  INVENTORY_TYPE, OS,
  PUBLISHER_ERRORS, SITES, SUB_ID,
  PROTOCOL_TYPE, HOURLY,
  CREATIVES, BID_TYPE, PUBLISHER_ERRORS_XML, SIZES,
} from '../../../constants/reports';

export default [
  {
    filtersAdmin: [ADVERTISER, CAMPAIGN, PUBLISHER, INVENTORY_TYPE, AD_TYPE, PROTOCOL_TYPE, BID_TYPE],
    filtersAdvertiser: [CAMPAIGN],
    filtersPublisher: [],
    disable: [],
    type: [DAILY],
  },
  {
    filtersAdmin: [ADVERTISER, CAMPAIGN, PUBLISHER, INVENTORY_TYPE, AD_TYPE, PROTOCOL_TYPE, BID_TYPE],
    filtersAdvertiser: [],
    filtersPublisher: [],
    disable: [],
    type: [HOURLY],
  },
  {
    filtersAdmin: [ADVERTISER, CAMPAIGN, PUBLISHER, INVENTORY_TYPE, AD_TYPE, PROTOCOL_TYPE, BID_TYPE],
    filtersAdvertiser: [CAMPAIGN, PUBLISHER, INVENTORY_TYPE, PROTOCOL_TYPE],
    disable: [],
    type: [PUBLISHERS],
  },
  {
    filtersAdmin: [ADVERTISER, PUBLISHER, CAMPAIGN, INVENTORY_TYPE, AD_TYPE, PROTOCOL_TYPE, BID_TYPE],
    filtersAdvertiser: [ADVERTISER, PUBLISHER, CAMPAIGN],
    disable: [],
    type: [ADVERTISERS],
  },
  {
    filtersAdmin: [PUBLISHER, CAMPAIGN, INVENTORY_TYPE, AD_TYPE, PROTOCOL_TYPE, BID_TYPE],
    filtersAdvertiser: [],
    filtersPublisher: [],
    disable: [],
    type: [CREATIVES],
  },
  {
    filtersAdmin: [],
    filtersAdvertiser: [],
    filtersPublisher: [],
    disable: [],
    type: [SIZES],
  },
  {
    filtersAdmin: [CAMPAIGN, PUBLISHER, ADVERTISER, INVENTORY_TYPE, AD_TYPE, PROTOCOL_TYPE, BID_TYPE],
    filtersAdvertiser: [CAMPAIGN],
    disable: [INVENTORY_TYPE, AD_TYPE],
    type: [CAMPAIGNS],
  },
  {
    filtersAdmin: [CAMPAIGN, PUBLISHER, ADVERTISER],
    filtersAdvertiser: [CAMPAIGN, PUBLISHER],
    type: [IMPRESSIONS],
  },
  {
    filtersAdmin: [CAMPAIGN, PUBLISHER, ADVERTISER],
    filtersAdvertiser: [CAMPAIGN, PUBLISHER],
    type: [CLICKS],
  },
  {
    filtersAdmin: [PUBLISHER],
    filtersAdvertiser: [PUBLISHER],
    type: [PUBLISHER_ERRORS],
  },
  {
    filtersAdmin: [PUBLISHER],
    filtersAdvertiser: [PUBLISHER],
    type: [PUBLISHER_ERRORS_XML],
  },
  {
    filtersAdmin: [CAMPAIGN, ADVERTISER, PUBLISHER, INVENTORY_TYPE, AD_TYPE, PROTOCOL_TYPE, BID_TYPE],
    filtersAdvertiser: [],
    filtersPublisher: [],
    disable: [],
    type: [APPS],
  },
  {
    filtersAdmin: [CAMPAIGN, ADVERTISER, PUBLISHER, INVENTORY_TYPE, AD_TYPE, PROTOCOL_TYPE, BID_TYPE],
    filtersAdvertiser: [],
    filtersPublisher: [],
    disable: [],
    type: [SITES],
  },
  {
    filtersAdmin: [CAMPAIGN, ADVERTISER, PUBLISHER, INVENTORY_TYPE, AD_TYPE, PROTOCOL_TYPE, BID_TYPE],
    filtersAdvertiser: [],
    filtersPublisher: [],
    disable: [],
    type: [SUB_ID],
  },
  {
    filtersAdmin: [CAMPAIGN, PUBLISHER, ADVERTISER],
    filtersAdvertiser: [CAMPAIGN, PUBLISHER],
    filtersPublisher: [],
    disable: [],
    type: [OS],
  },
  {
    filtersAdmin: [CAMPAIGN, PUBLISHER, PROTOCOL_TYPE, AD_TYPE, INVENTORY_TYPE, BID_TYPE],
    filtersAdvertiser: [CAMPAIGN, PUBLISHER],
    filtersPublisher: [],
    disable: [],
    type: [COUNTRY],
  },
];
