/** 普通学校支付信息页
 * 路由参数说名
 * @parmas 如果当前isSelfPay = 0 则为学号/证件号缴费 如果isSelfPay = 1 则代表自助缴费类型
 * ***/
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Checkbox from '@components/checkbox';
import { navigateTo, getQueryValue, goBack, isWechatClient, isAliPayClient,storage } from "@utils/publicMethod";
import { API } from '@api/requestUrl';
import { Post } from '@api/index';
import huabeiIcon from '@assets/image/icon_huabei.png';
import alipayIcon from '@assets/image/icon_alipay.png';
import '@assets/css/pay-info.less';

class PayInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clock: 1800, //10分钟后未支付过期
      payInfo: {},
      isOpenHB: false,
      hubList: [],
      period: '',
      isSelfPay: '',
      checkedAlipay: false,
      isSure: false,   // 是否点击确认信息
      isWeiXin: false,   // 判断是否为微信支付
      isAliPay: false,
      minipgpay: '0',      // 判断是不是从教育平台小程序跳转过来 1  代表是
      isResponse: true,    // 防止重复点击,
      show: false,         // 是否展示分次支付按钮
      showPopup: false,
      tips: '',
      isLimit: false
    }
  }
  componentWillMount() {
    let { payInfo } = this.props;
    if (Object.keys(payInfo).length === 0) {
      payInfo = storage.get('payInfo');
    }
    const isSelfPay = Number(getQueryValue('isSelfPay'));
    const minipgpay = getQueryValue('minipgpay') || '0';
    const isSure = isSelfPay==1? false: true;
    const isWeiXin = isWechatClient(window.navigator.userAgent)? true: false;
    const isAliPay = isAliPayClient(window.navigator.userAgent)? true: false;
    this.setState({ payInfo, isSelfPay, minipgpay, isSure, isWeiXin, isAliPay }, () => {
      if (isSelfPay == 0){
         this.showBtn();
      }
      if (isAliPay){
        this.checkOpenHuaBei(payInfo.schoolid);
        this.queryHBList(payInfo.payAmount);
      }
    });
  }
  componentDidMount() {
    this.surplusMinute()
    this.interval = setInterval(this.Tick, 1000);
    console.log(this.state.clock)
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    // 判断是否满足清空定时器条件
    const {clock} = this.state;
    if(clock === 0){
        clearInterval(this.interval);
        goBack();
    }
  }
  componentWillUnmount() {
    // 清空定时器
    clearInterval(this.interval);
  }
  //获取剩余分钟数
  surplusMinute = () => {
    const parmas ={}
    Post(API.surplusSecond, parmas, true).then(res => {
      if (res && res.data)  {
        const { second } = res.data;
        const { clock } = this.state;
        this.setState({
          clock: second||clock
      });
      }
    })
  };
  Tick = () => {
    const { clock } = this.state;
        this.setState({
            clock: clock-1
        });
  };
  // Tick = () => {
  //   const { clock } = this.state;
  //   this.setState({
  //       clock: clock-1
  //   });
  // };
  /**判断是否展示分次支付按钮**/
  showBtn=()=>{
    let { schoolid,payAmount,billNoList } = this.state.payInfo;
    let parmas = {
      schId: schoolid,
      billNos: billNoList.join(','),
      payAmount: payAmount
    }
    Post(API.showBatchBtn, parmas, true).then(res => {
      if (res && res.data)  {
        this.setState({
          show: res.data.show
        })
      }
    })
  }
  toPay = () => {
    let { payInfo,isSelfPay,isOpenHB,checkedAlipay,isWeiXin,isAliPay,period,minipgpay,isResponse } = this.state;
    let { schoolid,payItem,payItemList,payAmount,customData,remark,userNo,billNoList,subAppId,subOpenId, buyerName} = payInfo;
    let payUrl = '';
    let reqType = 1;
    let parmas = {};
    if (!isResponse){
      return false;
    }
    if (isSelfPay === 1){ // 自助缴费类型
        parmas= {
          schId: schoolid,
          remark: remark?remark: '',
          customFields: JSON.stringify(customData)
        }
        if (payInfo.isActive === 'N'){
          payUrl = API.selfPay; 
          parmas.payItem = payItem; parmas.payAmount = payAmount;
        }else{
          reqType = 2;
          payUrl = API.selfPayItems;
          parmas.selfItems = payItemList; parmas.payMoney = payAmount;
        }
    }else{
      payUrl = API.payFromSelectSchool;
      parmas= {
        stuNo: userNo,
        schId: schoolid,
        totalAmount: payAmount,
        billNoList
      }
      if (minipgpay == 1) {
        reqData.subAppId = subAppId;
        reqData.subOpenId = subOpenId;
      }
    }
    if (isWeiXin){
       // 微信支付
      parmas.payType = 0
    }else if(isAliPay) { // 支付宝支付
        if (isOpenHB){
          if (checkedAlipay){
              parmas.payType = 2
          }else{
              parmas.payType = 3;
              parmas.period = period;
          }
        }
    }
    if (buyerName) {
       parmas.buyerName = buyerName;
    }
    this.setState({ isResponse: false});
    // 防止唤起支付后 取消支付  返回页面拿不到payInfo的情况
    storage.set('payInfo', payInfo);
    // 调用支付接口
    Post(payUrl, parmas, true, reqType ).then(res => {
      this.setState({ isResponse: true });
      const data = res && res.data;
      if (data) {
        const { code_url, status} = data;
        if(code_url){
          /* 跳转支付 */
          window.location.href = code_url;
        }else if (status === 7001) {
          this.setState({
            isLimit: true,
            showPopup: true,
            tips: data.msg
          })
        }
      }
    }).catch((error)=>{
      this.setState({ isResponse: true });
    }) 
  }
  // 检测是否开通花呗支付
  checkOpenHuaBei = (orgId) => {
    Post(API.isOpenHB, { orgType: 0, orgId }, true, 1).then(res => {
      const data = res && res.data;
      if (data) {
        const { hbStatus } = data;
        if (hbStatus === 'Y') {
          this.setState({ isOpenHB: true });
        }
      }
    })
  };
  /**获取花呗分期列表**/
  queryHBList = (payAmount) => {
    Post(API.HBPeriodList, { payAmount }, true, 1).then(res => {
      const data = res && res.data;
      if (data) {
        const nextState = { hubList: data };
        const def = data.filter(item => item.isdefault === 'Y');
        if (def.length !== 0) {
          nextState.period = def[0].period;
        }
        this.setState({
          ...nextState
        });
      }
    })
  }
  onPeriodChange = period => e => {
    const value = e.target.checked;
    if (value) {
      this.setState({
        period,
        checkedAlipay: false
      })
    }
  }
  closePopup=()=>{
    this.setState({
      showPopup: false
    },()=>{
      if (this.state.isLimit) {
         goBack();
      }
    })
  }
  moneyParser = money => {
    return (typeof money === 'number' || typeof money === 'string') ? Number(money) / 100 : 0;
  }
  batchPay=()=>{
    let selectList  = this.state.payInfo.selectList || [] ;
    let showModel = false;
    let tips ="";
    if (selectList.length == 1 && selectList[0].billPayType == 2){
        showModel = true;
        tips = '当前账单不支持分次缴费';
    }else if(selectList.length > 1){
      showModel = true;
      tips = '多次支付只能选择单个缴费项目';
    }
    if (showModel) {
        this.setState({
          showPopup: true,
          tips
        })
    }else{
       const billNo = selectList[0].billNo;
       this.props.nextPageStartDirection('left', () => {
          navigateTo('/school-batch-pay', `billNo=${billNo}`);
      })
    }
  }
  render() {
    const { payInfo, isSure, isOpenHB, hubList, period, checkedAlipay, isSelfPay, isAliPay, clock, show, showPopup, tips } = this.state;
    let list = payInfo.customData || [];
    let payAmount = payInfo.payAmount || 0;
    return (
      <div className={["payment_information", isSelfPay==1? 'addBottom' : ''].join(' ')}>
        <div className="payment_tips">订单将在{Math.floor(clock / 60)}分钟后关闭，请及时完成支付</div>
        <div className="payment_container">
            <div className="payment_top">
              <p className="payment_title">缴费金额</p>
              <p className="payment_amount">￥<em className="number">{(payAmount / 100).toFixed(2)}</em></p>
            </div>
            <ul className="payment_info_list">
              <li className="payment_item_li bottom_line">
                <p className="payment_label">收费单位</p>
                <p className="payment_name">{payInfo.payName}</p>
              </li>
              <li className="payment_item_li bottom_line">
                <p className="payment_label">缴费项目</p>
                <p className="payment_name">{payInfo.payItem}</p>
              </li>
              {
                list.length > 0 && list.map((item, index) => {
                  return (
                    <li className="payment_item_li bottom_line" key={index}>
                      <p className="payment_label">{item.customName}</p>
                      <p className="payment_name">{item.customValue}</p>
                    </li>
                  )
                })
              }
              {payInfo.remark &&
                <li className="payment_item_li">
                  <p className="payment_label">备注</p>
                  <p className="payment_name">{payInfo.remark}</p>
                </li>
              }
              {payInfo.buyerName &&
                <li className="payment_item_li">
                  <p className="payment_label">发票抬头</p>
                  <p className="payment_name">{payInfo.buyerName}</p>
                </li>
              }
            </ul>
          { isAliPay &&
          <div className="alipay-options">
            <div className="opt-header">
              <div className="huabei-logo">
                <img src={huabeiIcon} alt="" className="huabeiIcon" />
              </div>
              <div className="opt-header-text">
                <span>花呗分期</span> <span className="important">推荐</span>
              </div>
            </div>
            <ul className="periodization">
              {
                isOpenHB && hubList.map((item, index) => {
                  return (
                    <li className="bystages_item bottom_line" key={index}>
                      <div className="bystages_item_text">
                        <p>￥{this.moneyParser(item.periodAmount)}x{item.period}期</p>
                        <p className="service_charge">手续费￥{this.moneyParser(item.serviceAmount)}/期</p>
                      </div>
                      <Checkbox.Item multipleLine checked={period === item.period} onChange={this.onPeriodChange(item.period)} key={index}>
                      </Checkbox.Item>
                    </li>
                  )
                })
              }
              <li className="bystages_item oneTime-pay-wrapper">
                <div className="bystages_item_text">支付宝</div>
                <Checkbox.Item checked={checkedAlipay} onChange={(e) => this.setState({ checkedAlipay: e.target.checked, period: null })}>
                </Checkbox.Item>
                <img className="alipayIcon" src={alipayIcon} alt="" />
              </li>
            </ul>
          </div>
          }
        </div>
        <div className="payment_footer">
              {isSelfPay == 1 &&
                <div className="ensure_msg">
                  <Checkbox onChange={(e) => this.setState({ isSure: e.target.checked })}>
                    <span className="msg_cont">请确认缴费人<span className="font_red">收费单位、缴费项目、姓名、缴费金额</span>无误</span>
                  </Checkbox>
                </div>
              }
              <div className="payment_btn_box">
                <button className={["payment_btn", !isSure ? 'disable_btn' : ''].join(' ')} disabled={!isSure} onClick={this.toPay}>
                  支付
                </button>
               { show && <p className="batch_pay" onClick={this.batchPay}>分次支付</p>}
              </div>
          </div>
          <div className={["popop_model_box",showPopup? "popup_show":""].join(' ')}>
            <div className="popop_main_content">
              <div className="content_title">温馨提示</div>
              <div className="popup_content bottom_line">{tips}</div>
              <div className="popup_footer">
                <p className="determine_btn" onClick={this.closePopup}>确定</p>
              </div>
            </div>
          </div> 
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    payInfo: state.getPayInfo,
  }
}
PayInfo.propTypes = {

};
const Connects = connect(
  mapStateToProps
)(PayInfo)
export default Connects;