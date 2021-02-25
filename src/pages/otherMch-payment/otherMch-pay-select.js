/**1、通过输入姓名、手机/证件号或者户号进入此页面
 * 2、mercId、userNo、userName分别代表缴费单位的Id 和输入的房屋号/户号、缴费人姓名
 * 这两个参数 在物业缴费和其他缴费也适用，这几个参数是在授权后，
 * 后端重定向到当前页面拼接的，目的是为了查询到缴费单位的信息以及待缴费列表
 **/
import React, { Component } from "react";
import { connect } from "react-redux";
import { payInfo } from "@store/actions";
import { Toast } from "antd-mobile";
import Checkbox from "@components/checkbox";
import List from "@components/list";
import { API } from "@api/requestUrl";
import { Get, Post } from "@api/index";
import { navigateTo, getQueryValue, storage } from "@utils/publicMethod";
import "@assets/css/paySelect.less";
import otherMchIcon from "@assets/image/ic_project_other@3x.png";
import otherMchIconPay from "@assets/image/payment_icon.png";
import otherMchPartyIconPay from "@assets/image/OtherMCh-payment.png";
class OtherMchSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      otherMchInfo: {},
      paymentList: [],
      totalAmount: 0,
      selectList: [], // 选中的缴费项
      commOrgId: "", // 其他单位的ID
      commUname: "", // 业主姓名
      phoneNumber: "", //  手机号/证件号
      customList: [], // 扩展信息
      iconPath: "",
      themeColor: 0, //  页面主题颜色 0 为默认颜色 1 为 红色
      showPage: false,
      numTip: 0,
    };
  }
  componentDidMount() {
    this.initPage();
  }
  initPage = () => {
    const otherMchInfo = storage.get("receivingUnit");
    const commOrgId = getQueryValue("mercId");
    const phoneNumber = getQueryValue("userNo");
    const commUname = decodeURIComponent(getQueryValue("userName"));
    if (commOrgId === "30") {
      document.title = "党费缴纳平台";
    }
    this.getPayList(commOrgId, phoneNumber, commUname);
    this.queryOrderNum(commOrgId, phoneNumber, commUname);
    if (otherMchInfo && Object.keys(otherMchInfo).length !== 0) {
      this.setState({ otherMchInfo });
    } else {
      this.getOtherMch(commOrgId);
    }
    this.setState({
      commOrgId,
      phoneNumber,
    });
  };
  /**获取缴费的单位信息**/
  getOtherMch = (commOrgId) => {
    let requsetUrl = API.queryOtherMch + `default/${commOrgId}`;
    Get(requsetUrl, null, false).then((res) => {
      const data = res && res.data;
      if (data) {
        storage.set("receivingUnit", data);
        this.setState({ otherMchInfo: data });
      }
    });
  };
  //查询待支付订单数量
  queryOrderNum = (commOrgId, phoneNumber, commUname) => {
    Post(API.queryOtherMchOrderNum, { commOrgId, phoneNumber, commUname }, true)
      .then((res) => {
        this.setState({ showPage: true });
        if (res && res.data) {
            const {count} =res.data
          this.setState(
            {
                numTip:count||0
            },
          );
        }
      })
      .catch(() => {
        this.setState({ showPage: true });
      });
  };
  /**查询缴费项**/
  getPayList = (commOrgId, phoneNumber, commUname) => {
    Post(API.qrypaybillCommon, { commOrgId, phoneNumber, commUname }, true)
      .then((res) => {
        this.setState({ showPage: true });
        if (res && res.data) {
          let { data, userInfo } = res;
          let { bills, userInfos, icon, themeColor } = data;
          if (bills && bills.length > 0) {
            bills.map((item) => {
              item.checked = 0;
            });
          }

          this.setState(
            {
              commUname: userInfo.commUname,
              paymentList: bills || [],
              customList: userInfos,

              iconPath: icon || otherMchIcon,
              themeColor: themeColor || 0,
            },
            () => {
              console.log(111, this.state.themeColor);
            }
          );
        }
      })
      .catch(() => {
        this.setState({ showPage: true });
      });
  };
  goPaymentProcess = () => {
    const { phoneNumber, commOrgId, themeColor,commUname } = this.state;
    this.props.nextPageStartDirection("left", () => {
      navigateTo(
        "/other-pay-process",
        `mercId=${commOrgId}&userNo=${phoneNumber}&themeColor=${themeColor}&commUname=${commUname}`
      );
    });
  };
  //默认多选
  onPaymentChange = (e, data) => {
    const { paymentList } = this.state;
    let totalAmount = 0;
    let selectList = [];
    paymentList.map((item, index) => {
      if (data.partPayStatus == 2 && data.batchNo == item.batchNo) {
        if (e.target.checked) {
          item.checked = 1;
        } else {
          item.checked = 0;
        }
      } else if (data.id == item.id) {
        if (e.target.checked) {
          item.checked = 1;
        } else {
          item.checked = 0;
        }
      }
      if (item.checked == 1) {
        selectList.push(item);
        totalAmount += Number(item.payAmount);
      }
    });
    this.setState({ selectList, totalAmount });
  };
  /**
   * 跳转缴费信息页面
   * **/
  goPayInfo = () => {
    const {
      totalAmount,
      selectList,
      commOrgId,
      phoneNumber,
      otherMchInfo,
      themeColor,
      commUname,
    } = this.state;
    if (totalAmount === 0) {
      return Toast.info("缴费金额不能为0", 2);
    }
    let billNoList = [],
      payitemList = [],
      remarkList = [];
    selectList.forEach((item) => {
      if (item.remark) {
        remarkList.push(item.remark);
      }
      billNoList.push(item.billNo);
      payitemList.push(item.payItem);
    });
    const parmas = {
      payItem: payitemList.join(","),
      remark: remarkList.join(","),
      payName: otherMchInfo.commMercName,
      phoneNumber,
      commOrgId,
      payAmount: totalAmount,
      billNoList,
      themeColor,
      commUname,
    };
    this.props.setPayInfo(parmas);
    this.props.nextPageStartDirection("left", () => {
      navigateTo("/other-pay-info", "isSelfPay=0");
    });
  };
  handleCheckPayHistory = () => {
    const { commOrgId, phoneNumber } = this.state;
    this.props.nextPageStartDirection("left", () => {
      navigateTo(
        "/other-pay-history",
        `mercId=${commOrgId}&userNo=${phoneNumber}`
      );
    });
  };
  // 身份切换
  goPayBefore = () => {
    const { commOrgId } = this.state;
    const data = storage.get("entryParmas") || "";
    if (data && Object.keys(data).length !== 0) {
      if (data.bankType) {
        // bankType 1晋城银行 2 泉州银行 3石嘴山银行
        const url =
          data.bankType == 1
            ? "/jc-bank"
            : data.bankType == 2
            ? "/qz-bank"
            : "/szs-bank";
        this.props.nextPageStartDirection("right", () => {
          navigateTo(url);
        });
      } else {
        this.props.nextPageStartDirection("right", () => {
          navigateTo(
            "/index",
            `template=default&channelid=${data.channelId}&subChanId=${data.subChanId}`
          );
        });
      }
    } else {
      this.props.nextPageStartDirection("right", () => {
        navigateTo(
          "/other-pay-before",
          `commOrgId=${commOrgId}&template=default&isAuthor=1`
        );
      });
    }
  };
  render() {
    const {
      paymentList,
      commUname,
      customList,
      themeColor,
      iconPath,
      showPage,
      commOrgId,
      numTip,
    } = this.state;

    //const messageSub = getQueryValue('messageSub') || '0'; // 判断是不是从消息订阅跳转过来的
    return (
      <div className="select_container">
        {showPage && (
          <div className="page_container">
            <div className="pay_select">
              <div className="select_top">
                <div className="userName">
                <img src={iconPath} className="payMentImg" />
                  <span>{commUname}</span>
                 
                </div>
                {customList.length > 0 &&
                  customList.map((item, index) => {
                    return (
                      <p className="info_line" key={index}>
                        {item.name}：
                        <span className="info_val">{item.value}</span>
                      </p>
                    );
                  })}
                <p
                  className={`switching_btn ${
                    themeColor == 1 ? "redTheme" : ""
                  }`}
                  onClick={this.goPayBefore}
                >
                  切换用户
                </p>
              </div>
              {paymentList && paymentList.length > 0 ? (
                <div className="page_mian_content">
                  <div className="scrollContent">
                    <div
                      className={`pay_checkBox ${
                        themeColor == 1 ? "party_dues_select" : ""
                      }`}
                    >
                      <List>
                        {paymentList.map((item) => (
                          <Checkbox.Item
                            key={item.billNo}
                            onChange={(e) => this.onPaymentChange(e, item)}
                            disabled={item.billStatus == 3}
                            checked={item.checked}
                          >
                            <div>
                              <span className={["itemName",item.billStatus === 3?"greyBtn":""].join(' ')}>
                                {item.payItem}
                                {item.billStatus == 3 && (
                                  <span className="handle">(处理中)</span>
                                )}
                              </span>
                              <span className={["money",item.billStatus === 3?"greyBtn":""].join(' ')}>
                                ¥<em>{(item.payAmount / 100).toFixed(2)}</em>
                              </span>
                            </div>
                            {item.remark && (
                              <p className="remakeWords">备注：{item.remark}</p>
                            )}
                          </Checkbox.Item>
                        ))}
                      </List>
                    </div>
                    <div className="all_money">
                      合计：
                      <em className="symbool">¥</em>
                      <em className="acount">
                        {(this.state.totalAmount / 100).toFixed(2)}
                      </em>
                    </div>
                    <div
                      className={`pay_btn ${themeColor == 1 ? "red_btn" : ""}`}
                      onClick={this.goPayInfo}
                    >
                      {commOrgId == 30 ? "去缴纳" : "缴费"}
                    </div>
                    <div
                      className={`query_btn ${
                        themeColor == 1 ? "red_btn" : ""
                      }`}
                      onClick={this.handleCheckPayHistory}
                    >
                      {commOrgId == 30 ? "缴纳历史查询" : "缴费历史查询"}
                    </div>
                    {numTip > 0 && (
                      <div
                        className="payment_status"
                        onClick={this.goPaymentProcess}
                      >
                        {themeColor == 1 ? (
                          <img
                            src={otherMchPartyIconPay}
                            className="payment_icon"
                          />
                        ) : (
                          <img src={otherMchIconPay} className="payment_icon" />
                        )}
                        <p className="pending">待处理</p>  
                        <div className="numTip">{numTip}</div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="pay-empty">
                  <div className="pay-empty-icon-wrapper">
                    <div className="pay-empty-icon"></div>
                    <p className="pay-empty-text">暂无缴费项目</p>
                  </div>
                  <div
                    className={`pay-history-btn ${
                      themeColor == 1 ? "red_btn" : ""
                    }`}
                    onClick={this.handleCheckPayHistory}
                  >
                    缴费历史
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setPayInfo(data) {
      dispatch(payInfo(data));
    },
  };
};
const Connects = connect(null, mapDispatchToProps, null, { forwardRef: true })(
  OtherMchSelect
);
export default Connects;
