import React, { Component } from 'react';
import { Toast } from 'antd-mobile';
import { API } from '@api/requestUrl';
import { Post } from '@api/index';
import { getQueryValue, getMoney } from "@utils/publicMethod";
import '@assets/css/batch-pay.less';

export default class batchPay extends Component {
  constructor(props){
    super(props);
    this.state= {
      progressBar: '',
      payInfo: {},
      percentage: '', // 支付金额的百分比
      hasPayAmount: '',
      inputVal: '', // 输入的支付金额
      isResponse: true,    // 防止重复点击,
     }
  }
  componentDidMount(){
    this.getPayDetails();
  }
  /**获取账单明细**/
  getPayDetails=()=>{
    const billNo = getQueryValue('billNo') || '';
    if (!billNo) {
      return Toast.info('账单编号不存在', 2);
    }
    Post(API.PayBillDetail, { billNo }, true).then(res => {
      if(res && Object.keys(res.data).length !==0 ) {
        const { payAmount, unPayAmount } = res.data;
        let hasPayAmount = parseInt(payAmount) - parseInt(unPayAmount);
        let percentage=  (Math.round(parseInt(hasPayAmount) / parseInt(payAmount) * 10000) / 100.00 + "%");// 小数点后两位百分比
        this.state.progressBar.style.width = percentage;
          this.setState({
            percentage,
            hasPayAmount,
            payInfo: res.data
          })  
      }
    })
  }
    //金额的输入框
  inputChange = (e) => {
    if (e.target.value === '') {
      this.setState({
        inputVal: ''
      });
    } else {
      let reg = /^\d+(\.\d{0,2})?$/;
      let flag = reg.test(e.target.value);
      if (flag) {
        this.setState({
          inputVal: e.target.value,
        })
      }
    }
  }
  payMoney=()=>{
    let { payInfo, inputVal } = this.state;
    let payMoney = getMoney(inputVal);
    if (!payMoney) {
      return Toast.info('输入金额不能为空', 2);
    }else if (Number(payMoney) > Number(payInfo.unPayAmount)) {
       return Toast.info('支付金额不能大于待支付金额', 2);
    }
    if (!this.state.isResponse){
      return false;
    }
    let billNo = getQueryValue('billNo') || '';
    let payUrl = API.payFromSelectSchool;
    let parmas= {
      stuNo: payInfo.stuNo,
      schId: payInfo.schId,
      totalAmount: payMoney,
      billNoList: billNo,
      billPayType: 2
    }
    this.setState({ isResponse: false});
    // 调用支付接口
    Post(payUrl, parmas, true, 1).then(res => {
      this.setState({ isResponse: true });
      const data = res && res.data;
      if (data) {
        const { code_url } = data;
        if(code_url){
          /* 跳转支付 */
          window.location.href = code_url;
        }
      }
    }).catch((error)=>{
      this.setState({ isResponse: true });
    }) 
  }
  render() {
    const channelid = Number(getQueryValue('channelid')) || '';
    const { percentage,hasPayAmount, payInfo, inputVal } = this.state;
    return (
      <div className="batchPayPage">
          <div className="progress_bar">
            <p className={`current_progress ${channelid==3? 'greenProgress': ''}`} ref={e => (this.state.progressBar = e)}>
              <span className="percentage">{percentage}</span>
            </p>
          </div>
          <div className="explain">
            <div className="pay_li pay_left">
              <p className="li_name">已支付</p>
                <p className="li_value">￥{(hasPayAmount/100).toFixed(2)}</p>
            </div>
            <div className="pay_li pay_right">
              <p className="li_name">合计</p>
              <p className="li_value totalVal">￥{(Number(payInfo.payAmount)/100).toFixed(2)}</p>
            </div>
          </div>
          <div className={`box_input ${channelid==3? 'green_input': ''}`}>
            <span className="symbool">￥</span>
            <input type="text" className="money_input" value={inputVal} placeholder="输入金额需 5000以上" onChange={this.inputChange}/>
          </div>
          <p className="surplus">还需支付<span className="remainder_money">
            ￥{(Number(payInfo.unPayAmount)/100).toFixed(2)}</span>
          </p>
          <div className={`sure_btn ${channelid==3? 'sure_green_btn': ''}`} onClick={this.payMoney}>确认支付</div>
      </div>
    )
  }
}
