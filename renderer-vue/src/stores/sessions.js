import { ref } from 'vue'
import { defineStore } from 'pinia'

const inUtools = typeof window.services === 'object'

export const useSessionsStore = defineStore('sessions', () => {
  console.log('session.js:useSessionsStore')
  // 会话对象， Object
  const sessions = ref({})
  // 当前会话ID
  const currentSessionId = ref(-1)

  sessions.value = inUtools
    ? window.services.getSessions()
    : JSON.parse(localStorage.getItem('aiSessions'))

  console.log('useSessionsStore:session.js:sessions.value is', sessions.value)

  function selectSession(id) {
    console.log('session.js:selectSession:id is', id)
    currentSessionId.value = id
  }

  function createSession(session) {
    if (!session.id) return
    sessions.value[session.id] = session

    window.services.setSessions(JSON.parse(JSON.stringify(sessions.value)))
    selectSession(session.id)
  }

  function updateSession(id, session) {
    if (!id) return
    console.log('session.js:updateSession:id is', id, session)
    sessions.value[id] = {
      ...sessions.value[id],
      ...session,
    }

    window.services.setSessions(JSON.parse(JSON.stringify(sessions.value)))
  }

  function removeSession(row) {
    // 把当前项的 _isRemove 设置为 true
    if (row._isRemove) {
      delete sessions.value[row.id]
      window.services.setSessions(JSON.parse(JSON.stringify(sessions.value)))
    }

    // 把当前 row 的 _isRemove 设置为 true，其它项的 _isRemove 设置为 false
    Object.keys(sessions.value).forEach(key => {
      sessions.value[key]._isRemove = false
    })
    row._isRemove = true
  }

  return {
    currentSessionId,
    sessions,
    removeSession,
    selectSession,
    updateSession,
    createSession,
  }
})
