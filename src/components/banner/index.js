import React, { Component } from "react";
import Swiper from "react-id-swiper";
import { API } from "@api/requestUrl";
import { Get } from "@api/index";
import "@assets/css/swiper.min.css";
import "./index.less";

class Carousel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bannerList: [],
      listNone: false
    };
  }
  componentWillMount() {
    this.getBannerList();
  }
  linkTo = (url) => {
    if (url) {
      location.href = url;
    }
  };
  /**请求学校广告banner列表
   * @parmas mchType  商户类型 0 学校 1 物业 2 其他  目前 物业暂未通过接口处理banner
   * mercId   商户ID
   * **/
  getBannerList = () => {
    Get(API.queryBannerList, { ...this.props }, true).then((res) => {
      const data = res && res.data;
      const listNone = res && res.data.length > 0 ? false : true;
      this.setState({ 
        bannerList: data || [],
        listNone
      });
    });
  };
  renderBanner = () => {
    let bannerData = "";
    const { bannerList } = this.state;
    if (bannerList.length > 0) {
      bannerData = bannerList.map((item, index) => {
        return (
          <div className="img_item" key={index}>
            <img
              src={item.banPath}
              onClick={this.linkTo.bind(this, item.banLink)}
              className="bannerImg"
            />
          </div>
        );
      });
    }
    return bannerData;
  };
  render() {
    const { bannerList, listNone } = this.state;
    const { mchType } = this.props;
    const params = {
      pagination: {
        el: ".swiper-pagination",
        type: "bullets",
        clickable: true,
      },
      autoplay: {
        delay: 3000, //每张停留3000ms
      },
      loop: true,
      speed: 500, //设置每张切换速度
      observer: true, //修改swiper自己或子元素时，自动初始化swiper
      observeParents: true, //修改swiper的父元素时，自动初始化swiper
    };
    return (
      <div className="bannerContainer">
        {bannerList.length > 0 && (
          <div className="carouselContainer">
            <div className="imgBox">
              {
                /*只有一张图片 不轮播*/
                bannerList.length === 1 && (
                  <div className="banner_wrap">{this.renderBanner()}</div>
                )
              }
              {
                /*只有>1图片 轮播*/
                bannerList.length > 1 && (
                  <div className="banner_wrap">
                    <Swiper {...params}>{this.renderBanner()}</Swiper>
                  </div>
                )
              }
            </div>
          </div>
        ) }
        {listNone && (
          <div>
            {mchType == 0 && (
              <div className="pay_befor_banner school_banner"></div>
            ) }
            {mchType == 1 && (
              <div className="pay_befor_banner property_banner"></div>
            )}
            {mchType == 2 && (
              <div className="pay_befor_banner otherMch_banner"></div>
            )}
          </div>
        )}
      </div>
    );
  }
}
Carousel.defaultProps = {
  mercId: "",
  bannerList: [],
};
export default Carousel;
