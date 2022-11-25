import React, {useState} from 'react';
import classNames from 'classnames';
import onClickOutside from 'react-onclickoutside';
import PickerBody from './PickerBody';
import Title from './Title';

const ExtraDatePicker2 = (props) => {
  const [isOpenModal, setIsOpenModal] = useState(false);

  const toggle = () => {
    setIsOpenModal(!isOpenModal);
  };

  ExtraDatePicker2.handleClickOutside = () => {
    setIsOpenModal(false);
  };

  return (
    <div style={{marginRight: '0.6%'}} className="search-cover">
      <div className="dropdown-cover tags-cover">
        <div
          className={classNames('dropdown columns bordered date-picker-wrapper_style2', {'opened': isOpenModal})}>
          <button
            onClick={() => toggle()}
            className="dropdown__button button2"
            tabIndex="0"
            type="button">
            <Title
              startDate={props.startDate}
            />
            <span className="dropdown__arrow"/>
          </button>
          <PickerBody
            {...props}
            isOpenModal={isOpenModal}
          />
        </div>
      </div>
    </div>
  );
};

const clickOutsideConfig = {
  handleClickOutside: () => ExtraDatePicker2.handleClickOutside,
};

export default onClickOutside(ExtraDatePicker2, clickOutsideConfig);
