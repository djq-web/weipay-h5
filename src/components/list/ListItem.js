import React from 'react';
import classNames from 'classnames';
import './List.less';
import { List } from 'antd-mobile';
const Item = List.Item;

const ListItem=(props)=>{
    const {className,children,...others}=props;
    const cls=classNames({
        'swift_list_item':true,
        [className]:className
    });
    return(
        <Item className={cls} {...others}>
            {children}
        </Item>

    )
}

export default ListItem;
