import axios from 'axios';

// Check http://www.geonames.org for more details
const REGIONS = [
  {
    id: 6255147,
    name: 'Asia',
    countries: ['China', 'India', 'Indonesia', 'Pakistan', 'Bangladesh', 'Japan', 'Philippines', 'Vietnam',
      'Thailand', 'Myanmar', 'South Korea', 'Malaysia', 'Nepal', 'North Korea', 'Sri Lanka',
      'Cambodia', 'Laos', 'Mongolia', 'Bhutan', 'Maldives', 'Brunei',
    ],
  },
  {
    id: 6255151,
    name: 'Oceania',
    countries: ['Australia', 'Fiji', 'Palau', 'Cook Islands', 'Tuvalu', 'Papua New Guinea',
      'French Polynesia', 'Samoa', 'Kiribati', 'Micronesia', 'New Zealand', 'Solomon Islands',
      'Vanuatu', 'New Caledonia', 'Tonga', 'Marshall Islands', 'Northern Mariana Islands',
      'Wallis And Futuna', 'Nauru', 'Tokelau',
    ],
  },
  {id: 6255149, name: 'North America', countries: ['United States']},
];

export const getCountriesByRegion = async () => {
  const region = REGIONS[0];

  try {
    const response = await axios.get(`http://www.geonames.org/childrenJSON?geonameId=${region.id}&callback=listPlaces&style=short`);

    const results = JSON.parse(response.data.split('listPlaces(')[1].split(');')[0]);

    const countries = results.geonames
        .filter((geo) => region.countries.includes(geo.name))
        .map((item) => ({
          geonameId: item.geonameId, code: item.countryCode, name: item.name,
        }));

    const s = await getStatesByCountry(countries[0]);

    return countries;
  } catch (e) {
    console.error(`Can't get countries for region cause: ${e.message}`);
  }
};

export const getStatesByCountry = async (country) => {
  try {
    const response = await axios.get(`http://www.geonames.org/childrenJSON?geonameId=${country.geonameId}&callback=listPlaces&style=medium`);

    const results = JSON.parse(response.data.split('listPlaces(')[1].split(');')[0]);

    const data = {};

    const states = results.geonames
        .forEach((geo) => data[`${[country.code]}-${geo.adminCodes1.ISO3166_2}`] = geo.name);

    const filteredStates = {country: country.name, states};

    return filteredStates;
  } catch (e) {
    console.error(`Can't get states for country cause: ${e.message}`);
  }
};
