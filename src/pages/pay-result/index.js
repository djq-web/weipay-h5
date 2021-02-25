import React, { Component } from 'react';
import { Toast } from 'antd-mobile';
import { API } from '@api/requestUrl';
import { Post, Get } from '@api/index';
import { navigateTo, getQueryValue, batchRemoveSessionStorage } from "@utils/publicMethod";
import '@assets/css/pay-ok.less';


export default class SchoolPayOk extends Component {
  constructor(props){
    super(props);
    this.state= {
      payType: 1, // payType 1、学校 2、物业 3、 其他缴费
      amount: 0,
      continuePayFlag: false, // 是否显示继续支付按钮
      billNo: '',          // 账单编号（continuePayFlag=true时有值）
      clickTimes: 0,
      hasResponse: false,
      showPopup: false,
      tips: '',
      certStatus: '',
      payStatus: '',
    }
  }
  componentDidMount() {
    this.queryTradeStatus();
  }
  queryTradeStatus = () => {
    const outTradeNo = getQueryValue('outTradeNo');
    const payType = getQueryValue('payType') || 1; 
    const reqUrl = payType == 1? API.querypaystate: payType == 2? API.queryPropertyPayStatus: API.queryOtherPayStatus ;
    this.setState({ payType });
    if(!outTradeNo){
        return Toast.info('查询失败！订单号不能为空！', 2);
    }
    Post(reqUrl, {outTradeNo}, true).then(res=>{
        const data =  res && res.data;
        if (data) {
          this.setState({
            amount: (data.payAmount/100).toFixed(2),
            continuePayFlag: data.continuePayFlag || false,
            billNo: data.billNo || '',
            certStatus: data.certStatus || '',
            payStatus: data.payStatus
          })
        }
    })
  }
  goRouter=()=>{
    const payType = getQueryValue('payType') || '';  // payType 1、学校 2、物业 3、 其他缴费
    const mercId = getQueryValue('mercId') || '';   
    const userNo = decodeURIComponent(getQueryValue('userNo')) || '';    //  存在说明是学号缴费 不存在则是自助缴费
    batchRemoveSessionStorage(['payInfo',  'customData']); // 支付完成清除之前存的所有数据
    if(payType == 1) {
      if (userNo) {
        this.props.nextPageStartDirection('left', () => {
          navigateTo('/school-pay-history', `mercId=${mercId}&userNo=${userNo}`);
        })
      }else{
        this.props.nextPageStartDirection('left', () => {
          navigateTo('/pay-before', `schoolid=${mercId}&template=default&navigate=false`);
        })
      }
    }else if (payType == 2) {
      if (userNo) {
        this.props.nextPageStartDirection('left', () => {
          navigateTo('/wy-pay-history', `mercId=${mercId}&userNo=${userNo}`);
        })
      }else{
        this.props.nextPageStartDirection('left', () => {
          navigateTo('/wy-pay-before', `propOrgId=${mercId}&template=default&navigate=false`);
        })
      }
    }else {
      if (userNo) {
        this.props.nextPageStartDirection('left', () => {
          navigateTo('/other-pay-history', `mercId=${mercId}&userNo=${userNo}`);
        })
      }else{
        this.props.nextPageStartDirection('left', () => {
          navigateTo('/other-pay-before', `commOrgId=${mercId}&template=default&navigate=false`);
        })
      }
    }
  }
  // 继续支付  当前版本暂时只有在学校缴费时才有分次支付
  continuePay=()=>{
    const { billNo } = this.state;
    this.props.nextPageStartDirection('left',()=>{
      navigateTo('/school-batch-pay', `billNo=${billNo}`);
    });
  }
  // 查看缴费凭证
  goVoucherUrl=() =>{
    const payOrderNo = getQueryValue('outTradeNo');
    if(!payOrderNo){
        return Toast.info('请检查订单号是否存在', 2);
    }
    if (this.state.hasResponse) {
       return false;
    }
    this.setState({
      hasResponse: true,

    })
    Get(API.getVoucher, { payOrderNo }, true).then(res=>{
      this.setState({hasResponse: false});
      if (res && res.data) {
          window.location.href = res.data;
      }else{
          let times = this.state.clickTimes;
          let tips = '加载失败请稍后再试';
          times++;
          if(times >= 3) {
            tips = '如需查看凭证， 请联系校管理员';
          }
          this.setState({ 
            showPopup: true,
            clickTimes: times,
            tips: tips
          })
      }
    }).catch((err)=>{
       this.setState({hasResponse: false});
    })
  }
  onClose
  render() {
    const { amount, continuePayFlag, showPopup, tips, certStatus, payStatus } = this.state;
    return (
        <div className="pay_ok">
          <div className="pay_success_incon"></div>
          <div className="pay_ok_text">
              <p>已成功支付</p>
              <p className="pay_money">￥<em className="number_money">{ amount }</em></p>
          </div>
          { continuePayFlag && <div className="continue_pay" onClick={this.continuePay}>继续支付</div> }
          <div className="complete_btn" onClick={this.goRouter}>完成</div>
         { certStatus==1 && payStatus==="S" && <div className="voucher_btn" onClick={this.goVoucherUrl}>查看缴费凭证</div>}
          <div className={["popop_model_box",showPopup? "popup_show":""].join(' ')}>
            <div className="popop_main_content">
              <div className="popup_content bottom_line">{tips}</div>
              <div className="popup_footer">
                <p className="determine_btn" onClick={()=>{this.setState({ showPopup: false})}}>关闭</p>
              </div>
            </div>
          </div>   
      </div>
    )
  }
}
