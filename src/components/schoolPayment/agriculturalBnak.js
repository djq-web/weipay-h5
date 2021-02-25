import React, { Component } from 'react';
import { Button, Toast } from 'antd-mobile';
import { API } from '@api/requestUrl';
import { Get, Post } from '@api/index';
import { navigateTo, isAliPayClient, storage } from "@utils/publicMethod";
import logo from '@assets/image/class_banner.png';
import payDetails from '@assets/image/payDetails.png';
import './agriculturalBnak.less';

class AgriculturalBnak extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stuNo: '',
    }
  }
  componentWillMount() { }
  getInputVal(event) {
    this.setState({
      stuNo: event.target.value
    })
  }
  /**选择区域**/
  changeArea = () => {
    this.props.onClick()
  }
  /**点击去缴费**/
  goPaySelect = () => {
    const { id, zzStatus } = this.props.schInfo;
    const { stuNo } = this.state;
    let { channelid } = this.props;
    let RegstuNo = stuNo.replace(/(^\s*)|(\s*$)/g, "");
    if (zzStatus === "Z") {
      Toast.info('该学校仅支持自助缴费', 2);
      return;
    } else if (!id) {
      Toast.info('请选择缴费学校', 2);
      return;
    } else if (!RegstuNo) {
      Toast.info('学号/证件号不能为空', 2);
      return;
    }
    storage.set('channelid', channelid);
    // this.props.nextPageStartDirection('left', () => {
    //   navigateTo('/pay-select',`mercId=${id}&userNo=${RegstuNo}&channelid=${channelid}`);
    // });
    this.getUserInfo(id, RegstuNo);
  }
  /**点击自助缴费**/
  servicePayment=()=>{
    const { id } = this.props.schInfo;
    let channelid = this.props.channelid;
    if (!id) {
      Toast.info('请选择缴费学校', 2);
      return;
    }
    this.getCustomData(id).then(()=>{
        return this.checkActive(id);
    }).then((data)=>{
        if (data && Object.keys(data).length !== 0){
          storage.set('receivingUnit', this.props.schInfo); // 存储收款的单位信息
          this.props.nextPageStartDirection('right',()=>{
            navigateTo('/pay-input', `schoolid=${id}&isActive=${data.isActive}&channelid=${channelid}`)
          });
        }
    }).catch((err)=>{
      console.log(err);
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
    return new Promise((resolve, reject) => {
      let PostUrl = authorizeType == 1 ? API.getwxInfo : API.getAliPayInfo;
      Post(PostUrl, parmas, true, 1).then(res => {
        if (res) {
          resolve(res);
          window.location.href = res;
        } else {
          reject(res);
        }
      })
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
  render() {
    const { schInfo, schName } = this.props;
    const { stuNo } = this.state;
    return (
      <div className="bankCustomizate">
        <div className="bank_mainContainer">
          <div className="bannerImg">
            <img src={logo} className="blackboard" />
          </div>
          <React.Fragment>
            <div className="pay_before_box">
              <p className="form_laber">缴费学校</p>
              <p className="line_input_box" onClick={this.changeArea}>
                <input className="form_input"
                  type="text"
                  placeholder="收费单位"
                  value={schName}
                  readOnly
                />
                <span className="goSelectBtn"></span>
              </p>
              <p className="form_laber">学生学号/证件号</p>
              <p className="line_input_box">
                <input className="form_input"
                  type="text"
                  onChange={this.getInputVal.bind(this)}
                  placeholder="请输入学生学号/证件号"
                  value={stuNo}
                />
              </p>
              {((schInfo.zzStatus != 'Z') || (schInfo.areaCode == 4)) &&
                <div className='green_btn_wrap'><Button type="primary" onClick={this.goPaySelect}>去缴费</Button></div>}
            </div>
          </React.Fragment>
          {schInfo.zzStatus != 'N' && schInfo.areaCode != 4 &&
            <div className="otherBtn" onClick={this.servicePayment}>自助缴费</div>
          }
          <div className="fiex_logo_bx">
            <img src={payDetails} className="payDetailsImg" />
            <p className="pageTips">客户服务热线：95392</p>
          </div>
        </div>
      </div>
    );
  }
}

AgriculturalBnak.defaultProps = {
  schInfo: {},
  channelid: ''
}
export default AgriculturalBnak;
