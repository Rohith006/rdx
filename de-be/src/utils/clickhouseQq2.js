import forOwn from 'lodash/forOwn';
import moment from 'moment';
import _ from 'lodash';

import {clickhouseCluster, wlid} from '../../config';
import {roles} from '../constants/user';
import {PERFORMANCE} from '../constants/reports';
import {generateSqlWhere} from './common';
import dateUtils from './date';
import {PUBLISHER} from '../constants/topEarnings';
import log from '../../logger';

const {
  BIDREQ_COUNTER_DAILY,
  BIDREQ_COUNTER_DAILY_CAMPAIGN,
  BIDREQ_COUNTER_DAILY_ADVERTISER,
  BIDREQ_COUNTER_SUBID,
  BIDREQ_COUNTER_SIZE_CRID_CAMPAIGN,
  BIDREQ_COUNTER_APP,
  BIDREQ_COUNTER_SITE,
  BIDREQ_COUNTER_SUBID_ADVERTISER,
  BIDREQ_COUNTER_SUBID_CAMPAIGN,
  BIDREQ_COUNTER_APP_ADVERTISER,
  BIDREQ_COUNTER_APP_CAMPAIGN,
  BIDREQ_COUNTER_SITE_ADVERTISER,
  BIDREQ_COUNTER_SITE_CAMPAIGN,
  BIDREQ_COUNTER_GEO,
  BIDREQ_COUNTER_GEO_ADVERTISER,
  BIDREQ_COUNTER_GEO_CAMPAIGN,
  BIDREQ_COUNTER_OS_CAMPAIGN,
  BIDRES_COUNTER_DAILY,
  BIDRES_COUNTER_DAILY_CAMPAIGN,
  BIDRES_COUNTER_CAMPAIGN,
  BIDRES_COUNTER_DAILY_ADVERTISER,
  BIDRES_COUNTER_GEO,
  BIDRES_COUNTER_OS_CAMPAIGN,
  BIDRES_COUNTER_SUBID,
  BIDRES_COUNTER_SIZE_CRID,
  BIDRES_COUNTER_APP,
  BIDRES_COUNTER_SITE,
  BIDRES_COUNTER_SUBID_ADVERTISER,
  BIDRES_COUNTER_SUBID_CAMPAIGN,
  BIDRES_COUNTER_APP_ADVERTISER,
  BIDRES_COUNTER_APP_CAMPAIGN,
  BIDRES_COUNTER_SITE_ADVERTISER,
  BIDRES_COUNTER_SITE_CAMPAIGN,
  BIDRES_COUNTER_GEO_ADVERTISER,
  BIDRES_COUNTER_GEO_CAMPAIGN,
  IMP_COUNTER_DAILY,
  IMP_COUNTER_CAMPAIGN,
  IMP_COUNTER_HOUR_CAMPAIGN,
  IMP_COUNTER_GEO,
  IMP_COUNTER_SUBID,
  IMP_COUNTER_OS,
  IMP_COUNTER_SIZE_CRID,
  IMP_COUNTER_APP,
  IMP_COUNTER_SITE,
  CLICK_COUNTER_DAILY,
  CLICK_COUNTER_CAMPAIGN,
  CLICK_COUNTER_GEO,
  CLICK_COUNTER_OS,
  CLICK_COUNTER_SUBID,
  CLICK_COUNTER_SIZE_CRID,
  BIDREQ_COUNTER_HOUR,
  BIDREQ_COUNTER_HOUR_CAMPAIGN,
  BIDREQ_COUNTER_HOUR_ADVERTISER,
  BIDRES_COUNTER_HOUR,
  BIDRES_COUNTER_HOUR_CAMPAIGN,
  BIDRES_COUNTER_HOUR_ADVERTISER,
  PUB_ERROR_COUNTER,
  CAMPAIGN_NOMATCH_COUNTER,
  CLICK_COUNTER_HOUR_CAMPAIGN,
} = clickhouseCluster;

/*
  refactored to V2
 */
export const getReportsDailyAdminSql = (filters, range, pubs, role) => {
  if (filters.selectedCampaign) {
    delete filters.selectedAdvertiser;
  }
  const whereFilter = `and wlid='${wlid}' ${generateSqlWhere(filters)}`;
  let bidreqTable = BIDREQ_COUNTER_DAILY;
  let bidresTable = BIDRES_COUNTER_DAILY;
  let isFeed = '';
  if (role !== PUBLISHER) {
    isFeed = 'and isFeed in (0, 2)';
    if (filters.selectedCampaign) {
      bidreqTable = BIDREQ_COUNTER_DAILY_CAMPAIGN;
      bidresTable = BIDRES_COUNTER_DAILY_CAMPAIGN;
      isFeed = '';
    }
  }
  forOwn(filters, (value, key) => {
    if (!value.length) {
      return;
    }
    switch (key) {
      case 'selectedAdvertiser': {
        bidreqTable = BIDREQ_COUNTER_DAILY_ADVERTISER;
        bidresTable = BIDRES_COUNTER_DAILY_ADVERTISER;
        isFeed = '';
        break;
      }
    }
  });

  const query = `
        select
          t1.createdDate as day,
          requests,
          responses,
          impressionsImage,
          approvedImpressionsImage,
          rejectedImpressionsImage,
          duplicateImpressionsImage,
          expiredImpressionsImage,
          mismatchImpressionsImage,
          impressionsIcon,
          approvedImpressionsIcon,
          rejectedImpressionsIcon,
          duplicateImpressionsIcon,
          expiredImpressionsIcon,
          mismatchImpressionsIcon,
          clicks,
          approvedClicks,
          floor((approvedClicks / clicks) * 100, 1) as percentApprovedClicks,
          t3.revenue + t4.revenue as revenue,
          t3.payout + t4.payout as payout,
          bidFloor,
          floor(if (impressionsImage = 0, 0, clicks / impressionsImage * 100), 6) as ctr,
          floor(if (impressionsImage = 0 , 0, revenue / impressionsImage * 1000), 6) as eCPM,
          floor((approvedImpressionsImage / impressionsImage) * 100, 1) as percentApprovedImage,
          floor((rejectedImpressionsImage / impressionsImage) * 100, 4) as percentRejectedImpressionsImage,
          floor((duplicateImpressionsImage / impressionsImage) * 100, 4) as percentDuplicateImpressionsImage,      
          floor((expiredImpressionsImage / impressionsImage) * 100, 4) as percentExpiredImpressionsImage,         
          floor((mismatchImpressionsImage / impressionsImage) * 100, 4) as percentMismatchImpressionsImage,
          floor((approvedImpressionsIcon / impressionsIcon) * 100, 1) as percentApprovedIcon,
          floor((rejectedImpressionsIcon / impressionsIcon) * 100, 4) as percentRejectedImpressionsIcon,
          floor((duplicateImpressionsIcon / impressionsIcon) * 100, 4) as percentDuplicateImpressionsIcon,      
          floor((expiredImpressionsIcon / impressionsIcon) * 100, 4) as percentExpiredImpressionsIcon,         
          floor((mismatchImpressionsIcon / impressionsIcon) * 100, 4) as percentMismatchImpressionsIcon,
          floor(if (responses = 0, 0, impressionsImage / responses * 100), 6) as winRate,
          floor(if (requests = 0, 0, impressionsImage / requests * 100), 4) as fillRate,
          floor(if (requests = 0, 0, responses / requests * 100), 4) as bidRate,
          floor((revenue - payout), 6) as profit   
        from (
          select 
            createdDate,
            toInt32(countMerge(amount)) as requests,
            floor(avgMerge( avgBidfloor ), 6) as bidFloor
          from dsp.${bidreqTable}
          where createdDate in (${range}) ${whereFilter} ${isFeed} 
          group by createdDate ) as t1
          
          left join (
          select 
            createdDate,
            toInt32(countMerge(amount)) as responses 
          from dsp.${bidresTable}
          where createdDate in (${range}) ${whereFilter} ${isFeed}
          group by createdDate) as t2
          on t1.createdDate = t2.createdDate
          
          left join (
          select 
            createdDate, 
            toInt32(countMerge(amount)) as impressionsImage,
            toInt32(countMergeIf(amount, status='APPROVED')) as approvedImpressionsImage, 
            toInt32(countMergeIf(amount, status='REJECTED' and viewType='image')) as rejectedImpressionsImage,
            toInt32(countMergeIf(amount, reason='duplicate' and viewType='image')) as duplicateImpressionsImage,
            toInt32(countMergeIf(amount, reason='ttl expired' and viewType='image')) as expiredImpressionsImage,
            toInt32(countMergeIf(amount, reason in ('1', '2', '3', '4') and viewType='image')) as mismatchImpressionsImage,
            toInt32(countMergeIf(amount, viewType='icon')) as impressionsIcon,
            toInt32(countMergeIf(amount, status='APPROVED' and viewType='icon')) as approvedImpressionsIcon, 
            toInt32(countMergeIf(amount, status='REJECTED' and viewType='icon')) as rejectedImpressionsIcon,
            toInt32(countMergeIf(amount, reason='duplicate' and viewType='icon')) as duplicateImpressionsIcon,
            toInt32(countMergeIf(amount, reason='ttl expired' and viewType='icon')) as expiredImpressionsIcon,
            toInt32(countMergeIf(amount, reason in ('1', '2', '3', '4') and viewType='icon')) as mismatchImpressionsIcon,
            floor(sumMergeIf(sumPayout, status='APPROVED'), 6) as payout,
            floor(sumMergeIf(sumPrice, status='APPROVED'), 6) as revenue
          from dsp.${IMP_COUNTER_CAMPAIGN}
          where createdDate in (${range}) ${whereFilter} and campaignId!=0
          group by createdDate) as t3
          on t1.createdDate = t3.createdDate
          
          left join (
            select 
              createdDate,
              toInt32(countMerge(amount)) as clicks,
              toInt32(countMergeIf(amount, status='APPROVED')) as approvedClicks,
              floor(sumMergeIf(sumPayout, status='APPROVED'), 6) as payout,
              floor(sumMergeIf(sumPrice, status='APPROVED'), 6) as revenue
            from dsp.${CLICK_COUNTER_CAMPAIGN}
            where createdDate in (${range}) ${whereFilter} and campaignId!=0
            group by createdDate) as t4
          on t1.createdDate = t4.createdDate
      `;
  const count =`select count(DISTINCT createdDate) as count from dsp.${bidreqTable}
    where createdDate in (${range}) and wlid='${wlid}' ${whereFilter}`;

  return [query, count];
};

export const getReportsDailyAccountManagerSql = (filters, range, pubs) => {
  if (filters.selectedCampaign) {
    delete filters.selectedAdvertiser;
  }
  const whereFilter = `and wlid='${wlid}' ${generateSqlWhere(filters)}`;
  let bidreqTable = BIDREQ_COUNTER_DAILY;
  let bidresTable = BIDRES_COUNTER_DAILY;
  let isFeed = '';

  isFeed = 'and isFeed in (0, 2)';
  if (filters.selectedCampaign) {
    bidreqTable = BIDREQ_COUNTER_DAILY_CAMPAIGN;
    bidresTable = BIDRES_COUNTER_DAILY_CAMPAIGN;
    isFeed = '';
  }

  forOwn(filters, (value, key) => {
    if (!value.length) {
      return;
    }
    switch (key) {
      case 'selectedAdvertiser': {
        bidreqTable = BIDREQ_COUNTER_DAILY_ADVERTISER;
        bidresTable = BIDRES_COUNTER_DAILY_ADVERTISER;
        isFeed = '';
        break;
      }
    }
  });

  let query;

  let count =`select count(DISTINCT createdDate) as count from dsp.${bidreqTable} where createdDate in (${range}) ${whereFilter}`;

  if (filters.switcherStatus === PERFORMANCE) {
    query = `
        select
          t1.createdDate as day,
          requests,
          responses,
          impressionsImage,
          approvedImpressionsImage,
          rejectedImpressionsImage,
          duplicateImpressionsImage,
          expiredImpressionsImage,
          mismatchImpressionsImage,
          impressionsIcon,
          approvedImpressionsIcon,
          rejectedImpressionsIcon,
          duplicateImpressionsIcon,
          expiredImpressionsIcon,
          mismatchImpressionsIcon,
          clicks,
          approvedClicks,
          floor((approvedClicks / clicks) * 100, 1) as percentApprovedClicks,
          t3.revenue + t4.revenue as revenue,
          t3.payout + t4.payout as payout,
          bidFloor,
          floor(if (impressionsImage = 0, 0, clicks / impressionsImage * 100), 6) as ctr,
          floor(if (impressionsImage = 0 , 0, revenue / impressionsImage * 1000), 6) as eCPM,
          floor((approvedImpressionsImage / impressionsImage) * 100, 1) as percentApprovedImage,
          floor((rejectedImpressionsImage / impressionsImage) * 100, 4) as percentRejectedImpressionsImage,
          floor((duplicateImpressionsImage / impressionsImage) * 100, 4) as percentDuplicateImpressionsImage,      
          floor((expiredImpressionsImage / impressionsImage) * 100, 4) as percentExpiredImpressionsImage,         
          floor((mismatchImpressionsImage / impressionsImage) * 100, 4) as percentMismatchImpressionsImage,
          floor((approvedImpressionsIcon / impressionsIcon) * 100, 1) as percentApprovedIcon,
          floor((rejectedImpressionsIcon / impressionsIcon) * 100, 4) as percentRejectedImpressionsIcon,
          floor((duplicateImpressionsIcon / impressionsIcon) * 100, 4) as percentDuplicateImpressionsIcon,      
          floor((expiredImpressionsIcon / impressionsIcon) * 100, 4) as percentExpiredImpressionsIcon,         
          floor((mismatchImpressionsIcon / impressionsIcon) * 100, 4) as percentMismatchImpressionsIcon,
          floor(if (responses = 0, 0, impressionsImage / responses * 100), 6) as winRate,
          floor(if (requests = 0, 0, impressionsImage / requests * 100), 4) as fillRate,
          floor(if (requests = 0, 0, responses / requests * 100), 4) as bidRate,
          floor((revenue - payout), 6) as profit   
        from (
          select 
            createdDate,
            toInt32(countMerge(amount)) as requests,
            floor(avgMerge( avgBidfloor ), 6) as bidFloor
          from dsp.${bidreqTable}
          where createdDate in (${range}) ${whereFilter} ${isFeed} 
          group by createdDate ) as t1
          
          left join (
          select 
            createdDate,
            toInt32(countMerge(amount)) as responses 
          from dsp.${bidresTable}
          where createdDate in (${range}) ${whereFilter} ${isFeed}
          group by createdDate) as t2
          on t1.createdDate = t2.createdDate
          
          left join (
          select 
            createdDate, 
            toInt32(countMerge(amount)) as impressionsImage,
            toInt32(countMergeIf(amount, status='APPROVED')) as approvedImpressionsImage, 
            toInt32(countMergeIf(amount, status='REJECTED' and viewType='image')) as rejectedImpressionsImage,
            toInt32(countMergeIf(amount, reason='duplicate' and viewType='image')) as duplicateImpressionsImage,
            toInt32(countMergeIf(amount, reason='ttl expired' and viewType='image')) as expiredImpressionsImage,
            toInt32(countMergeIf(amount, reason in ('1', '2', '3', '4') and viewType='image')) as mismatchImpressionsImage,
            toInt32(countMergeIf(amount, viewType='icon')) as impressionsIcon,
            toInt32(countMergeIf(amount, status='APPROVED' and viewType='icon')) as approvedImpressionsIcon, 
            toInt32(countMergeIf(amount, status='REJECTED' and viewType='icon')) as rejectedImpressionsIcon,
            toInt32(countMergeIf(amount, reason='duplicate' and viewType='icon')) as duplicateImpressionsIcon,
            toInt32(countMergeIf(amount, reason='ttl expired' and viewType='icon')) as expiredImpressionsIcon,
            toInt32(countMergeIf(amount, reason in ('1', '2', '3', '4') and viewType='icon')) as mismatchImpressionsIcon,
            floor(sumMergeIf(sumPayout, status='APPROVED'), 6) as payout,
            floor(sumMergeIf(sumPrice, status='APPROVED'), 6) as revenue
          from dsp.${IMP_COUNTER_CAMPAIGN}
          where createdDate in (${range}) ${whereFilter} and campaignId!=0
          group by createdDate) as t3
          on t1.createdDate = t3.createdDate
          
          left join (
            select 
              createdDate,
              toInt32(countMerge(amount)) as clicks,
              toInt32(countMergeIf(amount, status='APPROVED')) as approvedClicks,
              floor(sumMergeIf(sumPayout, status='APPROVED'), 6) as payout,
              floor(sumMergeIf(sumPrice, status='APPROVED'), 6) as revenue
            from dsp.${CLICK_COUNTER_CAMPAIGN}
            where createdDate in (${range}) ${whereFilter} and campaignId!=0
            group by createdDate) as t4
          on t1.createdDate = t4.createdDate
      `;

    count =`select count(DISTINCT createdDate) as count from dsp.${bidreqTable} where createdDate in (${range}) ${whereFilter}`;
  }

  return [query, count];
};

