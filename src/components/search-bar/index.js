import React from 'react';
import classNames from 'classnames';
import {SearchBar as AntdSearchBar} from 'antd-mobile';

export default class SearchBar extends React.Component{

    render(){
        const {className,children,...others}=this.props
        const cls=classNames({
            'swift_searchbar':true,
            [className]:className
        })
        return(
            <AntdSearchBar className={cls} {...others}>{children}</AntdSearchBar>
        )
    }
}
