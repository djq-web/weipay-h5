import React, { Component } from 'react';
import { Toast } from 'antd-mobile';
import { navigateTo, getQueryValue, toThousands } from "@utils/publicMethod";
import { API } from '@api/requestUrl';
import { Post } from '@api/index';
import './voucher.less';
class Voucher extends Component {
  constructor(props) {
    super(props);
    this.state = {
      invoiceList: []
    };
  }
  componentWillMount() {  
  }
  // 获取开票历史列表
  getList = () => {
    const schoolid = getQueryValue('schoolid');
    const stuNo = getQueryValue('stuNo');
    if (!schoolid || !stuNo) {
      return Toast.info('请从正常的缴费入口进入！', 2);
    }
    Post(API.qryInvoiceRec, {schId: schoolid, stuNo: stuNo }, true, 1)
      .then(res => {
        if (res && res.data) {
        }
      })
  }

  render() {
    return (
      <div className="voucher_page">
        <div className="payment_voucher_container">
              <div className="payment_title">缴费凭证</div>
              <div className="main_content">
                <div className="voucher_herader">
                  <p className="left_content">
                    <span className="red_text">订单号：</span>
                    <span className="order_num blue_text">ZZ342546565765765765765878456755</span>
                  </p>
                  <p>
                    <span className="red_text">交易时间：</span>
                    <span className="pay_time blue_text">2020-12-15 15:45:35</span>
                  </p>
                </div>
                <ul className="tabel_content">
                  <li className="first_line">
                      <p className="line_lable red_text">基本信息</p>
                      <p className="base_message_content line_content">
                          <span className="blue_text">姓名/学好/班级</span>
                      </p>
                  </li>
                  <li className="second_line">
                      <p className="line_lable red_text payment_list_title">缴费项目</p>
                      <div className="right_payment">
                          <p className="item_list_box ">
                            <span className="item_name">书本费</span>
                            <span className="item_value">¥10000.00</span>
                            <span className="line-through"></span>
                          </p>
                          <p className="item_list_box">
                              <span className="item_name">学杂费</span>
                              <span className="item_value">¥10000.00</span>
                            </p>
                            <div className="refund_picture"></div>
                       </div>
                    </li>
                    <li className="third_line"> 
                      <p className="total_money_capitalize">
                        <span className="red_text">合计金额（大写）：</span>
                        <span className="blue_text">伍万叁仟肆佰元整</span>
                      </p>
                      <p>
                        <span className="red_text">（小写）：</span>
                        <span className="blue_text">¥ 53400.00</span>
                      </p>
                     </li>
                     <li className="fourth_line"> 
                      <p className="line_lable red_text">缴费类型</p>
                      <p className="line_content blue_text">账单缴费/自助缴费</p>
                    </li>
                    <li className="fifth_line">
                      <p className="line_lable red_text">支付方式</p>
                      <p className="payment_method_name blue_text">微信支付/支付宝支付/其他</p>
                      <div className="flex_auto_box">
                          <p className="pay_status_name red_text">支付状态</p>
                          <p className="pay_status_success blue_text">支付成功</p>
                      </div>
                    </li>
                    <div className="payment_logo"></div>
                </ul>
                <div className="table_footer">
                  <span className="red_text">经办方：</span>
                  <span className="blue_text right">威缴费平台</span>
                </div>
              </div>
          </div>
          <div className="download_line">
            <a href="../../assets/test.pdf" className="download_btn" download>下载</a>
          </div>
      </div>

    )
  }
}
export default Voucher;
