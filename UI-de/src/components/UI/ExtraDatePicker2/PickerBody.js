import React, {useEffect, useState} from 'react';
import DatePatterns from './DatePatterns';
import SelectPeriodDate from './SelectPeriodDate';
import {periodList} from './Utils';
import {HOURLY} from '../../../constants/reports';

function PickerBody(props) {
  const [list, setList] = useState([]);
  const [reqdUrl , setReqdUrl ] = useState(null)

  useEffect(() => {
    setList(periodList);
    setReqdUrl(window.location.href.split('/')[3])
  }, []);
  return (
    !props.isOpenModal ? <div></div> :
      <div className={reqdUrl === 'reports' ? "dropdown-modal-body2":"dropdown-modal-body"}>
        <div className="right-side">
          <SelectPeriodDate
            setList={setList}
            list={list}
            {...props}
          />
        </div>
      </div>
  );
}

export default PickerBody;