export const getReportsDailyPubSql = (filters, range) => {
  const whereFilter = `and wlid='${wlid}' ${generateSqlWhere(filters)}`;
  const query = `
      select
        t1.createdDate as day,
        requests,
        responses,
        impressionsImage,
        approvedImpressionsImage,
        rejectedImpressionsImage,
        duplicateImpressionsImage,
        expiredImpressionsImage,
        mismatchImpressionsImage,
        impressionsIcon,
        approvedImpressionsIcon,
        rejectedImpressionsIcon,
        duplicateImpressionsIcon,
        expiredImpressionsIcon,
        mismatchImpressionsIcon,
        clicks,
        approvedClicks,
        floor((approvedClicks / clicks) * 100, 1) as percentApprovedClicks,
        t3.payout + t4.payout as payout,
        bidFloor,
        floor(if (impressionsImage = 0, 0, clicks / impressionsImage * 100), 6) as ctr,
        floor((approvedImpressionsImage / impressionsImage) * 100, 1) as percentApprovedImage,
        floor((rejectedImpressionsImage / impressionsImage) * 100, 4) as percentRejectedImpressionsImage,
        floor((duplicateImpressionsImage / impressionsImage) * 100, 4) as percentDuplicateImpressionsImage,      
        floor((expiredImpressionsImage / impressionsImage) * 100, 4) as percentExpiredImpressionsImage,         
        floor((mismatchImpressionsImage / impressionsImage) * 100, 4) as percentMismatchImpressionsImage,
        floor((approvedImpressionsIcon / impressionsIcon) * 100, 1) as percentApprovedIcon,
        floor((rejectedImpressionsIcon / impressionsIcon) * 100, 4) as percentRejectedImpressionsIcon,
        floor((duplicateImpressionsIcon / impressionsIcon) * 100, 4) as percentDuplicateImpressionsIcon,      
        floor((expiredImpressionsIcon / impressionsIcon) * 100, 4) as percentExpiredImpressionsIcon,         
        floor((mismatchImpressionsIcon / impressionsIcon) * 100, 4) as percentMismatchImpressionsIcon,
        floor(if (responses = 0, 0, impressionsImage / responses * 100), 6) as winRate,
        floor(if (requests = 0, 0, impressionsImage / requests * 100), 4) as fillRate,
        floor(if (requests = 0, 0, responses / requests * 100), 4) as bidRate
      from (
        select 
          createdDate,
          toInt32(countMerge(amount)) as requests,
          floor(avgMerge( avgBidfloor ), 6) as bidFloor
        from dsp.${BIDREQ_COUNTER_DAILY}
        where createdDate in (${range}) ${whereFilter} 
        group by createdDate ) as t1
        
        left join (
        select 
          createdDate,
          toInt32(countMerge(amount)) as responses 
        from dsp.${BIDRES_COUNTER_DAILY}
        where createdDate in (${range}) ${whereFilter}
        group by createdDate) as t2
        on t1.createdDate = t2.createdDate
        
        left join (
        select 
          createdDate, 
          toInt32(countMergeIf(amount, viewType='image')) as impressionsImage,
          toInt32(countMergeIf(amount, status='APPROVED' and viewType='image')) as approvedImpressionsImage, 
          toInt32(countMergeIf(amount, status='REJECTED' and viewType='image')) as rejectedImpressionsImage,
          toInt32(countMergeIf(amount, reason='duplicate' and viewType='image')) as duplicateImpressionsImage,
          toInt32(countMergeIf(amount, reason='ttl expired' and viewType='image')) as expiredImpressionsImage,
          toInt32(countMergeIf(amount, reason in ('1', '2', '3', '4') and viewType='image')) as mismatchImpressionsImage,
          toInt32(countMergeIf(amount, viewType='icon')) as impressionsIcon,
          toInt32(countMergeIf(amount, status='APPROVED' and viewType='icon')) as approvedImpressionsIcon, 
          toInt32(countMergeIf(amount, status='REJECTED' and viewType='icon')) as rejectedImpressionsIcon,
          toInt32(countMergeIf(amount, reason='duplicate' and viewType='icon')) as duplicateImpressionsIcon,
          toInt32(countMergeIf(amount, reason='ttl expired' and viewType='icon')) as expiredImpressionsIcon,
          toInt32(countMergeIf(amount, reason in ('1', '2', '3', '4') and viewType='icon')) as mismatchImpressionsIcon,
          floor(sumMergeIf(sumPayout, status='APPROVED'), 6) as payout
        from dsp.${IMP_COUNTER_DAILY}
        where createdDate in (${range}) ${whereFilter}
        group by createdDate) as t3
        on t1.createdDate = t3.createdDate
        
        left join (
          select 
            createdDate,
            toInt32(countMerge(amount)) as clicks,
            toInt32(countMergeIf(amount, status='APPROVED')) as approvedClicks,
            floor(sumMergeIf(sumPayout, status='APPROVED'), 6) as payout
          from dsp.${CLICK_COUNTER_DAILY}
          where createdDate in (${range}) ${whereFilter}
          group by createdDate) as t4
        on t1.createdDate = t4.createdDate
    `;
  const count =`select count(DISTINCT createdDate) as count from dsp.${BIDREQ_COUNTER_DAILY}
  where createdDate in (${range}) and wlid='${wlid}' ${whereFilter}`;
  return [query, count];
};

export const getReportsHourlyAdminSql = (filters, range, pubs) => {
  const hourlyRange = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

  let bidreqTable = BIDREQ_COUNTER_HOUR;
  let bidresTable = BIDRES_COUNTER_HOUR;
  let isFeed = 'and isFeed=2';

  forOwn(filters, (value, key) => {
    if (!value.length) {
      return;
    }
    switch (key) {
      case 'selectedAdvertiser': {
        bidreqTable = BIDREQ_COUNTER_HOUR_ADVERTISER;
        bidresTable = BIDRES_COUNTER_HOUR_ADVERTISER;
        isFeed = '';
        break;
      }
      case 'selectedCampaign': {
        bidreqTable = BIDREQ_COUNTER_HOUR_CAMPAIGN;
        bidresTable = BIDRES_COUNTER_HOUR_CAMPAIGN;
        isFeed = '';
        break;
      }
    }
  });

  if (filters.selectedCampaign) {
    delete filters.selectedAdvertiser;
    isFeed = '';
  }

  const where = `and wlid='${wlid}' ${generateSqlWhere(filters)}`;

  const query =
      `select 
            t0.h as hour,
            requests,
            responses,
            impressions,
            approvedImpressions,
            rejectedImpressions,
            duplicateImpressions,
            expiredImpressions,
            mismatchImpressions,
            bidFloor,
            clicks,
            floor(if (impressions = 0, 0, clicks / impressions * 100), 6) as ctr,
            floor(if (impressions = 0 , 0, revenue / impressions * 1000), 6) as eCPM,
            floor((approvedImpressions / impressions) * 100, 1) as percentApproved,
            floor((rejectedImpressions / impressions) * 100, 4) as percentRejectedImpressions,
            floor((duplicateImpressions / impressions) * 100, 4) as percentDuplicateImpressions,      
            floor((expiredImpressions / impressions) * 100, 4) as percentExpiredImpressions,         
            floor((mismatchImpressions / impressions) * 100, 4) as percentMismatchImpressions,
            floor(if (responses = 0, 0, impressions / responses * 100), 6) as winRate,
            floor(if (requests = 0, 0, impressions / requests * 100), 4) as fillRate,
            t3.revenue + t4.revenue as revenue,
            t3.payout + t4.payout as payout,
            floor((revenue - payout), 6) as profit
          from(
             select arrayJoin([${hourlyRange}] as src) as h) as t0 
          full join(   
          select 
              hour as h,
              toInt32(countMerge(amount)) as requests,
              floor(avgMerge(avgBidfloor), 6) as bidFloor
          from dsp.${bidreqTable}
          where createdDate = '${filters.date}' ${where}
          group by h) as t1
          on t0.h = t1.h
          left join (
              select 
                  hour as h,
                  toInt32(countMerge(amount)) as responses
              from dsp.${bidresTable}
              where createdDate = '${filters.date}' ${where}
              group by h) as t2
          on t0.h = t2.h
          left join (
            select 
              hour as h,
              toInt32(countMerge(amount)) as impressions,
              toInt32(countMergeIf(amount, status = 'APPROVED')) as approvedImpressions,
              toInt32(countMergeIf(amount, status = 'REJECTED')) as rejectedImpressions,
              toInt32(countMergeIf(amount, reason='duplicate')) as duplicateImpressions,
              toInt32(countMergeIf(amount, reason='ttl expired')) as expiredImpressions,
              toInt32(countMergeIf(amount, reason in ('1', '2', '3', '4'))) as mismatchImpressions,
              floor(sumMergeIf(sumPayout, status='APPROVED'), 6) as payout,
              floor(sumMergeIf(sumPrice, status='APPROVED'), 6) as revenue
            from dsp.${IMP_COUNTER_HOUR_CAMPAIGN}
            where createdDate = '${filters.date}' and campaignId>0 ${where}
            group by h) as t3
          on t0.h = t3.h
          left join (
            select
             hour as h,
             toInt32(countMerge(amount)) as clicks,
             floor(sumMergeIf(sumPayout, status='APPROVED'), 6) as payout,
             floor(sumMergeIf(sumPrice, status='APPROVED'), 6) as revenue
            from dsp.${CLICK_COUNTER_HOUR_CAMPAIGN}
            where createdDate = '${filters.date}' and campaignId>0 ${where}
            group by h) as t4
          on t0.h = t4.h`;

  return (query);
};

export const getReportsCampaignSql = (startDate, endDate, user, filters, arr, campaignIds = []) => {
  const where = generateSqlWhere(filters);
  delete filters.selectedAdvertiser;
  const campaignsCondition = campaignIds.length ? ` and campaignId in (${campaignIds}) ` : '';
  const query = `
    SELECT
      toInt32( REQUESTS.count ) AS requests,
      bidPrice,
      REQUESTS.campaignId AS id,
      toInt32(BIDRESPONSES.count) AS responses,
      toInt32(CLICKS.count ) AS clicks,
      toInt32(CLICKS.count ) AS approvedClicks,
      toInt32( IMPRESSIONS.count ) AS impressions,
      IMPRESSIONS.revenue + CLICKS.revenue AS revenue,
      IMPRESSIONS.payout + CLICKS.payout AS payout,
      IMPRESSIONS.approvedPayout + CLICKS.approvedPayout AS approvedPayout,
      approvedImpressions,
      rejectedImpressions,
      duplicateImpressions,
      expiredImpressions,
      mismatchImpressions,
      floor((approvedImpressions / impressions) * 100, 1) as perApprovedImpressions,
      floor((rejectedImpressions / impressions) * 100, 1) as perRejectedImpressions,
      floor((duplicateImpressions / impressions) * 100, 1) as perDuplicateImpressions,
      floor((expiredImpressions / impressions) * 100, 1) as perExpiredImpressions,
      floor((mismatchImpressions / impressions) * 100, 1) as perMismatchImpressions,
      floor((approvedClicks / clicks) * 100, 1) as perApprovedClicks,
      floor((approvedPayout / payout) * 100, 1) as perApprovedPayout,
      floor(if( impressions=0, 0, (clicks / impressions * 100)), 6 ) as ctr,
      floor(if (requests = 0, 0, responses / requests * 100), 4) as bidRate,
      floor(if( requests=0, 0, (impressions / requests * 100)), 6 ) as fillRate,
      floor(if( responses=0, 0, (impressions / responses * 100)), 6 ) AS winRate,
      floor(if( impressions=0, 0, (revenue / impressions * 1000)), 6 ) as eCPM,
      floor((revenue - approvedPayout), 6) as profit
    FROM (
      SELECT
          countMerge(amount) AS count,
          campaignId
      FROM dsp.${BIDREQ_COUNTER_DAILY_CAMPAIGN}
          WHERE createdDate BETWEEN '${startDate}' AND '${endDate}' AND wlid='${wlid}' ${campaignsCondition} 
          GROUP BY campaignId, wlid
          ORDER BY count DESC) REQUESTS
    
    LEFT JOIN (
      SELECT
          countMerge(amount) as count,
          campaignId, 
          floor(avgMerge(avgBidPrice), 6) AS bidPrice
      FROM dsp.${BIDRES_COUNTER_CAMPAIGN}
          WHERE createdDate BETWEEN '${startDate}' AND '${endDate}' AND wlid='${wlid}' ${where}
          GROUP BY campaignId
      ) BIDRESPONSES 
    ON BIDRESPONSES.campaignId = REQUESTS.campaignId
    
    LEFT JOIN (
      SELECT
        countMerge(amount) AS count,
        campaignId,
        floor(sumMergeIf(sumPrice, status='APPROVED'), 6 ) AS revenue,
        floor(sumMerge(sumPayout), 6 ) AS payout,
        floor(sumMergeIf(sumPayout, status='APPROVED'), 6 ) AS approvedPayout,
        toInt32(countMergeIf(amount, status='REJECTED')) as rejectedImpressions,
        toInt32(countMergeIf(amount, status='APPROVED')) as approvedImpressions,
        toInt32(countMergeIf(amount, reason='duplicate')) as duplicateImpressions,
        toInt32(countMergeIf(amount, reason='ttl expired')) as expiredImpressions,
        toInt32(countMergeIf(amount, reason in ('1', '2', '3', '4'))) as mismatchImpressions
      FROM dsp.${IMP_COUNTER_CAMPAIGN}
      WHERE createdDate BETWEEN '${startDate}' AND '${endDate}' AND wlid='${wlid}' ${where}
      GROUP BY campaignId
      ) IMPRESSIONS
      ON IMPRESSIONS.campaignId = REQUESTS.campaignId
      
    LEFT JOIN (
      SELECT
        countMerge(amount) AS count,
        countMergeIf(amount, status ='APPROVED') AS approvedClicks,
        campaignId AS campaignId,
        floor(sumMergeIf(sumPrice, status = 'APPROVED'), 6) AS revenue,
        floor(sumMerge(sumPayout), 6) AS payout,
        floor(sumMergeIf(sumPayout, status = 'APPROVED'), 6) AS approvedPayout
      FROM dsp.${CLICK_COUNTER_CAMPAIGN}
        WHERE createdDate BETWEEN '${startDate}' AND '${endDate}' AND wlid='${wlid}' ${where}
        GROUP BY campaignId
        ) CLICKS 
      ON CLICKS.campaignId = REQUESTS.campaignId`;
  const count = `
    SELECT count(DISTINCT campaignId) AS count
      FROM dsp.${BIDREQ_COUNTER_DAILY_CAMPAIGN} 
      WHERE createdDate BETWEEN '${startDate}' AND '${endDate}' AND wlid='${wlid}' ${campaignsCondition}
  `;
  return {
    statisticsQuery: query,
    countQuery: count,
  };
};

