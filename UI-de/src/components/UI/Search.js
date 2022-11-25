import React from 'react'
import { SvgSearch } from '../common/Icons'

const Search = ({ onSearch }) => (
  <div className="search_cover" style={{ width: '22%' }}>
    <span className="icon" style={{ top: '50%' }}>
      <SvgSearch />
    </span>
    <input
      type="text"
      placeholder="Search"
      autoComplete="off"
      onChange={onSearch}
    />
  </div>
)

export default Search
