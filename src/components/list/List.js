import React from 'react';
import classNames from 'classnames';
import './List.less';
import { List as AntdList } from 'antd-mobile';
import PropTypes from 'prop-types';

export default class List extends React.Component{
    static propTypes={
        name:PropTypes.string
    };

    render(){
        const {className,children,onChange,mainColor,...others}=this.props;
        const cls=classNames({
            'swift_list':true,
            [className]:className
        });
        return(
            <AntdList className={cls}  {...others} >{children}</AntdList>
        )
    }

}
