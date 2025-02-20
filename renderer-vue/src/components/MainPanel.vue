<script setup>
import { ref, watch, reactive } from 'vue'
import { queryAnswer } from '../utils'
import SideNav from './SideNav.vue'
import ChatWindow from './ChatWindow.vue'
import MessageInput from './MessageInput.vue'
import { useSessionsStore } from '@/stores/sessions'
import { useTokenStore } from '@/stores/token'

const sessionsStore = useSessionsStore()
const tokenStore = useTokenStore()
const emit = defineEmits(['change-token'])

let currentSessionId = ref(-1)
let sendingMessage = ref(false)

const sessions = reactive({})
let messages = ref([])

watch(
  () => sessionsStore.currentSessionId,
  val => {
    // 每次切换对话，重置发送状态
    sendingMessage.value = false
    const currentSession = sessionsStore.sessions[val]
    console.log('App.vue:watch:currentSessionId', sessionsStore.sessions, val, currentSession)
    messages.value = currentSession ? currentSession.messages : []
  }
)

const handleSend = async (content, model) => {
  console.log(
    'App.vue:handleSend:content, model is',
    sessionsStore.currentSessionId,
    content,
    model
  )
  sendingMessage.value = true

  const session = reactive({
    id: null,
    name: '',
    updateTime: null,
    messages: [],
  })

  // 先判断是不是创建新对话
  if (sessionsStore.currentSessionId === -1) {
    console.log('App.vue:handleSend:create new session', content.slice(0, 10), model)
    const name = content.length > 20 ? `${content.slice(0, 20)}...` : content

    session.id = Date.now()
    session.name = name
    session.updateTime = session.id

    sessionsStore.createSession(session)
  } else {
    const currentSession = sessionsStore.sessions[sessionsStore.currentSessionId]
    session.id = currentSession.id
    session.name = currentSession.name
    session.updateTime = currentSession.updateTime
    session.messages = currentSession.messages
  }

  console.log('App.vue:handleSend:messages', session.messages)
  session.messages.push({
    role: 'user',
    content,
    error: false,
  })

  const anserTime = Date.now()

  // 需要更新当前对话的时间
  session.updateTime = anserTime

  session.messages.push({
    role: 'assistant',
    content: '正在思考中...',
    model,
    timestamp: anserTime,
    error: true,
  })

  try {
    const steam = await queryAnswer(
      session.messages.filter(m => !m.error), // 过滤掉错误的消息
      {
        model,
        apiKey: tokenStore.token,
      }
    )

    // 先当非流处理
    if (steam.choices) {
      session.messages[session.messages.length - 1].content = steam.choices[0].message.content
    } else {
      // 先清空
      session.messages[session.messages.length - 1].content = ''
      for await (const chunk of steam) {
        await new Promise(resolve => requestAnimationFrame(resolve))
        const content = chunk.choices[0]?.delta.content || ''
        session.messages[session.messages.length - 1].content += content
      }
      session.messages[session.messages.length - 1].content += '\n'
    }

    sendingMessage.value = false
    sessionsStore.updateSession(session.id, session)
  } catch (error) {
    console.error('Error querying answer stream:', error)
    console.log('error', session.messages)
    console.log('error', error.message)
    // 把前端两组改成error
    session.messages[session.messages.length - 1].error = true
    session.messages[session.messages.length - 1].content = '出现错误: ' + error.message
    session.messages[session.messages.length - 2].error = true
    // 把最后一条问题和回答都加上 error: true

    // 恢复等待发送状态
    sendingMessage.value = false
  }
}

function handleCreateSession() {
  // 要判断会话数如果超过20条，就不让创建
  if (Object.keys(sessions).length >= 50) {
    alert('会话数已达到上限50条，请先删除一些会话')
    return
  }
  sessionsStore.selectSession(-1)
}
</script>

<template>
  <div class="app-container">
    <SideNav
      v-model:sessions="sessions"
      v-model:currentSessionId="currentSessionId"
      class="side-nav"
      @create-session="handleCreateSession"
      @change-token="emit('change-token')"
    />
    <div class="chat-area">
      <ChatWindow :messages="messages" />
      <MessageInput
        :sending="sendingMessage"
        :currentSessionId="currentSessionId"
        @send="handleSend"
      />
    </div>
  </div>
</template>
<style>
body,
html {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}
</style>

<style scoped>
.app-container {
  display: flex;
  /* flex-direction: column; */
  height: 100vh;
  width: 100%;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  width: 100%;
}

.chat-area {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}
</style>
