import React, { Component } from 'react';
import { goBack } from "@utils/publicMethod";
import './invoice.less';

export default class Billing extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  goInvoiceHistory = () => {
    goBack();
  }
  render() {
    return (
      <div className="invoice_pending">
        <div className="cont">
          <span className="invoicing_icon"></span>
          <p className="submit_title">发票开具中</p>
          <p className="gray_tip">预计24小时内为您开票成功，请耐心等待！</p>
          <div className="complete_btn" onClick={this.goInvoiceHistory}>完成</div>
        </div>
      </div>
    )
  }
}
