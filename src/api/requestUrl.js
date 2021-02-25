export const API = {
  // 顶层API, 1.查询是否开启花呗， 2.花呗分期列表
  isOpenHB: "/schoolpayment/hb/queryHbState",
  HBPeriodList: "/schoolpayment/hb/queryHbType",
  // 查询成都地区列表（定制需求，成都农商行定制需求）
  queryArea: "/schoolpayment/pay/channel/qryareas",
  // 模糊查询学校列表（实时查询，成都农商行定制需求）
  qrySchByChanIdAndName: "/schoolpayment/pay/school/qrySchByChanIdAndName",
  //查询渠道下学校列表
  queryChannel: "/schoolpayment/pay/channel/queryChannelSchool/",
  //查询某个学校信息
  querySchool: "/schoolpayment/pay/school/querySchoolInfo/",
  // 查询缴费项目
  paybill: "/schoolpayment/pay/student/querystudent/paybill",
  paybillhistory: "/schoolpayment/pay/student/querystudent/paybillhistory",
  //查询分次支付账单明细
  PayBillDetail: "/schoolpayment/pay/student/querystudent/manyPayBillDetail",
  // 是否展示分次支付按钮
  showBatchBtn: "/schoolpayment/pay/student/querystudent/showManyPayButton",
  // 申请退款
  refundMoney: "/schoolpayment/pay/student/querystudent/manyPayRefundApply",
  // 通过选择学校 填写学生学号 支付接口
  payFromSelectSchool: "/schoolpayment/allpay/billpay",
  //学校缴费——订单状态查询
  querypaystate: "/schoolpayment/allpay/querypaystate",
  // 自助缴费无激活项目
  selfPay: "/schoolpayment/allpay/selfhelppay",
  // 自助缴费有激活项目
  selfPayItems: "/schoolpayment/allpay/selfPayItems",
  //自助缴费前 查询是否有激活缴费项目
  checkActive: "/schoolpayment/pay/school/item/checkActive",
  //获取激活项目
  schoolItemInfo: "/schoolpayment/pay/school/item/schoolItemInfos",
  //获取自定义字段
  queryCustonData: "/schoolpayment/pay/school/queryschoolbyid",
  // 学校缴费请求banner广告图列表
  queryBannerList: "/schoolpayment/pay/school/qryBannerInfoList",

  /*学校电子发票版本接口 start*/

  // 根据票据类型查询可开票的缴费记录
  qryRecByCode: "/schoolpayment/invoice/qryrecbycode",
  // 查询学生的开票历史记录
  qryInvoiceRec: "/schoolpayment/invoice/qryinvoicerec",
  // 提交开票接口
  openInvoice: "/schoolpayment/invoice/openinvoice",
  /*学校电子发票版本接口 end*/

  //判断首页该渠道下有几种缴费项目（学校、物业、其他）
  qrPayType: "/schoolpayment/pay/channel/qrymerctype/",

  /*物业缴费接口 start*/

  // 查询物业机构列表
  queryPropertyChannel: "/schoolpayment/pay/channel/qryproporg/",
  // 查询某个物业机构信息
  queryProperty: "/schoolpayment/pay/property/qrypropinfo/",
  // 查询物业账单缴费项目 (废弃)
  qrypaybill: "/schoolpayment/pay/property/qrypaybill",
  // 通过选择物业机构 填写证件号和姓名 支付接口
  payFromSelectProperty: "/schoolpayment/propertypay/billpay",
  // 物业历史账单查询接口
  qrWyHisbill: "/schoolpayment/pay/property/qryhisbill",
  // 物业自助缴费
  wySelfPay: "/schoolpayment/propertypay/selfpay",

  // 自助缴费前 查询物业是否有激活缴费项目
  propCheckActive: "/schoolpayment/pay/property/propCheckActive",
  // 获取物业已激活项目
  propertyItemInfo: "/schoolpayment/pay/property/propItemInfo",
  // 物业半自助缴费 提交接口
  wySelfPayItems: "/schoolpayment/propertypay/selfPayItems",
  // 物业缴费自定义字段
  getWyCustomItem: "/schoolpayment/pay/property/querypropbyid",
  // 查询物业商户下的所有楼栋信息
  buildinglist: "/schoolpayment/pay/property/qryPropTierById",

  /*物业缴费接口 end*/

  /*其他商户缴费接口 start*/

  // 查询其他商户列表
  queryOtherChannel: "/schoolpayment/pay/channel/qrycommorgs/",
  // 查询某个商户信息
  queryOtherMch: "/schoolpayment/pay/common/qrycomminfo/",
  // 查询其他商户账单缴费信息
  qrypaybillCommon: "/schoolpayment/pay/common/qrypaybill",
  // 通过选择物业机构 填写证件号和姓名 支付接口
  payFromSelectOther: "/schoolpayment/commonpay/billpay",
  // 物业历史账单查询接口
  qrOtherHisbill: "/schoolpayment/pay/common/qryhisbill",
  // 物业自助缴费
  ohterSelfPay: "/schoolpayment/commonpay/selfpay",
  // 其他缴费的半自助缴费 支付接口
  otherSelfPayItems: "schoolpayment/commonpay/selfPayItems",
  //自助缴费前 查询其他缴费项目是否有激活缴费项
  otherCheckActive: "/schoolpayment/pay/common/item/checkActive",
  //  其他缴费自定义字段
  getOtherCustomItem: "/schoolpayment/pay/common/queryCustomFields",
  // 其他缴费项目的激活项目
  otherMchItemInfo: "/schoolpayment/pay/common/selfItems",

  /*其他商户缴费接口 end*/

  /**小程序查询学校缴费项目**/
  querySchoolBill: "/schoolpayment/pay/student/eduqrypaybill",
  /**授权接口 -微信**/
  getwxInfo: "/schoolpayment/oauth/wxAuth",
  /**支付宝授权**/
  getAliPayInfo: "/schoolpayment/oauth/zfbAuth",
  //  查询物业缴费支付状态接口
  queryPropertyPayStatus: "/schoolpayment/propertypay/querypaystate",
  // 查询其他缴费支付状态接口
  queryOtherPayStatus: "/schoolpayment/commonpay/querypaystate",
  // 其他缴费 ——查询其他用户
  querUserInfo: "/schoolpayment/pay/common/user",
  // 查询当前用户授权信息
  queryAuthorization: "/schoolpayment/oauth/getUserByThirdId",
  // 物业根据楼宇查询业主证件号接口
  queryWyUserNo: "/schoolpayment/pay/property/qryUserInfoByTier",
  // 根据参数信息查询缴费用户是否存在
  queryUser: "/schoolpayment/oauth/findUserByParams",
  // 查询楼栋房屋（商户层级）
  queryTierByUser: "/schoolpayment/pay/property/queryTierByUser",
  // 物业账单列表查询 （新版 启用）
  queryWyBillList: "/schoolpayment/pay/property/qryPayBillByTier",
  // 缴费凭证获取
  getVoucher: "/schoolpayment/pay/student/downLoadCertificate",

  //缴费流程优化接口

  //账单缴费-查询支付中订单数量(学校)
  querySchOrderNum: "/schoolpayment/repay/school/payIngCount",
  //账单缴费-查询支付中订单明细(学校)
  querySchOrderDetail: "/schoolpayment/repay/school/payIngDetail",
  //账单缴费-查询支付中订单明细(物业)
  queryPropertyDetail: "/schoolpayment/repay/prop/payIngDetail",
  //账单缴费-查询支付中订单数量(物业)
  queryPropertyOrderNum: "/schoolpayment/repay/prop/payIngCount",
  //账单缴费-查询支付中订单数量(其他)
  queryOtherMchOrderNum: "/schoolpayment/repay/other/payIngCount",
  //账单缴费-查询支付中订单明细(其他)
  queryOtherMchOrderDetail: "/schoolpayment/repay/other/payIngDetail",
  //账单缴费-取消订单
  cancelOrder: "/schoolpayment/repay/cancel",
  //账单缴费-重新支付
  repayOrder: "/schoolpayment/repay/repay",
  //账单缴费-查询待支付订单还剩下多少分钟
  surplusSecond:'/schoolpayment/repay/second'
};
