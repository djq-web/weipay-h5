/**工具类**/
import { createHashHistory } from 'history'; // 如果是hash路由
//import { createBrowserHistory } from 'history'; // 如果是history路由

const history = createHashHistory();

/**
* @name navigateTo
* @description 页面跳转公用方法
* @param {string} path - 跳转的页面
* @param {object} querySrirng - 地址栏参数，为一个String
* @example
* //前往index页，同时地址栏带上 username=admin&age=1 参数
* navigateTo( '/index', '?schoolId=1');
*
*/
export function navigateTo(path, querySrirng){
    let search = querySrirng? `?${querySrirng}`: '';
    history.push({
        pathname: path,
        search
    })
}
/**返回上一页**/
export function goBack(){
    history.goBack();
}

/**
* findArray 查找数组，返回匹配到的第一个index
*
* @param array 被查找的数组
* @param feature 查找特征 或者为一个具体值，用于匹配数组遍历的值，或者为一个对象，表明所有希望被匹配的key-value  eg: {username: 'admin'}
* @param all boolean 希望命中feature全部特征或者只需命中一个特征，默认true
* @return 数组下标  查找不到返回-1
*
*/
export function findArray(array, feature, all = true) {
    for (let index in array) {
        let cur = array[index];
        if (feature instanceof Object) {
            let allRight = true;
            for (let key in feature) {
                let value = feature[key];
                if (cur[key] == value && !all) return index;
                if (all && cur[key] != value) {
                    allRight = false;
                    break;
                }
            }
            if (allRight) return index;
        } else {
            if (cur == feature) {
                return index;
            }
        }
    }
    return -1;
}

//数组去重 ['a','b','c','a']
export function arrayUnique(arr) {
    let res = [];
    let json = {};
    for (let i = 0; i < arr.length; i++) {
        if (!json[arr[i]]) {
            res.push(arr[i]);

            json[arr[i]] = 1;
        }
    }
    return res;
}

//深拷贝
export function deepCopy(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = deepCopy(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = deepCopy(obj[attr]);
        }
        return copy;
    }
    throw new Error("Unable to copy obj! Its type isn't supported.");
}

export function isEmptyObject(obj){
    for(let key in obj){
        return false
    }
    return true
    // return JSON.stringify(obj) == "{}"
}

//是否为空
export function isEmpty(obj){
    let hasOwnProperty = Object.prototype.hasOwnProperty;
    // 本身为空直接返回true
    if (obj == null) return true;

    // 然后可以根据长度判断，在低版本的ie浏览器中无法这样判断。
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    //最后通过属性长度判断。
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
}

/**
* @name toThousands 格式化金额
* @param {Number} currency 金额
* @param {Number} convertUnit 后端传回的金额数值放大倍数
* @param {Boolean} isNotFormat 不对金额进行逗号分隔
* @return {String}
* @example "1,500.00"
*/
export function toThousands(currency, convertUnit=100 , isNotFormat) {
    const type = typeof currency
    const place = convertUnit.toString().length - 1
    let result = ''

    if(type == 'undefined' || currency == null || (type != 'number' && type != 'string')) return null

    const isMinus = currency < 0//是否为负数

    currency = Math.abs(parseFloat(currency/convertUnit))

    currency = currency.toFixed(place)

    if(isNotFormat) {
        if (isMinus) currency = '-' + currency
        return currency
    }

    const tmp = currency.split('.')
    const decimal = tmp[1]

    currency = tmp[0]

    while (currency.length > 3) {
        result = ',' + currency.slice(-3) + result;
        currency = currency.slice(0, currency.length - 3)
    }

    if (currency) result = currency + result
    if (decimal) result += '.' + decimal
    if (isMinus) result = '-' + result

    return result
}

/**
* @name 获取浏览器语言
* @returns {String} 'zh-CN'
*/
export const getBrowserLanuage = () => {
    const language = navigator.language.toLowerCase()
    let browserLanuage = ''

    switch(language){
        case 'zh-cn':
        case 'zh':
        browserLanuage = 'zh-CN'
        break
        case 'zh-hk':
        case 'zh-tw':
        browserLanuage = 'zh-HK'
        break
        case 'en-us':
        case 'en':
        browserLanuage = 'en-US'
        default:
        browserLanuage = navigator.language
        break
    }

    return browserLanuage
}


