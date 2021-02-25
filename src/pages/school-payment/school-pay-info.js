
import React, { Component } from 'react';
import OrdinaryPayment from './ordinary-pay-info';
import BankPayment from './bank-custom-pay-info';
import { getQueryValue } from "@utils/publicMethod";

class SchoolPayInfo extends Component {
  render() {
    const channelid = getQueryValue('channelid');
    return (
      <div className="payInfoPage">
        {
          channelid == 3? 
          <BankPayment nextPageStartDirection={this.props.nextPageStartDirection}></BankPayment>:
          <OrdinaryPayment nextPageStartDirection={this.props.nextPageStartDirection}></OrdinaryPayment>
        }  
      </div>
    );
  }
}

export default SchoolPayInfo;