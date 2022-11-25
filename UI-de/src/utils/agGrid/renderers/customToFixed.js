import React from 'react';
export default ({value}) => (
  <span>
    { !value ? 0 :
      (!isNaN(value) && (value + '').split('.')[1] && (value + '').split('.')[1].length > 2) ? parseFloat(value.toFixed(2)) :
        value
    }
  </span>
);
