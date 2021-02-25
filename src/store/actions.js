

/**action也是函数**/ 

export function getCustomList(data) {
  return { type: 'GET_CUSTOM_DATA', data: data}
}
export function payInfo(data) {
  return { type: 'GET_PAY_INFO', data: data}
}
export function getEnterTimes(data) {
  return { type: 'SET_TIMES', data: data}
}

