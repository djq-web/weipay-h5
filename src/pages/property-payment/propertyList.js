import React, { Component } from 'react';
import SearchBar from '@components/search-bar';
import { Toast } from 'antd-mobile';
import { API } from '@api/requestUrl';
import { Get } from '@api/index';
import { navigateTo, isAliPayClient, storage, getQueryValue } from "@utils/publicMethod";
import '@assets/css/company-list.less';

class PropertyList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialList: [], // 初始的物业列表
      propertyList: [],  //  触发搜索时展示的物业列表
      noData: false,
    }
  }
  componentDidMount() {
    this.getUnitList();
  }
  // 获取物业列表
  getUnitList = () => {
    let channelid = getQueryValue('channelid');
    let template = getQueryValue('template');
    let subChanId = getQueryValue("subChanId");
    if (!channelid || !template) {
      Toast.info('请通过正确的微信公众号入口进入该页面！', 2);
      return;
    }
    const url = template + '/' + channelid;
    const requestUrl = API.queryPropertyChannel + url;
    Get(requestUrl, { subChanId }, true).then(res => {
      let data = res && res.data;
      if (Object.prototype.toString.call(data) === '[object Object]') {
        data = [data];
      }
      const noData =  data && data.length > 0? false: true;
      this.setState({
        initialList: data,
        propertyList: data,
        noData
      })
    })
  }
    //输入框发生改变时触发
  handleChange = (val) => {
      const { initialList } = this.state;
      let searchVal = val.replace(/(^\s*)|(\s*$)/g, "");
      if (searchVal.length == 0) {
        this.setState({
          propertyList:  initialList,
          noData: initialList.length > 0? false : true
        })
      }else{
        const reg = new RegExp(searchVal, 'g');
        const newList = [];
        initialList.map(item => {
          if (reg.test(item.propMercName) || reg.test(item.propPyMercName)) {
              return newList.push(item);
          }
          return item;
        });
        this.setState({
          propertyList:  newList,
          noData: newList.length > 0? false : true
        })
      }
  }
  /**点击物业缴费**/
  goPay=(propertyItem)=>{
    storage.set('receivingUnit', propertyItem);   // 存储收款的单位信息
    if (propertyItem.zzStatus === 'Z'){
       // 只设置了自助缴费的情况下
       navigateTo('/wy-pay-input', `propOrgId=${propertyItem.id}&template=default`);
    }else{
      const url = `/wy-pay-before?propOrgId=${propertyItem.id}&template=default&navigate=false&isAuthor=1`;
      this.CheckOpenHuaBei(propertyItem.id, url); 
    }
  }
  /**检测是否开通花呗支付**/ 
  CheckOpenHuaBei = (orgId, redirectUrl) => {
      Get(API.isOpenHB, { orgType: 1, orgId }, true).then(res => {
          let data = res && res.data;
          if (data){
            const { hbStatus } = data;
            //  如果开通了花呗，同时是在微信端打开，进入花呗推广页面
            if (hbStatus === 'Y' && !isAliPayClient(window.navigator.userAgent)) {  
                  const path = '/aliPay-tips';
                  navigateTo(path, `redirectUrl=${redirectUrl}`)  
            }else{
              navigateTo(redirectUrl)
            }
          }
      })
  };
  render() {
    const { propertyList, noData } = this.state;
    return (
      <div className="company_list_container">
        <div className="search_box">
          <SearchBar
            placeholder="请输入查询关键字"
            onChange={this.handleChange}
          />
        </div>
        <div className="blank_box"></div>
        {propertyList && propertyList.length > 0 && <div className="data_list_box">
            {
               propertyList.map((item, index) => {
                return (
                  <div className="company_item bottom_line"  onClick={this.goPay.bind(this, item)} key={item.id}>{item.propMercName}</div>
                )
              })
              
            }
        </div>}
        {noData &&
        <div className="no_data">
            <div className="empty_logo"></div>
            <p>请输入关键字查询</p>
        </div>
        }
      </div>
    );
  }
}

export default PropertyList;
