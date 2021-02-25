import React from 'react';
import classNames from 'classnames';
import { Modal} from 'antd-mobile';
import './Popup.less';

const Confirm=(config)=>{

    const {title,content,onOk,onCancel,okText='确定',cancelText='取消',...others} = config;
    
    const cls=classNames({
        'swift_content':true,
        'no_title':!title
    })

    const contTmpl=<div className={cls}>{content}</div>

    const btns=[
        { text: cancelText, onPress: onCancel },
        { text: okText, onPress: onOk }
    ]

    Modal.alert(title,contTmpl,btns);
}


export default Confirm;
