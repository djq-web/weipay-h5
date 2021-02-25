/**1、通过输入姓名、手机/证件号或者户号进入此页面
 * 2、mercId、userNo、userName分别代表缴费单位的Id 和输入的房屋号/户号、缴费人姓名
 * 这两个参数 在物业缴费和其他缴费也适用，这几个参数是在授权后，
 * 后端重定向到当前页面拼接的，目的是为了查询到缴费单位的信息以及待缴费列表
 **/
import React, { Component } from "react";
import { connect } from "react-redux";
import { payInfo } from "@store/actions";
import { Toast } from "antd-mobile";
import Popup from "@components/popup";
import Checkbox from "@components/checkbox";
import List from "@components/list";
import { API } from "@api/requestUrl";
import { Get, Post } from "@api/index";
import { navigateTo, getQueryValue, storage } from "@utils/publicMethod";
import "@assets/css/paySelect.less";
import propertyIcon from "@assets/image/ic_project_property@3x.png";
import propertyIconPay from "@assets/image/payment_icon.png";
class PropertySelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      proporgInfo: {},
      paymentList: [],
      totalAmount: 0,
      selectList: [], // 选中的缴费项
      propOrgId: "", // 物业ID
      houseUname: "", // 业主姓名
      certNo: "", //  证件号
      houseNo: "", // 户号
      showPage: false,
      houseList: [],
      buildingUnit: "",
      showPopup: false,
      tierId: "",
      numTip: 99,
    };
  }
  componentDidMount() {
    this.initPage();
  }
  initPage = () => {
    const proporgInfo = storage.get("receivingUnit");
    const propOrgId = getQueryValue("mercId");
    const certNo = getQueryValue("userNo");
    if (propOrgId && certNo) {
      this.getHouseList(propOrgId, certNo);
      if (proporgInfo && Object.keys(proporgInfo).length !== 0) {
        this.setState({ proporgInfo });
      } else {
        this.getProperty(propOrgId);
      }
      this.setState({
        propOrgId,
        certNo,
      });
    } else {
      return Toast.info("请从正确的缴费链接进入", 2);
    }
  };
  //跳转到待支付订单列表页
  goPaymentProcess = () => {
    const { certNo, propOrgId } = this.state;
    this.props.nextPageStartDirection("left", () => {
      navigateTo("/wy-pay-process", `mercId=${propOrgId}&userNo=${certNo}`);
    });
  }; //查询待支付订单数量
  queryOrderNum = (propOrgId, certNo, tierId, houseNo, houseUname) => {
    const parmas = {
      propOrgId: Number(propOrgId),
      certNo,
      tierId,
      houseNo,
      houseUname,
    };
    storage.set("Property", parmas);
    Post(API.queryPropertyOrderNum, parmas, true).then((res) => {
      const data = res && res.data;
      const { count } = data;
      this.setState({
        numTip: count || 0,
      });
    });
  };
  //获取用户相关的楼栋单元
  getHouseList = (propOrgId, certNo) => {
    const buildInfo = storage.get("buildInfo") || "";
    const houseUname = decodeURIComponent(getQueryValue("userName")) || "";
    Post(API.queryTierByUser, { propOrgId, certNo, houseUname }, true).then(
      (res) => {
        const list = res && res.data;
        let houseList = [],
          tierId = "",
          houseNo = "",
          buildingUnit = "",
          houseFloorName = "";
        const id = getQueryValue("tierId");
        const houNum = decodeURIComponent(getQueryValue("houseNo"));
        if (list && list.length > 0) {
          list.forEach((item) => {
            if (houNum && houNum == item.houseNo) {
              houseFloorName = item.fullPath + "/" + houNum;
            }
            item.huoseName = item.fullPath + "/" + item.houseNo;
            houseList.push(item);
          });
          if (buildInfo) {
            tierId = buildInfo.tierId;
            houseNo = buildInfo.houseNo;
            buildingUnit = buildInfo.buildingUnit;
          } else {
            tierId = id ? id : houseList[0].tierId;
            houseNo = houNum ? houNum : houseList[0].houseNo;
            buildingUnit = id ? houseFloorName : houseList[0].huoseName;
          }
          this.setState(
            {
              houseList,
              buildingUnit,
              tierId,
              houseNo,
              houseUname,
            },
            () => {
              this.getPayList(propOrgId, certNo, tierId, houseNo, houseUname);
              this.queryOrderNum(
                propOrgId,
                certNo,
                tierId,
                houseNo,
                houseUname
              );
            }
          );
        } else {
          return Toast.info("未找到该用户的缴费信息", 2);
        }
      }
    );
  };
  /**获取缴费的物业信息**/
  getProperty = (propOrgId) => {
    let requsetUrl = API.queryProperty + `default/${propOrgId}`;
    Get(requsetUrl, null, false).then((res) => {
      const data = res && res.data;
      if (data) {
        this.setState({ proporgInfo: data });
      }
    });
  };

  /**查询缴费项**/
  getPayList = (propOrgId, certNo, tierId, houseNo, houseUname) => {
    const parmas = {
      propOrgId: Number(propOrgId),
      certNo,
      tierId,
      houseNo,
      houseUname,
    };
    Post(API.queryWyBillList, parmas, true)
      .then((res) => {
        this.setState({ showPage: true });
        if (res) {
          let payItemStatus = res.data || [];
          let { data, userInfo } = res;
          if (data && data.length > 0) {
            data.map((item) => {
              item.checked = 0;
            });
          }
          this.setState({
            houseUname: userInfo.houseUname,
            paymentList: data || [],
          });
        }
      })
      .catch(() => {
        this.setState({ showPage: true });
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
      propOrgId,
      certNo,
      proporgInfo,
      houseUname,
      tierId,
      houseNo,
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
      payName: proporgInfo.propMercName,
      houseUname,
      certNo,
      propOrgId,
      payAmount: totalAmount,
      billNoList,
      tierId,
      houseNo,
    };
    this.props.setPayInfo(parmas);
    this.props.nextPageStartDirection("left", () => {
      navigateTo("/wy-pay-info", "isSelfPay=0");
    });
  };
  handleCheckPayHistory = () => {
    const { propOrgId, certNo } = this.state;
    this.props.nextPageStartDirection("left", () => {
      navigateTo("/wy-pay-history", `mercId=${propOrgId}&userNo=${certNo}`);
    });
  };
  // 身份切换
  goPayBefore = () => {
    const { propOrgId } = this.state;
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
          "/wy-pay-before",
          `propOrgId=${propOrgId}&template=default&isAuthor=1`
        );
      });
    }
  };
  // 弹窗
  showBuildList = () => {
    if (this.state.houseList.length <= 1) {
      return;
    }
    this.setState({
      showPopup: true,
    });
  };
  // 变更账单列表
  updateBill = (item) => {
    const { houseUname } = this.state;
    this.setState(
      {
        showPopup: false,
        buildingUnit: item.huoseName,
        tierId: item.tierId,
        houseNo: item.houseNo,
      },
      () => {
        this.getPayList(
          item.propOrgId,
          item.certNo,
          item.tierId,
          item.houseNo,
          houseUname
        );
        this.queryOrderNum(
          item.propOrgId,
          item.certNo,
          item.tierId,
          item.houseNo,
          houseUname
        );
      }
    );
  };
  render() {
    const {
      paymentList,
      houseUname,
      certNo,
      showPage,
      buildingUnit,
      showPopup,
      houseList,
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
                  <img src={propertyIcon} className="payMentImg"/>
                  <span>{houseUname}</span>
                
                </div>
                <p className="info_line build_list">
                  楼栋单元：
                  <span className="info_val" onClick={this.showBuildList}>
                    {buildingUnit}
                    {houseList.length > 1 && (
                      <i
                        className={`arrow_icon ${showPopup ? "arrow_up" : ""}`}
                      ></i>
                    )}
                  </span>
                </p>
                <p className="info_line">
                  手机号/证件号：<span className="info_val">{certNo}</span>
                </p>
                <p className="switching_btn" onClick={this.goPayBefore}>
                  切换用户
                </p>
              </div>
              {paymentList && paymentList.length > 0 ? (
                <div className="page_mian_content">
                  <div className="scrollContent">
                    <div className="pay_checkBox">
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
                    <div className="pay_btn" onClick={this.goPayInfo}>
                      缴费
                    </div>
                    <div
                      className="query_btn"
                      onClick={this.handleCheckPayHistory}
                    >
                      缴费历史查询
                    </div>
                  </div>
                  {numTip > 0 && (
                    <div
                      className="payment_status"
                      onClick={this.goPaymentProcess}
                    >
                      <img src={propertyIconPay} className="payment_icon" />
                      <p className="pending">待处理</p>
                      <div className="numTip">{numTip}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="pay-empty">
                  <div className="pay-empty-icon-wrapper">
                    <div className="pay-empty-icon"></div>
                    <p className="pay-empty-text">暂无缴费项目</p>
                  </div>
                  <div
                    className="pay-history-btn"
                    onClick={this.handleCheckPayHistory}
                  >
                    缴费历史
                  </div>
                </div>
              )}
            </div>
            <Popup.SlidePop popup visible={showPopup} maskClosable={false}>
              <ul className="select-list">
                {houseList.map((i, index) => (
                  <li
                    key={index}
                    className="select-list-li boderBottomLine"
                    onClick={this.updateBill.bind(this, i)}
                  >
                    {i.huoseName}
                  </li>
                ))}
              </ul>
              <div
                className="cancle_btn"
                onClick={() => {
                  this.setState({ showPopup: false });
                }}
              >
                <p className="cancle_p">取消</p>
              </div>
            </Popup.SlidePop>
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
  PropertySelect
);
export default Connects;
