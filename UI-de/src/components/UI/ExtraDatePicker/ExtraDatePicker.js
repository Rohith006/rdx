import React, { Component } from 'react'
import classNames from 'classnames'
import onClickOutside from 'react-onclickoutside'
import PickerBody from './PickerBody'
import Calendar from '../../../../assets/images/icons/calendar.svg'
import Title from './Title'

class ExtraDatePicker extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isOpenModal: false,
    }

    this.toggle = this.toggle.bind(this)
    this.handleClickOutside = this.handleClickOutside.bind(this)
  }

  toggle() {
    this.setState({ isOpenModal: !this.state.isOpenModal })
  }

  handleClickOutside() {
    this.setState({ isOpenModal: false })
  }

  render() {
    return (
      <div style={{ marginRight: '0.6%' }} className="search-cover">
        <div className="dropdown-cover tags-cover">
          <div
            className={classNames(
              'dropdown columns bordered date-picker-wrapper',
              { opened: this.state.isOpenModal },
            )}
          >
            <button
              onClick={this.toggle}
              className="dropdown__button"
              tabIndex="0"
              type="button"
            >
              <Title
                startDate={this.props.startDate}
                endDate={this.props.endDate}
              />
              <div className="dropdown_image">
                <img src={Calendar} />
              </div>
            </button>
            <PickerBody
              {...this.props}
              isOpenModal={this.state.isOpenModal}
              setModal={this.handleClickOutside}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default onClickOutside(ExtraDatePicker)
