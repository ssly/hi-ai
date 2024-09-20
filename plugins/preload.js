/* global utools */

const listeners = {}

let pluginEnterData = {}

const openai = require('./openai-js')


// uTools API onPluginEnter(callback)
// type 为 "text"、"regex"、 "over" 时， payload 值为进入插件应用时的主输入框文本
utools.onPluginEnter(({ code, type, payload }) => {
  pluginEnterData = { code, type, payload }

})

window.services = {
  // 复制
  copyText: text => utools.copyText(text),

  queryAnswer: openai.queryAnswer,

  // 显示通知
  showNotification: (content) => {
    console.log('xxxxx', content)
    utools.showNotification(content)
  },

  // 获取插件进入数据
  getPluginEnterData: () => pluginEnterData,

  // 操作数据库
  db: utools.db,

  // 注册发布订阅
  listener: {
    on(key, listener) {
      if (typeof listener === 'function') {
        if (!Array.isArray(listeners[key])) {
          listeners[key] = []
        }
        listeners[key].push(listener)
      }
    },
    off(key, listener) {
      if (Array.isArray(listeners[key])) {
        listeners[key] = listeners[key].filter(l => l !== listener)
      }
    }
  },
}