export const getReportsPublisherSql = (startDate, endDate, filters, publisherIds = []) => {
  if (filters.selectedCampaign) {
    delete filters.selectedAdvertiser;
  }
  const where = generateSqlWhere(filters);

  const publishersCondition = publisherIds.length ? ` and publisherId in (${publisherIds}) ` : '';

  let query;
  let count;
  let bidreqTable = BIDREQ_COUNTER_DAILY;
  let bidresTable = BIDRES_COUNTER_DAILY;
  let isFeed = ' and isFeed in (0, 2)';

  forOwn(filters, (value, key) => {
    if (!value.length) {
      return;
    }
    switch (key) {
      case 'selectedAdvertiser': {
        bidreqTable = BIDREQ_COUNTER_DAILY_ADVERTISER;
        bidresTable = BIDRES_COUNTER_DAILY_ADVERTISER;
        isFeed = '';
        break;
      }
      case 'selectedCampaign': {
        bidreqTable = BIDREQ_COUNTER_DAILY_CAMPAIGN;
        bidresTable = BIDRES_COUNTER_DAILY_CAMPAIGN;
        isFeed = '';
        break;
      }
    }
  });

    query = `
       SELECT
        REQUESTS.count as requests,
        RESPONSES.count as responses,
        IMPRESSIONS.count as impressions,
        CLICKS.count as clicks,
        REQUESTS.reqPubId as id,
        REQUESTS.bidFloor as bidFloor,
        IMPRESSIONS.revenue + CLICKS.revenue as revenue,
        IMPRESSIONS.payout + CLICKS.payout as payout,
        IMPRESSIONS.approvedPayout + CLICKS.approvedPayout as approvedPayout,
        approvedImpressions,
        approvedClicks,
        rejectedImpressions,
        duplicateImpressions,
        expiredImpressions,
        mismatchImpressions,
        floor((approvedImpressions / impressions) * 100, 1) as perApprovedImpressions,
        floor((rejectedImpressions / impressions) * 100, 1) as perRejectedImpressions,
        floor((duplicateImpressions / impressions) * 100, 1) as perDuplicateImpressions,
        floor((expiredImpressions / impressions) * 100, 1) as perExpiredImpressions,
        floor((mismatchImpressions / impressions) * 100, 1) as perMismatchImpressions,
        floor((approvedClicks / clicks) * 100, 1) as perApprovedClicks,
        floor((approvedPayout / payout) * 100, 1) as perApprovedPayout,
        floor( if( REQUESTS.count=0, 0, (impressions / REQUESTS.count) * 100 ), 6 ) as fillRate,
        floor( if( responses=0, 0, (responses / requests) * 100 ), 6 ) as bidRate,
        floor( if( responses=0, 0, (IMPRESSIONS.count / responses) * 100 ), 6 ) as winRate,
        floor( if( IMPRESSIONS.count=0, 0, (IMPRESSIONS.revenue / IMPRESSIONS.count) * 1000 ), 6 ) as eCPM,
        floor( if( IMPRESSIONS.count=0, 0, (CLICKS.count / IMPRESSIONS.count) * 100 ), 6 ) as ctr,
        floor( (revenue - approvedPayout), 6 ) as profit
       FROM (
        SELECT
          publisherId as reqPubId,
          toUInt32(countMerge(amount)) as count,
          floor(avgMerge(avgBidfloor), 6) as bidFloor
        FROM dsp.${bidreqTable}
        WHERE wlid='${wlid}' AND createdDate BETWEEN '${startDate}' AND '${endDate}' ${where} ${isFeed}
        GROUP BY reqPubId, wlid 
        ORDER BY reqPubId DESC) as REQUESTS
             
        LEFT JOIN (
          SELECT 
            toUInt32(countMerge(amount)) as count,
            publisherId as resPubId 
          FROM dsp.${bidresTable} 
          WHERE wlid='${wlid}' AND createdDate BETWEEN '${startDate}' AND '${endDate}' ${where} ${isFeed}
          GROUP BY resPubId) as RESPONSES
        ON RESPONSES.resPubId = REQUESTS.reqPubId
                     
        LEFT JOIN (
          SELECT
            toUInt32(countMerge(amount)) as count,
            countMergeIf(amount, status='REJECTED') as countRejected, 
            floor(sumMergeIf(sumPrice, status='APPROVED' ), 6 ) as revenue, 
            floor(sumMerge(sumPayout), 6 ) as payout,
            floor(sumMergeIf(sumPayout, status='APPROVED' ), 6 ) as approvedPayout,
            toInt32(countMergeIf(amount, status='REJECTED')) as rejectedImpressions,
            toInt32(countMergeIf(amount, status='APPROVED')) as approvedImpressions,
            toInt32(countMergeIf(amount, reason='duplicate')) as duplicateImpressions,
            toInt32(countMergeIf(amount, reason='ttl expired')) as expiredImpressions,
            toInt32(countMergeIf(amount, reason in ('1','2','3','4'))) as mismatchImpressions,
            publisherId as impPubId
          FROM dsp.${IMP_COUNTER_CAMPAIGN}
          WHERE wlid='${wlid}' and createdDate BETWEEN '${startDate}' AND '${endDate}' ${where} AND campaignId!=0
          GROUP BY impPubId) as IMPRESSIONS 
        ON IMPRESSIONS.impPubId = REQUESTS.reqPubId
              
        LEFT JOIN (
          SELECT 
            toUInt32(countMerge(amount)) as count,
            toUInt32(countMergeIf(amount, status ='APPROVED')) as approvedClicks,
            floor(sumMergeIf(sumPrice, status = 'APPROVED'), 6) as revenue, 
            floor(sumMerge(sumPayout), 6) as payout,
            floor(sumMergeIf(sumPayout, status ='APPROVED'), 6) as approvedPayout,
            publisherId as clickPubId 
          FROM dsp.${CLICK_COUNTER_CAMPAIGN} 
          WHERE wlid='${wlid}' AND createdDate BETWEEN '${startDate}' AND '${endDate}' ${where} AND campaignId!=0
          GROUP BY clickPubId) as CLICKS
        ON CLICKS.clickPubId = REQUESTS.reqPubId`;
    count = `
        SELECT count(DISTINCT publisherId) as count
        FROM dsp.${bidreqTable} 
        WHERE wlid='${wlid}' AND createdDate BETWEEN '${startDate}' AND '${endDate}' ${where}`;

  return {
    statisticsQuery: query,
    countQuery: count,
  };
};

export const getReportsAdvertiserSql = (startDate, endDate, filters, advertiserIds = []) => {
  if (filters.selectedCampaign) {
    delete filters.selectedAdvertiser;
  }
  let where = generateSqlWhere(filters);
  where += ` and wlid='${wlid}'`;

  delete filters.selectedCampaign;
  let advertisersCondition = generateSqlWhere(filters);

  const query = `
      SELECT 
        REQUESTS.count AS requests,
        REQUESTS.advertiserId AS id,
        RESPONSES.count AS responses,
        RESPONSES.bidPrice AS bidPrice,
        toInt32( IMPRESSIONS.count ) AS impressions,
        toInt32( IMPRESSIONS.countApproved ) AS approvedImpressions,
        floor((approvedImpressions / impressions) * 100, 1) as perApprovedImpressions,
        CLICKS.revenue + IMPRESSIONS.revenue AS revenue,
        CLICKS.payout + IMPRESSIONS.payout AS payout,
        CLICKS.count AS clicks,
        floor( if( impressions=0, 0, (clicks / impressions * 100)), 6 ) AS ctr,
        floor( if( responses=0, 0, (impressions / responses * 100)), 6 ) AS winRate,
        floor( if( requests=0, 0, (responses / requests * 100)), 6 ) AS bidRate,
        floor( if( requests=0, 0, (impressions / requests * 100)), 6 ) AS fillRate,
        floor( if( impressions=0, 0, (revenue / impressions * 1000)), 6 ) as eCPM,
        floor((revenue - payout), 6) as profit
      FROM (
        SELECT 
          countMerge(amount) AS count,
          advertiserId
        FROM dsp.${BIDREQ_COUNTER_DAILY_ADVERTISER} 
          WHERE createdDate BETWEEN '${startDate}' AND '${endDate}' AND isFeed in (0,2) ${advertisersCondition}
          GROUP BY advertiserId, wlid
          ORDER BY count DESC) AS REQUESTS    
      LEFT JOIN (
        SELECT 
          countMerge(amount) as count,
          countMergeIf(amount, status='APPROVED') as countApproved, 
          floor(sumMergeIf(sumPrice, status='APPROVED' ), 6 ) as revenue, 
          floor(sumMergeIf(sumPayout, status='APPROVED' ), 6 ) as payout, 
          advertiserId
        FROM dsp.${IMP_COUNTER_CAMPAIGN} 
        WHERE createdDate BETWEEN '${startDate}' AND '${endDate}' AND campaignId>0 ${where}
        GROUP BY advertiserId) AS IMPRESSIONS
        ON IMPRESSIONS.advertiserId = REQUESTS.advertiserId
      LEFT JOIN (
      SELECT
        advertiserId,
        countMerge(amount) AS count,
        floor(avgMerge(avgBidPrice), 6) AS bidPrice
      FROM dsp.${BIDRES_COUNTER_CAMPAIGN}
      WHERE createdDate BETWEEN '${startDate}' AND '${endDate}' ${where}
      GROUP BY advertiserId) RESPONSES
      ON RESPONSES.advertiserId = REQUESTS.advertiserId
      LEFT JOIN (
        SELECT 
          countMerge(amount) AS count,
          floor(sumMergeIf(sumPrice, status = 'APPROVED'), 6 ) as revenue, 
          floor(sumMergeIf(sumPayout, status = 'APPROVED'), 6 ) as payout, 
          advertiserId
        FROM dsp.${CLICK_COUNTER_CAMPAIGN}  
        WHERE createdDate BETWEEN '${startDate}' AND '${endDate}' AND campaignId>0 ${where}
        GROUP BY advertiserId
        ) AS CLICKS
        ON CLICKS.advertiserId = REQUESTS.advertiserId`;
  const count = `
    SELECT count(DISTINCT advertiserId) as count FROM dsp.${BIDREQ_COUNTER_DAILY_ADVERTISER} 
    WHERE createdDate BETWEEN '${startDate}' AND '${endDate}' AND isFeed=2 ${advertisersCondition}`;

  return {
    statisticsQuery: query,
    countQuery: count,
  };
};

export const getReportsPublisherErrorSql = (startDate, endDate, filters) => {
  const where = `wlid='${wlid}' ${generateSqlWhere(filters)}`;
  return `
      SELECT
       pub.id as id,
       toInt32(status204) as status204,
       toInt32(status200) as status200, 
       toInt32(status400) as status400, 
       toInt32(status403) as forbidden, 
       toInt32(status499) as status499,
       toInt32(status410 + status411) as tmax,
       toInt32(status412) as geo,
       toInt32(status413) as ip,
       toInt32(status414) as os,
       toInt32(status415) as status415,
       toInt32(status416) as bidfloor,
       toInt32(status417) as adType,
       toInt32(status418) as inventoryType,
       toInt32(status419) as geoMatch,
       toInt32(status420) as blacklisted,
       toInt32(status421) as parse,
       toInt32(status424) as auctionType,
       toInt32(status500) as serverErrors,
       toInt32(total) as requests,
       toInt32(total - access) as errors,
       if (requests = 0, 0, floor(errors / requests * 100, 3)) as percentErrors,
       if (requests = 0, 0, floor(forbidden / requests * 100, 3)) as percentForbidden,
       if (requests = 0, 0, floor(tmax / requests * 100, 3)) as percentTmax,
       if (requests = 0, 0, floor(geo / requests * 100, 3)) as percentGeo,
       if (requests = 0, 0, floor(ip / requests * 100, 3)) as percentIp,
       if (requests = 0, 0, floor(geoMatch / requests * 100, 3)) as percentGeoMatch,
       if (requests = 0, 0, floor(os / requests * 100, 3)) as percentOs,
       if (requests = 0, 0, floor(bidfloor / requests * 100, 3)) as percentBidfloor,
       if (requests = 0, 0, floor(adType / requests * 100, 3)) as percentAdType,
       if (requests = 0, 0, floor(auctionType / requests * 100, 3)) as percentAuctionType,
       if (requests = 0, 0, floor(inventoryType / requests * 100, 3)) as percentInventoryType,
       if (requests = 0, 0, floor(parse / requests * 100, 3)) as percentParse,
       if (requests = 0, 0, floor(blacklisted / requests * 100, 3)) as percentBlacklisted,
       if (requests = 0, 0, floor(serverErrors / requests * 100, 3)) as percentServerErrors
      FROM  
        (SELECT DISTINCT publisherId as id from dsp.${PUB_ERROR_COUNTER}
        WHERE ${where} and createdDate >= '${startDate}' and createdDate <= '${endDate}') as pub
        LEFT JOIN
        (SELECT 
          publisherId,
          sumMergeIf(sumCounter, statusCode=000) as total,
          sumMergeIf(sumCounter, statusCode in (204, 200)) as access,
          sumMergeIf(sumCounter, statusCode=204) as status204,
          sumMergeIf(sumCounter, statusCode=200) as status200,
          sumMergeIf(sumCounter, statusCode=400) as status400,
          sumMergeIf(sumCounter, statusCode=403) as status403,
          sumMergeIf(sumCounter, statusCode=410) as status410,
          sumMergeIf(sumCounter, statusCode=411) as status411,
          sumMergeIf(sumCounter, statusCode=412) as status412,
          sumMergeIf(sumCounter, statusCode=413) as status413,
          sumMergeIf(sumCounter, statusCode=414) as status414,
          sumMergeIf(sumCounter, statusCode=415) as status415,
          sumMergeIf(sumCounter, statusCode=416) as status416,
          sumMergeIf(sumCounter, statusCode=417) as status417,
          sumMergeIf(sumCounter, statusCode=418) as status418,
          sumMergeIf(sumCounter, statusCode=419) as status419,
          sumMergeIf(sumCounter, statusCode=420) as status420,
          sumMergeIf(sumCounter, statusCode=421) as status421,
          sumMergeIf(sumCounter, statusCode=422) as status422,
          sumMergeIf(sumCounter, statusCode=424) as status424,
          sumMergeIf(sumCounter, statusCode=499) as status499,
          sumMergeIf(sumCounter, statusCode=500) as status500
          FROM dsp.${PUB_ERROR_COUNTER}
          WHERE ${where} and createdDate >= '${startDate}' and createdDate <= '${endDate}'
          GROUP BY publisherId) as s204
        ON pub.id = s204.publisherId
      ORDER BY errors desc
    `;
};

export const getReportsCountrySql = (startDate, endDate, limit, offset, filters, role) => {
  let bidreqTable = BIDREQ_COUNTER_GEO;
  let bidresTable = BIDRES_COUNTER_GEO;

  let isFeed = '';
  if (role !== PUBLISHER) {
    isFeed = 'and isFeed in (0,2)';
  }

  if (filters.selectedCampaign) {
    delete filters.selectedAdvertiser;
    bidreqTable = BIDREQ_COUNTER_GEO_CAMPAIGN;
    bidresTable = BIDRES_COUNTER_GEO_CAMPAIGN;

    isFeed = '';
  } else if (filters.selectedAdvertiser) {
    bidreqTable = BIDREQ_COUNTER_GEO_ADVERTISER;
    bidresTable = BIDRES_COUNTER_GEO_ADVERTISER;
  }

  const where = `and wlid='${wlid}' ${generateSqlWhere(filters)}`;

  const query = `
      SELECT
        geos.geo as geo,
        requests,
        responses,
        impressions,
        rejectedImpressions,
        clicks,
        impressions.revenue + clicks.revenue as revenue,
        impressions.payout + clicks.payout as payout,
        floor(if (impressions=0, 0, clicks / impressions * 100), 2) as ctr, bidFloor,  
        floor(if (impressions=0, 0, revenue / impressions * 1000), 6) as eCPM,
        floor(if (responses=0, 0, impressions / responses * 100), 6) as winRate,
        floor(if (requests=0, 0, responses / requests * 100), 6) as bidRate,
        floor(if (requests=0, 0, impressions / requests * 100), 6) as fillRate,
        floor(revenue - payout, 6) as profit
      FROM (
       SELECT 
        geo,
        floor(avgMerge(avgBidfloor), 6) as bidFloor,
        toInt32(countMerge(amount)) as requests 
       FROM dsp.${bidreqTable} 
       WHERE createdDate between '${startDate}' and '${endDate}' and geo!='' ${where} ${isFeed}
       GROUP BY geo) as geos
      
      LEFT JOIN (
        SELECT 
         toInt32(countMerge(amount)) as responses,
         geo 
        FROM dsp.${bidresTable} 
        WHERE createdDate between '${startDate}' and '${endDate}' ${where} ${isFeed}
        GROUP BY geo) as responses
        ON geos.geo = responses.geo
        
      LEFT JOIN (
        SELECT 
          toInt32(countMerge(amount)) as impressions,
          toInt32(countMergeIf(amount, status='REJECTED' )) as rejectedImpressions,
          floor(sumMergeIf(sumPrice, status='APPROVED' ), 6) as revenue, 
          floor(sumMergeIf(sumPayout, status='APPROVED' ), 6) as payout,
          geo
        FROM dsp.${IMP_COUNTER_GEO}
        WHERE createdDate between '${startDate}' and '${endDate}' ${where} and campaignId!=0
        GROUP BY geo) as impressions
        ON geos.geo = impressions.geo
        
      LEFT JOIN (
        SELECT 
         toInt32(countMerge(amount)) as clicks,
         geo,
         floor(sumMergeIf(sumPrice, status ='APPROVED'), 6) as revenue, 
         floor(sumMergeIf(sumPayout, status = 'APPROVED'), 6) as payout
        FROM dsp.${CLICK_COUNTER_GEO} 
        WHERE createdDate between '${startDate}' and '${endDate}' ${where} and campaignId!=0
        GROUP BY geo) as clicks
        ON geos.geo = clicks.geo
      ORDER BY requests desc
      `;
  const count = `
      SELECT count(DISTINCT geo) as count from dsp.${bidreqTable} 
      WHERE createdDate between '${startDate}' and '${endDate}' ${where} ${isFeed}`;

  return (
    [query, count]
  );
};

