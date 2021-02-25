import React, { Component } from 'react';
import SearchBar from '@components/search-bar';
import { API } from '@api/requestUrl';
import { Get, Post } from '@api/index';
import './schoolPopup.less';

class SchoolPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showArea: true,
      areaList: [],   // 区域列表
      schoolList: [], // 学校列表
      areaIndex: '',  // 当前选中的区域index
      areaName: '全部',
      schoolName: '',
      areaCode: '',  // 当前选中的区域ID
    }
  }
  componentDidMount() {
    const data  = this.state.areaList && this.state.areaList.length;
    const { channelid } = this.props;
    if (!data && channelid == 3 ){
      this.getAreaList();
    }
   }
  /**（定制需求）查询成都地区列表**/ 
  getAreaList = () => {
      Get(API.queryArea, {}, true).then(res => {
          this.setState({
              areaList: res && res.data
          })
      })
  }
  closePop=()=>{
    let { showArea }  = this.state;
    if (showArea) {
      this.props.onClick();
    }else{
      this.setState({
        showArea: true
      })
    }
  }
  /**选择区域**/
  activeClick = (e, areaCode, areaName) => {
    this.setState({
        areaIndex: Number(e.currentTarget.getAttribute('index')),
        areaCode,
        areaName,
        showArea: false,
    },()=>{ this.filterList(areaCode) })
  }
  /**查询成都银行学校列表**/ 
  filterList = (areaCode) => {
    const { channelid, template } = this.props;
    const url = API.queryChannel + template + '/' + channelid;
    Get(url, { areaCode }, true).then(res => {
      if (res) {
        this.setState({
          schoolList: res.data
        })
      }
    })
  }
  /**点击选中的学校**/
  getSchoolInfo=(item)=>{
    this.setState({
      showArea: true
    },()=>{
      this.props.getSelectItem(item)
    })
  }
  /**搜索学校**/
  searchSchool=(val)=>{
    let schName = val.replace(/\s*/g, '');
    const { areaCode } = this.state;
    const { channelid } = this.props;
    const  data = {
      chanId: channelid, 
      schName,
      areaCode
    }
    Post(API.qrySchByChanIdAndName, data, true).then(res => {
        this.setState({
          schoolList: [],
          showArea: false
        })
        if(res && res.data ){
          this.setState({
            schoolList: res.data
          })
        }
    })
  }
  render() {
    const { popupClass } = this.props ;
    const { areaIndex, areaList , showArea, areaName, schoolList } = this.state;
    return (
      <div className={['schoolPopup',popupClass].join(' ')}>
         <div className="popupContainer">
            <div className="popupHeader">
              <span className="back_icon" onClick={this.closePop}></span>
              <p className="header_title">选择缴费学校</p>
            </div>
            <SearchBar className="popupSech"
              placeholder="请输入查询关键字查询学校"
              onSubmit={this.searchSchool}/>
            { showArea? <div className="areaListBox">
                <p className="area_title">根据学校所属市区选择</p>
                <div className="area_list">
                    {
                      areaList && areaList.length>0 && areaList.map((item, index) => {
                          return (
                              <span className={areaIndex === index ? 'onSelect' : ''} key={item.areaCode} index={index} onClick={(e) => this.activeClick(e, item.areaCode, item.areaName)} >{item.areaName}</span>
                          )
                      })
                    }
                </div>
            </div>:
            <div className="schoolContent">
                <div className="content_title">
                    <span className="allRera" onClick={(()=>{this.setState({showArea: true})}) }>全部市区</span>
                    <span>{areaName}</span>
                </div>
                <div className="area_list">
                    {
                      schoolList && schoolList.length>0 && schoolList.map((item, index) => {
                          return (
                              <div className="area_list_item bottom_line" onClick={this.getSchoolInfo.bind(this, item)} key={item.id}>{item.schName}</div>
                          )
                      })
                    }
                </div>
             </div> 
            }
         </div>
      </div>
    );
  }
}
export default SchoolPopup;
