import React, { Component } from 'react';
import { API } from '@api/requestUrl';
import { Get, Post } from '@api';
import { navigateTo, getQueryValue, storage, goBack } from "@utils/publicMethod";
import './index.less';

class PayList extends Component {
  constructor() {
    super();
    this.state = {
      list: [],
      mercId: '',
      userNo: '',
      respond: true,    // 防止重复点击,
      showPopup: false,
      currentNo: '' ,  // 当前点击的billNo
      paymentInfo: null,
      hasResponse: false,
    };
  }
  componentWillMount() {
    const mercId = getQueryValue('mercId') || '';
    const userNo = decodeURIComponent(getQueryValue('userNo')) || '';
    if (!mercId || !userNo) {
        this.props.nextPageStartDirection('left', () => {
          navigateTo('/');
        });
    } else {
      this.setState({ mercId, userNo },()=>{
        this.getHistoryList();
        this.getSchool(mercId);
      });
    }
  }
  /**获取学校相关信息**/
  getSchool = (schoolid) => {
    let reqUrl = 'default/' + schoolid;
    Get(API.querySchool + reqUrl, null, true).then(res=>{
          const data = res && res.data;
          if(data){
            this.setState({
              paymentInfo: data
            })  
          }
      })
  };
  getHistoryList = () => {
    const { mercId, userNo } = this.state;
    const { payType } = this.props;
    const reqUrl = payType===1? API.paybillhistory: payType===2? API.qrWyHisbill: API.qrOtherHisbill;
    let parmas = { schId: mercId, stuNo: userNo };
    if (payType === 2) {
      parmas = { propOrgId:mercId, certNo:userNo};
    }else if (payType === 3){
      parmas = { commOrgId:mercId, phoneNumber:userNo};
    }
    Post(reqUrl, parmas, true).then(res => {
      const data = res && res.data;
      if (data) {
        this.setState({ list: data });
      }
    })
  }
  goInvoiceType = () => {
    const mercId = getQueryValue('mercId') || '';
    const userNo = decodeURIComponent(getQueryValue('userNo')) || '';
    this.props.nextPageStartDirection('left', () => {
      navigateTo('/invoice-list', `schoolid=${mercId}&stuNo=${userNo}`);
    })
  }
  refundMoney=(billNo)=>{
    this.setState({
      showPopup: true,
      currentNo: billNo
    })
  }
  // 确认退款
  sureRefund=(billNo)=>{
    if (!this.state.respond){
      return false;
    }
    this.setState({ respond: false});
    Post(API.refundMoney,{billNo}, true).then(res=>{
      this.setState({ respond: true, showPopup: false });
      if (res){
        this.getHistoryList();
      }
    }).catch((error)=>{
      this.setState({ respond: true, showPopup: false });
    }) 
  }
  // 点击继续支付
  continueToPay=(billNo)=>{
    this.props.nextPageStartDirection('left', () => {
      navigateTo('/school-batch-pay', `billNo=${billNo}`);
    })
  }
    // 查看缴费凭证
  goVoucherUrl=(payOrderNo) =>{
      if (this.state.hasResponse) {
         return false;
      }
      this.setState({
        hasResponse: true
      })
      Get(API.getVoucher, { payOrderNo }, true).then(res=>{
        this.setState({hasResponse: false});
        if (res && res.data) {
          window.location.href = res.data;
        }
      }).catch((err)=>{
         this.setState({hasResponse: false});
      })
  }
  render() {
    const { list, showPopup, currentNo, paymentInfo } = this.state;
    //const paymentInfo = storage.get('receivingUnit') || {};
    const channelId = getQueryValue('channelId') || '';
    const { payType } = this.props;
    const mercId = getQueryValue('mercId') || '';
    return (
      <div className="pay_list_page">
        { channelId == 3 ? 
        <div className="page_header">
          <div className="page_title_history" onClick={()=> goBack()}>历史缴费</div>
          {
            paymentInfo && paymentInfo.invoiceEnableStatus == 'Y' &&
            <div className="green_btn" onClick={this.goInvoiceType}>电子票据</div>
          }
        </div> :
        <div className="page_header">
          {(payType==3 && mercId ==30) ? <div className="page_title">缴纳历史查询</div>:
            <div className="page_title">缴费历史查询</div>
          }
            {
              paymentInfo && paymentInfo.invoiceEnableStatus == 'Y' &&
              <div className="invoice_btn" onClick={this.goInvoiceType}>电子票据</div>
            }
        </div>
        }
        { list && list.length > 0? 
          <ul className="history_lit">
              { list.map(item => {
                return (
                  <li className="list_item" key={item.id}>
                   <div className={`flex_box ${channelId == 3 ? 'payli_item' : ''} ${payType!=1 || (item.billStatus !=6 && item.billStatus!=7)? 'noBottomLine': ''}`}>
                    <div className="item_left">
                        <p className={channelId == 3 ? 'channel_line' : 'first_line'}>缴费类目：{item.payItem}</p>
                        { payType==1 && (item.billStatus ==6 || item.billStatus==7)? 
                         <p className="totalMoney">合计： <span>￥{(item.payAmount / 100).toFixed(2)}</span></p>:
                         <p className="second_line">{item.createTime}</p>
                        }
                      </div>
                      {payType==1?<div className="item_right">
                         <p>￥<span>{((item.payAmount-item.unPayAmount) / 100).toFixed(2)}</span></p>
                         <p className="new_line">
                           {item.payStatus==='S' && item.certStatus==1 && <span className="voucher_btn" onClick={this.goVoucherUrl.bind(this, item.payNo)} >查看缴费凭证</span>}
                           {item.payStatus!=='S' && <span className="payStatusName">{item.payStatusStr}</span>}
                         </p>
                        </div>:
                      <div className="item_right">
                        <p>￥<span>{(item.payAmount / 100).toFixed(2)}</span></p>
                      </div>
                      }
                   </div>
                 { payType==1 && (item.billStatus ==6 || item.billStatus==7) &&
                 <div>
                    <div className={`pay_content ${channelId==3? 'pay_content_green': ''}`}>
                        {
                          <p className="beingPay">待支付：<span className="num">¥ {(item.unPayAmount / 100).toFixed(2)}</span></p>
                        }
                        { item.billStatus == 6 && item.refundFlag == 1 && 
                          <p onClick={this.refundMoney.bind(this, item.billNo)}>申请退款</p>
                        }
                        {item.billStatus==6 &&
                          <p className={`continue_pay ${channelId==3? 'continue_pay_green': ''}`} onClick={this.continueToPay.bind(this, item.billNo)}>继续支付</p>
                        }
                        {item.billStatus==7&&<p className="refunding">退款中</p>}
                      </div>
                      <p className="grayLine"></p>
                  </div>
                  }
                  </li>
                )
              })}
          </ul>:
          <div className="noDataTips">
            <p className="emptyIMg"></p>
            <p>{(payType==3 && mercId ==30) ? "暂无缴纳记录":"暂无缴费记录"}</p>
          </div>
        }
          <div className={["popop_model_box",showPopup? "popup_show":""].join(' ')}>
            <div className="popop_main_content">
              <div className="content_title">申请退款</div>
              <div className="popup_content bottom_line">已支付部分将全部原路退回</div>
              <div className="popup_footer">
                <p className={["cancle_btn", channelId==3? "greenBtn":""].join(' ')} onClick={()=>{this.setState({ showPopup: false})}} >取消</p>
                <p className={["determine_btn", channelId==3? "greenBtn":""].join(' ')} onClick={this.sureRefund.bind(this, currentNo)}>确定</p>
              </div>
            </div>
        </div>   
      </div>
    )
  }
}
PayList.defaultProps ={
  payType: 1
}
export default PayList;
