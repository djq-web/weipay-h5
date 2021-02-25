import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PayList from '@components/payHistory';

export default class SchoolPayHistory extends Component {
  static propTypes = {
    payType: PropTypes.number
  }
  render() {
    return (
      <div>
        <PayList payType={1} nextPageStartDirection={ this.props.nextPageStartDirection }></PayList>
      </div>
    )
  }
}