export const getReportsCountryPubSql = (startDate, endDate, limit, offset, filters) => {
  const where = `createdDate between '${startDate}' and '${endDate}' and wlid='${wlid}' ${generateSqlWhere(filters)}`;
  const query = `
    SELECT
      geos.geo as geo,
      requests,
      responses,
      impressions,
      rejectedImpressions,
      clicks,
      impressions.revenue + clicks.revenue as revenue,
      impressions.payout + clicks.payout as payout,
      floor(if (impressions=0, 0, clicks / impressions * 100), 2) as ctr, bidFloor,  
      floor(if (impressions=0, 0, revenue / impressions * 1000), 6) as eCPM,
      floor(if (responses=0, 0, impressions / responses * 100), 6) as winRate,
      floor(if (requests=0, 0, responses / requests * 100), 6) as bidRate,
      floor(if (requests=0, 0, impressions / requests * 100), 6) as fillRate,
      floor(revenue - payout, 6) as profit
    FROM (
     SELECT 
      geo,
      floor(avgMerge(avgBidfloor), 6) as bidFloor,
      toInt32(countMerge(amount)) as requests 
     FROM dsp.${BIDREQ_COUNTER_GEO} 
     WHERE ${where} and geo!=''
     GROUP BY geo) as geos
    
    LEFT JOIN (
      SELECT 
       toInt32(countMerge(amount)) as responses,
       geo 
      FROM dsp.${BIDRES_COUNTER_GEO} 
      WHERE ${where}
      GROUP BY geo) as responses
      ON geos.geo = responses.geo
      
    LEFT JOIN (
      SELECT 
        toInt32(countMerge(amount)) as impressions,
        toInt32(countMergeIf(amount, status='REJECTED' )) as rejectedImpressions,
        floor(sumMergeIf(sumPrice, status='APPROVED' ), 6) as revenue, 
        floor(sumMergeIf(sumPayout, status='APPROVED' ), 6) as payout,
        geo
      FROM dsp.${IMP_COUNTER_GEO}
      WHERE ${where}
      GROUP BY geo) as impressions
      ON geos.geo = impressions.geo
      
    LEFT JOIN (
      SELECT 
       toInt32(countMerge(amount)) as clicks,
       geo,
       floor(sumMergeIf(sumPrice, status = 'APPROVED'), 6) as revenue, 
       floor(sumMergeIf(sumPayout, status = 'APPROVED'), 6) as payout
      FROM dsp.${CLICK_COUNTER_GEO} 
      WHERE ${where}
      GROUP BY geo) as clicks
      ON geos.geo = clicks.geo
    ORDER BY requests desc
    `;
  const count = `SELECT count(DISTINCT geo) as count from dsp.${BIDREQ_COUNTER_GEO} WHERE ${where}`;
  return [query, count];
};

export const trafficStatisticsSqlAdmin = (interval) => {
  let strInterval = ``;
  interval.map((item) => strInterval+=`'${item}',`);
  strInterval = strInterval.slice(0, strInterval.length -1);
  const query = `
    select 
      t1.createdDate as date,
      bidrequests,
      bidresponses,
      impressions,
      clicks,
      t3.revenue + t5.revenue as revenue,
      t3.payout + t5.payout as payout,
      floor((clicks / impressions * 100), 2) as ctr,
      floor((conversions / clicks * 100), 2) as cr,
      floor((bidresponses / bidrequests * 100), 2) as fillRate,
      floor((revenue / impressions * 1000), 2) as eCPM,
      floor((impressions / bidresponses * 100), 2) as winRate,
      floor((revenue - payout), 4) as profit
     from (
      select 
        createdDate,
        toInt32(countMerge(amount)) as bidrequests
      from dsp.${BIDREQ_COUNTER_DAILY} 
      where createdDate in (${strInterval}) and wlid='${wlid}'
      group by createdDate
    ) as t1 
    left join (
      select 
        createdDate,
        toInt32(countMerge(amount)) as bidresponses
      from dsp.${BIDRES_COUNTER_DAILY} 
      where createdDate in (${strInterval}) and wlid='${wlid}'
      group by createdDate
    ) as t2
    on t1.createdDate = t2.createdDate
    left join (
      select 
        createdDate, 
        toInt32(countMerge(amount)) as impressions,
        floor(sumMergeIf( sumPrice, status='APPROVED' ), 2) as revenue,
        floor(sumMergeIf( sumPayout, status='APPROVED' ), 2) as payout
      from dsp.${IMP_COUNTER_DAILY}
      where createdDate in (${strInterval}) and wlid='${wlid}'
      group by createdDate
    ) as t3
    on t1.createdDate = t3.createdDate
    left join (
      select createdDate, toInt32(count()) as conversions
      from dsp.conversions_local_v2 
      where createdDate in (${strInterval}) and wlid='${wlid}'
      group by createdDate
    ) as t4
    on t1.createdDate = t4.createdDate
    left join (
      select 
        createdDate, 
        toInt32(countMerge(amount)) as clicks,
        floor(sumMergeIf( sumPrice, status = 'APPROVED'), 2) as revenue,
        floor(sumMergeIf( sumPayout, status = 'APPROVED'), 2) as payout
      from dsp.${CLICK_COUNTER_DAILY} 
      where createdDate in (${strInterval}) and wlid='${wlid}'
      group by createdDate
    ) as t5
    on t1.createdDate = t5.createdDate
   `;
  return query;
};

export const trafficStatisticsSqlAccountManager = (interval, advertiserIds = [], publisherIds = []) => {
  let strInterval = ``;
  interval.map((item) => strInterval+=`'${item}',`);
  strInterval = strInterval.slice(0, strInterval.length -1);

  let advertisersCondition = '';
  if (advertiserIds.length) {
    advertisersCondition = ` and advertiserId in (${advertiserIds}) `;
  }

  let publishersCondition = '';
  if (!advertiserIds.length && publisherIds.length) {
    publishersCondition = ` and publisherId in (${publisherIds}) `;
  }

  const query = `
    select 
      t1.createdDate as date,
      bidrequests,
      bidresponses,
      impressions,
      clicks,
      t3.revenue + t5.revenue as revenue,
      t3.payout + t5.payout as payout,
      floor((clicks / impressions * 100), 2) as ctr,
      floor((conversions / clicks * 100), 2) as cr,
      floor((bidresponses / bidrequests * 100), 2) as fillRate,
      floor((impressions / bidresponses * 100), 2) as winRate,
      floor((revenue / impressions * 1000), 2) as eCPM,
      floor((revenue - payout), 4) as profit
     from (
      select 
        createdDate,
        toInt32(countMerge(amount)) as bidrequests
      from dsp.${BIDREQ_COUNTER_DAILY_ADVERTISER} 
      where createdDate in (${strInterval}) and wlid='${wlid}' ${advertisersCondition} ${publishersCondition}
      group by createdDate
    ) as t1 
    left join (
      select 
        createdDate,
        toInt32(countMerge(amount)) as bidresponses
      from dsp.${BIDRES_COUNTER_DAILY_ADVERTISER} 
      where createdDate in (${strInterval}) and wlid='${wlid}' ${advertisersCondition} ${publishersCondition}
      group by createdDate
    ) as t2
    on t1.createdDate = t2.createdDate
    left join (
      select 
        createdDate, 
        toInt32(countMerge(amount)) as impressions,
        floor(sumMergeIf( sumPrice, status='APPROVED' ), 2) as revenue,
        floor(sumMergeIf( sumPayout, status='APPROVED' ), 2) as payout
      from dsp.${IMP_COUNTER_DAILY}
      where createdDate in (${strInterval}) and wlid='${wlid}' ${advertisersCondition} ${publishersCondition}
      group by createdDate
    ) as t3
    on t1.createdDate = t3.createdDate
    left join (
      select createdDate, toInt32(count()) as conversions
      from dsp.conversions_local_v2 
      where createdDate in (${strInterval}) and wlid='${wlid}' ${advertisersCondition} ${publishersCondition}
      group by createdDate
    ) as t4
    on t1.createdDate = t4.createdDate
    left join (
      select 
        createdDate, 
        toInt32(countMerge(amount)) as clicks,
        floor(sumMergeIf( sumPrice, status ='APPROVED'), 2) as revenue,
        floor(sumMergeIf( sumPayout, status = 'APPROVED'), 2) as payout
      from dsp.${CLICK_COUNTER_DAILY} 
      where createdDate in (${strInterval}) and wlid='${wlid}' ${advertisersCondition} ${publishersCondition}
      group by createdDate
    ) as t5
    on t1.createdDate = t5.createdDate`;

  return query;
};

// Summary
export const getSummaryTodayAdminSql = (startDate, endDate) => {
  const thisMonthRevenue = `${moment().startOf('month').format('YYYY-MM-DD')}' and '${moment().endOf('month').format('YYYY-MM-DD')}`;
  const lastMonthRevenue = `${moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD')}' and '${moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD')}`;
  const query = `select
      toInt32((select countMerge(amount) from dsp.${IMP_COUNTER_DAILY} where createdDate='${startDate}' and wlid='${wlid}')) as todayImpressions,
      toInt32((select count() from dsp.conversions_local_v2 where createdDate='${startDate}' and wlid='${wlid}')) as todayConversions,
      toInt32((select countMerge(amount) from dsp.${CLICK_COUNTER_DAILY} where createdDate='${startDate}' and wlid='${wlid}')) as todayClicks,
      floor((todayClicks / todayImpressions * 100), 6) as todayCTR,
      floor((todayConversions / todayClicks * 100), 6) as todayCr,
      (select floor(sumMerge( sumPrice ), 6) from dsp.${IMP_COUNTER_DAILY} where createdDate='${startDate}' and wlid='${wlid}' AND status='APPROVED') 
      +
      (select floor(sumMerge( sumPrice ), 6) from dsp.${CLICK_COUNTER_DAILY} where createdDate='${startDate}' and wlid='${wlid}' AND status='APPROVED') 
      as todayRevenue,
      (select floor(sumMerge( sumPayout ), 6) from dsp.${IMP_COUNTER_DAILY} where createdDate='${startDate}' and wlid='${wlid}' AND status='APPROVED')
      +
      (select floor(sumMerge( sumPayout ), 6) from dsp.${CLICK_COUNTER_DAILY} where createdDate='${startDate}' and wlid='${wlid}' AND status='APPROVED') 
      as todayPayout,
      (select floor(sumMerge( sumPrice ), 6) from dsp.${IMP_COUNTER_DAILY} where createdDate between'${thisMonthRevenue}' and wlid='${wlid}' AND status='APPROVED')
      +
      (select floor(sumMerge( sumPrice ), 6) from dsp.${CLICK_COUNTER_DAILY} where createdDate between'${thisMonthRevenue}' and wlid='${wlid}' AND status='APPROVED')
      as thisMonthRevenue,
      (select floor(sumMerge( sumPrice ), 6) from dsp.${IMP_COUNTER_DAILY} where createdDate between'${lastMonthRevenue}' and wlid='${wlid}' AND status='APPROVED') 
      +
      (select floor(sumMerge( sumPrice ), 6) from dsp.${CLICK_COUNTER_DAILY} where createdDate between'${lastMonthRevenue}' and wlid='${wlid}' AND status='APPROVED') 
      as lastMonthRevenue,
      (select floor(sumMerge( sumPayout ), 6) from dsp.${IMP_COUNTER_DAILY} where createdDate between'${thisMonthRevenue}' and wlid='${wlid}' AND status='APPROVED')
      +
      (select floor(sumMerge( sumPayout ), 6) from dsp.${CLICK_COUNTER_DAILY} where createdDate between'${thisMonthRevenue}' and wlid='${wlid}' AND status='APPROVED')
      as thisMonthPayout,
      (select floor(sumMerge( sumPayout ), 6) from dsp.${IMP_COUNTER_DAILY} where createdDate between'${lastMonthRevenue}' and wlid='${wlid}' AND status='APPROVED')
      +
      (select floor(sumMerge( sumPayout ), 6) from dsp.${CLICK_COUNTER_DAILY} where createdDate between'${lastMonthRevenue}' and wlid='${wlid}' AND status='APPROVED')
      as lastMonthPayout,
      floor((thisMonthRevenue - thisMonthPayout), 4) as thisMonthProfit,
      floor((lastMonthRevenue - lastMonthPayout), 4) as lastMonthProfit`;
  return query;
};

export const getSummaryTodayAdvertiserSql = (advertiserId) => {
  const thisMonthStart = dateUtils.startOf('month', 0, 'YYYY-MM-DD');
  const thisMonthEnd = dateUtils.endOf('month', 0, 'YYYY-MM-DD');

  const lastMonthStart = dateUtils.startOf('month', -1, 'YYYY-MM-DD');
  const lastMonthEnd = dateUtils.endOf('month', -1, 'YYYY-MM-DD');

  const query = `
    SELECT 
      toInt32(summary.todayImpressions) as todayImpressions, 
      toInt32(summary.todayClicks) as todayClicks, 
      toInt32(summary.todayConversions) as todayConversions,
      summary.todayRevenue,
      summary.thisMonthRevenue,
      summary.lastMonthRevenue,
      floor( if(todayImpressions = 0, 0, todayClicks / todayImpressions * 100), 6 ) as todayCTR,
      floor( if(todayClicks = 0, 0, todayConversions / todayClicks * 100), 6 ) as todayCr
    FROM (
      SELECT 
        (SELECT countMerge(amount) FROM dsp.${IMP_COUNTER_DAILY} WHERE wlid='${wlid}' and advertiserId=${advertiserId} and status='APPROVED' and createdDate=today() and adType!='PUSH')
        +
        (SELECT countMerge(amount) FROM dsp.${IMP_COUNTER_DAILY} WHERE wlid='${wlid}' and advertiserId=${advertiserId} and status='APPROVED' and createdDate=today() and adType='PUSH' and viewType='icon') 
          AS todayImpressions,
          
      (SELECT countMerge(amount) FROM dsp.${CLICK_COUNTER_DAILY} WHERE wlid='${wlid}' and advertiserId=${advertiserId} and status='APPROVED' and createdDate=today()) 
        AS todayClicks,
      
      (SELECT count() FROM dsp.conversions_local_v2 WHERE wlid='${wlid}' and advertiserId=${advertiserId} and status='APPROVED' and createdDate=today()) 
        AS todayConversions,
        
      (SELECT sumMerge(sumPrice) FROM dsp.${IMP_COUNTER_DAILY} WHERE wlid='${wlid}' and advertiserId=${advertiserId} and status='APPROVED' and createdDate=today())
      + 
      (SELECT sumMerge(sumPrice) FROM dsp.${CLICK_COUNTER_DAILY} WHERE wlid='${wlid}' and advertiserId=${advertiserId} and status='APPROVED' and createdDate=today())
      + 
      (SELECT sum(price) FROM dsp.conversions_local_v2 WHERE wlid='${wlid}' and advertiserId=${advertiserId} and status='APPROVED' and createdDate=today())
      + 
      (SELECT sum(price) FROM dsp.wins_local_v3 WHERE wlid='${wlid}' and advertiserId=${advertiserId} and status='APPROVED' and createdDate=today())
       AS todayRevenue,
      
      (SELECT sumMerge(sumPrice) FROM dsp.${IMP_COUNTER_DAILY} WHERE wlid='${wlid}' and advertiserId=${advertiserId} and status='APPROVED' and createdDate between '${thisMonthStart}' and '${thisMonthEnd}')
      + 
      (SELECT sumMerge(sumPrice) FROM dsp.${CLICK_COUNTER_DAILY} WHERE wlid='${wlid}' and advertiserId=${advertiserId} and status='APPROVED' and createdDate between '${thisMonthStart}' and '${thisMonthEnd}')
      + 
      (SELECT sum(price) FROM dsp.conversions_local_v2 WHERE wlid='${wlid}' and advertiserId=${advertiserId} and status='APPROVED' and createdDate between '${thisMonthStart}' and '${thisMonthEnd}')
      + 
      (SELECT sum(price) FROM dsp.wins_local_v3 WHERE wlid='${wlid}' and advertiserId=${advertiserId} and status='APPROVED' and createdDate between '${thisMonthStart}' and '${thisMonthEnd}'
      ) AS thisMonthRevenue,
      
      (SELECT sumMerge(sumPrice) FROM dsp.${IMP_COUNTER_DAILY} WHERE wlid='${wlid}' and advertiserId=${advertiserId} and status='APPROVED' and createdDate between '${lastMonthStart}' and '${lastMonthEnd}')
      + 
      (SELECT sumMerge(sumPrice) FROM dsp.${CLICK_COUNTER_DAILY} WHERE wlid='${wlid}' and advertiserId=${advertiserId} and status='APPROVED' and createdDate between '${lastMonthStart}' and '${lastMonthEnd}')
      + 
      (SELECT sum(price) FROM dsp.conversions_local_v2 WHERE wlid='${wlid}' and advertiserId=${advertiserId} and status='APPROVED' and createdDate between '${lastMonthStart}' and '${lastMonthEnd}')
      + 
      (SELECT sum(price) FROM dsp.wins_local_v3 WHERE wlid='${wlid}' and advertiserId=${advertiserId} and status='APPROVED' and createdDate between '${lastMonthStart}' and '${lastMonthEnd}')
       AS lastMonthRevenue
    ) AS summary`;

  return query;
};