/**
* @keys 需要批量删除的sessionStorage的key数组
* */
export function batchRemoveSessionStorage(keys) {
    if(Array.isArray(keys)){
        keys.map(item=>{
            return storage.remove(item);
        });
    }
    if(typeof keysArr === 'string'){
        storage.remove(keys);
    }
}

/**
* @keys 需要批量获取的sessionStorage的key数组
* */
export function batchGetSessionStorage(keys) {
    const result = {};
    if(Array.isArray(keys)){
        keys.map(item=>{
            return result[item] = storage.get(item);
        });
    }
    if(typeof keys === 'string'){
        result[keys] = storage.get(keys);
    }
    return result;
}

/**
* 自封装的 操作sessionStorage 的storage对象
* @property:
*       @get（函数)  对应 sessionStorage.getItem()函数,会自动转换可进行json转换的数据
*       @set (函数)  对应 sessionStorage.getItem()函数,会自动将数组和对象类型数据转为JSON字符串。
*       @remove (函数)  对应 sessionStorage.removeItem()函数
*       @clear (函数)  对应 sessionStorage.clear()函数
* */
export const storage = {
    get: function (key) {
        let result = window.sessionStorage.getItem(key);
        try {
            const temp = JSON.parse(result);
            if(typeof temp === 'number' || typeof temp === 'string'){
                // 防止数值类型超出16位精度丢失
                result = window.sessionStorage.getItem(key);
            }else{
                result = temp;
            }
        } catch (err) {
        }
        return result;
    },
    set: function (key, value) {
        if (Object.prototype.toString.call(value) === '[object Object]' || Object.prototype.toString.call(value) === '[object Array]') {
            return window.sessionStorage.setItem(key, JSON.stringify(value));
        }
        return window.sessionStorage.setItem(key, value)
    },
    remove: function (key) {
        return window.sessionStorage.removeItem(key);
    },
    clear: function () {
        return window.sessionStorage.clear();
    }
};

/**
* 判断字符串，输入的名称是否正确
* @param string
* */
export function isRightName(string) {
    if(!string ||  typeof string !== 'string'){
        return false;
    }
    const char = /^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9_]){1,20}$/; 
    return char.test(string);
}
export function regularNum(val) {
    if (!val || typeof val !== 'string') {
        return false;
    }
    const reg = /^[a-zA-Z0-9]*$/g;
    return reg.test(val);
}
export function checkPhone(val) {
    if (!val || typeof val !== 'string') {
        return false;
    }
    const reg = /^1[3456789]\d{9}$/;
    return reg.test(val);
}

export function replaceScript(str) {
    let __str = str;
    return __str.replace(/<script.*?>.*?<\/script>/ig, '');
}
export function replaceLeftRightArrow(string) {
    let str = string;
    str = str.replace(/\</g, '&lt');
    str = str.replace(/\>/g, '&gt');
    return str;
}


function IsWeixinOrAlipay() {
    var ua = window.navigator.userAgent;
    //判断是不是微信
    if (ua.indexOf("MicroMessenger") > 0) {
        return "Wechat";
    }
    //判断是不是支付宝
    if (ua.indexOf("Alipayclient") > 0) {
        return "Alipay";
    }
    // 都不是
    return "false";
}
export function isWechatClient(UserAgent) {
    return UserAgent.indexOf("MicroMessenger") !== -1;
}

export function isAliPayClient(UserAgent) {
    return UserAgent.indexOf('AlipayClient') !== -1;
}

/**
* 将输入的金额转化为分再传送给后端
* @param string
* */
export function getMoney(val){
    let str = "";
    if (typeof(val)=='string' &&  val.indexOf('.') != -1) {
        let arr = val.split('.');
        arr.forEach((item, index)=>{
            if (index==1&&item.length<2){
                if (item != 0) {
                    item = String(item*10);
                }else{
                    item = '00';
                }
            }
            str +=item;
        })
    }else{
        str = String(val*100);
    }
    return parseInt(str);
 }


/**
 * [通过参数名获取url中的参数值]
 * 示例URL:http://htmlJsTest/getrequest.html?uid=admin&rid=1&fid=2&name=小明
 * @param  {[string]} queryName [参数名]
 * @return {[string]}           [参数值]
 */
export  function getQueryValue(queryName) {
    var result = window.location.href.match(new RegExp("[\?\&]" + queryName + "=([^\&]+)", "i")); 
    if (result == null || result.length < 1) {
         return ""; 
    }
    return result[1];
}