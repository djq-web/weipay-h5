/**1、通过输入学号/证件号进入此页面
 * 2、mercId、userNo 分别代表缴费单位的Id 和输入的学号/证件号
 * 这两个参数 在物业缴费和其他缴费也适用，这两个参数是在授权后，
 * 后端重定向到当前页面拼接的，目的是为了查询到缴费单位的信息以及待缴费列表
 **/

import React, { Component } from "react";
import PropTypes from "prop-types";
import { getQueryValue,goBack } from "@utils/publicMethod";
import { Post, Get } from "@api/index";
import { API } from "@api/requestUrl";
import { Toast } from 'antd-mobile';
import { storage } from "@utils/publicMethod";
import "@assets/css/payment-process.less";
class OtherMchPaymentProcess extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orderList: [],
      message: "",
      showPopup: false,
      showFaultPop:true,
      count:0,
      payOrderNo:''
    };
  }
  componentWillMount() {
    this.queryOrderDetail()
  }
  queryOrderDetail=()=> {
    const commOrgId = getQueryValue("mercId");
    const phoneNumber = decodeURIComponent(getQueryValue("userNo"));
    const commUname = getQueryValue("commUname");
    const parmas = { commUname, phoneNumber,commOrgId };
    Post(API.queryOtherMchOrderDetail, parmas, true).then((res) => {
      const data = res && res.data;
      if (data)
        this.setState({
          orderList: data || [],
        });
        if(data.length==0){
          this.setState({
            count: data.count||0,
            message:'没有待处理订单，请重新选择缴费项目缴费',
            showPopup: true,
            showFaultPop:false,
          });
        }
    });
  }
  Cancel=(payOrderNo)=>{
    this.setState({ showPopup: true ,
      payOrderNo:payOrderNo
    });
  };
  cancelOrder = (payOrderNo)=>  {
      const parmas ={
        payOrderNo:payOrderNo
      }
    Post(API.cancelOrder, parmas, true).then((res) => {
      const data = res && res.data;
      const {count,overTime}=data  
      if (data&&!overTime){
        this.setState({
          showPopup: false,
          count:count||0
        });
        this.queryOrderDetail()
      }else if(overTime==true){
        this.setState({
          showPopup: true,
          showFaultPop:false,
          count:count||0,
        });
        if(count>0){
          this.setState({
            message:'该订单已超时，请重新选择项目进行缴费'
          });
        }else{  
          this.setState({
          message:'没有待处理订单，请重新选择缴费项目缴费'
          });
        }
      }
        
    }).catch(()=>{
      this.setState({
        showPopup: false,
        showFaultPop:true,
        message:''
      })
      return Toast.info("请求失败");
     
    });
  }
  //
  closeModel=()=>{
    const {count}=this.state
    if(count>0){
      this.queryOrderDetail()
    }else{
      goBack()
    }
    this.setState({
      showPopup: false,
      showFaultPop:true,
      message:'',
    });
    
  };
  confirm (payOrderNo) {
    const parmas ={
      payOrderNo:payOrderNo
    };
     
    Post(API.repayOrder, parmas, true).then((res) => {
      const data = res && res.data;
      const {count,overTime}=data
      if (data&&!overTime) {
        const { code_url } = data;
        if(code_url){
          /* 生产环境开启跳转 */
          window.location.href = code_url;
        }
      }else if(overTime==true){
        this.setState({
          showPopup: true,
          showFaultPop:false,
          count:count||0,
        });
        if(count>0){
          this.setState({
            message:'该订单已超时，请重新选择项目进行缴费'
          });
        }else{  
          this.setState({
          message:'没有待处理订单，请重新选择缴费项目缴费'
          });
        }
      }

    }).catch((err=>{
      this.setState({
        showPopup: false,
        showFaultPop:true,
        message:''
      })
      return Toast.info("请求失败");
    }));
   }
  render() {
    // const channelid = getQueryValue("channelid");
    const { showPopup,payOrderNo,message,showFaultPop,orderList } = this.state;
    const themeColor = getQueryValue("themeColor");
    return (
      <div className="content-process">
        { orderList.map((item,index) => {
                return (
        <div className="payment-process" key={index}>
          <div className="process-top">
                <span>支付订单号:{(item.payOrderNo)}</span>
          </div>
          <div className="process-middle">
            <div className="process-middle-top">
              <span className="process-title">缴费项目</span>
                <div className="payment-items">{(item.payItems)}</div>
            </div>
            <div className="process-middle-bottom">
              <span className="process-title">缴费金额</span>
              <div className="payment-money">￥ {(item.payAmount / 100).toFixed(2)}</div>
            </div>
          </div>
          <div className="process-bottom">
            <div className="process-buttom">
                        <div className="cancle-order" onClick={this.Cancel.bind(this, item.payOrderNo)}>取消订单</div>
            {item.showRepayBotton ? (
              themeColor == 1 ? (
                <div className="confirm-party" onClick={this.confirm.bind(this,item.payOrderNo)}>支付</div>
              ) : (
                <div className="confirm" onClick={this.confirm.bind(this,item.payOrderNo)}>支付</div>
              )
            ):''}
            </div>
          </div>
        </div>
           )
          })}
        <div className={["popop_model_box",showPopup? "popup_show":""].join(' ')}>
            <div className="popop_main_content">
              <div className="content_title">温馨提示</div>
              { showPopup&&showFaultPop&& <div className="popup_content bottom_line">是否取消订单</div>}
              { showPopup&&!showFaultPop&&<div className="popup_content bottom_line">{message}</div>}
             { showPopup&&showFaultPop&&<div className="popup_footer">
                <p className={["cancel_btn", themeColor==1? "redBtn":""].join(' ')}  onClick={()=>{this.setState({ showPopup: false})}}>否</p>
               <p className={["determine_btn", themeColor==1? "redBtn":""].join(' ')} onClick={this.cancelOrder.bind(this,payOrderNo)}>是</p>
              </div>
              }
                { showPopup&&!showFaultPop&&<div className="popup_footer">
                <p className={["determine_btn", themeColor==1? "redBtn":""].join(' ')} onClick={this.closeModel}>确定</p>
              </div>
              }
            </div>
            </div>
      </div>
    );
  }
}
OtherMchPaymentProcess.propTypes = {
  nextPageStartDirection: PropTypes.func,
};

export default OtherMchPaymentProcess;
