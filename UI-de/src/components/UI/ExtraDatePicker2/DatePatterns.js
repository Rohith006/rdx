import React from 'react';
import moment from 'moment';

export default function DatePatterns({onSelectTimeChange, setList, list}) {
  function handlerClick(item) {
    setList(list.map((el) => el.id === item.id ? {...el, isActive: true} : {...el, isActive: false}));
    switch (item.id) {
      case 1:
        onSelectTimeChange(moment(), 'startDate');
        onSelectTimeChange(moment(), 'endDate');
        break;
      case 2:
        onSelectTimeChange(moment().subtract(1, 'day'), 'startDate');
        onSelectTimeChange(moment().subtract(1, 'day'), 'endDate');
        break;
      case 3:
        onSelectTimeChange(moment().subtract(6, 'day'), 'startDate');
        onSelectTimeChange(moment(), 'endDate');
        break;
      case 4:
        onSelectTimeChange(moment().subtract(30, 'day'), 'startDate');
        onSelectTimeChange(moment(), 'endDate');
        break;
      case 5:
        onSelectTimeChange(moment().startOf('month'), 'startDate');
        onSelectTimeChange(moment(), 'endDate');
        break;
      case 6:
        onSelectTimeChange(moment().subtract(1, 'month').startOf('month'), 'startDate');
        onSelectTimeChange(moment().subtract(1, 'month').endOf('month'), 'endDate');
        break;
    }
  }

  return (
    <ul className="period-patterns-list">
      {
        list.map((el) =>
          <li
            onClick={() => handlerClick(el)}
            className={el.isActive ? 'active' : ''}
            key={el.label}>
            {el.label}
          </li>,
        )
      }
    </ul>
  );
}
