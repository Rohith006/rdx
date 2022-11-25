import React from 'react';

export default function(params) {
  return (
    <span className={`status ${params.value.toLowerCase()}`}>
      {params.value.toLowerCase()}
    </span>
  );
}
