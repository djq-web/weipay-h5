import React from 'react';
import classNames from 'classnames';
import { Modal} from 'antd-mobile';
import './Popup.less';

const Info=(config)=>{
    const {title,content,onOk,okText='知道了',...others} = config;

    const cls=classNames({
        'swift_content':true,
        'no_title':!title
    })

    const contTmpl=<div className={cls}>{content}</div>


    const btns=[
        { text: okText, onPress: onOk }
    ]

    Modal.alert(title,contTmpl,btns);
}


export default Info;
