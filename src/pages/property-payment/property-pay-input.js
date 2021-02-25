/**
 * 自助缴费页面（包含全自助与半自助）
 * 如果 isActive === 'Y'  则表明有激活缴费项  为半自助
 * 如果 isActive === 'N'  则表明无激活缴费项  为全自助
 * ***/

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Toast } from 'antd-mobile';
import { payInfo } from '@store/actions';
import Popup from '@components/popup';
import Input from '@components/input';
import Banner from '@components/banner';
import List from '@components/list';
import { API } from '@api/requestUrl';
import { Get, Post } from '@api/index';
import PaymentPopup from '@components/paySelect/paymentPopup';
import { navigateTo, getQueryValue, isRightName, getMoney,storage } from "@utils/publicMethod";
import '@assets/css/pay-before.less';

class PropertyPayInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      proporgInfo: {},
      isActive: '',
      propOrgId: '',   // 收费单位的ID
      payItem: '',    // 缴费项目
      allMoney: 0,     // 缴费总金额
      payAmount: '',
      customData: [],  // 自定义缴费字段
      remark: '',       // 备注  
      payItemList: [],
      showPopup: false,
      defaultList: [],
      customId: '',
      isEdit: true,
      isOnlyOne: false
    };
  }
  componentWillMount() {
    const customData = storage.get('customData') || '';
    const proporgInfo = storage.get('receivingUnit') || '';
    const isActive = getQueryValue('isActive') || '';
    const propOrgId = getQueryValue('propOrgId');
    if (propOrgId){
      this.setState({propOrgId});
      this.getItemOption(propOrgId);
      if (!isActive){
        // 此情况 针对某一机构只设置自助缴费的情况下用户直接扫码进入该页面
        this.checkActive(propOrgId);
      }else{
        this.setState({ isActive });
      }
      if (!proporgInfo){
        this.getProperty(propOrgId);
      }else{
        this.setState({ proporgInfo });
      }
      if (!customData){
        this.getCustomData(propOrgId);
      }else{
        this.setState({ customData });
      }
    }else{
      return Toast.info('不是合法的进入入口', 2);
    } 
  }
  handlePopupShow = () => {
    this.child.onShow();
    this.child.getItemOption();
  }
    //获取自助缴费项目列表
    getItemOption = (propOrgId) => {
      const requestUrl = API.propertyItemInfo;
      let parmas = { propOrgId };
      Get(requestUrl, parmas, true)
        .then(res => {
          const data = res && res.data;
          if (data && Object.keys(data).length === 1 ) {
                let list = [];
                let obj = {
                  amount: Number(data[0].payMoney),
                  itemId: data[0].itemId
                }
                list.push(obj);
                let payItem = data[0].itemName;
                let payAmount = data[0].payMoney;
                let allMoney = '￥' + Number(payAmount / 100);
                if (data[0].payMoney == 0) {
                  payAmount = '';
                  allMoney = '';
                  this.setState({
                    isEdit: false
                  })
                }
                this.setState({
                  allMoney,
                  payAmount,
                  payItem,
                  payItemList: list,
                  isOnlyOne: true
                })
          }
        })
    }
   // 检查当前机构是否有待激活项目
  checkActive=(propOrgId)=>{
      Get(API.propCheckActive, { propOrgId }, true)
      .then(res=> {
         const data = res && res.data;
         if (data) {
          this.setState({
             isActive: data.isActive
          })
        }
      })
  }
  /**
   * 获取自定义字段
   * **/
  getCustomData = (propOrgId) =>{   
    Post(API.getWyCustomItem, { propOrgId }, true, 1).then(res=> {
      const data = res && res.data;
      if (data){
        this.setState({
          customData: data
        })
      }
    })    
  }
  /**获取物业单位的相关信息**/
  getProperty = (propOrgId) => {
    let reqUrl = 'default/' + propOrgId;
    Get(API.queryProperty + reqUrl, null, true).then(res=>{
        const data = res && res.data;
        if(data){
          storage.set('receivingUnit', data);   // 存储收款的单位信息
          this.setState({ proporgInfo: data })   
        }
    })
  };
  getChildValue = (data) => {
    let payAmount = data.payAmount;
    let allMoney = '￥' + Number(payAmount / 100);
    let payItem = data.itemNameArray.join(',');
    let payItemList = data.payItemArr;
    this.setState({
      isEdit: true,
      allMoney,
      payAmount,
      payItem,
      payItemList
    })
  }
  // 将页面的scollTop重置为0
  reduction=()=>{
    var pageNode =  document.querySelector('.page_main_content');
    pageNode.scrollTop = 0;
  }
  //用户输入时触发
  handleChange = (data) => {
    switch (data.name) {
      case 'payItem':
        this.setState({
          payItem: data.data,
        });
        break;
      case 'remark':
        this.setState({
          remark: data.data
        });
        break;
    }
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
  // 输入自定义字段
  handleCustomChange = (data) => {
    let { customData } = this.state;
    for (let i = 0; i < customData.length; i++) {
      if (customData[i]['customId'] == data.name) {
        customData[i]['customValue'] = data.data;
        break;
      }
    }
    this.setState({ customData });
  }
  //切换为全自主输入
  goSelfInput=()=>{
    this.setState({
      isActive: 'N',
      payAmount: ''
    });
  }
  // 选择默认字段
  getDefaultVal=(item)=>{
    this.setState({
      defaultList: item.defaultVals,
      customId: item.customId,
      showPopup: true
    })
  }
  getInputVal=(val)=>{
    let {customId, customData} = this.state;
    customData.map(item=>{
      if (item.customId == customId) {
        item.customValue = val;
      }
    })
    this.setState({
      showPopup: false,
      customData
    })
  }
  /**
   * 去缴费
   * ***/
  goPayInfo = () => {
    let { propOrgId, payItem, payAmount, remark, customData, isActive, proporgInfo, payItemList, isEdit, isOnlyOne } = this.state;
    let payName = proporgInfo.propMercName;
    payItem = payItem.replace(/(^\s*)|(\s*$)/g, "");
    if (!propOrgId) {
      return Toast.info(`收费单位不能为空`, 2);
    } else if (isActive === 'N' && !payItem) {
      return Toast.info(`请填写正确的缴费项目`, 2);
    } else if (!payAmount || (payAmount * 100000) <= 0) {
      return Toast.info('缴费金额必须大于0', 2);
    }
    // 判断自定义字段为必填项
    if (customData) {
      for (let i = 0; i < customData.length; i++) {
        let value = customData[i].customValue;
        let str = value ? value.replace(/(^\s*)|(\s*$)/g, "") : "";
        if (!str) {
          return Toast.info('必填项不能为空', 2);
        }
      }
    }
    storage.set('customData', customData);
    const parmas = {
      propOrgId,
      payName,
      payItem,
      payAmount,
      customData,
      remark,
      isActive
    }
    if (parmas.customData.length>0){
      parmas.customData.map(item=>{
        if (item.defaultVals){
          delete item.defaultVals
        }
      })
    }
    if (isActive === 'N') {
      parmas.payAmount = getMoney(payAmount);
    }else {
      parmas.payItemList = payItemList;
      if (!isEdit) {
        parmas.payAmount = getMoney(payAmount);
        parmas.payItemList[0].amount = getMoney(payAmount);
      }else{
        if (isOnlyOne) {
          parmas.payItemList[0].amount = payAmount;
        }
      }
    }
    this.props.setPayInfo(parmas);   
    this.props.nextPageStartDirection('left',()=>{
      navigateTo('/wy-pay-info',`isSelfPay=1`);
    }) 
  }
  render() {
    const { proporgInfo, payItem, customData, isActive, propOrgId, payAmount, allMoney, showPopup, defaultList, isEdit } = this.state;
    const { selfIn } = proporgInfo;
    return (
      <div className="pay_form_page">
        <div className="page_main_content">
          <Banner mercId={propOrgId} mchType={1}></Banner>
          <p className="content_title">请输入缴费信息进行缴费</p>
          <div className="form_container">
            <Input type="text" name="propOrgId" value={proporgInfo.propMercName} placeholder="请输入收费单位" editable={false}>收费单位</Input>
            {isActive === 'Y' ? <List.Item className={payItem ? 'hasContent' : ''} extra={payItem ? payItem : '请选择缴费项目'} arrow="horizontal"
              onClick={this.handlePopupShow} >
              <span className="required_symbol">*</span>缴费项目
              </List.Item> :
              <Input type="text" name="payItem" placeholder="请输入缴费项目" onChange={this.handleChange} clear>
                <span className="required_symbol" >*</span>缴费项目
              </Input>
            }
            <Input type="text" name="payAmount" value={(isActive === 'Y' && isEdit) ? allMoney : payAmount} placeholder={(isActive === 'Y' && isEdit) ? '选择缴费项目后显示' : '请输入缴费金额'} maxLength="13" clear editable={(isActive !== 'Y' || !isEdit)} onChange={this.inputChange}>
              <span className="required_symbol">*</span>缴费金额
            </Input>
            {/*自定义字段*/customData && customData.length > 0 &&
              customData.map((item, index) => {
                return (
                  <React.Fragment key={index}>
                    {
                      item.defaultVals && item.defaultVals.length > 0?
                      <List.Item className={item.customValue ? 'hasContent' : ''} extra={item.customValue ? item.customValue : `请选择${item.customName}`} arrow="horizontal" onClick={this.getDefaultVal.bind(this, item)} >
                        <span className="required_symbol">*</span>{item.customName}
                      </List.Item> :
                      <Input type="text" name={item.customId}
                        placeholder={"请输入" + item.customName}
                        onChange={this.handleCustomChange}
                        value={item.customValue} clear>
                        <span className="required_symbol">*</span>{item.customName}
                      </Input>
                    }   
                  </React.Fragment>
                )
              })
            }
            <Input type="text" name="remark" placeholder="请输入备注" onChange={this.handleChange} maxLength="50" clear>
              备注
            </Input>
          </div>
          <p className="pay_input_tips">说明：此页面用于自助缴费，若使用账单缴费，请返回上一页</p>
          <div className="go_pay_btn" onClick={this.goPayInfo}>缴费</div>
        </div>
        <PaymentPopup onRef={(ref) => { this.child = ref }} selectPayItmes={this.getChildValue} mercId={propOrgId} payType={2} selfIn={selfIn}  onClick={this.goSelfInput} isActive={isActive} reduction={this.reduction}></PaymentPopup>
        <Popup.SlidePop
          popup  visible={showPopup}  maskClosable={false} >
          <ul className="select-list">
            {defaultList.map((i, index) => (
              <li key={index} className="select-list-li boderBottomLine" onClick={this.getInputVal.bind(this, i.value)}>{i.value}</li>
            ))}  
          </ul>
          <div className="cancle_btn" onClick={() => { this.setState({ showPopup: false }) }}><p className="cancle_p">取消</p></div>
        </Popup.SlidePop>
      </div>
    );
  }
}
// mapStateToProps：将state映射到组件的props中
const mapStateToProps = (state, ownProps) => {
  return {
    customData: state.getCustomData,
  }
}
// mapDispatchToProps：将dispatch映射到组件的props中
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setPayInfo(data) {
      dispatch(payInfo(data));
    }
  }
}
const Connects = connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  { forwardRef: true }
)(PropertyPayInput)
export default Connects;