export const getSummaryTodayAccountManagerSql = (advertiserIds = [], publisherIds = [], showRevenue = false, showPayout = false, showProfit = false) => {
  const thisMonthRevenue = `${moment().startOf('month').format('YYYY-MM-DD')}' and '${moment().endOf('month').format('YYYY-MM-DD')}`;
  const lastMonthRevenue = `${moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD')}' and '${moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD')}`;

  const startDate = dateUtils.now('YYYY-MM-DD');

  let advertisersCondition = '';
  if (advertiserIds.length) {
    advertisersCondition = ` and advertiserId in (${advertiserIds}) `;
  }

  let publishersCondition = '';
  if (!advertiserIds.length && publisherIds.length) {
    publishersCondition = ` and publisherId in (${publisherIds}) `;
  }

  const query = `
    SELECT
      toInt32(
        (select countMerge(amount) from dsp.${IMP_COUNTER_DAILY} where createdDate='${startDate}' and wlid='${wlid}' ${advertisersCondition} ${publishersCondition})
      ) as todayImpressions,
      
      toInt32(
        (select count() from dsp.conversions_local_v2 where createdDate='${startDate}' and wlid='${wlid}' ${advertisersCondition} ${publishersCondition})
      ) as todayConversions,
      
      toInt32(
        (select countMerge(amount) from dsp.${CLICK_COUNTER_DAILY} where createdDate='${startDate}' and wlid='${wlid}' ${advertisersCondition} ${publishersCondition})
      ) as todayClicks,
      
      floor( if(todayImpressions = 0, 0, (todayClicks / todayImpressions * 100)), 6 ) as todayCTR
      
      ${
        showRevenue ? `
          ,(
            select floor(sumMerge( sumPrice ), 6) from dsp.${IMP_COUNTER_DAILY} where createdDate='${startDate}' and wlid='${wlid}' AND status='APPROVED' ${advertisersCondition} ${publishersCondition}
          ) 
          +
          (
            select floor(sumMerge( sumPrice ), 6) from dsp.${CLICK_COUNTER_DAILY} where createdDate='${startDate}' and wlid='${wlid}' AND status='APPROVED' ${advertisersCondition} ${publishersCondition}
          ) as todayRevenue,
        
          (
            select floor(sumMerge( sumPrice ), 6) from dsp.${IMP_COUNTER_DAILY} where createdDate between'${thisMonthRevenue}' and wlid='${wlid}' AND status='APPROVED' ${advertisersCondition} ${publishersCondition}
          )
          +
          (
            select floor(sumMerge( sumPrice ), 6) from dsp.${CLICK_COUNTER_DAILY} where createdDate between'${thisMonthRevenue}' and wlid='${wlid}' AND status='APPROVED' ${advertisersCondition} ${publishersCondition}
          ) as thisMonthRevenue,
          
          (
            select floor(sumMerge( sumPrice ), 6) from dsp.${IMP_COUNTER_DAILY} where createdDate between'${lastMonthRevenue}' and wlid='${wlid}' AND status='APPROVED' ${advertisersCondition} ${publishersCondition}
          ) 
          +
          (
            select floor(sumMerge( sumPrice ), 6) from dsp.${CLICK_COUNTER_DAILY} where createdDate between'${lastMonthRevenue}' and wlid='${wlid}' AND status='APPROVED' ${advertisersCondition} ${publishersCondition}
          ) as lastMonthRevenue` : ''}
          
      ${
        showPayout ? `
          ,(
            select floor(sumMerge( sumPayout ), 6) from dsp.${IMP_COUNTER_DAILY} where createdDate='${startDate}' and wlid='${wlid}' AND status='APPROVED' ${advertisersCondition} ${publishersCondition}
          )
          +
          (
            select floor(sumMerge( sumPayout ), 6) from dsp.${CLICK_COUNTER_DAILY} where createdDate='${startDate}' and wlid='${wlid}' AND status='APPROVED' ${advertisersCondition} ${publishersCondition}
          ) as todayPayout,
          (
            select floor(sumMerge( sumPayout ), 6) from dsp.${IMP_COUNTER_DAILY} where createdDate between'${thisMonthRevenue}' and wlid='${wlid}' AND status='APPROVED' ${advertisersCondition} ${publishersCondition}
          )
          +
          (
            select floor(sumMerge( sumPayout ), 6) from dsp.${CLICK_COUNTER_DAILY} where createdDate between'${thisMonthRevenue}' and wlid='${wlid}' AND status='APPROVED' ${advertisersCondition} ${publishersCondition}
          ) as thisMonthPayout,
        
          (
            select floor(sumMerge( sumPayout ), 6) from dsp.${IMP_COUNTER_DAILY} where createdDate between'${lastMonthRevenue}' and wlid='${wlid}' AND status='APPROVED' ${advertisersCondition} ${publishersCondition}
          )
          +
          (
            select floor(sumMerge( sumPayout ), 6) from dsp.${CLICK_COUNTER_DAILY} where createdDate between'${lastMonthRevenue}' and wlid='${wlid}' AND status='APPROVED' ${advertisersCondition} ${publishersCondition}
          ) as lastMonthPayout` : ''}    
      
      ${ showRevenue && showPayout && showProfit ? `
        ,floor((thisMonthRevenue - thisMonthPayout), 4) as thisMonthProfit, 
        floor((lastMonthRevenue - lastMonthPayout), 4) as lastMonthProfit` : ''}`;

  return query;
};

export const getSummaryYesterdayAdvertiserSql = (advertiserId) => {
  const query = `
    SELECT 
      toInt32(summary.yesterdayImpressions) as yesterdayImpressions, 
      toInt32(summary.yesterdayClicks) as yesterdayClicks, 
      toInt32(summary.yesterdayConversions) as yesterdayConversions,
      summary.yesterdayRevenue,
      floor( if(yesterdayImpressions = 0, 0, yesterdayClicks / yesterdayImpressions * 100), 6 ) as yesterdayCTR,
      floor( if(yesterdayClicks = 0, 0, yesterdayConversions / yesterdayClicks * 100), 6 ) as yesterdayCr
    FROM (
      SELECT 
        (SELECT countMerge(amount) FROM dsp.${IMP_COUNTER_DAILY} WHERE wlid='${wlid}' and advertiserId=${advertiserId} and status='APPROVED' and createdDate=yesterday() and adType!='PUSH')
        +
        (SELECT countMerge(amount) FROM dsp.${IMP_COUNTER_DAILY} WHERE wlid='${wlid}' and advertiserId=${advertiserId} and status='APPROVED' and createdDate=yesterday() and adType='PUSH' and viewType='icon') 
          AS yesterdayImpressions,
          
      (SELECT countMerge(amount) FROM dsp.${CLICK_COUNTER_DAILY} WHERE wlid='${wlid}' and advertiserId=${advertiserId} and status='APPROVED' and createdDate=yesterday()) 
        AS yesterdayClicks,
      
      (SELECT count() FROM dsp.conversions_local_v2 WHERE wlid='${wlid}' and advertiserId=${advertiserId} and status='APPROVED' and createdDate=yesterday()) 
        AS yesterdayConversions,
        
      (SELECT sumMerge(sumPrice) FROM dsp.${IMP_COUNTER_DAILY} WHERE wlid='${wlid}' and advertiserId=${advertiserId} and status='APPROVED' and createdDate=yesterday())
      + 
      (SELECT sumMerge(sumPrice) FROM dsp.${CLICK_COUNTER_DAILY} WHERE wlid='${wlid}' and advertiserId=${advertiserId} and status='APPROVED' and createdDate=yesterday())
      + 
      (SELECT sum(price) FROM dsp.conversions_local_v2 WHERE wlid='${wlid}' and advertiserId=${advertiserId} and status='APPROVED' and createdDate=yesterday())
      + 
      (SELECT sum(price) FROM dsp.wins_local_v3 WHERE wlid='${wlid}' and advertiserId=${advertiserId} and status='APPROVED' and createdDate=yesterday())
       AS yesterdayRevenue
    ) AS summary`;

  return query;
};

export const getSummaryYesterdayAdminSql = (startDate, endDate) => {
  return (
    `select
    toInt32((select countMerge(amount) from dsp.${IMP_COUNTER_DAILY} where createdDate='${startDate}' and wlid='${wlid}')) as yesterdayImpressions,
    toInt32((select count() from dsp.conversions_local_v2 where createdDate='${startDate}' and wlid='${wlid}')) as yesterdayConversions,
    toInt32((select countMerge(amount) from dsp.${CLICK_COUNTER_DAILY} where createdDate='${startDate}' and wlid='${wlid}')) as yesterdayClicks,
    floor((yesterdayClicks / yesterdayImpressions * 100), 6) as yesterdayCTR,
    floor((yesterdayConversions / yesterdayClicks * 100), 6) as yesterdayCr,
    (select floor(sumMerge(sumPrice), 6) from dsp.${IMP_COUNTER_DAILY} where createdDate='${startDate}' and wlid='${wlid}' AND status='APPROVED') 
    +
    (select floor(sumMerge(sumPrice), 6) from dsp.${CLICK_COUNTER_DAILY} where createdDate='${startDate}' and wlid='${wlid}' AND status='APPROVED') 
    as yesterdayRevenue,
    (select floor(sumMerge(sumPayout), 6) from dsp.${IMP_COUNTER_DAILY} where createdDate='${startDate}' and wlid='${wlid}' AND status='APPROVED') 
    +
    (select floor(sumMerge(sumPayout ), 6) from dsp.${CLICK_COUNTER_DAILY} where createdDate='${startDate}' and wlid='${wlid}' AND status='APPROVED') 
    as yesterdayPayout`
  );
};

export const getSummaryYesterdayAccountManagerSql = (advertiserIds = [], publisherIds = [], showRevenue = false, showPayout = false, showProfit = false) => {
  const startDate = dateUtils.startOf('day', -1, 'YYYY-MM-DD');

  let advertisersCondition = '';
  if (advertiserIds.length) {
    advertisersCondition = ` and advertiserId in (${advertiserIds}) `;
  }

  let publishersCondition = '';
  if (!advertiserIds.length && publisherIds.length) {
    publishersCondition = ` and publisherId in (${publisherIds}) `;
  }

  const query = `SELECT
    toInt32(
      (select countMerge(amount) from dsp.${IMP_COUNTER_DAILY} where createdDate='${startDate}' and wlid='${wlid}' ${advertisersCondition} ${publishersCondition})
    ) as yesterdayImpressions,
    
    toInt32(
      (select count() from dsp.conversions_local_v2 where createdDate='${startDate}' and wlid='${wlid}' ${advertisersCondition} ${publishersCondition})
    ) as yesterdayConversions,
    
    toInt32(
      (select countMerge(amount) from dsp.${CLICK_COUNTER_DAILY} where createdDate='${startDate}' and wlid='${wlid}' ${advertisersCondition} ${publishersCondition})
    ) as yesterdayClicks,
    
    floor( if(yesterdayImpressions = 0, 0, (yesterdayClicks / yesterdayImpressions * 100)), 6 ) as yesterdayCTR
    
    ${
      showRevenue ? `
      , (
        select floor(sumMerge(sumPrice), 6) from dsp.${IMP_COUNTER_DAILY} where createdDate='${startDate}' and wlid='${wlid}' AND status='APPROVED' ${advertisersCondition} ${publishersCondition}
      ) 
      +
      (
        select floor(sumMerge(sumPrice), 6) from dsp.${CLICK_COUNTER_DAILY} where createdDate='${startDate}' and wlid='${wlid}' AND status = 'APPROVED' ${advertisersCondition} ${publishersCondition}
      ) as yesterdayRevenue` : ''}
    
    ${
      showPayout ? `
      ,(
        select floor(sumMerge(sumPayout), 6) from dsp.${IMP_COUNTER_DAILY} where createdDate='${startDate}' and wlid='${wlid}' AND status='APPROVED' ${advertisersCondition} ${publishersCondition}
      ) 
      +
      (
        select floor(sumMerge(sumPayout ), 6) from dsp.${CLICK_COUNTER_DAILY} where createdDate='${startDate}' and wlid='${wlid}' AND status ='APPROVED' ${advertisersCondition} ${publishersCondition}
      ) as yesterdayPayout` : ''}`;

  return query;
};

export const getAdvertiserSql = (ids, startDate, endDate) => (
  `select advertiserId, t1.spend + t2.spend as spend from (
     select
       advertiserId,
       floor(sumMergeIf(sumPrice, status='APPROVED'),2) as spend 
      from dsp.${IMP_COUNTER_DAILY} 
      where advertiserId in (${ids}) and createdDate >= toDateTime('${startDate}') and createdDate <= toDateTime('${endDate}') and wlid='${wlid}'
      group by advertiserId) as t1
      left join (
        select
         advertiserId,
         floor(sumMergeIf(sumPrice, status ='APPROVED'),2) as spend 
        from dsp.${CLICK_COUNTER_DAILY} 
        where advertiserId in (${ids}) and createdDate >= toDateTime('${startDate}') and createdDate <= toDateTime('${endDate}') and wlid='${wlid}'
        group by advertiserId
      ) as t2
      on toUInt32(t1.advertiserId) = toUInt32(t2.advertiserId)
  `
);

export const getAllAdvertiserSql = (ids) => (
  `select advertiserId, t1.spend + t2.spend as spend from (
     select
       advertiserId,
       floor(sumMergeIf(sumPrice, status='APPROVED' ), 2) as spend 
      from dsp.${IMP_COUNTER_DAILY} 
      where advertiserId in (${ids})  and wlid='${wlid}'
      group by advertiserId) as t1
      left join (
        select
         advertiserId,
         floor(sumMergeIf(sumPrice, status ='APPROVED'),2) as spend 
        from dsp.${CLICK_COUNTER_DAILY} 
        where advertiserId in (${ids}) and wlid='${wlid}'
        group by advertiserId
      ) as t2
      on toUInt32(t1.advertiserId) = toUInt32(t2.advertiserId)
  `
);

export const getReportsSubIdSql2 = (startDate, endDate, filters, role, id) => {
  let bidreqTable = BIDREQ_COUNTER_SUBID;
  let bidresTable = BIDRES_COUNTER_SUBID;

  let isFeed = '';
  if (role !== PUBLISHER) {
    isFeed = 'and isFeed=2';
  }

  if (filters.selectedCampaign) {
    delete filters.selectedAdvertiser;
    bidreqTable = BIDREQ_COUNTER_SUBID_CAMPAIGN;
    bidresTable = BIDRES_COUNTER_SUBID_CAMPAIGN;

    isFeed = '';
  } else if (filters.selectedAdvertiser) {
    bidreqTable = BIDREQ_COUNTER_SUBID_ADVERTISER;
    bidresTable = BIDRES_COUNTER_SUBID_ADVERTISER;
  }

  let where = `and wlid='${wlid}' and subId!='' ${generateSqlWhere(filters)}`;
  const {limit, offset} = filters;
  let query;

  if (role === roles.ADVERTISER) {
    where += ` and advertiserId=${id}`;
    bidreqTable = BIDREQ_COUNTER_SUBID_ADVERTISER;
    bidresTable = BIDRES_COUNTER_SUBID_ADVERTISER;
  } else if (role === roles.PUBLISHER) {
    where += ` and publisherId=${id}`;
    bidreqTable = BIDREQ_COUNTER_SUBID;
    bidresTable = BIDRES_COUNTER_SUBID;
  }

  query = `SELECT
      subIds.subId as subidLabel,
      requests, 
      responses, 
        impressions,
        approvedImpressions,
        rejectedImpressions,
        clicks,
        floor((approvedImpressions / impressions) * 100, 1) as perApprovedImpressions,
        floor((rejectedImpressions / impressions) * 100, 1) as perRejectedImpressions,       
        floor((revenue / impressions * 1000), 6) as eCPM,
        floor((clicks / impressions * 100), 6) as ctr,
        floor((responses / requests * 100), 6) as fillRate,
        floor((impressions / responses * 100), 6) as winRate,
        impressions.revenue + clicks.revenue as revenue,
        impressions.payout + clicks.payout as payout,
        floor(revenue - payout, 6) as profit
      FROM (
        SELECT 
          subId,
          toUInt32(countMerge(amount)) as requests 
        FROM dsp.${bidreqTable} 
        WHERE createdDate between '${startDate}' and '${endDate}' ${where} ${isFeed}
        GROUP by subId
        ORDER BY requests desc) as subIds
      LEFT JOIN (
       SELECT 
        toUInt32(countMerge(amount)) as responses,
        subId
       FROM dsp.${bidresTable} 
       WHERE createdDate between '${startDate}' and '${endDate}' ${where} ${isFeed}
       GROUP BY subId) as responses
      ON subIds.subId = responses.subId
      LEFT JOIN (
        SELECT
          toInt32(countMerge(amount)) as impressions,
          toInt32(countMergeIf(amount, status='REJECTED')) as rejectedImpressions,
          toInt32(countMergeIf(amount, status='APPROVED')) as approvedImpressions,
          floor(sumMergeIf(sumPrice, status='APPROVED'), 6) as revenue, 
          floor(sumMergeIf(sumPayout, status='APPROVED'), 6) as payout,
          subId
        FROM dsp.${IMP_COUNTER_SUBID}
        WHERE createdDate between '${startDate}' and '${endDate}' and campaignId>0 ${where} 
        GROUP BY subId) as impressions
      ON subIds.subId = impressions.subId
      LEFT JOIN (
        SELECT
          toInt32(countMerge(amount)) as clicks,
          floor(sumMergeIf(sumPrice, status='APPROVED'), 6) as revenue, 
          floor(sumMergeIf(sumPayout, status='APPROVED'), 6) as payout,
          subId
      FROM dsp.${CLICK_COUNTER_SUBID}
      WHERE createdDate between '${startDate}' and '${endDate}' and campaignId>0 ${where} 
      GROUP BY subId) as clicks
      ON subIds.subId = clicks.subId
      ORDER BY impressions desc, requests desc`;


  const count = `select count(DISTINCT subId) as count from dsp.${bidreqTable} 
    where createdDate between '${startDate}' and '${endDate}' and wlid='${wlid}' ${where} ${isFeed}`;

  return [query, count];
};

