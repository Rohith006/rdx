import React from 'react';

export default function Search({onChange, value}) {
  return (
    <div className="search-box search_cover">
      <input
        type="text"
        placeholder="Search..."
        className="search-tag"
        value={value}
        onChange={(e) => onChange(e)}/>
    </div>
  );
}
