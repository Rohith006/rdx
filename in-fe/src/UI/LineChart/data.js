import moment from "moment";

const lastThirtyDays = [...new Array(31)].map((i, idx) =>
  moment().startOf("day").subtract(idx, "days").format("MMM-DD")
);
// console.log('lastThirtyDays======>', lastThirtyDays)

const Days = lastThirtyDays.reverse();
// console.log('Days======>', Days)

export let data = [
  {
    date: Days[0],
    events: 1,
    bidresponses: 1,
    profiles: 0,
    sessions: 0,
    revenue: 0,
    payout: 0,
    ctr: 0,
    cr: 0,
    fillRate: 100,
    winRate: 0,
    profit: 0,
    spend: 10,
  },
  {
    date: Days[1],
    events: 3949376,
    bidresponses: 915843,
    profiles: 550472,
    sessions: 1636,
    revenue: 104.51,
    payout: 36.22,
    ctr: 0.29,
    cr: 0,
    fillRate: 23.18,
    winRate: 13.93,
    profit: 68.29,
    spend: 15,
  },
  {
    date: Days[2],
    events: 12661038,
    bidresponses: 389389,
    profiles: 182042,
    sessions: 645,
    revenue: 21.77,
    payout: 14.23,
    ctr: 0.35,
    cr: 0,
    fillRate: 3.07,
    winRate: 1.43,
    profit: 7.5399,
    spend: 2,
  },
  {
    date: Days[3],
    events: 12227509,
    bidresponses: 0,
    profiles: 0,
    sessions: 1,
    revenue: 0,
    payout: 0,
    ctr: 0,
    cr: 0,
    fillRate: 0,
    winRate: 0,
    profit: 0,
    spend: 33,
  },
  {
    date: Days[4],
    events: 11488538,
    bidresponses: 0,
    profiles: 0,
    sessions: 1,
    revenue: 0,
    payout: 0,
    ctr: 0,
    cr: 0,
    fillRate: 0,
    winRate: 0,
    profit: 0,
    spend: 18,
  },
  {
    date: Days[5],
    events: 11218937,
    bidresponses: 0,
    profiles: 0,
    sessions: 2,
    revenue: 0,
    payout: 0,
    ctr: 0,
    cr: 0,
    fillRate: 0,
    winRate: 0,
    profit: 0,
    spend: 10,
  },
  {
    date: Days[6],
    events: 10918418,
    bidresponses: 2173525,
    profiles: 1305528,
    sessions: 4297,
    revenue: 239.49,
    payout: 12.77,
    ctr: 0.32,
    cr: 0,
    fillRate: 19.9,
    winRate: 11.95,
    profit: 226.72,
    spend: 40,
  },
  {
    date: Days[7],
    events: 3949376,
    bidresponses: 915843,
    profiles: 550472,
    sessions: 1636,
    revenue: 104.51,
    payout: 36.22,
    ctr: 0.29,
    cr: 0,
    fillRate: 23.18,
    winRate: 13.93,
    profit: 68.29,
    spend: 25,
  },
  {
    date: Days[8],
    events: 2896344,
    bidresponses: 0,
    profiles: 66,
    sessions: 3,
    revenue: 0,
    payout: 0,
    ctr: 4.54,
    cr: 0,
    fillRate: 0,
    winRate: 0,
    profit: 0,
    spend: 55,
  },
  {
    date: Days[9],
    events: 19051836,
    bidresponses: 298344,
    profiles: 139893,
    sessions: 694,
    revenue: 15.69,
    payout: 10.24,
    ctr: 0.49,
    cr: 0,
    fillRate: 1.56,
    winRate: 0.73,
    profit: 5.4499,
    spend: 0,
  },
  {
    date: Days[10],
    events: 13481816,
    bidresponses: 873705,
    profiles: 323125,
    sessions: 1053,
    revenue: 39.07,
    payout: 25.55,
    ctr: 0.32,
    cr: 0,
    fillRate: 6.48,
    winRate: 2.39,
    profit: 13.52,
    spend: 23,
  },
  {
    date: Days[11],
    events: 12567228,
    bidresponses: 627185,
    profiles: 157692,
    sessions: 44,
    revenue: 19.1,
    payout: 12.49,
    ctr: 0.02,
    cr: 0,
    fillRate: 4.99,
    winRate: 1.25,
    profit: 6.61,
    spend: 30,
  },
  {
    date: Days[12],
    events: 5147263,
    bidresponses: 386735,
    profiles: 69318,
    sessions: 0,
    revenue: 8.35,
    payout: 5.46,
    ctr: 0,
    cr: 0,
    fillRate: 7.51,
    winRate: 1.34,
    profit: 2.8899,
    spend: 42,
  },
  {
    date: Days[13],
    events: 56,
    bidresponses: 20,
    profiles: 50,
    sessions: 178,
    revenue: 180,
    payout: 70,
    ctr: 80,
    cr: 50,
    fillRate: 95.23,
    winRate: 76.8,
    profit: 100,
    spend: 8,
  },
  {
    date: Days[14],
    events: 76,
    bidresponses: 20,
    profiles: 50,
    sessions: 130,
    revenue: 120,
    payout: 20,
    ctr: 60,
    cr: 90,
    fillRate: 95.23,
    winRate: 56.8,
    profit: 100,
    spend: 21,
  },
  {
    date: Days[15],
    events: 8,
    bidresponses: 5,
    profiles: 2,
    sessions: 2,
    revenue: 10,
    payout: 0,
    ctr: 100,
    cr: 0,
    fillRate: 62.5,
    winRate: 25,
    profit: 0,
    spend: 32,
  },
  {
    date: Days[16],
    events: 6,
    bidresponses: 5,
    profiles: 2,
    sessions: 2,
    revenue: 0,
    payout: 0,
    ctr: 100,
    cr: 0,
    fillRate: 83.33,
    winRate: 33.33,
    profit: 0,
    spend: 28,
  },
  {
    date: Days[17],
    events: 54,
    bidresponses: 39,
    profiles: 2130,
    sessions: 1798,
    revenue: 0,
    payout: 0,
    ctr: 84.41,
    cr: 0,
    fillRate: 72.22,
    winRate: 3944.44,
    profit: 0,
    spend: 15,
  },
  {
    date: Days[18],
    events: 1,
    bidresponses: 1,
    profiles: 0,
    sessions: 0,
    revenue: 0,
    payout: 0,
    ctr: 0,
    cr: 0,
    fillRate: 100,
    winRate: 0,
    profit: 0,
    spend: 19,
  },
  {
    date: Days[19],
    events: 37688,
    bidresponses: 19798,
    profiles: 0,
    sessions: 0,
    revenue: 0,
    payout: 0,
    ctr: 0,
    cr: 0,
    fillRate: 52.53,
    winRate: 0,
    profit: 0,
    spend: 13,
  },
  {
    date: Days[20],
    events: 11417,
    bidresponses: 10103,
    profiles: 0,
    sessions: 0,
    revenue: 0,
    payout: 0,
    ctr: 0,
    cr: 0,
    fillRate: 88.49,
    winRate: 0,
    profit: 0,
    spend: 24,
  },
  {
    date: Days[21],
    events: 9513626,
    bidresponses: 7656273,
    profiles: 0,
    sessions: 0,
    revenue: 0,
    payout: 0,
    ctr: 0,
    cr: 0,
    fillRate: 80.47,
    winRate: 0,
    profit: 0,
    spend: 3,
  },
  {
    date: Days[22],
    events: 14361,
    bidresponses: 11229,
    profiles: 5,
    sessions: 2,
    revenue: 0,
    payout: 0,
    ctr: 40,
    cr: 0,
    fillRate: 78.19,
    winRate: 0.03,
    profit: 0,
    spend: 1,
  },
  {
    date: Days[23],
    events: 1253710,
    bidresponses: 112083,
    profiles: 6419,
    sessions: 104,
    revenue: 0.03,
    payout: 0.02,
    ctr: 1.62,
    cr: 0,
    fillRate: 8.94,
    winRate: 0.51,
    profit: 0.0099,
    spend: 18,
  },
  {
    date: Days[24],
    events: 4634859,
    bidresponses: 441386,
    profiles: 11831,
    sessions: 0,
    revenue: 0.44,
    payout: 0.29,
    ctr: 0,
    cr: 0,
    fillRate: 9.52,
    winRate: 0.25,
    profit: 0.15,
    spend: 56,
  },
  {
    date: Days[25],
    events: 5377459,
    bidresponses: 108300,
    profiles: 17866,
    sessions: 0,
    revenue: 1.02,
    payout: 0.66,
    ctr: 0,
    cr: 0,
    fillRate: 2.01,
    winRate: 0.33,
    profit: 0.36,
    spend: 63,
  },
  {
    date: Days[26],
    events: 8170415,
    bidresponses: 219032,
    profiles: 46088,
    sessions: 2,
    revenue: 3.33,
    payout: 2.16,
    ctr: 0,
    cr: 0,
    fillRate: 2.68,
    winRate: 0.56,
    profit: 1.17,
    spend: 33,
  },
  {
    date: Days[27],
    events: 6533286,
    bidresponses: 112519,
    profiles: 13637,
    sessions: 3,
    revenue: 1.4,
    payout: 0.91,
    ctr: 0.02,
    cr: 0,
    fillRate: 1.72,
    winRate: 0.2,
    profit: 0.4899,
    spend: 32,
  },
  {
    date: Days[28],
    events: 5943072,
    bidresponses: 108043,
    profiles: 12027,
    sessions: 5,
    revenue: 1.41,
    payout: 0.91,
    ctr: 0.04,
    cr: 0,
    fillRate: 1.81,
    winRate: 0.2,
    profit: 0.4999,
    spend: 43,
  },
  {
    date: Days[29],
    events: 10679915,
    bidresponses: 764859,
    profiles: 196686,
    sessions: 572,
    revenue: 23.04,
    payout: 15.06,
    ctr: 0.29,
    cr: 0,
    fillRate: 7.16,
    winRate: 1.84,
    profit: 7.9799,
    spend: 1,
  },
  {
    date: Days[30],
    events: 13321101,
    bidresponses: 891729,
    profiles: 402801,
    sessions: 1181,
    revenue: 47.57,
    payout: 31.1,
    ctr: 0.29,
    cr: 0,
    fillRate: 6.69,
    winRate: 3.02,
    profit: 16.47,
    spend: 10,
  },
];
