import React from 'react';

export default ({jsx}) => ({data: {clickId, fs_status, publisherId, advertiserId}}) => {
  let params = {};

  if (clickId) {
    params = {...params, clickId};
  }
  if (fs_status) {
    params = {...params, fs_status};
  }
  if (publisherId) {
    params = {...params, publisherId};
  }
  if (advertiserId) {
    params = {...params, advertiserId};
  }

  const stringifiedParams = JSON.stringify(params);

  return jsx ? <div>{ stringifiedParams }</div> : stringifiedParams;
};
