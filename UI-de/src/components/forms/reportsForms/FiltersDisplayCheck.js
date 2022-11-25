import React, {Component} from 'react';
import PropTypes from 'prop-types';

class FiltersDisplayCheck extends Component {
  constructor(props) {
    super(props);

    this.checkPermissions = this.checkPermissions.bind(this);
  }

  checkPermissions() {
    const {type, exclude, filterTypes} = this.props;

    const isMatched = filterTypes.includes(type);
    return exclude ? !isMatched : isMatched;
  }

  render() {
    return this.checkPermissions() && this.props.children;
  }
}

FiltersDisplayCheck.propTypes = {
  filterTypes: PropTypes.array.isRequired,
  exclude: PropTypes.bool,
  type: PropTypes.string,
};

export default FiltersDisplayCheck;
