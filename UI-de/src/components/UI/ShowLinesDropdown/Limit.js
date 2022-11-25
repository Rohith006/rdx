import React from 'react';
import classNames from 'classnames';

const Limit = (props) => {
  const {offset, limit, count} = props;

  const from = count > 0 ? offset + 1 : 0;
  const to = (limit + offset) > count ? count : limit + offset;

  return (
    <div className='dropdown_container show-lines reports-dropdown'>
      <div className="pagination-left">
        {props.changeState && <div className="info-pagination">{`${from}-${to} of ${count}`}</div>}
        <div className={classNames('dropdown', {'opened': props.showLinesDropdown})}>
          <button onClick={props.toggleLinesDropdown}
            className="dropdown__button"
            tabIndex="0"
            type="button">
            <span className="dropdown__button-value">
              Show lines:<span id="page-size" className="lines-label">{props.limit}</span>
            </span>
            <span className="dropdown__arrow"/>
          </button>
          <div className="dropdown__menu" style={{bottom: '32px', top: 'auto'}}>
            <div className="dropdown__menu-scroll">
              {
                [100, 500, 1000, 5000].map((line, index) => (
                  <div onClick={() => props.setLinesSelect(line)} className="dropdown__item nowrap" key={index}>
                    <span className="nowrap">{line}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>);
};

export default Limit;
