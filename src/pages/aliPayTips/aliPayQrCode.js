import React, { Component } from 'react';
import { Button } from 'antd-mobile';
import QrCodeWithLogo from 'qr-code-with-logo'
import html2canvas from 'html2canvas';
import img from '@assets/image/alipay_icon_img.png';
import scan from '@assets/image/alipay_icon_scan.png';
import huabei from "@assets/image/alipay_icon_huabei.png";
import leftArrow from '@assets/image/alipay_icon_leftarrow.png';
import huabeiLogo from '@assets/image/huabei_logo.png';
import qrcodeLogo from '@assets/image/qrCode_logo.png';
import { navigateTo, getQueryValue } from "@utils/publicMethod";
import './aliPay.less';

class AliPayQrCode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redirectUrl: ''
    }
  }
  componentWillMount() {
    let localUrl = window.location.hash;
    let redirectUrl = localUrl.match(/redirectUrl=(\S*)/)[1];
    this.setState({
      redirectUrl
    });
  }
  componentDidMount() {
    const myCanvas = document.createElement('img');
    document.querySelector('#qrCode').appendChild(myCanvas);
    QrCodeWithLogo.toImage({
      image: myCanvas,
      margin: 1,
      content: window.location.origin + '/#' + this.state.redirectUrl,
      width: 360,
      logo: {
        src: qrcodeLogo,
        radius: 8,

      }
    }).then(res => {
      const qrCodeWrapper = document.querySelector('.qrcode-wrapper');
      const doms = document.querySelector('.qrcode-inner-wrapper');
      html2canvas(doms).then(function (canvas) {
        var image = new Image();
        image.src = canvas.toDataURL("image/png");
        image.style.width = '100%';
      });
    });
  }

  backToIndex = () => {
    const { redirectUrl } = this.state;
    this.props.nextPageStartDirection('right',()=>{
      navigateTo(redirectUrl);
    })
  }

  render() {
    return (
      <div className={'alipay-qrcode-page'}>

        <div className={'qrcode-wrapper'}>
          <div className={'qrcode-inner-wrapper'}>
            <div className={'up'}>
              <ul className={'steps'}>
                <li className={'step-item'}>
                  <img src={img} alt="" />
                  <p className={'step-word'}>
                    <small className={'step-count'}>1</small>
                    <span className={'step-text'}>长按保存图片</span>
                  </p>
                </li>
                <li className={'step-divider first'}>
                  <img src={leftArrow} alt="" />
                </li>
                <li className={'step-item'}>
                  <img src={scan} alt="" />
                  <p className={'step-word'}>
                    <span className={'step-count'}>2</span>
                    <span className={'step-text'}>支付宝扫码</span>
                  </p>
                </li>
                <li className={'step-divider last'}>
                  <img src={leftArrow} alt="" />
                </li>

                <li className={'step-item'}>
                  <img src={huabei} alt="" />
                  <p className={'step-word'}>
                    <span className={'step-count'}>3</span>
                    <span className={'step-text'}>选择花呗分期</span>
                  </p>
                </li>
              </ul>
            </div>
            <div className={'down'}>
              <div className={'qrCode'} id={'qrCode'}> </div>
              <div className={'qrCode-desc'}>
                <p>1.长按保存二维码，打开支付宝扫一扫</p>
                <p>2.点击相册，选择该二维码图片</p>
                <p>3.进入威缴费，即可选择花呗分期支付</p>
              </div>
            </div>
            <div className={'huabei-logo'}>
              <img src={huabeiLogo} alt="" />
            </div>
          </div>
        </div>
        <div id={'img-wrap'}></div>
        <div className={'button-group'}>
          <Button className={'wechat-pay-btn'} onClick={this.backToIndex}>微信全款缴费</Button>
        </div>
      </div>
    );
  }
}

export default AliPayQrCode