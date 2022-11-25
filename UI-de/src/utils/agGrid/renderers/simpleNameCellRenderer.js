import React from 'react';
import {Link} from 'react-router-dom';

export default (url, name) => <Link to={url} className="adv-pub-name">{name}</Link>;
