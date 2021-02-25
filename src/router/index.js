import Home from "@pages/home/index";
import JcBank from "@pages/bankEntry/jcBank";
import QzBank from "@pages/bankEntry/qzBank";
import SzsBank from "@pages/bankEntry/szsBank";
import AliPayTips from "@pages/aliPayTips/aliPayTips";
import AliPayQrCode from "@pages/aliPayTips/aliPayQrCode";
import InvoiceList from "@pages/invoice/list";
import InvoiceBilling from "@pages/invoice/billing";
// import Voucher from '@pages/invoice/voucher';

/**start 学校缴费*/
import SchoolList from "@pages/school-payment/schoolList";
import SchoolPayBefore from "@pages/school-payment/school-pay-before";
import SchoolPaySelect from "@pages/school-payment/school-pay-select";
import SchoolPayInupt from "@pages/school-payment/school-pay-input";
import SchoolPayInfo from "@pages/school-payment/school-pay-info";
import SchoolPayHistory from "@pages/school-payment/school-pay-history";
import BatchPay from "@pages/school-payment/batch-pay";
import SchoolPayProcess from "@pages/school-payment/payment-process";
/**end 学校缴费*/

/**start 物业缴费*/
import PropertyList from "@pages/property-payment/propertyList";
import PropertyPayBefore from "@pages/property-payment/property-pay-before";
import PropertyPaySelect from "@pages/property-payment/property-pay-select";
import PropertyPayInupt from "@pages/property-payment/property-pay-input";
import PropertyPayInfo from "@pages/property-payment/property-pay-info";
import PropertyHistory from "@pages/property-payment/property-pay-history";
import PropertyPayProcess from "@pages/property-payment/property-payment-process";
/**end 物业缴费*/

/**start 其他缴费*/
import OtherMchList from "@pages/otherMch-payment/otherMchList";
import OtherMchPayBefore from "@pages/otherMch-payment/otherMch-pay-before";
import OtherMchPaySelect from "@pages/otherMch-payment/otherMch-pay-select";
import OtherMchPayInupt from "@pages/otherMch-payment/otherMch-pay-input";
import OtherMchPayInfo from "@pages/otherMch-payment/OtherMch-pay-info";
import OtherMchHistory from "@pages/otherMch-payment/otherMch-pay-history";
import Contribution from "@pages/otherMch-payment/contribution-input";
import OtherMchPayProcess from "@pages/otherMch-payment/otherMch-payment-process";
/**end 其他缴费*/

/**支付结果页**/
import PayOK from "@pages/pay-result/index";
import NotFound from "@pages/notFound/index";

let routes = [
  {
    path: "/",
    component: Home,
    exact: true,
  },
  {
    path: "/index",
    component: Home,
  },
  {
    path: "/jc-bank",
    component: JcBank,
    title: "易缴费",
  },
  {
    path: "/qz-bank",
    component: QzBank,
    title: "泉州银行微缴费",
  },
  {
    path: "/szs-bank",
    component: SzsBank,
  },
  {
    path: "/aliPay-tips",
    component: AliPayTips,
  },
  {
    path: "/aliPay-qrCode",
    component: AliPayQrCode,
  },
  {
    path: "/school-list",
    component: SchoolList,
  },
  {
    path: "/pay-before",
    component: SchoolPayBefore,
  },
  {
    path: "/pay-select",
    component: SchoolPaySelect,
  },
  {
    path: "/pay-input",
    component: SchoolPayInupt,
  },
  {
    path: "/school-pay-info",
    component: SchoolPayInfo,
  },
  {
    path: "/school-pay-history",
    component: SchoolPayHistory,
  },
  {
    path: "/school-batch-pay",
    component: BatchPay,
  },
  {
    path: "/pay-process",
    component: SchoolPayProcess,
  },
  {
    path: "/pay-ok",
    component: PayOK,
  },
  {
    path: "/invoice-list",
    component: InvoiceList,
    title: "电子票据",
  },
  {
    path: "/invoicing-billing",
    component: InvoiceBilling,
  },
  // {
  //   path: "/payment-voucher",
  //   component: Voucher,
  //   title: '缴费凭证'
  // },
  {
    path: "/property-list",
    component: PropertyList,
  },
  {
    path: "/wy-pay-before",
    component: PropertyPayBefore,
  },
  {
    path: "/wy-pay-select",
    component: PropertyPaySelect,
  },
  {
    path: "/wy-pay-info",
    component: PropertyPayInfo,
  },
  {
    path: "/wy-pay-input",
    component: PropertyPayInupt,
  },
  {
    path: "/wy-pay-history",
    component: PropertyHistory,
  },
  {
    path: "/wy-pay-process",
    component: PropertyPayProcess,
  },

  {
    path: "/other-mch-list",
    component: OtherMchList,
  },
  {
    path: "/other-pay-before",
    component: OtherMchPayBefore,
  },
  {
    path: "/other-pay-select",
    component: OtherMchPaySelect,
  },
  {
    path: "/other-pay-input",
    component: OtherMchPayInupt,
  },
  {
    path: "/other-pay-process",
    component: OtherMchPayProcess,
  },

  {
    path: "/other-pay-info",
    component: OtherMchPayInfo,
  },
  {
    path: "/other-pay-history",
    component: OtherMchHistory,
  },
  {
    path: "/pay-contribution",
    component: Contribution,
    title: "慈善捐赠",
  },
  {
    path: "*",
    component: NotFound,
    title: "404",
  },
];
export default routes;
