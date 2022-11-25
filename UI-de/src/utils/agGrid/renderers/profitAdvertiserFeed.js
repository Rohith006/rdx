import React from 'react';
export default ({value}) => <span>{value ? `$ ${parseFloat(Number(value).toFixed(3))} / 0%` : `$ 0`}</span>;