export const getFullReportsSubIdSql2 = (startDate, endDate, filters, role, id) => {
  if (filters.selectedCampaign) {
    delete filters.selectedAdvertiser;
  }
  const where = `and wlid='${wlid}' and subId!='' ${generateSqlWhere(filters)}`;
  const {limit, offset} = filters;
  let query;
  let bidreqTable = BIDREQ_COUNTER_SUBID;
  let bidresTable = BIDRES_COUNTER_SUBID;
  if (filters.selectedAdvertiser) {
    bidreqTable = BIDREQ_COUNTER_SUBID_ADVERTISER;
    bidresTable = BIDRES_COUNTER_SUBID_ADVERTISER;
  }
  let isFeed = '';
  if (role !== PUBLISHER) {
    isFeed = 'and isFeed=2';
  }

  query = `SELECT
        subIds.subId as subidLabel,
        requests, 
        responses, 
        impressions,
        approvedImpressions,
        rejectedImpressions,
        clicks,
        floor((approvedImpressions / impressions) * 100, 1) as perApprovedImpressions,
        floor((rejectedImpressions / impressions) * 100, 1) as perRejectedImpressions,       
        floor((revenue / impressions * 1000), 6) as eCPM,
        floor((clicks / impressions * 100), 6) as ctr,
        floor((responses / requests * 100), 6) as fillRate,
        floor((impressions / responses * 100), 6) as winRate,
        impressions.revenue + clicks.revenue as revenue,
        impressions.payout + clicks.payout as payout,
        floor(revenue - payout, 6) as profit
      FROM (
        SELECT 
          subId,
          toUInt32(countMerge(amount)) as requests 
        FROM dsp.${bidreqTable} 
        WHERE createdDate between '${startDate}' and '${endDate}' ${where} ${isFeed}
        GROUP by subId
        ORDER BY requests desc) as subIds
      LEFT JOIN (
       SELECT 
        toUInt32(countMerge(amount)) as responses,
        subId
       FROM dsp.${bidresTable} 
       WHERE createdDate between '${startDate}' and '${endDate}' ${where} ${isFeed}
       GROUP BY subId) as responses
      ON subIds.subId = responses.subId
      LEFT JOIN (
        SELECT
          toInt32(countMerge(amount)) as impressions,
          toInt32(countMergeIf(amount, status='REJECTED')) as rejectedImpressions,
          toInt32(countMergeIf(amount, status='APPROVED')) as approvedImpressions,
          floor(sumMergeIf(sumPrice, status='APPROVED'), 6) as revenue, 
          floor(sumMergeIf(sumPayout, status='APPROVED'), 6) as payout,
          subId
        FROM dsp.${IMP_COUNTER_SUBID}
        WHERE createdDate between '${startDate}' and '${endDate}' and campaignId>0 ${where} 
        GROUP BY subId) as impressions
      ON subIds.subId = impressions.subId
      LEFT JOIN (
        SELECT
          toInt32(countMerge(amount)) as clicks,
          floor(sumMergeIf(sumPrice, status='APPROVED'), 6) as revenue, 
          floor(sumMergeIf(sumPayout, status='APPROVED'), 6) as payout,
          subId
      FROM dsp.${CLICK_COUNTER_SUBID}
      WHERE createdDate between '${startDate}' and '${endDate}' and campaignId>0 ${where} 
      GROUP BY subId) as clicks
      ON subIds.subId = clicks.subId
      ORDER BY impressions desc, requests desc
      LIMIT ${limit} OFFSET ${offset}`;

  const count = `select count(DISTINCT subId) as count from dsp.${bidreqTable} 
      where createdDate between '${startDate}' and '${endDate}' and wlid='${wlid}' ${where} ${isFeed}`;

  return [query, count];
};

export const getReportsSubIdPubSql2 = (startDate, endDate, filters) => {
  const where = `createdDate between '${startDate}' and '${endDate}' and wlid='${wlid}' and subId!='' ${generateSqlWhere(filters)}`;
  const {limit, offset} = filters;
  const query = `
    SELECT
      subIds.subId as subidLabel,
      requests, 
      responses, 
      impressions.revenue + clicks.revenue as revenue,
      impressions.payout + clicks.payout as payout,
      impressions,
      approvedImpressions,
      rejectedImpressions,
      clicks,
      floor((approvedImpressions / impressions) * 100, 1) as perApprovedImpressions,
      floor((rejectedImpressions / impressions) * 100, 1) as perRejectedImpressions,       
      floor((revenue / impressions * 1000), 6) as eCPM,
      floor((clicks / impressions * 100), 6) as ctr,
      floor((responses / requests * 100), 6) as fillRate,
      floor((impressions / responses * 100), 6) as winRate, 
      floor(revenue - payout, 6) as profit
    FROM (
      SELECT 
        subId,
        toUInt32(countMerge(amount)) as requests 
      FROM dsp.${BIDREQ_COUNTER_SUBID} 
      WHERE ${where}
      GROUP by subId
      ORDER BY requests desc) as subIds
    LEFT JOIN (
     SELECT 
      toUInt32(countMerge(amount)) as responses,
      subId
     FROM dsp.${BIDRES_COUNTER_SUBID} 
     WHERE ${where}
     GROUP BY subId) as responses
    ON subIds.subId = responses.subId
    LEFT JOIN (
      SELECT
        toInt32(countMerge(amount)) as impressions,
        toInt32(countMergeIf(amount, status='REJECTED')) as rejectedImpressions,
        toInt32(countMergeIf(amount, status='APPROVED')) as approvedImpressions,
        floor(sumMergeIf(sumPrice, status='APPROVED'), 6) as revenue, 
        floor(sumMergeIf(sumPayout, status='APPROVED'), 6) as payout,
        subId
      FROM dsp.${IMP_COUNTER_SUBID}
      WHERE ${where} 
      GROUP BY subId) as impressions
    ON subIds.subId = impressions.subId
    LEFT JOIN (
      SELECT
        toInt32(countMerge(amount)) as clicks,
        floor(sumMergeIf(sumPrice, status='APPROVED'), 6) as revenue, 
        floor(sumMergeIf(sumPayout, status='APPROVED'), 6) as payout,
        subId
    FROM dsp.${CLICK_COUNTER_SUBID}
    WHERE ${where}
    GROUP BY subId) as clicks
    ON subIds.subId = clicks.subId
    ORDER BY impressions desc, requests desc`;
  const count = `select count(DISTINCT subId) as count from dsp.${BIDREQ_COUNTER_SUBID} where ${where}`;
  return [query, count];
};

export const getReportsAppsSql2 = (startDate, endDate, filters, role, id, campaignIds = []) => {
  let bidreqTable = BIDREQ_COUNTER_APP;
  let bidresTable = BIDRES_COUNTER_APP;

  if (filters.selectedCampaign) {
    delete filters.selectedAdvertiser;
    bidreqTable = BIDREQ_COUNTER_APP_CAMPAIGN;
    bidresTable = BIDRES_COUNTER_APP_CAMPAIGN;
  } else if (filters.selectedAdvertiser) {
    bidreqTable = BIDREQ_COUNTER_APP_ADVERTISER;
    bidresTable = BIDRES_COUNTER_APP_ADVERTISER;
  }

  let where = `and wlid='${wlid}' and appId!='' ${generateSqlWhere(filters)}`;
  const {limit, offset} = filters;
  let campaignCondition = '';
  let isFeed = '';
  if (role !== PUBLISHER) {
    isFeed = 'and isFeed=2';
  }
  if (role === roles.ADVERTISER) {
    where += ` and advertiserId in(${id})`;
    campaignCondition = ` and campaignId in (${campaignIds})`;
    //bidreqTable = BIDREQ_COUNTER_APP_ADVERTISER;
    //the above table does not exist
    bidreqTable = BIDREQ_COUNTER_APP_CAMPAIGN;
    bidresTable = BIDRES_COUNTER_APP_ADVERTISER;
  } else if (role === roles.PUBLISHER) {
    where += ` and publisherId=${id}`;
  }

  const count = `
      select count(DISTINCT appName) as count from dsp.${bidreqTable} 
      where createdDate between '${startDate}' and '${endDate}' and appId!='' ${campaignCondition} ${isFeed}`;

  const query = `SELECT
        appIds.appName as appname,
        appIds.appId as appid,
        appIds.appBundle  as appbundle,
        requests, 
        responses, 
        revenue, 
        payout,
        impressions,
        approvedImpressions,
        rejectedImpressions,
        floor((approvedImpressions / impressions) * 100, 1) as perApprovedImpressions,
        floor((rejectedImpressions / impressions) * 100, 1) as perRejectedImpressions,       
        floor((revenue / impressions * 1000), 6) as eCPM,
        floor((responses / requests * 100), 6) as fillRate,
        floor((impressions / responses * 100), 6) as winRate,
        floor(revenue - payout, 6) as profit
      FROM (
      SELECT 
        appName,
        appBundle,
        appId,
        toInt32(countMerge(amount)) as requests 
      FROM dsp.${bidreqTable} 
      WHERE createdDate between '${startDate}' and '${endDate}' and appId!='' ${campaignCondition} ${isFeed}
      GROUP by appName, appId, appBundle
      ORDER BY requests desc) as appIds
      
      LEFT JOIN (
       SELECT 
        toInt32(countMerge(amount)) as responses,
        appName,
        appBundle,
        appId
      FROM dsp.${bidresTable} 
      WHERE createdDate between '${startDate}' and '${endDate}' ${where} ${isFeed}
      GROUP BY appName, appBundle, appId) as responses
      ON appIds.appName = responses.appName AND appIds.appId = responses.appId AND appIds.appBundle = responses.appBundle
      
      LEFT JOIN
      (select
        toInt32(countMerge(amount)) as impressions,
        toInt32(countMergeIf(amount, status='REJECTED')) as rejectedImpressions,
        toInt32(countMergeIf(amount, status='APPROVED')) as approvedImpressions,
        floor(sumMergeIf(sumPrice, status='APPROVED'), 6) as revenue, 
        floor(sumMergeIf(sumPayout, status='APPROVED'), 6) as payout,
        appName,
        appBundle,
        appId
      from dsp.${IMP_COUNTER_APP}
      where createdDate between '${startDate}' and '${endDate}' and appId!='' and campaignId>0 ${where} 
      GROUP BY appName, appBundle, appId) as impressions
      ON appIds.appName = impressions.appName AND appIds.appBundle = impressions.appBundle AND appIds.appId = impressions.appId
      
      ORDER BY impressions desc`;
  log.debug(`Reports App query: ${query}`);
  return (
      [query, count]
  );
};

export const getReportsAppsPubSql2 = (startDate, endDate, filters) => {
  const where = `createdDate between '${startDate}' and '${endDate}' and wlid='${wlid}' and appId!='' ${generateSqlWhere(filters)}`;
  const {limit, offset} = filters;
  const count =`select count(DISTINCT appName) as count from dsp.${BIDREQ_COUNTER_APP} where ${where}`;
  const query = `SELECT
    appIds.appName as appname,
    appIds.appId as appid,
    appIds.appBundle  as appbundle,
    requests, 
    responses, 
    payout,
    impressions,
    approvedImpressions,
    rejectedImpressions,
    floor((approvedImpressions / impressions) * 100, 1) as perApprovedImpressions,
    floor((rejectedImpressions / impressions) * 100, 1) as perRejectedImpressions,       
    floor((responses / requests * 100), 6) as fillRate,
    floor((impressions / responses * 100), 6) as winRate
  FROM (
  SELECT 
    appName,
    appBundle,
    appId,
    toInt32(countMerge(amount)) as requests 
  FROM dsp.${BIDREQ_COUNTER_APP} 
  WHERE ${where}
  GROUP by appName, appId, appBundle
  ORDER BY requests desc) as appIds
  
  LEFT JOIN (
   SELECT 
    toInt32(countMerge(amount)) as responses,
    appName,
    appBundle,
    appId
  FROM dsp.${BIDRES_COUNTER_APP} 
  WHERE ${where}
  GROUP BY appName, appBundle, appId) as responses
  ON appIds.appName = responses.appName AND appIds.appId = responses.appId AND appIds.appBundle = responses.appBundle
  
  LEFT JOIN
  (select
    toInt32(countMerge(amount)) as impressions,
    toInt32(countMergeIf(amount, status='REJECTED')) as rejectedImpressions,
    toInt32(countMergeIf(amount, status='APPROVED')) as approvedImpressions,
    floor(sumMergeIf(sumPayout, status='APPROVED'), 6) as payout,
    appName,
    appBundle,
    appId
  from dsp.${IMP_COUNTER_APP}
  where ${where} 
  GROUP BY appName, appBundle, appId) as impressions
  ON appIds.appName = impressions.appName AND appIds.appBundle = impressions.appBundle AND appIds.appId = impressions.appId
  
  ORDER BY impressions desc`;
  return [query, count];
};

export const getReportsSitesSql2 = (startDate, endDate, filters, role, id, campaignIds = []) => {
  let bidreqTable = BIDREQ_COUNTER_SITE;
  let bidresTable = BIDRES_COUNTER_SITE;

  if (filters.selectedCampaign) {
    delete filters.selectedAdvertiser;
    bidreqTable = BIDREQ_COUNTER_SITE_CAMPAIGN;
    bidresTable = BIDRES_COUNTER_SITE_CAMPAIGN;
  } else if (filters.selectedAdvertiser) {
    bidreqTable = BIDREQ_COUNTER_SITE_ADVERTISER;
    bidresTable = BIDRES_COUNTER_SITE_ADVERTISER;
  }

  let where = `and wlid='${wlid}' ${generateSqlWhere(filters)}`;
  const {limit, offset} = filters;

  let campaignCondition = '';
  let isFeed = '';
  if (role !== PUBLISHER) {
    isFeed = 'and isFeed=2';
  }
  if (role === roles.ADVERTISER) {
    where += ` and advertiserId=${id}`;
    campaignCondition = ` and campaignId in (${campaignIds})`;
    //bidreqTable = BIDREQ_COUNTER_SITE_ADVERTISER;
    //the above table does not exist
    bidreqTable = BIDREQ_COUNTER_SITE_CAMPAIGN;
    bidresTable = BIDRES_COUNTER_SITE_ADVERTISER;
  } else if (role === roles.PUBLISHER) {
    where += ` and publisherId=${id}`;
    bidreqTable = BIDREQ_COUNTER_SITE;
    bidresTable = BIDRES_COUNTER_SITE;
  }

  const query = `SELECT
        siteIds.siteId as siteidLabel,
        siteIds.siteDomain as sitedomainLabel,
        requests, 
        responses, 
        revenue, 
        payout,
        impressions,
        approvedImpressions,
        rejectedImpressions,
        floor((approvedImpressions / impressions) * 100, 1) as perApprovedImpressions,
        floor((rejectedImpressions / impressions) * 100, 1) as perRejectedImpressions,       
        floor((revenue / impressions * 1000), 6) as eCPM,
        floor((responses / requests * 100), 6) as fillRate,
        floor((impressions / responses * 100), 6) as winRate,
        floor(revenue - payout, 6) as profit
      FROM (
      SELECT 
        siteId,
        siteDomain,
        toUInt32(countMerge(amount)) as requests 
      FROM dsp.${bidreqTable} 
      WHERE createdDate between '${startDate}' and '${endDate}' and siteId!='' ${campaignCondition} ${isFeed}
      GROUP by siteId, siteDomain
      ORDER BY requests desc) as siteIds
      
      LEFT JOIN (
       SELECT 
        toUInt32(countMerge(amount)) as responses,
        siteId,
        siteDomain
      FROM dsp.${bidresTable} 
      WHERE createdDate between '${startDate}' and '${endDate}' and siteId!='' ${where} ${isFeed}
      GROUP BY siteId, siteDomain) as responses
      ON siteIds.siteId = responses.siteId AND siteIds.siteDomain = responses.siteDomain
      
      LEFT JOIN
      (select
        toInt32(countMerge(amount)) as impressions,
        toInt32(countMergeIf(amount, status='REJECTED')) as rejectedImpressions,
        toInt32(countMergeIf(amount, status='APPROVED')) as approvedImpressions,
        floor(sumMergeIf(sumPrice, status='APPROVED'), 6) as revenue, 
        floor(sumMergeIf(sumPayout, status='APPROVED'), 6) as payout,
        siteId,
        siteDomain
      from dsp.${IMP_COUNTER_SITE}
      where createdDate between '${startDate}' and '${endDate}' and siteId!='' and campaignId>0 ${where} 
      GROUP BY siteId, siteDomain) as impressions
      ON siteIds.siteId = impressions.siteId AND siteIds.siteDomain = impressions.siteDomain
            
      ORDER BY impressions desc`;
     log.debug(`Report sites query:${query}`);
  const count = `
      select count(DISTINCT siteId, siteDomain) as count from dsp.${bidreqTable} 
      where createdDate between '${startDate}' and '${endDate}' and siteId!='' ${campaignCondition}`;

  return [query, count];
};

