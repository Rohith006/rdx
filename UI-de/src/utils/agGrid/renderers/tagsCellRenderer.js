import React from 'react';

export default function TagsCellRenderer(params) {
  let result = '';
  if (!params.value || !params.value.length) {
    return <div>No Labels</div>;
  }
  let name = params.value[0].name;
  if (params.value.length === 1) {
    result = name;
  } else {
    if (name.length >= 5) {
      name = `${name.slice(0, 5)}...`;
    }
    result = `${name} ${params.value.length - 1} + more`;
  }

  return (
    <div className="tag-container-cell">
      <div className="color-box-cell" style={{backgroundColor: params.value[0].color}}></div>
      <div>{result}</div>
    </div>
  );
}
