import React, { Component } from "react";
import PropTypes from "prop-types";
import SchooItem from "@components/schoolPayment/schooItem";
import AgriculturalBnak from "@components/schoolPayment/agriculturalBnak";
import SchoolPopup from "@components/schoolPayment/schoolPopup";
import { getQueryValue, storage } from "@utils/publicMethod";

class SchoolPayment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      schName: "",
      channelid: "",
      template: "",
      schInfo: {},
      popupClass: "hidePopup",
      child: "",
      subChanId: ''
    };
  }
  componentWillMount() {
    let channelid = getQueryValue("channelid");
    let subChanId = getQueryValue("subChanId");
    let template = getQueryValue("template");
    this.setState({
      channelid,
      subChanId,
      template,
    });
  }
  /**打开区域弹窗**/
  showPopup = () => {
    this.setState({
      popupClass: "showPopup",
    });
  };
  /**隐藏区域弹窗**/
  hidePopup = () => {
    this.setState({
      popupClass: "hidePopup",
    });
  };
  getSchool = (selectData) => {
    storage.set("receivingUnit", selectData); // 存储收款的单位信息
    this.setState(
      {
        schInfo: selectData,
        schName: selectData.schName,
      },
      () => {
        this.hidePopup();
      }
    );
  };
  render() {
    const { channelid, template, popupClass, schInfo, schName, subChanId } = this.state;
    const { nextPageStartDirection } = this.props;
    return (
      <div className="schoolPayIndex">
        {channelid == 3 ? (
          <AgriculturalBnak
            onClick={this.showPopup}
            nextPageStartDirection={nextPageStartDirection}
            schInfo={schInfo}
            schName={schName}
            channelid={channelid}
          ></AgriculturalBnak>
        ) : (
          <SchooItem channelid={channelid} template={template} subChanId={subChanId}></SchooItem>
        )}
        <SchoolPopup
          popupClass={popupClass}
          onClick={this.hidePopup}
          onRef={this.onRef}
          getSelectItem={this.getSchool}
          channelid={channelid}
          template={template}
        ></SchoolPopup>
      </div>
    );
  }
}
SchoolPayment.propTypes = {
  schInfo: PropTypes.object,
  nextPageStartDirection: PropTypes.func,
};
export default SchoolPayment;
