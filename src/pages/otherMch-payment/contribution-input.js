/**疫情捐款页面**/
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Toast } from 'antd-mobile';
import { payInfo } from '@store/actions';
import Input from '@components/input';
import { navigateTo, getQueryValue, isRightName, checkPhone, getMoney, storage } from "@utils/publicMethod";
import { API } from '@api/requestUrl';
import { Get } from '@api/index';
import propagandaLogo from '@assets/image/propaganda.png';

class ContributionInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      otherMchInfo: {},
      commOrgId: '', //收费机构id
      payItem: '防控新型肺炎捐赠', // 缴费项目
      name: '',        //姓名
      phoneNumber: '',       //手机号
      payAmount: '',   //金额(分)
      remark: '',      //备注
    };
  }
  componentDidMount() {
    this.initPage();
  }
  /**页面初始**/
  initPage=()=>{
    const otherMchInfo = storage.get('receivingUnit') || {};
    if(otherMchInfo && Object.keys(otherMchInfo).length !== 0 ){
       this.setState({ otherMchInfo, commOrgId: otherMchInfo.id });
    }else{
      const commOrgId = getQueryValue('commOrgId');
      const template = getQueryValue('template');
      if (commOrgId && template){
        const url = template + '/' + commOrgId;
        this.getUnitList(API.queryOtherMch + url, commOrgId);
      }else{
        return Toast.info('请通过正确的微信公众号入口进入该页面！', 2);
      }
    }
  }
  // 查询商户信息
  getUnitList = (url, commOrgId) => {
    Get(url, null, true).then(res => {
      if (res && res.data){
        storage.set('receivingUnit', res.data)
         this.setState({
           otherMchInfo: res.data,
           commOrgId
         })
      }
    })
  }
  //金额的输入框
  inputChange = (data) => {
      if (data.data === '') {
        this.setState({
          payAmount: ''
        });
      } else {
        let reg = /^\d+(\.\d{0,2})?$/;
        let flag = reg.test(data.data);
        if (flag) {
          this.setState({
            payAmount: data.data,
          })
        }
      }
  }
    //用户输入时触发
  handleChange = (data) => {
    this.setState({
      [data.name]: data.data
    })
  }
  goPayInfo = () => {
    let { commOrgId, otherMchInfo, phoneNumber, remark, name, payAmount, payItem } = this.state;
    if (!commOrgId) {
      return Toast.info('收费单位不能为空', 2);
    }else  if ( !payAmount || parseInt(payAmount * 100) < 1) {
      return Toast.info('金额不能低于一分钱', 2);
    }else if(!isRightName(name)){
      return Toast.info('请输入正确的姓名', 2);
    }else if ( phoneNumber && !checkPhone(phoneNumber)){
      return Toast.info('请输入正确的手机号', 2);
    }
    const { setPayInfo } = this.props;
    const parmas = {
      commOrgId,
      commUname: name,
      payName: otherMchInfo.commMercName,
      payItem,
      payAmount: getMoney(payAmount),
      remark,
      phoneNumber
    }
    setPayInfo(parmas);   
    this.props.nextPageStartDirection('left', () => {
        navigateTo('/other-pay-info',`isSelfPay=2`);
    });
  }
  render() {
    const { otherMchInfo, payItem, payAmount } = this.state;
    return (

      <div className="pay_form_page">
        <div className="page_main_content">
          <div className="propaganda_box">
            <img src={propagandaLogo} alt="" className="banner_img" />
          </div>
          <div className="form_container">
            <Input type="text" name="commOrgId" value={otherMchInfo.commMercName} 
                   placeholder="请输入收费单位" editable={false}>收费单位
            </Input>
            <Input type="text" name="conpayItem" placeholder="请输入项目名称" 
                   value={payItem} editable={false}>项目名称
            </Input>
            <Input type="text" name="payAmount" placeholder="请输入金额"
                  onChange={this.inputChange} value={payAmount} maxLength="10" clear>
                  <span className="required_symbol" >*</span>金额(元)
            </Input>
            <Input  type="text" name="name" placeholder="请输入付款单位或个人姓名"
                    onChange={this.handleChange}  clear>
                    <span className="required_symbol" >*</span>姓名
            </Input>
            <Input type="text" name="phoneNumber" placeholder="请输入手机号"
                  onChange={this.handleChange} maxLength="11" clear>手机号
            </Input>
            <Input type="text" name="remark" placeholder="请输入备注" maxLength="50"
                   onChange={this.handleChange} clear>备注
            </Input>
          </div>
          <p className="pay_input_tips">温馨提示：请仔细核对以上信息，经确认捐赠的款项，支付机构无法追回亦无追回义务</p>
          <div className="go_pay_btn" onClick={this.goPayInfo}>立即捐款</div>
        </div>
      </div>
    )
  }
}
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setPayInfo(data) {
      dispatch(payInfo(data));
    }
  }
}
const Connects = connect(
  null,
  mapDispatchToProps,
  null,
  { forwardRef: true }
)(ContributionInput)
export default Connects;
