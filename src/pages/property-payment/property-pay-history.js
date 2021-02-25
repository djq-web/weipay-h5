import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PayList from '@components/payHistory';

export default class PropertyPayHistory extends Component {
  static propTypes = {
    payType: PropTypes.number
  }
  render() {
    return (
      <div>
        <PayList payType={2} nextPageStartDirection={ this.props.nextPageStartDirection }></PayList>
      </div>
    )
  }
}
