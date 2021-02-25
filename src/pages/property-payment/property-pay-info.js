/**
 * 路由参数说名
 * @parmas 如果当前isSelfPay = 0 则为学号/证件号缴费 如果isSelfPay = 1 则代表自助缴费类型
 * ***/
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Checkbox from '@components/checkbox';
import { getQueryValue, goBack, isWechatClient, isAliPayClient, storage } from "@utils/publicMethod";
import { API } from '@api/requestUrl';
import { Post } from '@api/index';
import huabeiIcon from '@assets/image/icon_huabei.png';
import alipayIcon from '@assets/image/icon_alipay.png';
import '@assets/css/pay-info.less';

class PropertyPayInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clock: 1800, //30分钟后未支付过期
      payInfo: {},
      isOpenHB: false,
      hubList: [],
      period: '',
      isSelfPay: '',
      checkedAlipay: false,
      isSure: false,   // 是否点击确认信息
      isWeiXin: false,   // 判断是否为微信支付
      isAliPay: false,
      isResponse: true    // 防止重复点击
    }
  }
  componentWillMount() {
    let { payInfo } = this.props;
    if (Object.keys(payInfo).length === 0) {
      payInfo = storage.get('payInfo');
    }
    const isSelfPay = Number(getQueryValue('isSelfPay'));
    const isSure = isSelfPay==1? false: true;
    const isWeiXin = isWechatClient(window.navigator.userAgent)? true: false;
    const isAliPay = isAliPayClient(window.navigator.userAgent)? true: false;
    this.setState({ payInfo, isSelfPay, isSure, isWeiXin, isAliPay }, () => {
      if (isAliPay){
        this.checkOpenHuaBei(payInfo.propOrgId);
        this.queryHBList(payInfo.payAmount);
      }
    });
  }
  componentDidMount() {
    this.surplusMinute()
    this.interval = setInterval(this.Tick, 1000);
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
  toPay = () => {
    let { payInfo,isSelfPay,isOpenHB,checkedAlipay,isWeiXin,isAliPay,period, isResponse } = this.state;
    let { propOrgId,payItem,payItemList,payAmount,customData,remark,certNo,billNoList, tierId, houseNo } = payInfo;
    let payUrl = '';
    let reqType = 1;
    let parmas = {};
    if (!isResponse){
      return false;
    }
    if (isSelfPay === 1){ // 自助缴费类型
        parmas= {
          propOrgId: propOrgId,
          remark: remark || '',
          payAmount,
          customFields: JSON.stringify(customData)
        }
        if (payInfo.isActive === 'N'){
          payUrl = API.wySelfPay; 
          parmas.payItem = payItem;
        }else{
          reqType = 2;
          payUrl = API.wySelfPayItems;
          parmas.selfItems = payItemList;
        }
    }else{
      payUrl = API.payFromSelectProperty;
      parmas= {
        certNo,
        propOrgId,
        totalAmount: payAmount,
        billNoList,
        tierId,
        houseNo
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
    this.setState({ isResponse: false});
    // 防止唤起支付后 取消支付  返回页面拿不到payInfo的情况
    storage.set('payInfo', payInfo);
    // 调用支付接口
    Post(payUrl, parmas, true, reqType ).then(res => {
      this.setState({ isResponse: true });
      const data = res && res.data;
      if (data) {
        // console.log('支付结果', data)
        const { code_url } = data;
        if(code_url){
          /* 生产环境开启跳转 */
          window.location.href = code_url;
        }
      }
    }).catch((error)=>{
      this.setState({ isResponse: true });
    })    
  }
  // 检测是否开通花呗支付
  checkOpenHuaBei = (orgId) => {
    Post(API.isOpenHB, { orgType: 1, orgId }, true, 1).then(res => {
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
  moneyParser = money => {
    return (typeof money === 'number' || typeof money === 'string') ? Number(money) / 100 : 0
  }
  render() {
    const { payInfo, isSure, isOpenHB, hubList, period, checkedAlipay, isSelfPay, isAliPay, clock } = this.state;
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
              { payInfo.houseUname && <li className="payment_item_li bottom_line">
                <p className="payment_label">姓名</p>
                <p className="payment_name">{payInfo.houseUname}</p>
              </li>
              }
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
const Connects = connect(
  mapStateToProps,
  null,
  null,
  { forwardRef: true }
)(PropertyPayInfo)
export default Connects;