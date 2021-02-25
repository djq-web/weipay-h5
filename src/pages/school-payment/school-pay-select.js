/**1、通过输入学号/证件号进入此页面
 * 2、mercId、userNo 分别代表缴费单位的Id 和输入的学号/证件号
 * 这两个参数 在物业缴费和其他缴费也适用，这两个参数是在授权后，
 * 后端重定向到当前页面拼接的，目的是为了查询到缴费单位的信息以及待缴费列表
 **/

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BankPaySelect from '@components/paySelect/bankPaySelect';
import PaySelect from '@components/paySelect/schoolPaySelect';
import { storage } from "@utils/publicMethod";

class SchoolPaySelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  componentWillMount() {}
  render() {
    const channelid = storage.get('channelid') || '';
    return (
      <div className="paySelectPage">
        {
         channelid==3?
         <BankPaySelect nextPageStartDirection={this.props.nextPageStartDirection} channelid={channelid}></BankPaySelect>:
         <PaySelect nextPageStartDirection={this.props.nextPageStartDirection}></PaySelect>
        }
      </div>
    );
  }
}
SchoolPaySelect.propTypes = {
  nextPageStartDirection: PropTypes.func
};

export default SchoolPaySelect;

