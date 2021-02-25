import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import './Checkbox.less';
import { Checkbox } from 'antd-mobile';
const AntdCheckboxItem = Checkbox.CheckboxItem;

const CheckboxItem=(props)=>{
    const {className,children,model,...others}=props;
    const cls=classNames({
        'swift_checkbox_item':true,
        [model]:true,
        [className]:className
    });
    return(
        <AntdCheckboxItem className={cls} {...others}>
            {children}
        </AntdCheckboxItem>

    )
}
CheckboxItem.propTypes = {
    model: PropTypes.string
}

CheckboxItem.defaultProps = {
    model:'round'
}
export default CheckboxItem;
