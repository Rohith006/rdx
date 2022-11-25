import React, {Fragment} from 'react';
import {SvgError} from '../common/Icons';

export const NotFound = () => (
  <Fragment>
    <SvgError/>
    <span>Not Found 404</span>
  </Fragment>
);
