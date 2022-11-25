import React from 'react';
import numeral from 'numeral';

export default ({value}) => (
  <span>
    {
      Number(value) ? `$ ${numeral(value).format('0.00')}` : `$ 0`
    }
  </span>
);
