/**
 * 转千分位展示
 * @param {number} src 金额
 * @param {number} [precision=3] 精度，默认为3
 * @returns {string} 转换后的金额
 */
function formatAmount(src, format = true, precision = 3) {
  const text = src.toFixed(precision)
  if (!format) {
    return text
  }
  return text
    .replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,')
}

/**
 * 将默认的base为USD的货币转换成目标货币
 * @param {Object} rates 目标货币的汇率
 * @param {String} base 转换成的目标货币，如CNY
 * @returns {Array} 返回转换后的汇率
 */
function transBaseTo(rates, _base = 'CNY') {
  const base = _base ? _base.toUpperCase() : 'CNY'
  if (!rates) {
    return []
  }
  if (!base || base && !rates[base]) {
    return []
  }
  const baseRate = rates[base]
  const result = []
  const resultObject = {}

  Object.keys(rates).forEach(key => {
    result.push({
      key,
      // 1元baseRate等于多少目标货币
      value: rates[key] / baseRate,
      // 1目标货币等于多少元baseRate
      reverseValue: baseRate / rates[key],
    })
    resultObject[key] = {
      key,
      // 1元baseRate等于多少目标货币
      value: rates[key] / baseRate,
      // 1目标货币等于多少元baseRate
      reverseValue: baseRate / rates[key],
    }
  })
  return resultObject
}

function parseCli(str) {
  const reg = /^([0-9]+(?:[.][0-9]+)?)[ ]?([a-zA-Z]{3})?[ ]?([a-zA-Z]{3})?$/
  const match = str.match(reg)
  if (!match) {
    return [, ,]
  }

  return [match[1], match[2], match[3]]
}

function getIconClass(src) {
  if (src === 'BTC') {
    return 'fis fi fi-btc'
  }
  return `fis fi fi-${src.slice(0, 2).toLocaleLowerCase()}`
}

const formatTime = (time) => {
  if (!time) {
    return ''
  }
  const date = new Date(time)
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  const hour = (date.getHours()).toString().padStart(2, '0')
  const minute = (date.getMinutes()).toString().padStart(2, '0')
  const secend = (date.getSeconds()).toString().padStart(2, '0')
  return `${y}-${m}-${d} ${hour}:${minute}:${secend}`
}

export {
  formatAmount,
  transBaseTo,
  parseCli,
  getIconClass,
  formatTime,
}