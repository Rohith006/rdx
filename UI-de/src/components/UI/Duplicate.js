import React from 'react';

export default ({type, width, height, onClick}) => (
  <button onClick={onClick} type={type} style={{width, height}} className="light-blue btn duplicate-btn">Duplicate</button>
);
