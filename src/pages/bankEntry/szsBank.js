import React, { Component } from 'react';
import { navigateTo, storage } from "@utils/publicMethod";
import bankLogo from '@assets/image/szsbank.png';
import './bank.less';

class SzsBank extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  componentDidMount() {
  }
  goUrl = (channelId) => {
    this.props.nextPageStartDirection('right', () => {
      navigateTo('/index', `template=default&channelid=${channelId}&bankType=3`)
    })
  }
  render() {
    const areaArray = [
      {
        "id": 1,
        "areaName": "银川地区",
        "channelid": "55"
      },
      {
        "id": 2,
        "areaName": "石嘴山地区",
        "channelid": "54"
      },
      {
        "id": 3,
        "areaName": "吴忠地区",
        "channelid": "53"
      },
      {
        "id": 4,
        "areaName": "中卫地区",
        "channelid": "52"
      },
      {
        "id": 5,
        "areaName": "固原地区",
        "channelid": "51"
      },
    ]
    return (
      <div className="bank_page">
        <div className="content_wrap">
          <div className="bank_logo1"><img src={bankLogo} /></div>
          <div className='choose_part'>
            <p className="title">请选择地区</p>
            <div className="area_list">
              {
                areaArray.map((item, index) => {
                  return (
                    <a className="area_li" key={item.id} onClick={this.goUrl.bind(this, item.channelid)}>{item.areaName}</a>
                  )
                })
              }
            </div>
          </div>

        </div>

      </div>
    )
  }
}

export default SzsBank;
