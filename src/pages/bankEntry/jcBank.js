import React, { Component } from 'react';
import { navigateTo,storage} from "@utils/publicMethod";
import bankLogo from '@assets/image/jcbank.png';
import './bank.less';

class JcBank extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentDidMount() { }
    goUrl = (channelId) => {
        this.props.nextPageStartDirection('right', () => {
            navigateTo('/index',`template=default&channelid=${channelId}&bankType=1`)
        })
    }
    render() {
        const areaArray = [
            {
                "id": 1,
                "areaName": "晋城地区",
                "channelid": "10"
            },
            {
                "id": 2,
                "areaName": "太原地区",
                "channelid": "11"
            },
            {
                "id": 3,
                "areaName": "运城地区",
                "channelid": "4"
            },
            {
                "id": 4,
                "areaName": "大同地区",
                "channelid": "9"
            },
            {
                "id": 5,
                "areaName": "晋中地区",
                "channelid": "14"
            },
            {
                "id": 6,
                "areaName": "长治地区",
                "channelid": "12"
            },
            {
                "id": 7,
                "areaName": "朔州地区",
                "channelid": "16"
            },
            {
                "id": 8,
                "areaName": "吕梁地区",
                "channelid": "15"
            },
            {
                "id": 9,
                "areaName": "忻州地区",
                "channelid": "13"
            },

        ]
        return (
            <div className="bank_page">
                <div className="content_wrap">
                    <div className="bank_logo"><img src={bankLogo} /></div>
                    <div className="choose_part">
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

export default JcBank;
