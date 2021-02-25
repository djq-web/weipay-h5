import React, { Component } from 'react';
import { Toast } from 'antd-mobile';
import { navigateTo, getQueryValue, toThousands } from "@utils/publicMethod";
import { API } from '@api/requestUrl';
import { Post } from '@api/index';
import './invoice.less';
class InvoiceList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      invoiceList: []
    };
  }
  componentWillMount() {  
    this.getList();
  }
  // 获取开票历史列表
  getList = () => {
    const schoolid = getQueryValue('schoolid');
    const stuNo = getQueryValue('stuNo');
    if (!schoolid || !stuNo) {
      return Toast.info('请从正常的缴费入口进入！', 2);
    }
    Post(API.qryInvoiceRec, {schId: schoolid, stuNo: stuNo }, true, 1)
      .then(res => {
        if (res && res.data) {
          let invoiceList = res.data.map((item, index) => {
            item.key = index;
            item.statusColor = 'kp_status';
            item.status =  Number(item.status);
            switch (item.status) {
              case 1:
                item.status = '未开票'
                break;
              case 2:
                item.status = '开票中',
                item.statusColor = 'kp_status blue'
                break;
              case 3:
                item.status = '已开票'
                break;
              case 4:
                item.status = '冲红中'
                break;
              case 5:
                item.status = '冲红成功'
                break;
              case 6:
                item.status = '开票失败'
                item.statusColor = 'kp_status red'
                break;
                case 7:
                  item.status = '红冲失败'
                  item.statusColor = 'kp_status red'
                  break;
              default:
            }
            return item;
          })
          this.setState({ invoiceList });
        }
      })
  }
  /***开票状态点击事件**/
  goToUrl = (obj) =>{
    if( obj.status == '已开票' && (obj.pictureUrl || obj.pdfUrl)){
        let url = obj.pictureUrl? obj.pictureUrl: obj.pdfUrl;
        window.location.href = url;
    }else if( obj.status == '开票中' ){
        this.props.nextPageStartDirection('left',()=>{
            navigateTo('/invoicing-billing');
        });
    }
  }
  render() {
    const { invoiceList } = this.state;
    return (
        <div className="invoice_history">
          {
            invoiceList.length !== 0 ?
              <React.Fragment>
                {
                  invoiceList.map(item => {
                    return (
                      <div className="list_wrap" key={item.key}>
                        <div className="white_box">
                          <div className="row row1">
                            <div className="kp_time">{item.createTime}</div>
                            <div className={item.statusColor} onClick={this.goToUrl.bind(this,item)}>{item.status}{item.status != '开票失败' && <span></span>}</div>
                          </div>
                          <div className="row row2">
                            <div className="small_gray">发票抬头：{item.buyerName || item.stuName}</div>
                          </div>
                          <div className="row row3">
                            <div className="small_gray sl">发票内容：{item.payItems || item.taxItemNames }</div>
                            <div className="fp_money">￥{toThousands(item.totalAmt)}</div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                }
              </React.Fragment>
              :
              <div className="fp_non_data"><span className="nodata_icon"></span>暂无开票记录</div>
          }
        </div>
    )
  }
}
export default InvoiceList;