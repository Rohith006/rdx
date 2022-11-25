import React, { useEffect, useState } from 'react'
import DatePatterns from './DatePatterns'
import SelectPeriodDate from './SelectPeriodDate'
import { periodList } from './Utils'
import localization from '../../../localization'

function PickerBody(props) {
  const [list, setList] = useState([])
  const [reqdUrl, setReqdUrl] = useState(null)

  useEffect(() => {
    setList(periodList)
    setReqdUrl(window.location.href.split('/')[3])
  }, [])

  return !props.isOpenModal ? (
    <div></div>
  ) : (
    <div
      className={
        reqdUrl === 'reports' ? 'dropdown-modal-body2' : 'dropdown-modal-body'
      }
    >
      <div className="right-side">
        <SelectPeriodDate setList={setList} list={list} {...props} />
      </div>
      {props.showRanges && (
        <div className="left-side">
          <DatePatterns
            list={list}
            setList={setList}
            onSelectTimeChange={props.onSelectTimeChange}
          />
          {/* <div style={{ display: 'flex', margin: '25px 15px' }}>
            <button
              onClick={props.setModal}
              type="button"
              className="btn cancel"
            >
              {localization.forms.cancel}
            </button>
            <button
              onClick={props.setModal}
              type="button"
              className="btn neutral"
              style={{ width: '81px', height: '36px' }}
            >
              Apply
            </button>
          </div> */}
        </div>
      )}
    </div>
  )
}

export default PickerBody
