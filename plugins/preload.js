/* global utools */

/*

apiConfig
{
  _id: string
  _rev: string
  githubToken: string
  groqApiKey: string
  modles: string // 逗号分隔
}
*/

let pluginEnterData = {}

const openai = require('./openai-js')

// uTools API onPluginEnter(callback)
// type 为 "text"、"regex"、 "over" 时， payload 值为进入插件应用时的主输入框文本
utools.onPluginEnter(({ code, type, payload }) => {
  pluginEnterData = { code, type, payload }
  console.log('pluginEnterData', pluginEnterData)
})

window.services = {
  // 复制
  copyText: text => utools.copyText(text),

  askByOpenAI: openai.askByOpenAI,

  // 显示通知
  showNotification: content => {
    utools.showNotification(content)
  },

  /**
   * 获取 token
   * @returns {String}
   */
  getToken: () => ({
    githubToken: utools.db.get('aiConfig')?.githubToken,
  }),

  /**
   * 设置 token
   * @param {String} token
   */
  setToken: token => {
    return utools.db.put({
      _id: 'aiConfig',
      githubToken: token.githubToken,
      _rev: utools.db.get('aiConfig')?._rev,
    })
  },

  getSessions: () => utools.db.get('aiSessions')?.sessions || {},

  setSessions: (sessions = {}) => {
    console.log('preload.js:setSessions:sessions is', sessions)
    return utools.db.promises.put({
      _id: 'aiSessions',
      sessions,
      _rev: utools.db.get('aiSessions')?._rev,
    })
  },

  // 获取插件进入数据
  getPluginEnterData: () => pluginEnterData,

  shellOpenExternal: url => utools.shellOpenExternal(url),

  // 操作数据库
  db: utools.db,
}
