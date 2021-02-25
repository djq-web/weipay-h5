let Validator = {};

const PATTERN = {
    EMAIL: /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/,
    URL: /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?$/,
    HEX: /^#?([a-f0-9]{6}|[a-f0-9]{3})$/i,
    NUM: /^((-?\d+\.\d+)|(-?\d+)|(-?\.\d+))$/,
    CNMOBILE: /^(0|86|17951)?(13[0-9]|15[0-9]|17[0678]|18[0-9]|14[57])[0-9]{8}$/,
    TELEPHONE: /^(0[0-9]{2,3}-)?([2-9][0-9]{6,7})+(-[0-9]{1,4})?$/,
    DATE: /^(?:(?:1[6-9]|[2-9][0-9])[0-9]{2}([-/.]?)(?:(?:0?[1-9]|1[0-2])\1(?:0?[1-9]|1[0-9]|2[0-8])|(?:0?[13-9]|1[0-2])\1(?:29|30)|(?:0?[13578]|1[02])\1(?:31))|(?:(?:1[6-9]|[2-9][0-9])(?:0[48]|[2468][048]|[13579][26])|(?:16|[2468][048]|[3579][26])00)([-/.]?)0?2\2(?:29))(\s+([01][0-9]:|2[0-3]:)?[0-5][0-9]:[0-5][0-9])?$/,
    COMPLEXFONT: /^[\u96f6\u58f9\u8d30\u53c1\u8086\u4f0d\u9646\u67d2\u634c\u7396\u62fe]$/,
    CHINESE: /^[\u4e00-\u9fa5]+$/,
    MONEY: /^([\u0024\u00A2\u00A3\u00A4\u20AC\u00A5\u20B1\u20B9\uFFE5]\s*)(\d+,?)+\.?\d*\s*$/,
    QQ: /^[1-9][0-9]{4,10}$/,
    IPV4: /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/,
    IPV6: /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/,
};

/* 判断是否为空 */
Validator.isNotEmpty = (value) => {
    // empty means empty string, empty array, empty object & null & undefined
    if (typeof value == "string") {
        return value.length !== 0
    }
    else if (typeof value == 'object') {
        if (value instanceof Array) {
            return value.length !== 0
        }
        else {
            var i = 0;
            for (var key in value) {
                i++;
            }
            return !!i;
        }
    }
    else if (typeof value == 'number') {
        return true;
    }
    else {
        return !!value;
    }
}
/* 判断邮箱 */
Validator.isEmail = (value) => {
    return typeof (value) === 'string' && PATTERN.EMAIL.test(value);
};
/* 判断URL */
Validator.isUrl = (value) => {
    return typeof (value) === 'string' && PATTERN.URL.test(value);
};
/* 判断十六进制 */
Validator.isHex = (value) => {
    return typeof (value) === 'string' && PATTERN.HEX.test(value);
};
/* 判断身份证号码 */
Validator.isIdCard = (value) => {
    const Weighte = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1];// 加权因子;
    const ValideCode = [1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2];// 身份证验证位值，10代表X;

    const isTrueValidateCodeBy18IdCard = (a_idCard) => {
        let sum = 0; // 声明加权求和变量
        if (a_idCard[17].toLowerCase() == 'x') {
            a_idCard[17] = 10;// 将最后位为x的验证码替换为10方便后续操作
        }
        for (let i = 0; i < 17; i++) {
            sum += Weighte[i] * a_idCard[i];// 加权求和
        }
        const valCodePosition = sum % 11;// 得到验证码所位置
        if (parseInt(a_idCard[17], 10) === ValideCode[valCodePosition]) {
            return true;
        }
        return false;
    }

    const isValidityBrithBy18IdCard = (idCard18) => {
        const year = idCard18.substring(6, 10);
        const month = idCard18.substring(10, 12);
        const day = idCard18.substring(12, 14);
        let temp_date = new Date(year, parseFloat(month) - 1, parseFloat(day));
        // 这里用getFullYear()获取年份，避免千年虫问题
        if (temp_date.getFullYear() !== parseFloat(year) || temp_date.getMonth() !== parseFloat(month) - 1 || temp_date.getDate() !== parseFloat(day)) {
            return false;
        }
        return true;
    }

    const isValidityBrithBy15IdCard = (idCard15) => {
        const year = idCard15.substring(6, 8);
        const month = idCard15.substring(8, 10);
        const day = idCard15.substring(10, 12);
        let temp_date = new Date(year, parseFloat(month) - 1, parseFloat(day));
        // 对于老身份证中的你年龄则不需考虑千年虫问题而使用getYear()方法
        if (temp_date.getYear() !== parseFloat(year) || temp_date.getMonth() !== parseFloat(month) - 1 || temp_date.getDate() !== parseFloat(day)) {
            return false;
        }
        return true;
    }

    if (value.length === 15) {
        return isValidityBrithBy15IdCard(value);
    } else if (value.length === 18) {
        const a_idCard = value.split("");// 得到身份证数组
        if (isValidityBrithBy18IdCard(value) && isTrueValidateCodeBy18IdCard(a_idCard)) {
            return true;
        }
        return false;
    }
    return false;
};
/* 判断移动电话 */
Validator.isCNMobile = (value) => {
    return typeof (value) === 'string' && PATTERN.CNMOBILE.test(value);
};
/* 判断固定电话 */
Validator.isCNMobile = (value) => {
    return typeof (value) === 'string' && PATTERN.CNMOBILE.test(value);
};
/* 判断日期 */
Validator.isDate = (value) => {
    return typeof (value) === 'string' && PATTERN.DATE.test(value);
};
/* 判断繁体0-9 */
Validator.isComplexFont = (value) => {
    return typeof (value) === 'string' && PATTERN.COMPLEXFONT.test(value);
};
/* 判断中文 */
Validator.isChinese = (value) => {
    return typeof (value) === 'string' && PATTERN.CHINESE.test(value);
};
/* 判断货币 */
Validator.isMoney = (value) => {
    return typeof (value) === 'string' && PATTERN.MONEY.test(value);
};
/* 判断QQ */
Validator.isQQ = (value) => {
    return typeof (value) === 'string' && PATTERN.QQ.test(value);
};
/* 判断IPV4 */
Validator.IPV4 = (value) => {
    return typeof (value) === 'string' && PATTERN.IPV4.test(value);
};
/* 判断IPV6 */
Validator.IPV6 = (value) => {
    return typeof (value) === 'string' && PATTERN.IPV6.test(value);
};
module.exports = Validator;
