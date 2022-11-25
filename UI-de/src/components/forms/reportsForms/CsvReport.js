import React from 'react';
import axios from 'axios';
import fileDownload from 'js-file-download';
import localization from '../../../localization';
import download from '../../../../assets/images/icons/download-button.svg';

const CsvReport = (props) => <img src={download} className="line_download-list" onClick={() => handleClick(props)} />

const configUrl = {
  'PUBLISHERS': 'load/csv-publishers',
  'APPS': 'load/csv-apps',
};

async function handleClick({startDate, endDate, groupBy}) {
  // const {data} = await axios.get(`${configUrl[groupBy]}?startDate=${startDate}&endDate=${endDate}`);
  // fileDownload(data, 'report.csv');
  const host = __INTERNAL_API_URL__;
  const myIframe = document.createElement('iframe');
  myIframe.style.display = 'none';
  myIframe.src = `${host}/${configUrl[groupBy]}?startDate=${startDate}&endDate=${endDate}`;
  document.body.appendChild(myIframe);
};

export default CsvReport;
