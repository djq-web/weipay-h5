import React,{Component} from 'react';
import classNames from 'classnames';
import './Input.less';
import PropTypes from 'prop-types';
import { InputItem } from 'antd-mobile';

export default class Input extends React.Component{

    static defaultProps={
        model: "primary",
        size: "medium",
        align:"left"
    }

    doChange=(val)=>{
        let data={data:val}
        if(this.props.name){
            data.name=this.props.name
        }
        this.props.onChange?this.props.onChange(data):null;
    }

    render(){
        const {className,model,size,onChange, align,...others}=this.props;
        const cls=classNames({
            'swift_input':true,
            'primary':model=="primary",
            [align]:true,
            [size]:true,
            [className]:className
        });

        return (

            <InputItem className={cls} onChange={this.doChange} {...others}/>

        )
    }

}
