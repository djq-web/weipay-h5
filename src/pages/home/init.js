import React, { Component } from 'react';
import QueueAnim from 'rc-queue-anim';
import PropTypes from 'prop-types';
const pageWidth = document.body.clientWidth;

//进场动画 从左到右
const animLeftToRight = [
    {
        translateX: [0, -pageWidth],//进场 end,start
        transition: 'transform 0.3s cubic-bezier(0.35, 0, 0.25, 1)'
    },
    {
        opacity: [1, 0.6],  //出场 start,end
        translateX: [0, pageWidth],
        transition: 'transform 0.3s cubic-bezier(0.35, 0, 0.25, 1)'
    }
]
//进场动画 从右到左
const animRightToLeft = [
    {
        translateX: [0, pageWidth],//进场 end,start
        transition: 'transform 0.3s cubic-bezier(0.35, 0, 0.25, 1)'
    },
    {
        opacity: [1, 0.6],  //出场 start,end
        translateX: [0, -pageWidth],
        transition: 'transform 0.3s cubic-bezier(0.35, 0, 0.25, 1)'
    }
];
class Init extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showAnimate: true,
            animConfig: animLeftToRight //项目初始化时 首页从屏幕左到右进场
        }

    }
    nextPageStartDirection = (direction, callback) => {
        let animConfig = direction === 'left' ? animLeftToRight : animRightToLeft;
        const nextState = { animConfig, showAnimate: direction !== 'none' };
        this.setState(nextState,
            () => {
                callback && callback()
            }
        )
    };

    setInitState = (state) => {
        this.setState(state)
    };


    render() {
        const animateProps = React.Children.map(this.props.children, child => React.cloneElement(child,
            {  
                nextPageStartDirection: this.nextPageStartDirection,
                key: location.hash,
                setInitState: this.setInitState
            }
        ));
        return (
            <div className="init">
                {
                    this.state.showAnimate ? (
                        <QueueAnim
                            className="router-wrap"
                            animatingClassName={['page-anim-entering', 'page-anim-leaving']}
                            animConfig={this.state.animConfig}
                        >
                            {
                                animateProps
                            }
                        </QueueAnim>
                    ) :
                        ({animateProps})
                }
            </div>
        )
    }
}
Init.propTypes = {
 
}
export default Init;
