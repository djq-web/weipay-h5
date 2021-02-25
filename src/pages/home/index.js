import React, { Component } from "react";
import { Toast } from "antd-mobile";
import { API } from "@api/requestUrl";
import { Get, Post } from "@api";
import { navigateTo, getQueryValue, isAliPayClient, storage } from "@utils/publicMethod";
import "./index.less";
import defaultIMg from "@assets/image/ic_index_other@3x.png";
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      common: false,
      property: false,
      school: false,
      channelid: "",
      template: "",
      weekName: "",
      currentTime: "",
      list: [],
      showPage: false,
    };
  }
  componentWillMount() {
    let time = new Date();
    let day = time.getDay();
    let month = time.getMonth();
    let date = time.getDate();
    let hour = time.getHours();
    let minutes = time.getMinutes();
    month = month + 1;
    month = month < 10 ? "0" + month : month;
    date = date < 10 ? "0" + date : date;
    hour = hour < 10 ? "0" + hour : hour;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    let currentTime = month + "/" + date + " " + hour + ":" + minutes;
    let weekTimes = new Array(
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    );
    this.setState({
      weekName: weekTimes[day - 1],
      currentTime,
    });
  }
  componentDidMount() {
    const channelid = getQueryValue("channelid") || undefined;
    const template = getQueryValue("template") || undefined;
    const subChanId = getQueryValue("subChanId") || '';
    const bankType = getQueryValue("bankType") || '';
    const entryParmas = storage.get("entryParmas") || "";
    if (channelid && template) {
        const data = {"channelId": channelid, "subChanId": subChanId, "bankType": bankType };
        storage.set('entryParmas', data);   // 记录入口参数
        this.setState({ channelid, template });
        // 判断是不是从银行入口进入得 || 渠道已经授权的时候 再次切换用户身份
        if (entryParmas) {
          this.getPaymentType(channelid, template, subChanId);
        }else{
          this.getAuthorization(channelid, template, subChanId);
        }
    } else {
        return Toast.info("不是合法入口", 2);
    }
  }
  /*
  查询用户是否授权过
  ** @parmas mercType 商户类型 1-学校商户 2-物业商户 3-其他商户
   * */
  getAuthorization = (id, tle, subChanId) => {
    const authorizeType = isAliPayClient(window.navigator.userAgent) ? 2 : 1; // 判断用户端
    Post(API.queryAuthorization, { authorizeType, mercId: id, mercType: "-1" }, true, 1).then((res) => {
      if (res && res.data && res.data.mercId) {
        const { data } = res;
        const url = data.mercType == 1 ? "/pay-select": data.mercType == 2 ? "/wy-pay-select" : "/other-pay-select";
        if (data.mercType !== 1 ) {
          navigateTo( url,`mercId=${data.mercId}&userNo=${ data.userNo}&userName=${encodeURIComponent(data.userName)}`
          );
        } else {
          navigateTo(url, `mercId=${data.mercId}&userNo=${data.userNo}`);
        }
      } else {
        this.getPaymentType(id, tle, subChanId);
      }
    });
  };
  // 判断该渠道下有多少种缴费项目
  getPaymentType = (channelid, template, subChanId) => {
    const url = `${template}/${channelid}`;
    let parmas = null;
    if (subChanId) {
      parmas = { subChanId };
    }
    Get(API.qrPayType + url, parmas, true).then((res) => {
      const data = res && res.data;
      if (data) {
        // data.common  为数组结构
        const common = data.common && data.common.length > 0 ? true : false;
        if (!data.property && !common && data.school) {
          this.LinkTo(1);
          return;
        } else if (!data.school && !common && data.property) {
          this.LinkTo(2);
          return;
        } else if (
          !data.property &&
          !data.school &&
          common &&
          data.common.length == 1
        ) {
          this.LinkTo(3, data.common[0].sceneId);
          return;
        } else {
          this.setState({
            showPage: true,
            school: data.school,
            property: data.property,
            common: common,
            list: data.common,
          });
        }
      } else {
        this.setState({
          property: false,
          school: false,
          common: false,
        });
      }
    });
  };
  /**
   * 跳转到对应的缴费项目
   * @type 1: 学校 2.物业 3.其他
   * **/
  LinkTo = (type, id) => {
    const subChanId = getQueryValue("subChanId") || '';
    const path = type == 1? "/school-list": type == 2 ? "/property-list": "/other-mch-list";
    const { channelid, template } = this.state;
    let queryParms = `channelid=${channelid}&template=${template}&subChanId=${subChanId}`;
    if (type === 3) {
      queryParms = `channelid=${channelid}&template=${template}&secenId=${id}&subChanId=${subChanId}`;
    }
    this.props.nextPageStartDirection("right", () => {
      navigateTo(path, queryParms);
    });
  };
  render() {
    const {
      showPage,
      property,
      school,
      common,
      weekName,
      currentTime,
      list,
    } = this.state;
    return (
      <div className="guide_page">
        {showPage && (
          <div className="mainContentBox">
            <div className="home_banner">
              <p className="week_name">{weekName}</p>
              <p className="date_time">{currentTime}</p>
            </div>
            <div className="title">选择缴费方式</div>
            <div className="type_wrap">
              <div className="flex_container">
                {school && (
                  <div
                    className="flex_pay_item school_item"
                    onClick={this.LinkTo.bind(this, 1)}
                  >
                    <span className="school_logo"></span>
                    <p className="item_title">学校缴费</p>
                    <p className="sub-title">School</p>
                    <p className="crossing1"></p>
                  </div>
                )}
                {property && (
                  <div
                    className="flex_pay_item property_item"
                    onClick={this.LinkTo.bind(this, 2)}
                  >
                    <span className="property_logo"></span>
                    <p className="item_title">物业缴费</p>
                    <p className="sub-title">Property</p>
                    <p className="crossing2"></p>
                  </div>
                )}
              </div>
              {common &&
                list.map((item, index) => {
                  return (
                    <div
                      className="other_item"
                      onClick={this.LinkTo.bind(this, 3, item.sceneId)}
                      key={index}
                    >
                      {item.sceneImgUrl ? (
                        <img className="other_logo" src={item.sceneImgUrl} />
                      ) : (
                          <img className="other_logo" src={defaultIMg} />
                        )}
                      <div className="right_name">
                        <p className="other_title">{item.name}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className="more_server">更多服务，即将来袭</div>
          </div>
        )}
      </div>
    );
  }
}
export default Index;
