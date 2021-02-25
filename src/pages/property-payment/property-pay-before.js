import React, { Component } from 'react';
import { Toast } from 'antd-mobile';
import Input from '@components/input';
import List from '@components/list';
import Popup from '@components/popup';
import { API } from '@api/requestUrl';
import Banner from '@components/banner';
import { Get, Post } from '@api/index';
import { navigateTo, getQueryValue, isAliPayClient, storage, isRightName } from "@utils/publicMethod";
import '@assets/css/pay-before.less';

class PropertyPayBefore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      propOrgId: '',
      proporgInfo: {},
      selectPayName: '业主信息',
      optionsData: [{ value: '1', name: '业主信息' }, { value: '2', name: '房屋信息' }],
      payType: 1,
      tierName: '',
      dataList: [],
      showPopup: false,
      tierId: 0,  // 楼栋的ID
      houseUname: '', // 业主姓名
      certNo: '' ,   //  证件号
      houseNo: '',  // 户号
      showSelect: false,  // 底部弹窗选择框
      showPage: false
    };
  }
  componentWillMount(){
    const isAuthor =  getQueryValue('isAuthor') || '';
    if (isAuthor === '1') {
      this.initPage();
    }else{
      this.getAuthorization();
    }
  }
  /*
  查询用户是否授权过
  ** @parmas mercType 商户类型 1-学校商户 2-物业商户 3-其他商户
   * */ 
  getAuthorization=()=>{
    const authorizeType = isAliPayClient(window.navigator.userAgent) ? 2 : 1; // 判断用户端
    const propOrgId = getQueryValue('propOrgId');
    Post(API.queryAuthorization, { authorizeType, mercId: propOrgId }, true, 1).then(res =>{
      if ( res && res.data && res.data.mercId) {
        const { data } = res;
        navigateTo('/wy-pay-select', `mercId=${data.mercId}&userNo=${data.userNo}&userName=${encodeURIComponent(data.userName)}`);
      }else{
        this.initPage();
      }
    })
  }
  /**页面初始化**/
  initPage=()=>{
    const proporgInfo = storage.get('receivingUnit') || {};
    const propOrgId = getQueryValue('propOrgId');
    const template = getQueryValue('template');
    if (propOrgId && template) {
      if(proporgInfo && Object.keys(proporgInfo).length !== 0){
        this.setState({propOrgId, proporgInfo, showPage: true });
      }else{
        let localUrl = window.location.hash;
        let redirectUrl = localUrl.split('#')[1];
        redirectUrl= `${redirectUrl}&navigate=false`;
        this.CheckOpenHuaBei(propOrgId, redirectUrl);
      }
    }else{
      return Toast.info('不是合法的进入入口', 2);
    } 
  }
    /**检测是否开通花呗支付**/ 
  CheckOpenHuaBei = (orgId, redirectUrl) => {
      const navigate = getQueryValue('navigate') || '';
      Get(API.isOpenHB, { orgType: 1, orgId }, true).then(res => {
          let data = res && res.data;
          if (data){
            const { hbStatus } = data;
            //  如果开通了花呗，同时是在微信端打开，进入花呗推广页面
            if (hbStatus === 'Y' && !isAliPayClient(window.navigator.userAgent) && !navigate ) { 
                const path = '/aliPay-tips';
                navigateTo(path, `redirectUrl=${redirectUrl}`)
            }else{
              this.getProperty(orgId);
            }
          }
      })
  };
  /**获取物业单位的相关信息**/
  getProperty = (propOrgId) => {
    let reqUrl = 'default/' + propOrgId;
    Get(API.queryProperty + reqUrl, null, true).then(res=>{
          const data = res && res.data;
          if(data){
            storage.set('receivingUnit', data);   // 存储收款的单位信息
            if (data.zzStatus === 'Z') {
               navigateTo('/wy-pay-input', `propOrgId=${propOrgId}&template=default`)
            }else{
              this.setState({ proporgInfo: data, propOrgId, showPage: true })   
            }
          }
      })
  };
  /**点击去缴费**/
  goPaySelect=()=>{
    let { propOrgId, payType, tierId, houseUname, certNo, houseNo, tierName } = this.state;
    houseUname = houseUname.replace(/(^\s*)|(\s*$)/g, "");
    certNo = certNo.replace(/(^\s*)|(\s*$)/g, "");
    houseNo = houseNo.replace(/(^\s*)|(\s*$)/g, "");
    if (!propOrgId){
      return Toast.info('收费单位不能为空', 2);
    }
    // let parmas= {};
    if (payType == 1) {
      if (!isRightName(houseUname)){
        return Toast.info('请输入正确的姓名', 2);
      }else if(!certNo){
        return Toast.info('请输入正确的证件号', 2);
      }
      // parmas = {
      //   propOrgId,
      //   certNo,
      //   houseUname,
      //   qryBillFlag: 1
      // }
      this.querUser(propOrgId, certNo, houseUname);
    }else{
      // let reg = /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/; 
      if (!tierId) {
        return Toast.show('请选择楼栋单元', 2);
      }else if(!houseNo){
        return Toast.info('请输入正确的户号', 2);
      }
      let buildingUnit = tierName + houseNo;
      const buildInfo = { tierId, houseNo, buildingUnit };
      storage.set('buildInfo', buildInfo);
      this.queryNo(propOrgId, tierId, houseNo).then(data=>{
        this.querUser(propOrgId, data.certNo, data.houseUname);
      }).catch(err=>{ console.log(err)});
      // parmas = {
      //   propOrgId,
      //   houseNo,
      //   tierId,
      //   qryBillFlag: 2
      // }
    }
    // this.props.nextPageStartDirection('left', () => {
    //    navigateTo('/wy-pay-select');
    // });
  }
  // 点击去缴费先查询当前用户No是否存在
  querUser=(mercId, userNo,userName)=>{
    Post(API.queryUser,{mercType: 2, mercId, userNo, userName}, true, 1).then(res=>{
      if (res && Object.keys(res).length !==0 ){
          this.getUserInfo(mercId, userNo, userName);
      }
    })
  }
    /**获取微信/支付宝授权
   * @param Object
   * merc_type      商户类型 1-学校商户 2-物业商户 3-其他商户   
   * merc_id        商户表主键 学校主键 物业主键 其他主键                
   * user_no        缴费系统用户编号 学号、手机号                        
   * authorize_type 授权类型 1-微信 2-支付宝
  */ 
  getUserInfo = (mercId, userNo, userName) => {
    const authorizeType = isAliPayClient(window.navigator.userAgent) ? 2 : 1; // 判断用户端
    const url = window.location.href;
    let arrUrl = url.split("#");
    let parmas = {
      mercType: 2,
      mercId,
      userNo,
      userName: encodeURIComponent(userName),
      authorizeType,
      frontUrlPre: escape(arrUrl[0]),
      frontUrlSuf: escape(arrUrl[1])
    }
    let PostUrl = authorizeType == 1 ? API.getwxInfo : API.getAliPayInfo;
    Post(PostUrl, parmas, true, 1).then(res => {
      if (res) {
        window.location.href = res;
      }
    })
  }
  // 根据楼宇查询业主证件号接口
  queryNo=(propOrgId, tierId, houseNo)=>{
    return new Promise((resolve, reject)=>{
      Post(API.queryWyUserNo, { propOrgId, tierId, houseNo }, true).then(res => {
        if (res && res.userInfo) {
           resolve(res.userInfo);
        }else {
           reject({});
        }
      })
    })
  }
  /**点击自助缴费**/
  selfHelpPay=(propOrgId)=>{
    this.getCustomData(propOrgId).then(()=>{
        return this.checkActive(propOrgId);
    }).then((data)=>{
        if (data && Object.keys(data).length !== 0){
          this.props.nextPageStartDirection('right',()=>{
            navigateTo('/wy-pay-input', `propOrgId=${propOrgId}&isActive=${data.isActive}`)
          });
        }
    }).catch((err)=>{
      console.log(err);
    })
  }
    /**
   * 获取自定义字段
   * **/
  getCustomData = (propOrgId) =>{
    return new Promise((resolve, reject)=>{
      Post(API.getWyCustomItem, { propOrgId }, true, 1).then(res=> {
        resolve();
        const data = res && res.data;
        if (data){
          storage.set('customData', data);
        }
        }).catch(err=>{
          reject(err);
        });
    })      
  }
  checkActive=(propOrgId)=>{
    return new Promise((resolve, reject)=>{
      Get(API.propCheckActive, { propOrgId }, true)
      .then(res=> {
         const data = res && res.data;
         resolve(data);
      }).catch(err=>{
          reject(err);
      });
    })
  }
  //用户输入时触发
  handleChange=(data)=>{
    switch(data.name){
        case 'houseUname':
            this.setState({
               houseUname:data.data
            });
            break;
        case 'certNo':
            this.setState({
              certNo:data.data
            });
            break;
        case 'houseNo':
          this.setState({
             houseNo:data.data
          });
          break;
    }
  };
  getData = () => {
    const { dataList, propOrgId } = this.state;
    if (dataList && dataList.length) {
      return false;
    }
    Post(API.buildinglist, { propOrgId: propOrgId }, false, 1).then(res => {
        const data = res && res.data;
        if (data && Array.isArray(data)){
          data.map(item=>{
            item.flag = false;
          })
          this.setState({
            dataList: data
          })
        }
    })
  }
  /**切换缴费类型**/
  selectItem = (item) => {
    this.setState({
        selectPayName: item.name,
        payType: item.value,
        showSelect: false
    })
    if (item.value == '2' ){
      this.getData();
    }
  }
  upFlod =(id)=>{
    let { dataList  } = this.state;
     dataList.forEach(item=>{
        if (item.tierId == id){
          item.flag = item.flag? false : true;
        }
     })
     this.setState({
       dataList
     })
  }
  getHouse=(item , number)=>{
    this.setState({
      tierName: item.tierName,
      tierId: item.tierId,
      houseNo: number,
      showPopup: false
    })
  }
  render() {
    const { proporgInfo, selectPayName, payType, optionsData,tierName,showPopup, dataList, propOrgId, houseNo, showPage } = this.state;
    const { zzStatus } = proporgInfo;
    return (
      <div className="payBeforePage">
        { proporgInfo && showPage && 
          <div className="page_main_content">
            <Banner mercId={propOrgId} mchType={1}></Banner>
            {/* <div className="pay_befor_banner property_banner"></div> */}
            { zzStatus != "Z" && <div className="content_title">请输入姓名及手机号，进行缴费</div> }
            <div className={["form_data",zzStatus == "Z"? "topLine":""].join(' ')}>
              <Input type="text" placeholder="收费单位"  editable={false} value={proporgInfo.propMercName} className="mediumSzie">收费单位</Input>
              {
               zzStatus != "Z" &&
               <div className="propertyForm">
                  <List.Item className="hasContent"  extra={selectPayName} arrow="horizontal" onClick={() => { this.setState({ showSelect: true }) }}>
                      <span>缴费类型</span>
                  </List.Item> 
                  {  payType == 1 ?
                    <div>
                        <Input name="houseUname" type="text"  placeholder="请输入姓名" 
                              onChange={this.handleChange}clear>姓名
                        </Input>
                        <Input name="certNo" type="text" placeholder="请输入手机号/证件号"
                              onChange={this.handleChange} clear>手机/证件号
                        </Input>
                    </div> :
                    <div>
                      <List.Item className={tierName ? 'hasContent' : ''} extra={tierName ? tierName : '选择楼栋单元'} arrow="horizontal" onClick={()=> this.setState({ showPopup: true })}>
                      <span>楼栋单元</span>
                      </List.Item>
                      <Input name="houseNo" value={houseNo}  type="text"  placeholder="请输入户号"
                            onChange={this.handleChange} clear >户号
                      </Input>
                    </div>
                  }
               </div>
              }
            </div>
            {    /*根据后台配置判断是否展示学号缴费功能 Y-学号和自助都有，N只展示学校，Z只展示自助*/
              (zzStatus != 'Z') &&
              <div className="go_pay_btn" onClick={this.goPaySelect}>去缴费</div>
            }
            {   /*根据后台配置判断是否展示自助缴费功能 Y-学号和自助都有，N只展示学校，Z只展示自助*/
             zzStatus != 'N' &&
              <div className="selfPaybtn" onClick={this.selfHelpPay.bind(this, propOrgId)}>自助缴费</div>
            }
         </div>
         }
         <Popup.SlidePop popup title="楼栋单元" visible={showPopup} closable={true} maskClosable={false}
         onClose={() => { this.setState({ showPopup: false }) }} >
            <ul className="house_list">
              {
                dataList.map((item, index) => (
                  <li key={index} className="house_item">
                    <div className="house_name">
                      <span className="flex_left_name">{item.tierName}</span>
                      {
                      item.houseList &&item.houseList.length > 0 &&<span className={`foldBtn ${item.flag? 'unfoldBtn': ''}`}  onClick={this.upFlod.bind(this, item.tierId)}></span>
                      }
                    </div>
                    { item.flag &&
                      item.houseList.map((childItme, number) => (
                          <div key={number} className="child_list_item" onClick={this.getHouse.bind(this, item, childItme.houseNo)}>{childItme.houseNo}</div>
                      ))
                    }
                  </li>
                ))
              }
            </ul>
          </Popup.SlidePop>
          <Popup.SlidePop
          popup
          visible={this.state.showSelect}
          onClose={() => { this.setState({ showSelect: false }) }}
          animationType="slide-up"
        >
          <ul className="select-list">
            {optionsData.map((i, index) => (
              <li key={index} className={`select-list-li ${index==0? 'bottom_line': ''}`} onClick={this.selectItem.bind(this, i)}>{i.name}</li>
            ))}
          </ul>
          <div className="cancle_btn" onClick={() => { this.setState({ showSelect: false }) }}><p className="cancle_p">取消</p></div>
        </Popup.SlidePop>
      </div>
    )
  }
}

export default PropertyPayBefore;
