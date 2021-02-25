
import React from 'react';
import ReactDOM from 'react-dom';
import Loading from './Loading';

let requestCount = 0;  // 当前正在请求的数量
// 显示loading
export  function showLoading() {
  if (requestCount === 0) {
    var dom = document.createElement('div')
    dom.setAttribute('id', 'loading')
    document.body.appendChild(dom)
    ReactDOM.render(<Loading show={true} blur={false}/>, dom)
  }
  requestCount++;
}
// 隐藏loading
export  function hideLoading() {
  requestCount--;
  if (requestCount === 0 && document.getElementById('loading')){
    document.body.removeChild(document.getElementById('loading'))
  }
}