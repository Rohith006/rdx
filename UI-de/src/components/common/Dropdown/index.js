import React, {Fragment} from 'react';
import classNames from 'classnames';
import {SvgDropdownArrow} from '../Icons';


export default function Dropdown(props) {
  return (
    <Fragment>
      <div onBlur={props.onBlur} className={props.className}>
        <div
          className={props.dropdownClass}
          onMouseDown={props.onMouseDown}>
          <button className="dropdown__button" tabIndex="0" type="button"
            onClick={props.onClick}>
            <span
              className="dropdown__button-value">
              { props.value}
            </span>
            <span className="icon icon dropdown__icon" title="">
              <SvgDropdownArrow/>
            </span>
          </button>
          <div className="dropdown__menu">
            <div className="dropdown__menu-scroll">
              {props.dropdownContentRenderer()}
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