export const getReportsSitesPubSql2 = (startDate, endDate, filters) => {
  const where = `createdDate between '${startDate}' and '${endDate}' and siteId!='' and wlid='${wlid}' ${generateSqlWhere(filters)}`;
  const {limit, offset} = filters;
  const query = `
    SELECT
      siteIds.siteId as siteidLabel,
      siteIds.siteDomain as sitedomainLabel,
      requests, 
      responses, 
      revenue, 
      payout,
      impressions,
      approvedImpressions,
      rejectedImpressions,
      floor((approvedImpressions / impressions) * 100, 1) as perApprovedImpressions,
      floor((rejectedImpressions / impressions) * 100, 1) as perRejectedImpressions,       
      floor((revenue / impressions * 1000), 6) as eCPM,
      floor((responses / requests * 100), 6) as fillRate,
      floor((impressions / responses * 100), 6) as winRate,
      floor(revenue - payout, 6) as profit
    FROM (
    SELECT 
      siteId,
      siteDomain,
      toUInt32(countMerge(amount)) as requests 
    FROM dsp.${BIDREQ_COUNTER_SITE} 
    WHERE ${where}
    GROUP by siteId, siteDomain
    ORDER BY requests desc) as siteIds
    
    LEFT JOIN (
     SELECT 
      toUInt32(countMerge(amount)) as responses,
      siteId,
      siteDomain
    FROM dsp.${BIDRES_COUNTER_SITE} 
    WHERE ${where}
    GROUP BY siteId, siteDomain) as responses
    ON siteIds.siteId = responses.siteId AND siteIds.siteDomain = responses.siteDomain
    
    LEFT JOIN
    (select
      toInt32(countMerge(amount)) as impressions,
      toInt32(countMergeIf(amount, status='REJECTED')) as rejectedImpressions,
      toInt32(countMergeIf(amount, status='APPROVED')) as approvedImpressions,
      floor(sumMergeIf(sumPrice, status='APPROVED'), 6) as revenue, 
      floor(sumMergeIf(sumPayout, status='APPROVED'), 6) as payout,
      siteId,
      siteDomain
    from dsp.${IMP_COUNTER_SITE}
    where ${where} 
    GROUP BY siteId, siteDomain) as impressions
    ON siteIds.siteId = impressions.siteId AND siteIds.siteDomain = impressions.siteDomain
          
    ORDER BY impressions desc`;
  const count = `select count(DISTINCT siteId, siteDomain) as count from dsp.${BIDREQ_COUNTER_SITE} where ${where}`;

  return [query, count];
};

export const getReportsCreativesSizes2 = (startDate, endDate, filters, campaignsIds, role, id) => {
  const entity = filters.reportsType === 'CREATIVES' ? 'crId' : 'size';
  let where = `and wlid='${wlid}' and ${entity}!='' ${generateSqlWhere(filters)}`;
  const {limit, offset} = filters;
  let bidreqTable = BIDREQ_COUNTER_SIZE_CRID_CAMPAIGN;
  let bidresTable = BIDRES_COUNTER_SIZE_CRID;
  if (role === roles.ADVERTISER) {
    const campaigns = !_.isEmpty(filters.selectedCampaign)? filters.selectedCampaign : campaignsIds;
    const adtype = !_.isEmpty(filters.selectedAdType)? `and adType in (${filters.selectedAdType})`:'';
    where = `and wlid='${wlid}' and ${entity}!='' and campaignId in (${campaigns}) ${adtype}`;
    bidreqTable = BIDREQ_COUNTER_SIZE_CRID_CAMPAIGN;
    bidresTable = BIDRES_COUNTER_SIZE_CRID;
  } else if (role === roles.PUBLISHER) {
    where += ` and publisherId=${id}`;
    bidreqTable = BIDREQ_COUNTER_SUBID;
    bidresTable = BIDRES_COUNTER_SUBID;
  }
  let isFeed = '';
  if (role !== PUBLISHER) {
    isFeed = '';
  }

  const query = `SELECT
        requests.${entity} as ${entity},
        requests, 
        responses, 
        impressions.revenue + clicks.revenue as revenue,
        impressions.payout + clicks.payout as payout,
        clicks,
        impressions,
        approvedImpressions,
        floor((approvedImpressions / impressions) * 100, 1) as perApprovedImpressions,
        floor((revenue / impressions * 1000), 6) as eCPM,
        floor((clicks / impressions * 100), 6) as ctr,
        floor((responses / requests * 100), 6) as bidRate,
        floor((impressions / requests * 100), 6) as fillRate,
        floor((impressions / responses * 100), 6) as winRate, 
        floor(revenue - payout, 6) as profit
      FROM (
        SELECT 
          ${entity},
          toUInt32(countMerge(amount)) as requests 
        FROM dsp.${bidreqTable} 
        WHERE createdDate between '${startDate}' and '${endDate}' ${where} ${isFeed}
        GROUP by ${entity}
        ORDER BY requests desc) as requests
      LEFT JOIN (
       SELECT 
        toUInt32(countMerge(amount)) as responses,
        ${entity}
       FROM dsp.${bidresTable} 
       WHERE createdDate between '${startDate}' and '${endDate}' ${where} ${isFeed}
       GROUP BY ${entity}) as responses
      ON requests.${entity} = responses.${entity}
      LEFT JOIN (
        SELECT
          toInt32(countMerge(amount)) as impressions,
          toInt32(countMergeIf(amount, status='REJECTED')) as rejectedImpressions,
          toInt32(countMergeIf(amount, status='APPROVED')) as approvedImpressions,
          floor(sumMergeIf(sumPrice, status='APPROVED'), 6) as revenue, 
          floor(sumMergeIf(sumPayout, status='APPROVED'), 6) as payout,
          ${entity}
        FROM dsp.${IMP_COUNTER_SIZE_CRID}
        WHERE createdDate between '${startDate}' and '${endDate}' and campaignId>0 ${where} 
        GROUP BY ${entity}) as impressions
      ON requests.${entity} = impressions.${entity}
      LEFT JOIN (
        SELECT
          toInt32(countMerge(amount)) as clicks,
          floor(sumMergeIf(sumPrice, status='APPROVED'), 6) as revenue, 
          floor(sumMergeIf(sumPayout, status='APPROVED'), 6) as payout,
          ${entity}
      FROM dsp.${CLICK_COUNTER_SIZE_CRID}
      WHERE createdDate between '${startDate}' and '${endDate}' and campaignId>0 ${where} 
      GROUP BY ${entity}) as clicks
      ON requests.${entity} = clicks.${entity}
      ORDER BY impressions desc, requests desc`;

  log.debug(`size query:${query}`);
  const count = `select count(DISTINCT ${entity}) as count from dsp.${bidreqTable} 
      where createdDate between '${startDate}' and '${endDate}' ${where} ${isFeed}`;

  return [query, count];
};

export const getReportsPubNoMatchSql = (filters) => {
  const where = `and wlid='${wlid}' ${generateSqlWhere(filters)}`;
  const query = `
        SELECT 
          publisherId as pid,
          campaignId as cid,
          toUInt32(sumIf(count, reason='totalRequests')) as requests,
          toUInt32(sumIf(count, reason!='totalRequests')) as totalNoMatch,
          floor((totalNoMatch / requests) * 100, 2) as percentNoMatch,
          toUInt32(sumIf(count, reason='blacklisted')) as blacklisted,
          floor((blacklisted / totalNoMatch) * 100, 2) as percentBlacklisted,
          toUInt32(sumIf(count, reason='bidFloor')) as bidFloor,
          floor((bidFloor / totalNoMatch) * 100, 2) as percentBidFloor,
          toUInt32(sumIf(count, reason='trafficType')) as trafficType,
          floor((trafficType / totalNoMatch) * 100, 2) as percentTrafficType,
          toUInt32(sumIf(count, reason='geo')) as geo,
          floor((geo / totalNoMatch) * 100, 2) as percentGeo,          
          toUInt32(sumIf(count, reason='cat')) as category,
          floor((category / totalNoMatch) * 100, 2) as percentCategory,         
          toUInt32(sumIf(count, reason='deviceType')) as deviceType,
          floor((deviceType / totalNoMatch) * 100, 2) as percentDeviceType,
          toUInt32(sumIf(count, reason='platform')) as platform,
          floor((platform / totalNoMatch) * 100, 2) as percentPlatform,
          toUInt32(sumIf(count, reason='minOS')) as minOS,
          floor((minOS / totalNoMatch) * 100, 2) as percentMinOS,
          toUInt32(sumIf(count, reason='maxOS')) as maxOS,
          floor((maxOS / totalNoMatch) * 100, 2) as percentMaxOS,
          toUInt32(sumIf(count, reason='size')) as size,
          floor((size / totalNoMatch) * 100, 2) as percentSize,
          toUInt32(sumIf(count, reason in ('ifa', 'gdpr', 'coppa', 'bundle', 'siteId', 'subId'))) as requiredParams,
          floor((requiredParams / totalNoMatch) * 100, 2) as percentRequiredParams,
          toUInt32(sumIf(count, reason='connection')) as connectionType,
          floor((connectionType / totalNoMatch) * 100, 2) as percentConnectionType,
          toUInt32(sumIf(count, reason='carrier')) as carrier,
          floor((carrier / totalNoMatch) * 100, 2) as percentCarrier,
          toUInt32(sumIf(count, reason='browser')) as browser,
          floor((browser / totalNoMatch) * 100, 2) as percentBrowser,
          toUInt32(sumIf(count, reason='ln')) as language,
          floor((language / totalNoMatch) * 100, 2) as percentLanguage,
          toUInt32(sumIf(count, reason='age')) as age,
          floor((age / totalNoMatch) * 100, 2) as percentAge,
          toUInt32(sumIf(count, reason='gender')) as gender,
          floor((gender / totalNoMatch) * 100, 2) as percentGender          
        FROM dsp.${CAMPAIGN_NOMATCH_COUNTER} 
        WHERE createdDate >='${filters.startDate}' and createdDate <= '${filters.endDate}' and campaignId>0 ${where}
        GROUP BY publisherId, campaignId
        ORDER BY percentNoMatch desc
      `;
  const count = `
      SELECT count(DISTINCT publisherId, campaignId) as count
      FROM dsp.${CAMPAIGN_NOMATCH_COUNTER} 
      WHERE createdDate >='${filters.startDate}' and createdDate <= '${filters.endDate}' and campaignId>0 ${where}
    `;

  return [query, count];
};

export const getReportsOsSql2 = (startDate, endDate, filters, campaignIds, role, id) => {
  const {limit, offset} = filters;
  let where;
  if(role === roles.ADVERTISER){
     const {selectedPublisher, selectedCampaign} = filters;
     const campaigns = !_.isEmpty(selectedCampaign) ? selectedCampaign: campaignIds;
     where = `createdDate between '${startDate}' and '${endDate}' and wlid='${wlid}' and os!='' ${!_.isEmpty(selectedPublisher)? `and publisherId in (${selectedPublisher})`:''} and campaignId in (${campaigns})`;
  } else {
    if (filters.selectedCampaign) {
      delete filters.selectedAdvertiser;
    }
    where = `createdDate between '${startDate}' and '${endDate}' and wlid='${wlid}' and os!='' ${generateSqlWhere(filters)}`;

  }


    const bidreqTable = BIDREQ_COUNTER_OS_CAMPAIGN;
    const bidresTable = BIDRES_COUNTER_OS_CAMPAIGN;

    const query = `SELECT
        oss.os as os,
        requests, 
        responses, 
        impressions.revenue + clicks.revenue as revenue,
        impressions.payout + clicks.payout as payout,
        impressions,
        approvedImpressions,
        rejectedImpressions,
        clicks,
        floor((approvedImpressions / impressions) * 100, 1) as perApprovedImpressions,
        floor((rejectedImpressions / impressions) * 100, 1) as perRejectedImpressions,       
        floor((revenue / impressions * 1000), 6) as eCPM,
        floor((clicks / impressions * 100), 6) as ctr,
        floor((responses / requests * 100), 6) as fillRate,
        floor((impressions / responses * 100), 6) as winRate, 
        floor(revenue - payout, 6) as profit
      FROM (
        SELECT 
          os,
          toUInt32(countMerge(amount)) as requests 
        FROM dsp.${bidreqTable} 
        WHERE ${where} and campaignId>0
        GROUP by os
        ORDER BY requests desc) as oss
      LEFT JOIN (
       SELECT 
        toUInt32(countMerge(amount)) as responses,
        os
       FROM dsp.${bidresTable} 
       WHERE ${where} and campaignId>0
       GROUP BY os) as responses
      ON oss.os = responses.os
      LEFT JOIN (
        SELECT
          toInt32(countMerge(amount)) as impressions,
          toInt32(countMergeIf(amount, status='REJECTED')) as rejectedImpressions,
          toInt32(countMergeIf(amount, status='APPROVED')) as approvedImpressions,
          floor(sumMergeIf(sumPrice, status='APPROVED'), 6) as revenue, 
          floor(sumMergeIf(sumPayout, status='APPROVED'), 6) as payout,
          os
        FROM dsp.${IMP_COUNTER_OS}
        WHERE ${where} and campaignId>0
        GROUP BY os) as impressions
      ON oss.os = impressions.os
      LEFT JOIN (
        SELECT
          toInt32(countMerge(amount)) as clicks,
          floor(sumMergeIf(sumPrice, status = 'APPROVED'), 6) as revenue, 
          floor(sumMergeIf(sumPayout, status = 'APPROVED'), 6) as payout,
          os
      FROM dsp.${CLICK_COUNTER_OS}
      WHERE ${where} and campaignId>0
      GROUP BY os) as clicks
      ON oss.os = clicks.os
      ORDER BY impressions desc, requests desc`;
    log.debug(`OS query:${query}`);
    const count = `select count(DISTINCT os) as count from dsp.${bidreqTable} where ${where} and campaignId>0`;

    return [query, count];
};

// Traffic statistics

export const trafficStatisticsAdvertiserSql = (advertiserId, interval) => {
  let strInterval = ``;
  interval.map((item) => strInterval += `'${item}',`);
  strInterval = strInterval.slice(0, strInterval.length - 1);

  const query = `
    select 
      t1.createdDate as date,
      bidrequests,
      bidresponses,
      impressions,
      clicks,
      t3.spent + t5.spent as spent,
      floor((clicks / impressions * 100), 2) as ctr,
      floor((conversions / clicks * 100), 2) as cr,
      floor((bidresponses / bidrequests * 100), 2) as fillRate,
      floor((impressions / bidresponses * 100), 2) as winRate
     from (
      select 
        createdDate,
        toInt32(countMerge(amount)) as bidrequests
      from dsp.${BIDREQ_COUNTER_DAILY_ADVERTISER} 
      where createdDate in (${strInterval}) and wlid='${wlid}' and advertiserId = ${advertiserId}
      group by createdDate
    ) as t1 
    left join (
      select 
        createdDate,
        toInt32(countMerge(amount)) as bidresponses
      from dsp.${BIDRES_COUNTER_DAILY_ADVERTISER} 
      where createdDate in (${strInterval}) and wlid='${wlid}' and advertiserId = ${advertiserId}
      group by createdDate
    ) as t2
    on t1.createdDate = t2.createdDate
    left join (
      select 
        createdDate, 
        toInt32(countMerge(amount)) as impressions,
        floor(sumMergeIf( sumPrice, status='APPROVED' ), 2) as spent
      from dsp.${IMP_COUNTER_DAILY}
      where createdDate in (${strInterval}) and wlid='${wlid}' and advertiserId = ${advertiserId}
      group by createdDate
    ) as t3
    on t1.createdDate = t3.createdDate
    left join (
      select createdDate, toInt32(count()) as conversions
      from dsp.conversions_local_v2 
      where createdDate in (${strInterval}) and wlid='${wlid}' and advertiserId = ${advertiserId}
      group by createdDate
    ) as t4
    on t1.createdDate = t4.createdDate
    left join (
      select 
        createdDate, 
        toInt32(countMerge(amount)) as clicks,
        floor(sumMergeIf( sumPrice, status = 'APPROVED'), 2) as spent
      from dsp.${CLICK_COUNTER_DAILY} 
      where createdDate in (${strInterval}) and wlid='${wlid}' and advertiserId = ${advertiserId}
      group by createdDate
    ) as t5
    on t1.createdDate = t5.createdDate
   `;
  return query;
};

