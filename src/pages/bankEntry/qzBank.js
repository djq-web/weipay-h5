import React, { Component } from 'react';
import { navigateTo, storage } from "@utils/publicMethod";
import bankLogo from '@assets/image/qzbank.png';
import './bank.less';

class qzBank extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentDidMount() { }
    goUrl = (channelId) => {
        this.props.nextPageStartDirection('right', () => {
            navigateTo('/index',`template=default&channelid=100&subChanId=${channelId}&bankType=2`)
        })
    }
    render() {
        const areaArray = [
            {
                "id": 1,
                "areaName": "泉州地区",
                "channelid": "1001886"
            },
            {
                "id": 2,
                "areaName": "福州地区",
                "channelid": "1001887"
            },
            {
                "id": 3,
                "areaName": "厦门地区",
                "channelid": "1001888"
            },
            {
                "id": 4,
                "areaName": "莆田地区",
                "channelid": "1001889"
            },
            {
                "id": 5,
                "areaName": "三明地区",
                "channelid": "1001890"
            },
            {
                "id": 6,
                "areaName": "龙岩地区",
                "channelid": "1001891"
            },
            {
                "id": 7,
                "areaName": "漳州地区",
                "channelid": "1001892"
            },
            {
                "id": 8,
                "areaName": "宁德地区",
                "channelid": "1001893"
            },
            {
                "id": 9,
                "areaName": "南平地区",
                "channelid": "1001894"
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

export default qzBank;
