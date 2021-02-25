import React from 'react';
import classNames from 'classnames';
import Popup from './Popup';
import PropTypes from 'prop-types';
import './Popup.less';

const SlidePop=(config)=>{

    const {children,model,...others}=config;
    return (
        <Popup
            transparent={false}
            animationType={model}
            transitionName="zoom"
            maskTransitionName='zoom'
            popup={true}
            {...others}
        >
            {children}
        </Popup>
    )
}
SlidePop.propTypes = {
    model:PropTypes.string
}
SlidePop.defaultProps = {
    model:'slide-up'
}



export default SlidePop;
