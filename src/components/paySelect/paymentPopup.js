/**
 * payType的值为1，2，3分别代表学校、物业、其他
 * mercId 代表当前收费单位的ID值 用该值来查询激活的缴费项目 
 * **/

import React, { Component } from 'react';
import { Toast } from 'antd-mobile';
import Popup from '@components/popup';
import Checkbox from '@components/checkbox';
import { API } from '@api/requestUrl';
import { Get } from '@api/index';
import { getMoney } from "@utils/publicMethod";
import './paymentPopup.less';

class PaymentPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPopup: false,
      itemsOption: [],
    }
  }
  componentDidMount() {
    // if (this.props.isActive !== 'N'){
    //   this.getItemOption();
    // }
    this.props.onRef(this);
  }
  //获取自助缴费项目列表
  getItemOption = () => {
    let { mercId, payType } = this.props;
    const requestUrl = payType == 1 ? API.schoolItemInfo : payType == 2 ? API.propertyItemInfo : API.otherMchItemInfo;
    let parmas = {};
    if (payType == 1) {
      parmas.schId = mercId;
    } else if (payType == 2) {
      parmas.propOrgId = mercId;
    } else {
      parmas.commOrgId = mercId;
    }
    Get(requestUrl, parmas, true)
      .then(res => {
        const data = res && res.data;
        if (data && Object.keys(data).length !== 0) {
          data.map((item, index) => {
            item.key = index;
            if (item.payMoney === 0) {
              item.payMoney = '';
              item.flag = true;
            }
            return item;
          })
          this.setState({ itemsOption: data });
        }
      })
  }
  onShow = () => {
      this.setState({ showPopup: true });
  }
  inputOnBlur=()=>{
    this.props.reduction();
  }
  /**input框中输入金额**/
  inputChange=(id, e)=>{
      let itemsOption = JSON.parse(JSON.stringify(this.state.itemsOption));
      itemsOption.forEach((item)=>{
          if (id=== item.itemId){
              item.payMoney = e.target.value;
              if (e.target.value.indexOf('￥')!=-1){
                  let reg =/^['￥']?(([1-9]{1}\d*)|(0{1}))(\.\d{3})$/;
                  let flag = reg.test(e.target.value);
                  if (!flag) {
                      item.inputMoney = e.target.value
                  } 
              }else{
                  item.inputMoney = '￥'+ e.target.value;
              }
          }
      })
      this.setState({ itemsOption });
  }

  /**缴费项目确定**/ 
  comfirmItem = () =>{
      const { itemsOption } = this.state;
      let payAmount = 0 ;
      let itemNameArray = [] ;  // 用于存缴费项目名字
      let payItemArr = [] ;     //用于存缴费项目id和金额
      let money = '';
      let list = [];
      let reg = /^(?=.*[a-zA-Z])|(?=.*[\u4e00-\u9fa5])|(?=.*[~!@#$%^&*()_+`\-={}:";'<>?,.\/])$/;
      for(let i=0;i<itemsOption.length; i++){
        if (itemsOption[i].checked===true){          
            let obj = {};
            let itemMoney = itemsOption[i].payMoney;
            if (itemMoney && typeof itemMoney === 'string') {
                if (itemsOption[i].inputMoney.indexOf('￥')!=-1){
                    if(reg.test(itemMoney)){
                       return Toast.info('请输入正确的金额',2);   
                    }
                    itemMoney = itemsOption[i].inputMoney.replace('￥','');
                    money = parseInt(getMoney(itemMoney));
                    obj.amount = money;
                    payAmount+=money;
                }
            }else{
                if(!itemMoney){
                  return Toast.info('金额未输入', 2);
                }
                payAmount+=Number(itemMoney);
                obj.amount = Number(itemMoney);
            }
            list.push(itemsOption[i].invoiceStatus);
            obj.itemId = itemsOption[i].itemId;    
            itemNameArray.push(itemsOption[i].itemName);
            payItemArr.push(obj);
        }
      }
      const payItmesInfo = {
        itemNameArray,  // 缴费项名称
        payAmount,      // 缴费总金额
        payItemArr,      // 选中的每一条缴费项的详情
        statusList: list
      }
      this.setState({
        showPopup: false,
      },()=>{ this.props.selectPayItmes(payItmesInfo)});
  }
  //触发选择多选项
  onPaymentChange=(e,data)=>{
      const { itemsOption } = this.state;
      itemsOption[data.key].checked = !itemsOption[data.key].checked;
      this.setState({
          itemsOption
      });
  }
  //切换为全自助输入
  goSelfInput=()=>{
    this.setState({
      showPopup: false
    },()=>{ this.props.onClick() })
  }
  render() {
    const { showPopup, itemsOption } = this.state;
    const { selfIn, channelid, themeColor } = this.props;
    return (
      <Popup.SlidePop popup title="缴费项目" visible={showPopup} closable={true} maskClosable={false}
        onClose={() => { this.setState({ showPopup: false }) }}>
        <ul className="select_list_container">
          {
            itemsOption && itemsOption.map((item, index) => {
              return (
                <li className="select_list_item" key={index}>
                  <Checkbox.Item  key={item.key} checked={item.checked}
                   onChange={(e) => this.onPaymentChange(e,item)} className={themeColor==1? 'redColor':''}/>
                  <div className="flex_right bottom_line">
                    <div className='payItem_name' dangerouslySetInnerHTML={{__html: item.itemName}}></div>
                    {!item.flag ? <div className="pay_money">{ '￥'+ Number(item.payMoney/100).toFixed(2)}</div> :
                      <div className="flex_input">
                        <input className="money_input" name={item.itemId} type="text" placeholder="￥请输入" onChange={this.inputChange.bind(this, item.itemId)}  onBlur={this.inputOnBlur} value={ item.payMoney == '' ? '': item.inputMoney}/>
                      </div>
                    }
                  </div>
                </li>
              )
            })
          }
        </ul>
        <div className={["sure_btn", channelid==3 ? 'green_sure_btn' : '', themeColor==1? 'redBtn': ''].join(' ')} onClick={ this.comfirmItem }>确认</div>
        { selfIn == 1 && <div className='self_support_btn' onClick={this.goSelfInput}>自助输入</div> }
      </Popup.SlidePop>
    );
  }
}

PaymentPopup.defaultProps = {
  mercId: '',
  payType: 1,
  selfIn: 0,
  channelid: 0,
  themeColor: 0
};
export default PaymentPopup;
