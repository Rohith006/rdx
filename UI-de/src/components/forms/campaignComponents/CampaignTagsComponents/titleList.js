import React from 'react';

export default function TitleList({titleList}) {
  return (
    <div className="tags-list-title">
      { !titleList.length ? 'Labels' :
        titleList.map((el) => (
          <div className="dropdown-title_wrapper" key={el}>{el}</div>
        ))
      }
    </div>
  );
}
