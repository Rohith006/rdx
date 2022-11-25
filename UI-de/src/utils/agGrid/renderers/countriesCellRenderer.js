import React from 'react';
import Flag from 'flags-react';

const CountriesRenderer = (countries) => {
  if (!countries) {
    return null;
  }
  const imgs = countries.map((country, idx) => {
    return (
      <div className="country-cell-renderer inline" key={idx}>
        <span className="country-cell-renderer__image">
          <div>
            <Flag code={country}/>
            <span className={`flag-icon flag-icon-${country}`}>{country}</span>
          </div>
        </span>
      </div>
    );
  });
  return imgs ? imgs : null;
};
export default CountriesRenderer;
