import React from 'react';
import numeral from 'numeral';

export default ({value}) => (
  <span>
    {
      (!isNaN(value) && numeral(value).format('0,0'))
    }
  </span>
);
