export default (data, keys) => {
  const summ = {};

  keys.forEach((key) => {
    if(key==='size' || key==='os' || key==='geo'){
      return
    }
    if (key === 'bidFloor' || key === 'bidPrice' || key === 'fillRate' || key === 'winRate' 
      || key === 'percentApprovedClicks' || key === 'percentApproved' || key === 'ctr' || key === 'eCPM' 
      || key === 'bidRate' || key === 'percentApprovedIcon' || key === 'percentApprovedImage'
      || key === 'percentDuplicateImpressions' || key === 'percentExpiredImpressions' || key === 'percentMismatchImpressions'
      || key === 'percentRejectedImpressions' || key === 'perApprovedPayout' || key === 'perApprovedImpressions'
      || key === 'perApprovedClicks' || key === 'percentBlacklisted' || key === 'percentErrors'
      || key === 'percentForbidden' || key === 'percentAuctionType' || key === 'percentInventoryType'
      || key === 'percentParse' || key === 'percentAdType' || key === 'percentTmax' || key === 'percentGeo'
      || key === 'percentIp' || key === 'percentGeoMatch' || key === 'percentOs' || key === 'percentServerErrors'
      || key === 'percentBidfloor' || key === 'percentNoMatch'|| key === 'percentBidFloor'
      || key === 'percentTrafficType' || key === 'percentCategory' || key === 'percentDeviceType'
      || key === 'percentPlatform' || key === 'percentMinOS' || key === 'percentMaxOS'
      || key === 'percentSize' || key === 'percentRequiredParams' || key === 'percentCarrier' || key === 'percentBrowser'
      || key === 'percentLanguage' || key === 'percentGender' || key === 'percentAge' || key === 'percentConnectionType' || key === 'perRejectedImpressions'
      || key === 'sizes' || key === 'geos') {
      const sum = data.reduce((prev, next) => Number(!isNaN(prev[key]) ? prev[key] : prev) + Number(!isNaN(next[key]) ? next[key] : next), 0);
      summ[key] = sum / data.length;
      summ[key] = isNaN(summ[key]) ? 0 : summ[key];
      summ[key] = summ[key].toFixed(2);
    } 
    else {
      summ[key] = data.reduce((prev, next) => Number(!isNaN(prev[key]) ? prev[key] : prev) + Number(!isNaN(next[key]) ? next[key] : next), 0);
    }
  });

  return summ;
};
