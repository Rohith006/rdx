import React from 'react'
import classNames from 'classnames'
import _ from 'lodash'
import localization from '../../localization'
import Progressbar from './TopCapBarChart'
import onOutsideElementClick from '../../utils/onOutsideElementClick'

class CapsTop extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      showPeriodDropdown: false,
      showTypeDropdown: false,
      period: localization.dashboard.dropdown.day.toLowerCase(),
      typeLabel: localization.dashboard.dropdown.budget,
      capsRowData: [],
      capsList: [],
    }

    this.togglePeriodDropdown = this.togglePeriodDropdown.bind(this)
    this.toggleTypeDropdown = this.toggleTypeDropdown.bind(this)
    this.setPeriodSelect = this.setPeriodSelect.bind(this)
  }

  componentDidMount() {
    onOutsideElementClick(this.periodDropdown, () => {
      if (this.state.showPeriodDropdown) {
        this.setState({
          showPeriodDropdown: false,
        })
      }
    })
    onOutsideElementClick(this.typeDropdown, () => {
      if (this.state.showTypeDropdown) {
        this.setState({
          showTypeDropdown: false,
        })
      }
    })
  }

  togglePeriodDropdown() {
    this.setState((prevState) => ({
      showPeriodDropdown: !prevState.showPeriodDropdown,
    }))
  }

  toggleTypeDropdown() {
    this.setState((prevState) => ({
      showTypeDropdown: !prevState.showTypeDropdown,
    }))
  }

  setPeriodSelect(period) {
    this.setState({
      period,
    })
    if (period === 'day') {
      this.setState({
        capsList: this.props.capsList.sort(
          (a, b) =>
            (b.day.currentCap / b.day.cap) * 100 -
            (a.day.currentCap / a.day.cap) * 100,
        ),
      })
    } else {
      this.setState({
        capsList: this.props.capsList.sort(
          (a, b) =>
            (b.hour.currentCap / b.day.cap) * 100 -
            (a.hour.currentCap / a.day.cap) * 100,
        ),
      })
    }

    this.togglePeriodDropdown()
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.capsList !== this.props.capsList) {
      this.setState({
        capsList: this.props.capsList.sort(
          (a, b) =>
            (b.day.currentCap / b.day.cap) * 100 -
            (a.day.currentCap / a.day.cap) * 100,
        ),
      })
    }
  }

  render() {
    const { period } = this.state
    const topCapsContainer = classNames({
      'no-data': this.state.capsList.length === 0,
      'card_body text-center': true,
    })
    return (
      <div className="card top_caps" style={{ width: '100%' }}>
        <div className="card_header bordered">
          <div className="subheading_cover">
            <h3 className="subheading">{localization.dashboard.topCaps}</h3>
            <div className="inline-dropdown">
              <div
                ref={(el) => (this.periodDropdown = el)}
                className="dropdown_cover"
              >
                <span className="title">
                  {localization.dashboard.dropdown.period}:
                </span>
                <div
                  className={classNames('dropdown', {
                    opened: this.state.showPeriodDropdown,
                  })}
                >
                  <button
                    onClick={this.togglePeriodDropdown}
                    className="dropdown__button"
                    tabIndex="0"
                    type="button"
                  >
                    <span className="dropdown__button-value">
                      <span  style={{fontSize:'14px',fontWeight:600}}>{_.capitalize(this.state.period)}</span>
                    </span>
                    <span className="dropdown__arrow" />
                  </button>
                  <div className="dropdown__menu">
                    <div className="dropdown__menu-scroll">
                      <div
                        onClick={() =>
                          this.setPeriodSelect(
                            localization.dashboard.dropdown.day.toLowerCase(),
                          )
                        }
                        className="dropdown__item nowrap"
                      >
                        <span className="nowrap">
                          {localization.dashboard.dropdown.day}
                        </span>
                      </div>
                      <div
                        onClick={() =>
                          this.setPeriodSelect(
                            localization.dashboard.dropdown.hour.toLowerCase(),
                          )
                        }
                        className="dropdown__item nowrap"
                      >
                        <span className="nowrap">
                          {localization.dashboard.dropdown.hour}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                ref={(el) => (this.typeDropdown = el)}
                className="dropdown_cover"
              >
                <span className="title">
                  {localization.dashboard.dropdown.type}:
                </span>
                <div
                  className={classNames('dropdown', {
                    opened: this.state.showTypeDropdown,
                  })}
                >
                  <button
                    onClick={this.toggleTypeDropdown}
                    className="dropdown__button"
                    tabIndex="0"
                    type="button"
                  >
                    <span className="dropdown__button-value">
                      <span style={{fontSize:'14px',fontWeight:600}}>{this.state.typeLabel}</span>
                    </span>
                    <span className="dropdown__arrow" />
                  </button>
                  <div className="dropdown__menu">
                    <div className="dropdown__menu-scroll">
                      <div
                        onClick={() =>
                          this.setTypeSelect(
                            0,
                            localization.dashboard.dropdown.budget,
                          )
                        }
                        className="dropdown__item nowrap"
                      >
                        <span className="nowrap">
                          {localization.dashboard.dropdown.budget}
                        </span>
                      </div>
                      <div
                        onClick={() => this.setTypeSelect(1, 'Goal')}
                        className="dropdown__item nowrap disabled"
                      >
                        <span className="nowrap">Goal</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className={topCapsContainer}>
            <Progressbar caps={this.state.capsList} period={period} />
          </div>
        </div>
      </div>
    )
  }
}

export default CapsTop
