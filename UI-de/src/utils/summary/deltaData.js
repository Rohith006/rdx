import moment from 'moment';
export const calculateDeltas = (summary) => {
  const {
    todayClicks, yesterdayClicks,
    todayConversions, yesterdayConversions,
    todayImpressions, yesterdayImpressions,
    todayRevenue, yesterdayRevenue,
    todayPayout, yesterdayPayout,
    todayCTR, yesterdayCTR,
    todayCr, yesterdayCr,
    todayWinRate, yesterdayWinRate,
  } = summary;

  function calc(today, yesDay) {
    let data = (1 - today / (yesDay * moment(new Date()).utc().format('HH') / 24)) * 100;
    if (!today) {
      data = 100;
    }
    if (!yesDay) {
      data = -100;
    }
    if (!yesDay && !today) {
      data = 0;
    }
    return data;
  }

  const impDeltaValue = calc(todayImpressions, yesterdayImpressions);
  const ctrDeltaValue = calc(todayCTR, yesterdayCTR);
  const spentDeltaValue = calc(todayRevenue, yesterdayRevenue);
  const earnedDeltaValue = calc(todayPayout, yesterdayPayout);
  const convDeltaValue = calc(todayConversions, yesterdayConversions);
  const clickDeltaValue = calc(todayClicks, yesterdayClicks);
  const crDeltaValue = calc(todayCr, yesterdayCr);
  const winRateDeltaValue = calc(todayWinRate, yesterdayWinRate);

  return {
    deltaClicks: {
      class: clickDeltaValue === 0 ? 'default' : clickDeltaValue < 0 ? 'positive' : 'negative',
      value: Math.abs(clickDeltaValue).toFixed(0),
    },
    deltaConv: {
      class: convDeltaValue === 0 ? 'default' : convDeltaValue < 0 ? 'positive' : 'negative',
      value: Math.abs(convDeltaValue).toFixed(0),
    },
    deltaImp: {
      class: impDeltaValue === 0 ? 'default' : impDeltaValue < 0 ? 'positive' : 'negative',
      value: Math.abs(impDeltaValue).toFixed(0),
    },
    deltaSpent: {
      class: spentDeltaValue === 0 ? 'default' : spentDeltaValue < 0 ? 'positive' : 'negative',
      value: Math.abs(spentDeltaValue).toFixed(0),
    },
    deltaEarned: {
      class: earnedDeltaValue === 0 ? 'default' : earnedDeltaValue < 0 ? 'positive' : 'negative',
      value: Math.abs(earnedDeltaValue).toFixed(0),
    },
    deltaCTR: {
      class: ctrDeltaValue === 0 ? 'default' : ctrDeltaValue < 0 ? 'positive' : 'negative',
      value: Math.abs(ctrDeltaValue).toFixed(0),
    },
    deltaCr: {
      class: crDeltaValue === 0 ? 'default' : crDeltaValue < 0 ? 'positive' : 'negative',
      value: Math.abs(ctrDeltaValue).toFixed(0),
    },
    deltaWinRate: {
      class: winRateDeltaValue === 0 ? 'default' : winRateDeltaValue < 0 ? 'positive' : 'negative',
      value: Math.abs(winRateDeltaValue).toFixed(0)
    }
  };
};
