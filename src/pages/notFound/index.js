
import React, { Component } from 'react';
import { goBack } from "@utils/publicMethod";
import notFoundLogo from '@assets/image/notFound.png';
import './index.less';

export default class NotFoundPage extends Component {
  constructor(props){
    super(props);
  }
  goHome=()=>{
    goBack();
  }
  render(){
    return (
      <div className="notFoundPage">
         <img src={notFoundLogo} className="pageLogo"/>
         <p className="backBtn" onClick={this.goHome}>返回首页</p>
      </div>
    )
  }
}
