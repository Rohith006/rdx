import {campaign as Campaign} from '../models';
import {wlid} from '../../config';
import moment from 'moment';
import {adTypeMap, paymentModelMap} from '../constants/common';
import {frequencyCapSeconds, frequencyCapType, NO_CAP_ON_IMPRESSION} from '../constants/caps';

export const getAdvertiserCampaignIds = async (advertiserId) => {
  const campaigns = await Campaign.findAll({
    attributes: ['id'],
    where: {advertiserId},
  });
  const ids = [];
  campaigns.map((item) => {
    const data = item.get();
    ids.push(data.id);
  });
  return ids;
};

export const getAdvertiserId = async (campaignId) => {
  let campaign = await Campaign.findOne({
    where: {id: campaignId},
  });
    return campaign.advertiserId;
};

export const generateCampaignStructure = (c) => {
  if (!c.budget || !c.trackingUrl) {
    return;
  }
  const obj = {
    id: c.id,
    wl_id: Number(wlid),
    advertiser_id: c.advertiserId,
    status: c.status,
    ad_type: adTypeMap[c.monetizationType],
    start_date: moment(c.startDate).format('YYYY-MM-DD'),
    end_date: moment(c.endDate).format('YYYY-MM-DD'),
    url: c.trackingUrl,
    payment_model: paymentModelMap[c.modelPayment],
    bid: Number(c.budget.currentBid || c.budget.bid),
    impression_ttl: c.impressionTtl ? c.impressionTtl * 60 : 1200,
    click_ttl: c.clickTtl ? c.clickTtl * 3600 : [14].includes(Number(wlid)) ? 172800 : 43200,
    ctr: c.ctr ? Number(c.ctr) : null,
    inventories: c.inventories.map((i) => {
      return {
        id: i.publisherId,
        payout: i.payout,
      };
    }) || [],
    targeting: {
      geo: {
        include: [],
        exclude: [],
      },
      subscriber_date: {
        from: c.sdmin,
        to: c.sdmax,
      },
      ip: {
        include: [],
        exclude: [],
      },
      language: {
        include: c.language || [],
        exclude: [],
      },
      device_type: {
        include: [],
        exclude: [],
      },
      platform: {
        include: c.platform && !c.platform.includes(null) && !c.platform.includes('ALL')? c.platform : [],
        exclude: [],
      },
    },
    limits: {
      money_total: Number(c.budget.totalBudget) || 0,
      money_day: Number(c.budget.dailyBudget) || 0,
      money_hour: Number(c.budget.hourlyBudget) || 0,
    },
    advertiser_limits: {
      money_total: Number(c.advertiser.balance) || -1,
    },
  };
  if (c.isIncludeGeo) {
    obj.targeting.geo.include = c.geography || [];
  } else {
    obj.targeting.geo.exclude = c.geoExclude || [];
  }
  if ((c.frequencyCapping && c.frequencyCapping !== NO_CAP_ON_IMPRESSION) || (c.fqCapClick && c.fqCapClick !== NO_CAP_ON_IMPRESSION)) {
    obj.cappings = {};
    if (c.frequencyCapping && c.frequencyCapping !== NO_CAP_ON_IMPRESSION) {
      obj.cappings.impression = {};
      obj.cappings.impression.type = Number(frequencyCapType[c.frequencyCapping]);
      obj.cappings.impression.frequency = c.frequencyCapValue ? Number(c.frequencyCapValue) : 0;
      obj.cappings.impression.capping = frequencyCapSeconds[c.frequencyCapInterval];
    }
    if (c.fqCapClick && c.fqCapClick !== NO_CAP_ON_IMPRESSION) {
      obj.cappings.click = {};
      obj.cappings.click.type = Number(frequencyCapType[c.fqCapClick]);
      obj.cappings.click.frequency = c.fqCapClickValue ? Number(c.fqCapClickValue) : 0;
      obj.cappings.click.capping = frequencyCapSeconds[c.fqCapClickInterval];
    }
  }
  for (const key in obj) {
    if (!obj[key]) {
      delete obj[key];
    }
  }
  // console.log(c.creatives);
  const creatives = [];

  return {
    campaign: obj,
    creatives,
  };
};
