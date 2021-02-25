/**
 * 1、combineReducers 工具函数，用于组织多个reducer，并返回reducer集合
 * 2、它就是将来真正要用到的数据，我们将其统一放置在reducers.js文件
 * **/ 

import { combineReducers } from 'redux';
import initState from './state';

// 获取自主缴费-自定义字段列表
const getCustomData =  (state = initState.customData, action) => {
   switch(action.type) {
      case "GET_CUSTOM_DATA":
         return action.data;
      default:
         return state;  
   }
}

// 获取支付信息
const getPayInfo =  (state = initState.payInfo, action) => {
   switch(action.type) {
      case "GET_PAY_INFO":
         return Object.assign({}, action.data);
      default:
         return state;  
   }
}
//记录小程序进入的次数
const enterTimes =  (state = initState.enterTimes, action) => {
   switch(action.type) {
      case "SET_TIMES":
         return action.data;
      default:
         return state;  
   }
}
// combineReducers 合并Reducer
const reducer = combineReducers({
   getCustomData,
   getPayInfo,
   enterTimes
})

//在这里，我们导出reducers， 并在store.js 文件导入获取该 最终达到reducer 对象

export default reducer;