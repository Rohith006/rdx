import React, { Fragment } from 'react'
import localization from '../../localization'

const Progressbar = ({ caps, period }) => {
  if (caps.length === 0) {
    return <span>{localization.dashboard.noData}</span>
  }

  return (
    <Fragment>
      {caps.slice(0, 5).map((item, i) => {
        const value = parseFloat(item[period].currentCap)
        const title = item[period].campaignName
        const maxValue = item[period].cap
        const os = item[period].os

        const percent = (value / maxValue) * 100
        const formattedValue = isNaN(percent)
          ? 0
          : Number.isInteger(percent)
          ? percent
          : percent.toFixed(2)

        return (
          <div key={i} className="progress_cover">
            <div className="progress_header">
              <h4 className="title">
                {title} - {os}
              </h4>
              <span className={formattedValue > 100 ? 'value-over' : 'value'}>
                {value}/{maxValue}({formattedValue}%)
              </span>
            </div>
            <div className="progress">
              <div className="progress-value" />
              <div className="progress-bg">
                <div
                  className="progress-bar"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </Fragment>
  )
}

export default Progressbar
