import React from 'react';
import classNames from 'classnames';
import {Checkbox as AntdCheckbox} from 'antd-mobile';
import './Checkbox.less';
import PropTypes from 'prop-types';

export default class Checkbox extends React.Component{
    static propTypes={
        model: PropTypes.string
    }
    static defaultProps={
        model: "round"
    }

    render(){
        const {className,children,model,...others}=this.props
        const cls=classNames({
            'swift_checkbox':true,
            [model]:true,
            [className]:className
        })
        return(
            <AntdCheckbox className={cls} {...others}>{children}</AntdCheckbox>
        )
    }
}
