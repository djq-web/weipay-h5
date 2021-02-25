import React from 'react';
import classNames from 'classnames';
import './Popup.less';
import PropTypes from 'prop-types';
import {Modal} from 'antd-mobile';

export default class Popup extends React.Component{
    static defaultProps={
        transparent: true,
        transitionName:'zoom'
    }
    render(){
        const {className,children,transparent,title,transitionName, ...others}=this.props;
        const cls=classNames({
            'swift_popup':true,
            'no_title':!title,
            [className]:className
        })
        return(
            <Modal
                 title={title}
                 transparent={transparent}
                 className={cls}
                 transitionName={transitionName}
                 maskTransitionName='zoom'
                 {...others}
            >
                 {children}
             </Modal>
        )
    }
}
