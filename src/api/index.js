import axios from 'axios';
import { showLoading, hideLoading } from '../components/Loading/index';
import { Toast } from 'antd-mobile';

function Request(method, url, data, isLoading, reqType) {
  method = method.toUpperCase();
  let contentType = 'application/x-www-form-urlencoded; charset=UTF-8';
  if ( method==='POST' ){
      contentType = 'application/json; charset=UTF-8';
      if (reqType === 1) {
        contentType = 'application/x-www-form-urlencoded; charset=UTF-8';
      }  
  }
  let instance = axios.create({
    baseURL: '',
    timeout: 10000, // 设置超时时长
    headers: {
      'isLoading': isLoading,
      'Content-Type': contentType,
    },
    transformRequest: [function (data) {
      if (method==='POST'&& reqType !== 1) {
        return JSON.stringify(data);
      }
      let ret = []
      for (let it in data) {
        ret.push(encodeURIComponent(it) + '=' + encodeURIComponent(data[it]))
      }
      return ret.join('&');
    }],
  });

  // 请求前拦截
  instance.interceptors.request.use(config => {
    //isLoading 为true时显示loading；
    if (config.headers.isLoading !== false) {
      showLoading();
    }
    return config
  }, err => {
    hideLoading();
    return Promise.reject(err)
  })

  //这里 响应拦截器 根据服务器返回的status 做判断 
  instance.interceptors.response.use(data => {
   hideLoading();
    if (data && data.data.status && data.data.status !== 0) {
        if(data.data.status === 7001) {  // 支付人数限制
           return data;
        }else if(data.data.overTime==true){
          return data;
        }
        else{
            Toast.info(data.data.msg || '服务器异常', 2);
            return null;
        }
    }
    return data.data;
  }, err => {
    hideLoading();
    if (err.message === 'Network Error') {
      Toast.offline('网络连接异常！')
    }
    if (err.code === 'ECONNABORTED') {
      Toast.offline('请求超时，请重试')
    }
    return Promise.reject(err)
  })
  if (method === "GET") {
    return instance.get(url, {
      params: data

    }).then((res) => {
      return res;
    })
  }

  if (method === "POST") {
    return instance.post(url, data).then((res) => {
      return res;
    })
  }
}

export const Get = (url, data, showLoad, type) => Request('GET', url, data, showLoad, type);
export const Post = (url, data, showLoad, type) => Request('POST', url, data, showLoad, type);
