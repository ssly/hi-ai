import { writable } from 'svelte/store'

// 创建一个可写的 store，初始值为收藏的货币
const { subscribe, set, update } = writable([
  { key: 'CNY', value: true }, // 人民币
  { key: 'USD', value: true }, // 美元
  { key: 'HKD', value: true }, // 港币
  { key: 'JPY', value: true }, // 日元
  { key: 'EUR', value: true }, // 欧元
  { key: 'TRY', value: true }, // 土耳其
  { key: 'KRW', value: true }, // 韩元
])

let rev = ''

/**
 * 整理成数据库的格式
 * @param {*} currencies 
 * @returns {string} 格式如 CNY,USD|TWD,KRW  前面为value为true的，后面为false的
 */
function formatToDB(currencies) {
  const trueCurrencies = currencies.filter(c => c.value).map(c => c.key)
  const falseCurrencies = currencies.filter(c => !c.value).map(c => c.key)
  return `${trueCurrencies.join(',')}|${falseCurrencies.join(',')}`
}



export default {
  subscribe,
  initFavority: () => {
    // 这里设置一下初始值
    const initData = window.services.db.get('favority')

    if (initData && initData.data) {
      // 这里设置一下初始值，把 CNY,USD|TWD,KRW 转换成 [{ key: 'CNY', value: true }, { key: 'USD', value: true }, { key: 'TWD', value: false }, { key: 'KRW', value: false }]

      const [trueCurrencies, falseCurrencies] = initData.data.favority.split('|')
      const trueCurrenciesArr = trueCurrencies.split(',').map(c => ({ key: c, value: true }))
      const falseCurrenciesArr = falseCurrencies.split(',').map(c => ({ key: c, value: false }))
      const favority = [...trueCurrenciesArr, ...falseCurrenciesArr]
      set(favority)

      rev = initData._rev
    }
  },

  addFavority: (currency) => {
    update(currencies => {
      let favority = currencies
      if (!currencies.some(c => c.key === currency)) {
        favority = [{ key: currency, value: true }, ...currencies]; // 添加到最前面
      } else {
        // 如果已经存在，要把它取出来移动到最前面，并且把它的 value 改 true
        const index = favority.findIndex(c => c.key === currency)
        favority.splice(index, 1)
        favority.unshift({ key: currency, value: true })
      }

      // 这里更新一下数据库
      const dbRes = window.services.db.put({ _id: 'favority', data: { favority: formatToDB(favority) }, _rev: rev ? rev : undefined })
      if (dbRes.error) {
        return currencies
      }

      rev = dbRes.rev
      return favority;
    })
  },
  removeFavority: (currency) => {
    update(currencies => {
      /**
       * 移除指定的货币
       * 把当前条的 value 改 false，移动到到 value: true 的下一个，在所有 value: false 的最前面
       * 例如 currencies: [{ key: 'CNY', value: true }, { key: 'USD', value: true }, { key: 'EUR', value: true }, { key: 'JPY', value: false }]
       * 移除 'USD' 后，currencies: [{ key: 'CNY', value: true }, { key: 'EUR', value: true }, { key: 'USD', value: false}, { key: 'JPY', value: false }]
       */
      currencies.forEach(c => {
        if (c.key === currency) {
          c.value = false
        }
      })
      // 按顺序拼接，先 true 的，再 false 的
      const trueCurrencies = currencies.filter(c => c.value)
      const falseCurrencies = currencies.filter(c => !c.value)
      const favority = [...trueCurrencies, ...falseCurrencies]

      // 这里更新一下数据库
      const dbRes = window.services.db.put({ _id: 'favority', data: { favority: formatToDB(favority) }, _rev: rev ? rev : undefined })
      if (dbRes.error) {
        return currencies
      }

      rev = dbRes.rev
      return favority
    })
  }
}