# webpack4-react-router4
The most powerful webpack4 tutorial in the universe
# 快速开始
```javascript
npm run dev            开发模式启动项目

npm run build          生产模式打包项目
```
# 项目介绍
这是一个依赖于webpack4并做了很多优化处理的react开发环境，采用的是react-router4做的路由加载，项目采用
react-redux实现数据管理

# 开源协议
本项目基于 MIT 协议，请自由地享受和参与开源。

# @babel/plugin-transform-runtime  你使用 generators/async 函数时，自动引入 babel-runtime/regenerator 


   
  **缴费类型** 
	当前的主要缴费类型分为学校缴费、物业缴费、其他缴费。其中其他缴费模块里面包含了党费缴纳以及捐款。
	因各个模块所包含的一些业务参数差异性，整个前端页面的业务处理分为三个业务处理模块，具体可以在项目中查看相关代码。
   
   **学校缴费** 
   
  示例：

   A类型：渠道链接：  https://wjf.swiftpass.cn/#/?template=default&channelid=102

   B类型：证件号和自助缴费入口： https://wjf.swiftpass.cn/#/wy-pay-before?propOrgId=358&template=default

   C类型：只展示自助缴费： https://wjf.swiftpass.cn/#/wy-pay-input?propOrgId=358&template=default

   D类型：账单催收： https://wjf.swiftpass.cn/#/wy-pay-select?template=default&mercId=%s&userNo=%s&userName=23444&messageSub=1
   
   A类型的入口缴费 分为常规页面和成都农商行定制化页面，在渠道号为3的时候， 展示另一套页面主题风格。
   
   B类型会先去判断该机构是否开通花呗，如果开通花呗并且是在微信中打开，那么将先跳转到花呗推 
   广页面 然后再通过学号进入账单页面，在账单页面，如果是从教育平台小程序跳转至该页面，那么所调用的接口以及后面的支付接口所携带的参数需要增加。
   
   C类型页面 只展示自助缴费：在只设置自助缴费的情况下，可以直接扫码进入该页面，并且可以选择全自助缴费还是半自助缴费。
   
   对应  的缴费项。同时在该页面用户也可以切换为全自助缴费，那么用户可以自行输入缴费项目。

  D类型 账单催收， 如果在管理后端对相对应的用户点击催收那么该用户将在微信收到账单提醒，点击该页面将跳转到对应的缴费账单页面。

  **物业缴费** 

   示例：

   A类型：渠道链接：  https://wjf.swiftpass.cn/#/?template=default&channelid=102

   B类型：证件号和自助缴费入口： https://wjf.swiftpass.cn/#/wy-pay-before?propOrgId=358&template=default

   C类型：只展示自助缴费： https://wjf.swiftpass.cn/#/wy-pay-input?propOrgId=358&template=default

   D类型：账单催收： https://wjf.swiftpass.cn/#/wy-pay-select?template=default&mercId=%s&userNo=%s&userName=23444&messageSub=1


   B 类型入口不 会先去判断该机构是否开通花呗，如果开通花呗并且是在微信中打开，那么将先跳转到花呗推 
   广页面，在该种入口下，用户可以选择业主信息和房屋信息缴费，在跳转到相关账单页面时，如果选择的是房 
   屋信息缴费，那么在该账单页面， 将获取相对应的房屋下所对应的账单，如果选择的是业主信息缴费，并且 
   该业主名下有多个房屋， 那么进入页面将默认选中第一个房屋去获取对应的账单，并且用户可以自行切换查 
   询不同的房屋下所对应的账单。

  如果后端设置了只展示自助缴费类型，那么在扫码时进入的链接是C类型，直接跳转到对应的自助缴费页面，
  其中在自助缴费页面，需要判断当前机构是否有激活的缴费项目供用户自行选择，如果有则可以弹窗展示对应 
  的缴费项。同时在该页面用户也可以切换为全自助缴费，那么用户可以自行输入缴费项目。

  D类型 账单催收， 如果在管理后端对相对应的用户点击催收那么该用户将在微信收到账单提醒，点击该页面将跳转到对应的缴费账单页面。
 
  
 **其他缴费** 

   示例：

   A类型：渠道链接：  https://wjf.swiftpass.cn/#/?template=default&channelid=102

   B类型：姓名手机号和自助缴费入口： https://wjf.swiftpass.cn/#/other-pay-before?commOrgId=358&template=default

   C类型：只展示自助缴费： https://wjf.swiftpass.cn/#/other-pay-input?commOrgId=358&template=default

   D类型：账单催收： https://wjf.swiftpass.cn/#/wy-pay-select?template=default&mercId=%s&userNo=%s&userName=23444&messageSub=1

    其他缴费的B类型下展示的页面主题风格，支持后端配置，根据commOrgId先去查询到对应的机构所配置的相关信息，如果themeColor==1， 将展示党费相关的主题颜色， 并且相关bannert图也支持后端配置，不存在的情况下则展示默认图。

   **授权逻辑**
   
   当前项目采用的是静默授权方式， 通过机构ID 和userNo以及userName绑定用户，用户在第一次输入学号/证件号或者手机号， 进入账单页面时，将向后端发起
   起请求， 这个时候后端请求微信将
   相关信息存储起来，过期时间可以设置，

    
