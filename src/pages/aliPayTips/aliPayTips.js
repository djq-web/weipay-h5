import React, { Component } from 'react';
import { Button } from 'antd-mobile';
import { navigateTo, getQueryValue } from "@utils/publicMethod";
import TitleImg from '@assets/image/alipay_title.png';
import subTitle from '@assets/image/alipay_subTitle.png';
import './aliPay.less';

class AliPayTips extends Component{
  state = {
    redirectUrl: '',
    loading: true
  };
  componentDidMount() {
      const promise = [];
      promise.push(new Promise((resolve, reject)=>{
        const img = new Image();img.src = TitleImg;img.onload = function(){resolve(1)}
      }));
      promise.push(new Promise((resolve, reject)=>{
        const img = new Image();img.src = subTitle;img.onload = function(){resolve(1)}
      }));
      Promise.all(promise).then(res=>{
        this.setState({loading: false});
      });
      let arr = window.location.hash.split('/');
      const redirectUrl = arr[2];
      this.setState({
        redirectUrl
      });
  }
  componentWillUnmount() {
    this.setState = (state, callback) => {
      return
    }
  }
  go = (redirectUrl) => {
    const path = '/aliPay-qrCode';
      if(redirectUrl){
        this.props.nextPageStartDirection('right',()=>{
          navigateTo(redirectUrl);
        })
      }else{
        this.props.nextPageStartDirection('right',()=>{
          navigateTo(path,`redirectUrl=${this.state.redirectUrl}`);
        })
      }
  };
  render() {
    return (
      <div className={'alipay-page'}>
        <div className={'title'}>
          <img src={TitleImg} alt=""/>
        </div>
        <div className={'sub-title'}>
          <img src={subTitle} alt=""/>
        </div>
        <div className={'text'}>
          <p className={'word'}>
            缴费用分期，手续费低至<span className={'strong yellow'}>0.625%</span>/月，
          </p>
          <p className={'word'}>
            1000元每个月仅需 <span className={'yellow'}>6.25元</span>,灵活还款无压力。
          </p>
        </div>
        <div className={'button-group'}>
          <Button className={'peroid-pay'} onClick={() => this.go()}>分期缴费</Button>
          <Button className={'one-time-pay'} onClick={() => this.go(this.state.redirectUrl)}>全款缴费</Button>
        </div>
      </div>
    );
  }
}

export default AliPayTips;