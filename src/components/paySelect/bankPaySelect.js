import React, { Component } from "react";
import { connect } from "react-redux";
import { payInfo, getEnterTimes } from "@store/actions";
import { Toast } from "antd-mobile";
import Checkbox from "@components/checkbox";
import List from "@components/list";
import { API } from "@api/requestUrl";
import { Get, Post } from "@api/index";
import { navigateTo, getQueryValue, storage } from "@utils/publicMethod";
import "./bankPaySelect.less";
import schoolIconPay from "@assets/image/school_bank_payment_icon@3x.png";
class BankPaySelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      schoolInfo: {},
      paymentList: [],
      allMoney: 0,
      selectList: [], // 选中的缴费项
      minipgpay: "0",
      userNo: "",
      schName: "",
      schoolid: "",
      classesName: "",
      subAppId: "",
      subOpenId: "",
      noData: false,
      stuName: "",
      numTip: 0,
      payItemsStatus: "",
    };
  }
  componentDidMount() {
    const minipgpay = getQueryValue("minipgpay") || "0"; //  判断是不是从教育平台小程序跳转过来的 1代表是

    if (minipgpay == 1) {
      this.setState({ minipgpay }, () => this.queryData());
    } else {
      const schoolInfo = storage.get("receivingUnit");
      const schoolid = getQueryValue("mercId");
      const userNo = decodeURIComponent(getQueryValue("userNo"));
      this.setState({ schoolid, userNo }, () => {
        this.getPayList(schoolid, userNo);
      });
      if (schoolInfo && Object.keys(schoolInfo).length !== 0) {
        this.setState({ schoolInfo });
      } else {
        this.getSchool(schoolid);
      }
    }
    this.queryOrderNum();
  }
  //进入缴费流程
  goPaymentProcess = () => {
    const { userNo, schoolid } = this.state;
    this.props.nextPageStartDirection("left", () => {
      navigateTo(
        "/pay-process",
        `mercId=${schoolid}&userNo=${userNo}&channelid=3`
      );
    });
  };
  //查询待支付订单数量
  queryOrderNum = () => {
    const schId = getQueryValue("mercId");
    const stuNo = decodeURIComponent(getQueryValue("userNo"));
    const parmas = { schId, stuNo };
    Post(API.querySchOrderNum, parmas, true).then((res) => {
      const data = res && res.data;
      const { count } = data;
      this.setState({
        numTip: count || 0,
      });
    });
  };
  //小程序跳转到H5页面时需求单独请求后端接口
  queryData = () => {
    const appId = getQueryValue("appId");
    const code = getQueryValue("code");
    let { enterTimes } = this.props;
    if (!enterTimes) {
      enterTimes = 1;
    }
    const parmas = { appId, code, enterTimes };
    Get(API.querySchoolBill, parmas, true).then((res) => {
      const data = res && res.data;
      const userInfo = res && res.userInfo;
      let noData = true;
      if (data && data.length > 0) {
        noData = false;
        data.map((itemVal) => {
          itemVal.checked = 0;
        });
      }
      this.setState({
        paymentList: data || [],
        schName: data[0].schName || "",
        userNo: userInfo.stuNo || "",
        schoolid: userInfo.schId || "",
        subAppId: userInfo.subAppId || "",
        subOpenId: userInfo.subOpenId || "",
        classesName: userInfo.className || "",
        noData,
      });
    });
  };
  /**获取缴费的学校信息**/
  getSchool = (schoolid) => {
    let requsetUrl = API.querySchool + `default/${schoolid}`;
    Get(requsetUrl, null, false).then((res) => {
      const data = res && res.data;
      if (data) {
        this.setState({ schoolInfo: data });
      }
    });
  };
  /**查询缴费项**/
  getPayList = (mercId, userNo) => {
    const parmas = {
      schId: mercId,
      stuNo: userNo,
    };
    Post(API.paybill, parmas, true).then((res) => {
      let data = res && res.data;
      let userInfo = res && res.userInfo;
      let noData = true;
      if (data && data.length > 0) {
        noData = false;
        data.map((item) => {
          item.checked = 0;
        });
      }
      this.setState({
        paymentList: data || [],
        noData,
        classesName: userInfo.className,
        stuName: userInfo.stuName,
      });
    });
  };
  //默认多选
  onPaymentChange = (e, data) => {
    const { paymentList } = this.state;
    let allMoney = 0;
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
        if (item.billPayType == 3) {
          allMoney += Number(item.unPayAmount);
        } else {
          allMoney += Number(item.payAmount);
        }
      }
    });
    this.setState({ selectList, allMoney });
  };
  /**
   * 跳转缴费信息页面
   * **/
  goPayInfo = () => {
    const {
      allMoney,
      selectList,
      schoolInfo,
      schName,
      userNo,
      schoolid,
      subAppId,
      subOpenId,
      minipgpay,
    } = this.state;
    if (allMoney === 0) {
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
      payAmount: allMoney,
      remark: remarkList.join(","),
      billNoList,
      userNo,
      selectList,
      schoolid,
    };
    if (minipgpay == 1) {
      parmas.payName = schName;
      parmas.subAppId = subAppId;
      parmas.subOpenId = subOpenId;
    } else {
      parmas.payName = schoolInfo.schName;
    }
    this.props.setPayInfo(parmas);
    this.props.setEnterTimes(2);
    this.props.nextPageStartDirection("left", () => {
      navigateTo(
        "/school-pay-info",
        `isSelfPay=0&minipgpay=${minipgpay}&channelid=3`
      );
    });
  };
  handleCheckPayHistory = () => {
    const { schoolid, userNo } = this.state;
    const { channelid, nextPageStartDirection } = this.props;
    this.props.setEnterTimes(2);
    nextPageStartDirection("left", () => {
      navigateTo(
        "/school-pay-history",
        `mercId=${schoolid}&userNo=${userNo}&channelid=${channelid}`
      );
    });
  };
  // 身份切换
  goPayBefore = () => {
    const { schoolid } = this.state;
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
          "/pay-before",
          `schoolid=${schoolid}&template=default&isAuthor=1`
        );
      });
    }
  };
  render() {
    const {
      paymentList,
      schoolInfo,
      userNo,
      classesName,
      noData,
      stuName,
      numTip,
    } = this.state;
    //const messageSub = getQueryValue('messageSub') || '0'; // 判断是不是从消息订阅跳转过来的
    return (
      <div className="select_container">
        <div className="chengduPage">
          <div className="pageHeader">
            <div className="left_img"></div>
            <div className="right_content">
              <div className="select_top_name">{stuName}</div>
              <div className="line_info">学校： {schoolInfo.schName}</div>
              <div className="line_info">班级： {classesName}</div>
              <div className="line_info">
                {schoolInfo.stuNoType === "2" ? "证件号：" : "学号："} {userNo}
              </div>
              <div className="switching_btn" onClick={this.goPayBefore}>
                切换用户
              </div>
            </div>
          </div>
          {!noData ? (
            <div className="page_scroll_content">
              <div className="banSelectContainer">
                <List renderHeader={() => "选择缴费项目"}>
                  {paymentList.map((item) => (
                    <Checkbox.Item
                      key={item.billNo}
                      onChange={(e) => this.onPaymentChange(e, item)}
                      disabled={Number(item.billPayType) === 0}
                      checked={item.checked}
                    >
                      <div>
                        <span className={["payItemName",item.billPayType === 0?"greyBtn":""].join(' ')}>
                          {item.payItem}{" "}
                          {item.billPayType === 0 && (
                            <span className="explain">(处理中)</span>
                          )}
                        </span>
                        <span className={[item.billPayType === 0?"greyBtn":""].join(' ')}>
                          ¥<em>{(item.payAmount / 100).toFixed(2)}</em>
                        </span>
                      </div>
                      {item.billPayType === 3 && (
                        <p className="defray_text">
                          <span>待支付：</span>
                          <span className="payment_num">
                            ￥{(item.unPayAmount / 100).toFixed(2)}
                          </span>
                        </p>
                      )}
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
                  {(this.state.allMoney / 100).toFixed(2)}
                </em>
              </div>
              <div className="green_btn" onClick={this.goPayInfo}>
                去缴费
              </div>
              <div className="historyBtn" onClick={this.handleCheckPayHistory}>
                缴费历史
              </div>
            </div>
          ) : (
            <div className="pay-empty">
              <div className="pay-empty-icon-wrapper">
                <div className="pay-empty-icon" />
                <p className="pay-empty-text">暂无未缴账单</p>
              </div>
              <div
                className="pay-history-btn"
                onClick={this.handleCheckPayHistory}
              >
                查询缴费历史
              </div>
            </div>
          )}
          {numTip > 0 && (
            <div className="payment_status" onClick={this.goPaymentProcess}>
              <img src={schoolIconPay} className="payment_icon"/>
              <p className="pending">待处理</p>
              <div className="numTip">{numTip}</div>
            </div>
          )}
          <div className="footer_logo"></div>
        </div>
      </div>
    );
  }
}
// mapStateToProps：将state映射到组件的props中
const mapStateToProps = (state, ownProps) => {
  return {
    enterTimes: state.enterTimes,
  };
};
// mapDispatchToProps：将dispatch映射到组件的props中
const mapDispatchToProps = (dispatch) => {
  return {
    setPayInfo(data) {
      dispatch(payInfo(data));
    },
    setEnterTimes(data) {
      dispatch(getEnterTimes(data));
    },
  };
};
const Connects = connect(mapStateToProps, mapDispatchToProps)(BankPaySelect);
export default Connects;
