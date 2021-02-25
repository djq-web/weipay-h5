import React, { Component } from 'react';
import SearchBar from '@components/search-bar';
import { Toast } from 'antd-mobile';
import { API } from '@api/requestUrl';
import { Get } from '@api/index';
import { navigateTo, isAliPayClient, storage } from "@utils/publicMethod";
import '@assets/css/company-list.less';

class SchooItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialList: [], // 初始的学校列表
      schoolList: [],  //  触发搜索时展示的学校列表
      noData: false,
    }
  }
  componentDidMount() {
    this.getUnitList();
  }
  // 获取学校列表
  getUnitList = () => {
    const { channelid, template, subChanId } = this.props;
    if (!channelid || !template) {
      Toast.info('请通过正确的微信公众号入口进入该页面！', 2);
      return;
    }
    const url = template + '/' + channelid;
    const requestUrl = API.queryChannel + url;
    Get(requestUrl, { subChanId }, true).then(res => {
      let data = res && res.data;
      if (Object.prototype.toString.call(data) === '[object Object]') {
        data = [data];
      }
      const noData =  data && data.length > 0? false: true;
      this.setState({
        initialList: data,
        schoolList: data,
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
        schoolList:  initialList,
        noData: initialList.length > 0? false : true
      })
    }else{
      const reg = new RegExp(searchVal, 'g');
      const newList = [];
      initialList.map(item => {
          if (reg.test(item.schName) || reg.test(item.schPyName)) {
              return newList.push(item);
          }
          return item;
      });
      this.setState({
        schoolList:  newList,
        noData: newList.length > 0? false : true
      })
    }
  }
  /**点击学校缴费**/
  goPay=(schoolItem)=>{
    storage.set('receivingUnit', schoolItem);   // 存储收款的单位信息
    if (schoolItem.zzStatus === 'Z' && schoolItem.areaCode != 4) {
      // 只设置了自助缴费的情况下
      navigateTo('/pay-input', `schoolid=${schoolItem.id}&template=default`);
    }else{
      const url = `/pay-before?schoolid=${schoolItem.id}&template=default&navigate=false&isAuthor=1`;
      this.CheckOpenHuaBei(schoolItem.id, url); 
    }
  }
  /**检测是否开通花呗支付**/ 
  CheckOpenHuaBei = (orgId, redirectUrl) => {
      Get(API.isOpenHB, { orgType: 0, orgId }, true).then(res => {
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
    const { schoolList, noData } = this.state;
    return (
      <div className="company_list_container">
        <div className="search_box">
          <SearchBar
            placeholder="请输入查询关键字"
            onChange={this.handleChange}
          />
        </div>
        <div className="blank_box"></div>
       { schoolList && schoolList.length > 0 && <div className="data_list_box">
            {
                schoolList.map((item, index) => {
                return (
                  <div className="company_item bottom_line"  onClick={this.goPay.bind(this, item)} key={item.id}>{item.schName}</div>
                )
              })  
            }
        </div>
       }
       {noData &&  <div className="no_data">
            <div className="empty_logo"></div>
            <p>请输入关键字查询</p>
        </div>
        }
      </div>
    );
  }
}
SchooItem.defaultProps = {
  channelid: "",
  template: ""
};

export default SchooItem;
