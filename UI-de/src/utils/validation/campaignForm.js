import isUrl from 'is-url';
import localization from '../../localization';

export default function validateForm({
  trackingUrl, enableNotifications, notificationsThreshold, bid,
  cap, dailyBudget, totalBudget, dspImpUrl, minWinRate, bidStep,
  impressionTtl, clickTtl,
}) {
  const errors = {};
  if (trackingUrl && !/\{CLICK_ID\}/gm.test(trackingUrl)) {
    // errors.trackingUrl = localization.validate.macros;
  }
  if (trackingUrl && !isUrl(trackingUrl)) {
    errors.trackingUrl = localization.validate.invalidUrl;
  }
  if (dspImpUrl) {
    if (!isUrl(dspImpUrl)) {
      errors.dspImpUrl = localization.validate.invalidUrl;
    }
  }
  if (enableNotifications && !notificationsThreshold) {
    errors.notificationsThreshold = localization.validate.required;
  }
  if (cap && cap <= 100) {
    errors.cap = localization.validate.mustAtLeastCPMCap;
  }
  if (totalBudget && parseFloat(dailyBudget) > parseFloat(totalBudget)) {
    errors.dailyBudget = localization.validate.lessThanTotalBudget;
  }
  if (minWinRate && (0 > minWinRate || minWinRate > 100)) {
    errors.minWinRate = localization.validate.mustAtPercent;
  }
  if (bidStep && (0 > bidStep || bidStep > bid)) {
    errors.bidStep = localization.validate.mustAtLeastMaxBid;
  }
  if (cap && cap <= 100) {
    errors.cap = localization.validate.mustAtLeastCPMCap;
  }
  if (impressionTtl && impressionTtl < 1 || impressionTtl > 60) {
    errors.impressionTtl = 'Please set the value between 1 to 60';
  }
  if (clickTtl && clickTtl < 1 || clickTtl > 72) {
    errors.clickTtl = 'Please set the value between 1 to 72';
  }
  return errors;
};
