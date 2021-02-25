module.exports = {
  "plugins": {
      "autoprefixer": {},                //自动写浏览器前缀
      "postcss-px-to-viewport":{
          viewportWidth: 750,            //设计稿宽度
          viewportHeight: 1334,          //设计稿高度
          unitPrecision: 5,              //精度 小数点后保留多少位
          viewportUnit: 'vw',
          selectorBlackList: ['.no-vw','.hairlines','/^body$/'], //黑名单中选择器的px值将不会转换成vw
          minPixelValue: 1,              //最小的px值，该值将不会被转化成vw
          mediaQuery: false
      }
  }
}
