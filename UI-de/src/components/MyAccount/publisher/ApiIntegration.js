import React, {Fragment} from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {TextField} from '../../UI';
import localization from '../../../localization';
import {showSuccessNotification} from '../../../utils/common';
import {getEndDate, getStartDate} from '../../../utils/getPeriodDate';

const ApiIntegration = (props) => {
  const reportUrl = `${__PUBLISHER_API_URL__}/report/ssp?pubId=${props.initialValues.id}&key=${props.initialValues.apiKey || 'YOUR_API_KEY'}&startDate=${getStartDate()}&endDate=${getEndDate()}&subId={SUB_ID}`;

  return (
    <Fragment>
      {/* STATISTIC URL */}
      <span className="subheading mt3">{localization.integration.reportUrl}</span>
      <div className="form-group mt3">
        <div className="form-group_field" style={{marginBottom: '15px'}}>
          <TextField input={{value: reportUrl || '', readOnly: true}} title={localization.integration.statsUrlDesc}/>
          <CopyToClipboard onCopy={() => showSuccessNotification(localization.integration.copied)} text={reportUrl}>
            <button type="button" className="btn light-blue" title="">
              <span>{localization.integration.clipboard}</span>
            </button>
          </CopyToClipboard>
        </div>
      </div>
    </Fragment>
  );
};

export default ApiIntegration;
