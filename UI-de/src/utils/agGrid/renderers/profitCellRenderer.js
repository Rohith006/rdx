import React from 'react';
import numeral from 'numeral';

export default ({value}) => (
  <span>
    {
      Number(value) ? `$ ${numeral(value).format('0.0000')}` : `$ 0`
    }
  </span>
);
