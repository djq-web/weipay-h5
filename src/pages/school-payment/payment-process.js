import React, { Component } from "react";
import OrdinaryPaymentProcess from "./school-payment-process";

class PaymentProcess extends Component {
  render() {
    return (
      <div className="payInfoPage">
        <OrdinaryPaymentProcess
          nextPageStartDirection={this.props.nextPageStartDirection}
        ></OrdinaryPaymentProcess>
      </div>
    );
  }
}

export default PaymentProcess;
