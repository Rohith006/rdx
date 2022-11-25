import React from 'react';

export default function adTypeRenderer(params) {
  return (
    <span className={`status active`}>
      {params.valueFormatted}
    </span>
  );
}
