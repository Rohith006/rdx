import React, {Fragment, useEffect, useState} from 'react';
import localization from '../../localization';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {NotificationManager} from 'react-notifications';
import {getEndDate, getStartDate} from '../../utils/getPeriodDate';

export default function ApiKeys(props) {
  const [reportUrl, setReportUrl] = useState('');
  useEffect(() => {
    setReportUrl(`${__ADVERTISER_API_URL__}/report/dsp?aid=${props.currentUser.id}&key=${props.currentUser.apiKey || 'YOUR_API_KEY'}&startDate=${getStartDate()}&endDate=${getEndDate()}`);
  }, [props.currentUser, props.currentUser.apiKey]);

  const showNotification = () => NotificationManager.success(localization.integration.copied);
  return (
    props.currentUser.role !== 'ADVERTISER' ? <div></div> :
      <Fragment>
        <div className="form-group" style={{alignItems: 'flex-start'}}>
          <div className="form-group_label" style={{marginTop: '10px'}}>Statistics URL</div>
          <div className="form-group_field" style={{marginBottom: '15px'}}>
            <div className="text-input">
              <input
                style={{margin: '15px 0 0px 0'}}
                value={reportUrl}
                type="text"
                className=""
                placeholder=""
                autoComplete="off"
              />
              <CopyToClipboard
                onCopy={() => showNotification()}
                text={reportUrl}
              >
                <button type="button" className="btn light-blue mt2" >
                  <span className="">{localization.integration.clipboard}</span>
                </button>
              </CopyToClipboard>
            </div>

          </div>
        </div>

      </Fragment>
  );
}
