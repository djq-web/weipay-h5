import React, { Component } from "react";
import { Toast } from "antd-mobile";
import Input from "@components/input";
import Banner from "@components/banner";
import { API } from "@api/requestUrl";
import { Get, Post } from "@api/index";
import { navigateTo, getQueryValue, isAliPayClient, storage } from "@utils/publicMethod";
import "@assets/css/pay-before.less";

class OtherMchPayBefore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      commOrgId: "",
      otherMchInfo: {},
      mercPayBase: {
        userNameDesc: "",
        userNoDesc: "",
        rule: "",
      },
      commUname: "",
      phoneNumber: "", //输入框
      showPage: false
    };
  }
  componentWillMount() {
    const isAuthor = getQueryValue("isAuthor") || "";
    const commOrgId = getQueryValue("commOrgId");
    if(commOrgId === '30'){
      document.title = '党费缴纳平台';
    }
    if (isAuthor === "1") {
      this.initPage();
    } else {
      this.getAuthorization();
    }
  }
  /*
  查询用户是否授权过
  ** @parmas mercType 商户类型 1-学校商户 2-物业商户 3-其他商户
   * */

  getAuthorization = () => {
    const authorizeType = isAliPayClient(window.navigator.userAgent) ? 2 : 1; // 判断用户端
    const commOrgId = getQueryValue("commOrgId");
    Post(
      API.queryAuthorization,
      { authorizeType, mercId: commOrgId },
      true,
      1
    ).then((res) => {
      if (res && res.data && res.data.mercId) {
        const { data } = res;
        navigateTo("/other-pay-select", `mercId=${data.mercId}&userNo=${data.userNo}&userName=${encodeURIComponent(data.userName)}`);
      } else {
        this.initPage();
      }
    });
  };
  /**页面初始化**/
  initPage = () => {
    // const otherMchInfo = storage.get("receivingUnit") || {};
    const commOrgId = getQueryValue("commOrgId");
    const template = getQueryValue("template");
    if (commOrgId && template) {
        this.setState({commOrgId});
        let localUrl = window.location.hash;
        let redirectUrl = localUrl.split("#")[1];
        redirectUrl = `${redirectUrl}&navigate=false`;
        this.CheckOpenHuaBei(commOrgId, redirectUrl); 
    }else{
      return Toast.info('不是合法的进入入口', 2);
    }
  };
  /**检测是否开通花呗支付**/
  CheckOpenHuaBei = (orgId, redirectUrl) => {
    const navigate = getQueryValue('navigate') || '';
    Get(API.isOpenHB, { orgType: 2, orgId }, true).then((res) => {
      let data = res && res.data;
      if (data) {
        const { hbStatus } = data;
        //  如果开通了花呗，同时是在微信端打开，进入花呗推广页面
        if (hbStatus === "Y" && !isAliPayClient(window.navigator.userAgent) && !navigate) {
          const path = "/aliPay-tips";
          navigateTo(path, `redirectUrl=${redirectUrl}`);
        } else {
          this.getOtherMch(orgId);
        }
      }
    });
  };
  /**获取单位的相关信息**/
  getOtherMch = (commOrgId) => {
    let reqUrl = 'default/' + commOrgId;
    Get(API.queryOtherMch + reqUrl, null, true).then((res) => {
      const data = res && res.data;
      if (data) {
        storage.set("receivingUnit", data); // 存储收款的单位信息
        if (data.zzStatus === 'Z') {
          navigateTo('/other-pay-input', `commOrgId=${commOrgId}&template=default`)
        }else{
          this.setState({
            mercPayBase: data.mercPayBase || {},
            otherMchInfo: data,
            showPage: true
          });
        }
      }
    })
  };

  /**点击去缴费**/
  goPaySelect = () => {
    let { commOrgId, commUname, phoneNumber, mercPayBase } = this.state;
    let pattern = new RegExp(mercPayBase.rule);
    commUname = commUname.replace(/(^\s*)|(\s*$)/g, "");
    phoneNumber = phoneNumber.replace(/(^\s*)|(\s*$)/g, "");
    if (!commOrgId) {
      return Toast.info("收费单位不能为空", 2);
    } else if (!commUname) {
      return Toast.info(`${mercPayBase.userNameDesc}不能为空`, 2);
    } else if (mercPayBase.rule && mercPayBase.rule !== 'null' && !pattern.test(phoneNumber)) {
      return Toast.info(`${mercPayBase.userNoDesc}格式不对，请重填`, 2);
    }
    this.querUser(commOrgId, phoneNumber, commUname);
    // this.props.nextPageStartDirection('left', () => {
    //   navigateTo('/other-pay-select',`mercId=${commOrgId}&userNo=${phoneNumber}`);
    // });
  };
  // 点击去缴费先查询当前用户No是否存在
  querUser = (mercId, userNo, userName) => {
    Post(API.queryUser,{ mercType: 3, mercId, userNo, userName },true,1).then((res) => {
      if (res && Object.keys(res).length !== 0) {
        this.getUserInfo(mercId, userNo, userName);
      }
    });
  };
  /**获取微信/支付宝授权
   * @param Object
   * merc_type      商户类型 1-学校商户 2-物业商户 3-其他商户
   * merc_id        商户表主键 学校主键 物业主键 其他主键
   * user_no        缴费系统用户编号 学号、手机号
   * authorize_type 授权类型 1-微信 2-支付宝
   */

  getUserInfo = (mercId, userNo, userName) => {
    const authorizeType = isAliPayClient(window.navigator.userAgent) ? 2 : 1; // 判断用户端
    const url = window.location.href;
    let arrUrl = url.split("#");
    let parmas = {
      mercType: 3,
      mercId,
      userNo,
      userName: encodeURIComponent(userName),
      authorizeType,
      frontUrlPre: escape(arrUrl[0]),
      frontUrlSuf: escape(arrUrl[1]),
    };
    let PostUrl = authorizeType == 1 ? API.getwxInfo : API.getAliPayInfo;
    Post(PostUrl, parmas, true, 1).then((res) => {
      if (res) {
        window.location.href = res;
      }
    });
  };
  /**点击自助缴费**/
  selfHelpPay = (commOrgId) => {
    this.getCustomData(commOrgId)
      .then(() => {
        return this.checkActive(commOrgId);
      })
      .then((data) => {
        if (data && Object.keys(data).length !== 0) {
          this.props.nextPageStartDirection("right", () => {
            navigateTo( "/other-pay-input", `commOrgId=${commOrgId}&isActive=${data.isActive}`);
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  /**
   * 获取自定义字段
   * **/
  getCustomData = (commOrgId) => {
    return new Promise((resolve, reject) => {
      Post(API.getOtherCustomItem, { commOrgId }, true, 1)
        .then((res) => {
          resolve();
          const data = res && res.data;
          if (data) {
            storage.set("customData", data);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
  checkActive = (commOrgId) => {
    return new Promise((resolve, reject) => {
      Get(API.otherCheckActive, { commOrgId }, true)
        .then((res) => {
          const data = res && res.data;
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
  //用户输入时触发
  handleChange = (data) => {
    switch (data.name) {
      case "commUname":
        this.setState({
          commUname: data.data,
        });
        break;
      case "phoneNumber":
        this.setState({
          phoneNumber: data.data,
        });
        break;
    }
  };
  render() {
    const { otherMchInfo, mercPayBase, showPage } = this.state;
    const commOrgId = getQueryValue("commOrgId");
    const { zzStatus } = otherMchInfo;
    return (
      <div className="payBeforePage">
        {otherMchInfo && showPage && 
          <div className="page_main_content">
            <Banner mercId={commOrgId} mchType={2}></Banner>
            {zzStatus != "Z" && (
              <div className="content_title">
                请输入{mercPayBase.userNoDesc}进行缴费
              </div>
            )}
            <div className="form_data">
              <Input
                type="text"
                editable={false}
                value={otherMchInfo.commMercName}
                className="mediumSzie"
              >
                {commOrgId==30? "缴纳项目":"收费单位"}
              </Input>
              <Input
                name="commUname"
                type="text"
                placeholder={`请输入${mercPayBase.userNameDesc}`}
                onChange={this.handleChange}
                maxLength="20"
                clear
              >
                {mercPayBase.userNameDesc}
              </Input>
              <Input
                name="phoneNumber"
                type="text"
                placeholder={`请输入${mercPayBase.userNoDesc}`}
                onChange={this.handleChange}
                clear
              >
                {mercPayBase.userNoDesc}
              </Input>
            </div>
            {
              /*根据后台配置判断是否展示学号缴费功能 Y-学号和自助都有，N只展示学校，Z只展示自助*/
              zzStatus != "Z" && (
                <div
                  className={`go_pay_btn ${
                    otherMchInfo.themeColor == 1 ? "redBtn" : ""
                  }`}
                  onClick={this.goPaySelect}
                >
                 { commOrgId==30? "去缴纳":"去缴费"}
                </div>
              )
            }
            {
              /*根据后台配置判断是否展示自助缴费功能 Y-学号和自助都有，N只展示学校，Z只展示自助*/
              zzStatus != "N" && (
                <div
                  className="selfPaybtn"
                  onClick={this.selfHelpPay.bind(this, commOrgId)}
                >
                  自助缴费
                </div>
              )
            }
          </div>
        }
      </div>
    );
  }
}

export default OtherMchPayBefore;
