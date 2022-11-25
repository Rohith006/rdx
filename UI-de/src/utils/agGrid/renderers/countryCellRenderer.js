import React from 'react';
import Flag from 'flags-react';

export default ({value}) =>
  <span className="country-cell-renderer">
    <span className="country-cell-renderer__image">
      <div>
        <Flag code={value.toString()}/>
        <span className={`flag-icon flag-icon-${value}`}>{value}</span>
      </div>
    </span>
  </span>;
