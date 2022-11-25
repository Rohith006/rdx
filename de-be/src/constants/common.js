export const FIRST_PRICE = 'FIRST PRICE';
export const SECOND_PRICE = 'SECOND PRICE';

export const AD_TYPE = {
  BANNER: 'BANNER',
  NATIVE: 'NATIVE',
  VIDEO: 'VIDEO',
  AUDIO:'AUDIO'
};

export const ResponseStatus = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export const inventoryMap = {
  'ALL': 0,
  'IN APP': 1,
  'WEB': 2,
};

export const auctionTypeMap = {
  'ALL': 0,
  '1': 1,
  '2': 2,
};

export const adTypeMap = {
  'ALL': 0,
  'BANNER': 1,
  'NATIVE': 2,
  'VIDEO': 3,
  'AUDIO':4
};

export const protocolMap = {
  'ORTB': 1,
  'XML': 2,
  'JSON': 3,
};

export const paymentModelMap = {
  'CPM': 1,
  'CPC': 2,
  'CPI': 3,
  'CPA': 4,
};

export const filterMap = {
  'ALL': 0,
  'APP': 1,
  'SITE': 2,
  'SUBID': 3,
  'CREATIVEID': 4,
  'DOMAIN': 5,
  'IP': 6,
};
