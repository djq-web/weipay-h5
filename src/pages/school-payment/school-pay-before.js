import React, { Component } from 'react';
import { Toast } from 'antd-mobile';
import Banner from '@components/banner';
import Input from '@components/input';
import { API } from '@api/requestUrl';
import { Get, Post } from '@api/index';
import { navigateTo, getQueryValue, isAliPayClient, storage, isRightName } from "@utils/publicMethod";
import '@assets/css/pay-before.less';

class PayBefore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      schoolid: '',
      schoolInfo: {},
      stuNo: '', // 输入的学号/证件号
      showPage: false,
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
    const schoolid = getQueryValue('schoolid');
    Post(API.queryAuthorization, { authorizeType, mercId: schoolid }, true, 1).then(res =>{
      if ( res && res.data && res.data.mercId) {
        const { data } = res;
        navigateTo('/pay-select', `mercId=${data.mercId}&userNo=${data.userNo}`);
      }else{
        this.initPage();
      }
    })
  }
  /**页面初始化**/
  initPage=()=>{
    const schoolInfo = storage.get('receivingUnit') || {};
    const schoolid = getQueryValue('schoolid');
    const template = getQueryValue('template');
    if (schoolid && template) {
      if(schoolInfo && Object.keys(schoolInfo).length !== 0){
        this.setState({ schoolid, schoolInfo, showPage: true }); 
      }else{
        let localUrl = window.location.hash;
        let redirectUrl = localUrl.split('#')[1];
        redirectUrl= `${redirectUrl}&navigate=false`;
        this.CheckOpenHuaBei(schoolid, redirectUrl);
      }
    }else{
      return Toast.info('不是合法的进入入口', 2);
    }
  }
    /**检测是否开通花呗支付**/ 
  CheckOpenHuaBei = (orgId, redirectUrl) => {
      const navigate = getQueryValue('navigate') || '';
      Get(API.isOpenHB, { orgType: 0, orgId }, true).then(res => {
          let data = res && res.data;
          if (data){
            const { hbStatus } = data;
            //  如果开通了花呗，同时是在微信端打开，进入花呗推广页面
            if (hbStatus === 'Y' && !isAliPayClient(window.navigator.userAgent) && !navigate) { 
                const path = '/aliPay-tips';
                navigateTo(path, `redirectUrl=${redirectUrl}`)
            }else{
              this.getSchool(orgId);
            }
          }
      })
  };
  /**获取学校相关信息**/
  getSchool = (schoolid) => {
    let reqUrl = 'default/' + schoolid;
    Get(API.querySchool + reqUrl, null, true).then(res=>{
          const data = res && res.data;
          if(data){
            storage.set('receivingUnit', data);   // 存储收款的单位信息
            if (data.zzStatus === 'Z' && data.areaCode !== '4') {
              navigateTo('/pay-input', `schoolid=${schoolid}&template=default`)
            }else{
              this.setState({
                schoolInfo: data,
                schoolid,
                showPage: true
              }) 
            } 
          }
      })
  };
  
  /**点击去缴费**/
  goPaySelect=()=>{
    let { stuNo, schoolInfo } = this.state;
    let { schPayBase } = schoolInfo;
    stuNo = stuNo.replace(/(^\s*)|(\s*$)/g, "");
    if (!schoolInfo.id){
      return Toast.info(`收费单位不能为空`, 2);
    }else if (!stuNo) {
      return Toast.info(`请输入正确的${schPayBase.userNo}`, 2);
    }
    this.querUser(schoolInfo.id, stuNo);
    // this.props.nextPageStartDirection('left', () => {
    //   navigateTo('/pay-select',`mercId=${schoolInfo.id}&userNo=${stuNo}`);
    // });
  }
  // 点击去缴费先查询当前用户No是否存在
  querUser=(mercId, userNo)=>{
    Post(API.queryUser,{mercType: 1, mercId, userNo}, true, 1).then(res=>{
      if (res && Object.keys(res).length !==0 ){
          this.getUserInfo(mercId, userNo);
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
  getUserInfo = (mercId, userNo) => {
    const url = window.location.href;
    let arrUrl = url.split("#");
    const authorizeType = isAliPayClient(window.navigator.userAgent) ? 2 : 1; // 判断用户端
    let parmas = {
      mercType: 1,
      mercId,
      userNo,
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
  /**点击自助缴费**/
  selfHelpPay=(schoolid)=>{
    this.getCustomData(schoolid).then(()=>{
        return this.checkActive(schoolid);
    }).then((data)=>{
        if (data && Object.keys(data).length !== 0){
          this.props.nextPageStartDirection('right',()=>{
            navigateTo('/pay-input', `schoolid=${schoolid}&isActive=${data.isActive}`)
          });
        }
    }).catch((err)=>{
      console.log(err);
    })
  }

    /**
   * 获取自定义字段
   * **/
  getCustomData = (id) =>{
    return new Promise((resolve, reject)=>{
      Post(API.queryCustonData, { id }, true, 1).then(res=> {
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
  checkActive=(schId)=>{
    return new Promise((resolve, reject)=>{
      Get(API.checkActive, { schId }, true)
      .then(res=> {
         const data = res && res.data;
         resolve(data);
      }).catch(err=>{
          reject(err);
      });
    })
  }
  //用户输入时触发
  handleChange=(event)=>{
    this.setState({
        stuNo: event.data
    })
  };
  render() {
    const { schoolInfo, showPage } = this.state;
    const schoolid = getQueryValue('schoolid');
    const { zzStatus, areaCode ,schPayBase} = schoolInfo;
    return (
      <div className="payBeforePage">
        { schoolInfo && showPage &&
          <div className="page_main_content">
            <Banner mercId={schoolid} mchType={0}></Banner>
            <div className="content_title">请输入{schPayBase&&schPayBase.userNo}进行缴费</div>
            <div className="form_data">
              <Input type="text" placeholder="收费单位"  editable={false} value={schoolInfo.schName} className="mediumSzie">收费单位</Input>
              {
                /*根据后台配置判断是否展示学号缴费功能 Y-学号和自助都有，N只展示学校，Z只展示自助*/
               ( (areaCode == 4 ) || (areaCode != 4  && zzStatus != 'Z') ) &&
              <Input type="text" placeholder={`请输入${schPayBase&&schPayBase.userNo}`} onChange={this.handleChange} clear>{schPayBase&&schPayBase.userNo}</Input>
              }
            </div>
            {    /*根据后台配置判断是否展示学号缴费功能 Y-学号和自助都有，N只展示学校，Z只展示自助*/
              (zzStatus != 'Z' || areaCode == 4) &&
              <div className="go_pay_btn" onClick={this.goPaySelect}>去缴费</div>
            }
            {   /*根据后台配置判断是否展示自助缴费功能 Y-学号和自助都有，N只展示学校，Z只展示自助*/
             zzStatus != 'N' && areaCode!= 4 &&
              <div className="selfPaybtn" onClick={this.selfHelpPay.bind(this, schoolid)}>自助缴费</div>
            }
         </div>
         }
      </div>
    )
  }
}
export default PayBefore;