export const trafficStatisticsPublisherSql = (publisherId, interval) => {
  let strInterval = ``;
  interval.map((item) => strInterval+=`'${item}',`);
  strInterval = strInterval.slice(0, strInterval.length -1);

  const query = `
    select 
      t1.createdDate as date,
      bidrequests,
      bidresponses,
      impressions,
      clicks,
      t3.payout + t5.payout as payout,
      floor(if (impressions = 0, 0, clicks / impressions * 100), 2) as ctr,
      floor(if (clicks = 0, 0, conversions / clicks * 100), 2) as cr,
      floor(if (bidrequests = 0, 0, bidresponses / bidrequests * 100), 2) as fillRate,
      floor(if (bidrequests = 0, 0, impressions / bidresponses * 100), 2) as winRate
     from (
      select 
        createdDate,
        toInt32(countMerge(amount)) as bidrequests
      from dsp.${BIDREQ_COUNTER_DAILY} 
      where createdDate in (${strInterval}) and wlid='${wlid}' and publisherId = ${publisherId}
      group by createdDate
    ) as t1 
    left join (
      select 
        createdDate,
        toInt32(countMerge(amount)) as bidresponses
      from dsp.${BIDRES_COUNTER_DAILY} 
      where createdDate in (${strInterval}) and wlid='${wlid}' and publisherId = ${publisherId}
      group by createdDate
    ) as t2
    on t1.createdDate = t2.createdDate
    left join (
      select 
        createdDate, 
        toInt32(countMerge(amount)) as impressions,
        floor(sumMergeIf( sumPayout, status='APPROVED' ), 2) as payout
      from dsp.${IMP_COUNTER_DAILY}
      where createdDate in (${strInterval}) and wlid='${wlid}' and publisherId = ${publisherId}
      group by createdDate
    ) as t3
    on t1.createdDate = t3.createdDate
    left join (
      select createdDate, toInt32(count()) as conversions
      from dsp.conversions_local_v2 
      where createdDate in (${strInterval}) and wlid='${wlid}' and publisherId = ${publisherId}
      group by createdDate
    ) as t4
    on t1.createdDate = t4.createdDate
    left join (
      select 
        createdDate, 
        toInt32(countMerge(amount)) as clicks,
        floor(sumMergeIf( sumPayout, status ='APPROVED'), 2) as payout
      from dsp.${CLICK_COUNTER_DAILY} 
      where createdDate in (${strInterval}) and wlid='${wlid}' and publisherId = ${publisherId}
      group by createdDate
    ) as t5
    on t1.createdDate = t5.createdDate
   `;

  return query;
};

export const getSummaryTodayPublisherSql = (publisherId) => {
  const thisMonthStart = dateUtils.startOf('month', 0, 'YYYY-MM-DD');
  const thisMonthEnd = dateUtils.endOf('month', 0, 'YYYY-MM-DD');

  const lastMonthStart = dateUtils.startOf('month', -1, 'YYYY-MM-DD');
  const lastMonthEnd = dateUtils.endOf('month', -1, 'YYYY-MM-DD');

  const query = `
    SELECT 
      toInt32(summary.todayImpressions) as todayImpressions, 
      toInt32(summary.todayClicks) as todayClicks, 
      toInt32(summary.todayConversions) as todayConversions,
      summary.todayRevenue,
      summary.thisMonthRevenue,
      summary.lastMonthRevenue,
      floor( if(todayImpressions = 0, 0, todayClicks / todayImpressions * 100), 6 ) as todayCTR,
      floor( if(todayResponses = 0, 0, todayImpressions / todayResponses * 100), 6 ) as todayWinRate,
      floor( if(todayClicks = 0, 0, todayConversions / todayClicks * 100), 6 ) as todayCr
    FROM (
      SELECT 
        (SELECT countMerge(amount) FROM dsp.${IMP_COUNTER_DAILY} WHERE wlid='${wlid}' and publisherId=${publisherId} and status='APPROVED' and createdDate=today() and adType!='PUSH')
        +
        (SELECT countMerge(amount) FROM dsp.${IMP_COUNTER_DAILY} WHERE wlid='${wlid}' and publisherId=${publisherId} and status='APPROVED' and createdDate=today() and adType='PUSH' and viewType='icon') 
          AS todayImpressions,
          
      (SELECT count() FROM dsp.${BIDRES_COUNTER_DAILY} WHERE wlid='${wlid}' and publisherId=${publisherId} and createdDate=today())    
        AS todayResponses,
         
      (SELECT countMerge(amount) FROM dsp.${CLICK_COUNTER_DAILY} WHERE wlid='${wlid}' and publisherId=${publisherId} and status='APPROVED' and createdDate=today()) 
        AS todayClicks,
      
      (SELECT count() FROM dsp.conversions_local_v2 WHERE wlid='${wlid}' and publisherId=${publisherId} and status='APPROVED' and createdDate=today()) 
        AS todayConversions,
        
      (SELECT sumMerge(sumPayout) FROM dsp.${IMP_COUNTER_DAILY} WHERE wlid='${wlid}' and publisherId=${publisherId} and status='APPROVED' and createdDate=today())
      + 
      (SELECT sumMerge(sumPayout) FROM dsp.${CLICK_COUNTER_DAILY} WHERE wlid='${wlid}' and publisherId=${publisherId} and status='APPROVED' and createdDate=today())
      + 
      (SELECT sum(payout) FROM dsp.conversions_local_v2 WHERE wlid='${wlid}' and publisherId=${publisherId} and status='APPROVED' and createdDate=today())
      + 
      (SELECT sum(payout) FROM dsp.wins_local_v3 WHERE wlid='${wlid}' and publisherId=${publisherId} and status='APPROVED' and createdDate=today())
       AS todayRevenue,
      
      (SELECT sumMerge(sumPayout) FROM dsp.${IMP_COUNTER_DAILY} WHERE wlid='${wlid}' and publisherId=${publisherId} and status='APPROVED' and createdDate between '${thisMonthStart}' and '${thisMonthEnd}')
      + 
      (SELECT sumMerge(sumPayout) FROM dsp.${CLICK_COUNTER_DAILY} WHERE wlid='${wlid}' and publisherId=${publisherId} and status='APPROVED' and createdDate between '${thisMonthStart}' and '${thisMonthEnd}')
      + 
      (SELECT sum(payout) FROM dsp.conversions_local_v2 WHERE wlid='${wlid}' and publisherId=${publisherId} and status='APPROVED' and createdDate between '${thisMonthStart}' and '${thisMonthEnd}')
      + 
      (SELECT sum(payout) FROM dsp.wins_local_v3 WHERE wlid='${wlid}' and publisherId=${publisherId} and status='APPROVED' and createdDate between '${thisMonthStart}' and '${thisMonthEnd}'
      ) AS thisMonthRevenue,
      
      (SELECT sumMerge(sumPayout) FROM dsp.${IMP_COUNTER_DAILY} WHERE wlid='${wlid}' and publisherId=${publisherId} and status='APPROVED' and createdDate between '${lastMonthStart}' and '${lastMonthEnd}')
      + 
      (SELECT sumMerge(sumPayout) FROM dsp.${CLICK_COUNTER_DAILY} WHERE wlid='${wlid}' and publisherId=${publisherId} and status='APPROVED' and createdDate between '${lastMonthStart}' and '${lastMonthEnd}')
      + 
      (SELECT sum(payout) FROM dsp.conversions_local_v2 WHERE wlid='${wlid}' and publisherId=${publisherId} and status='APPROVED' and createdDate between '${lastMonthStart}' and '${lastMonthEnd}')
      + 
      (SELECT sum(payout) FROM dsp.wins_local_v3 WHERE wlid='${wlid}' and publisherId=${publisherId} and status='APPROVED' and createdDate between '${lastMonthStart}' and '${lastMonthEnd}')
       AS lastMonthRevenue
    ) AS summary`;

  return query;
};

export const getSummaryYesterdayPublisherSql = (publisherId) => {
  const query = `
    SELECT 
      toInt32(summary.yesterdayImpressions) as yesterdayImpressions, 
      toInt32(summary.yesterdayClicks) as yesterdayClicks, 
      toInt32(summary.yesterdayConversions) as yesterdayConversions,
      summary.yesterdayRevenue,
      floor( if(yesterdayImpressions = 0, 0, yesterdayClicks / yesterdayImpressions * 100), 6 ) as yesterdayCTR,
      floor( if(yesterdayResponses = 0, 0, yesterdayImpressions / yesterdayResponses * 100), 6 ) as yesterdayWinRate,
      floor( if(yesterdayClicks = 0, 0, yesterdayConversions / yesterdayClicks * 100), 6 ) as yesterdayCr
    FROM (
      SELECT 
        (SELECT countMerge(amount) FROM dsp.${IMP_COUNTER_DAILY} WHERE wlid='${wlid}' and publisherId=${publisherId} and status='APPROVED' and createdDate=yesterday() and adType!='PUSH')
        +
        (SELECT countMerge(amount) FROM dsp.${IMP_COUNTER_DAILY} WHERE wlid='${wlid}' and publisherId=${publisherId} and status='APPROVED' and createdDate=yesterday() and adType='PUSH' and viewType='icon') 
          AS yesterdayImpressions,
          
      (SELECT countMerge(amount) FROM dsp.${CLICK_COUNTER_DAILY} WHERE wlid='${wlid}' and publisherId=${publisherId} and status='APPROVED' and createdDate=yesterday()) 
        AS yesterdayClicks,
      
      (SELECT count() FROM dsp.conversions_local_v2 WHERE wlid='${wlid}' and publisherId=${publisherId} and status='APPROVED' and createdDate=yesterday()) 
        AS yesterdayConversions,
        
      (SELECT count() FROM dsp.${BIDRES_COUNTER_DAILY} WHERE wlid='${wlid}' and publisherId=${publisherId} and createdDate=yesterday())    
        AS yesterdayResponses,
        
      (SELECT sumMerge(sumPayout) FROM dsp.${IMP_COUNTER_DAILY} WHERE wlid='${wlid}' and publisherId=${publisherId} and status='APPROVED' and createdDate=yesterday())
      + 
      (SELECT sumMerge(sumPayout) FROM dsp.${CLICK_COUNTER_DAILY} WHERE wlid='${wlid}' and publisherId=${publisherId} and status='APPROVED' and createdDate=yesterday())
      + 
      (SELECT sum(payout) FROM dsp.conversions_local_v2 WHERE wlid='${wlid}' and publisherId=${publisherId} and status='APPROVED' and createdDate=yesterday())
      + 
      (SELECT sum(payout) FROM dsp.wins_local_v3 WHERE wlid='${wlid}' and publisherId=${publisherId} and status='APPROVED' and createdDate=yesterday())
       AS yesterdayRevenue
    ) AS summary`;

  return query;
};

export const getReportsImpressionsSql = (startDate, endDate, limit, offset, params) => {
  let where = ` where createdDate between '${startDate}' and '${endDate}'`;
  const {selectedAdvertiser, selectedPublisher, selectedCampaign} = params;
  forOwn(params, (value, key) => {
    if (!value.length) return;
    switch (key) {
      case 'selectedAdvertiser': {
        where += ` and advertiserId in(${selectedAdvertiser})`;
        break;
      }
      case 'selectedPublisher': {
        where += ` and publisherId in(${selectedPublisher})`;
        break;
      }
    }
  });
  if (selectedCampaign !== '' || !selectedCampaign.length) {
    if (selectedCampaign && selectedCampaign.length) {
      where += ` and campaignId in(${selectedCampaign})`;
    }
  }

  let query = `select * from dsp.${IMP_COUNTER_DAILY}
       ${where} and wlid='${wlid}' and isFeed=0
       order by createdAt DESC 
       limit ${limit} offset ${offset}`;

  const count = `select (select count() from dsp.${IMP_COUNTER_DAILY}${where} and wlid='${wlid}') as count`;

  return [query, count];
};


export const getReportsAppsCSVSql = (startDate, endDate, limit, offset) => {
  const q = `select
  appIds.appId as appidLabel, appName, appBundle, publisherId, requests, responses, bidFloor, floor((revenue / impressions * 1000), 6) as eCPM,
  impressions, 
  floor((responses / requests * 100), 6) as fillRate,
  floor((impressions / responses * 100), 6) as winRate, 
  clicks,  floor((clicks / responses * 100), 6) as ctr,
  revenue, payout, floor((revenue - payout), 4) as profit
  FROM
  (select appId, appName, appBundle, publisherId, floor(avgMerge(avgBidfloor), 6) as bidFloor, 
  toInt32(countMerge(amount)) as requests
  FROM dsp.bidrequests_${bidReqCounterApps} 
  WHERE date between '${startDate}' and '${endDate}' and wlid='${wlid}'
  GROUP by appId, appName, appBundle, publisherId
  limit ${limit} offset ${offset}) as appIds
  LEFT JOIN
  (select toInt32(count()) as responses, appId, publisherId from dsp.${BIDRESPONSES} 
  where createdDate between '${startDate}' and '${endDate}' and wlid='${wlid}' 
  GROUP BY appId, publisherId) as responses
  ON appIds.appId = responses.appId
  LEFT JOIN
  (select
    toInt32(count()) as impressions,
    sum(price) as revenue,
    sum(payout) as payout,
    appId,
    publisherId
  from dsp.${IMP_COUNTER_DAILY}
  where createdDate between '${startDate}' and '${endDate}' and wlid='${wlid}' AND status='APPROVED' 
  GROUP BY appId, publisherId) as impressions
  ON responses.appId = impressions.appId
  LEFT JOIN
  (select toInt32(count()) as clicks, appId, publisherId
  from dsp.clicks_${versionTable}
  where createdDate between '${startDate}' and '${endDate}' and wlid='${wlid}' 
  GROUP BY appId, publisherId) as clicks
  ON impressions.appId = clicks.appId`;
  return q;
};


export const getGoalsClicksSql = (startDate, endDate, limit, offset, filters) => {
  let where = ` where createdAt between '${startDate}' and '${endDate}'`;

  forOwn(filters, (value, key) => {
    if (!value.length) return;
    switch (key) {
      case 'selectedAdvertiser': {
        where += ` and advertiserId in(${filters.selectedAdvertiser})`;
        break;
      }
      case 'selectedPublisher': {
        where += ` and publisherId in(${filters.selectedPublisher})`;
        break;
      }
      case 'selectedCampaign': {
        where += ` and campaignId in(${filters.selectedCampaign})`;
        break;
      }
    }
  });

  const query = `select * from dsp.clicks_${versionTable} ${where} and wlid='${wlid}' order by createdAt DESC limit ${limit} offset ${offset}`;
  const count = `select (select count() from dsp.clicks_${versionTable}${where}) as count`;
  return [query, count];
};

export const getReportsClicksSql = (startDate, endDate, limit, offset, params) => {
  let where = ` where createdDate='${startDate}' and wlid='${wlid}'`;
  const {selectedAdvertiser, selectedPublisher, selectedCampaign} = params;
  forOwn(params, (value, key) => {
    if (!value.length) return;
    switch (key) {
      case 'selectedAdvertiser': {
        where += ` and advertiserId in(${selectedAdvertiser})`;
        break;
      }
      case 'selectedPublisher': {
        where += ` and publisherId in(${selectedPublisher})`;
        break;
      }
    }
  });

  if (selectedCampaign !== '' || !selectedCampaign.length) {
    if (selectedCampaign) {
      where += ` and campaignId in(${selectedCampaign})`;
    }
  }

  const query = `select * from dsp.clicks_${versionTable}${where} and isFeed=0 order by createdAt DESC limit ${limit} offset ${offset}`;

  const count = `select (select count() from dsp.clicks_${versionTable}${where}) as count`;

  return [query, count];
};

export const getConversionsClicksSql = (startDate, endDate, limit, offset, data) => {
  let where = ` where createdAt between '${startDate}' and '${endDate}' and wlid='${wlid}'`;

  forOwn(data, (value, key) => {
    if (!value) return;
    switch (key) {
      case 'selectedAdvertiser': {
        where += ` and advertiserId=${data.selectedAdvertiser}`;
        break;
      }
      case 'selectedCampaign': {
        where += ` and campaignId=${data.selectedCampaign}`;
        break;
      }
      case 'selectedPublisher': {
        where += ` and publisherId=${data.selectedPublisher}`;
        break;
      }
      case 'selectedCountry': {
        where += ` and geo=${data.selectedCountry}`;
        break;
      }
      case 'selectedCampaignType': {
        where += ` and type=${data.selectedCampaignType}`;
        break;
      }
    }
  });
  const query = `select * from dsp.conversions_${versionTable}${where} and wlid='${wlid}' order by createdAt DESC limit ${limit} offset ${offset}`;
  const count = `select (select count() from dsp.conversions_${versionTable}${where} and wlid='${wlid}') as count`;
  return [query, count];
};
