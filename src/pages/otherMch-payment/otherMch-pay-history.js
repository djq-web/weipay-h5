import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PayList from '@components/payHistory';
import { getQueryValue } from "@utils/publicMethod";

export default class OtherMchPayHistory extends Component {
  static propTypes = {
    payType: PropTypes.number
  }
  componentWillMount(){
    const commOrgId = getQueryValue('mercId') || '';
    if(commOrgId === '30'){
      document.title = '党费缴纳平台';
    }
  }
  render() {
    return (
      <div>
        <PayList payType={3} nextPageStartDirection={ this.props.nextPageStartDirection }></PayList>
      </div>
    )
  }
}
