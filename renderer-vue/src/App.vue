<script setup>
import { ref, watch, nextTick, onMounted, reactive } from 'vue'
import { datebase } from './utils'
import SideNav from './components/SideNav.vue'
import ChatWindow from './components/ChatWindow.vue'
import MessageInput from './components/MessageInput.vue'
import UserGuide from './components/UserGuide.vue'
let currentSessionId = ref(-1)
let sendingMessage = ref(false)

let showGuide = ref(true)

const answerMessage = ref({
  role: 'assistant',
  content: '',
  model: 'gpt-4o-mini',
  timestamp: Date.now(),
})

const aiConfig = reactive({
  githubToken: '',
})

const sessions = ref({})
let messages = ref([])

let sessionsRev = undefined
async function updateConfig(src = aiConfig) {
  // 先拿到配置
  const oldConfig = (await datebase.get('aiConfig')) || {}
  console.log('oldConfig', src, oldConfig)
  const newConfig = {
    ...oldConfig,
    ...src,
  }
  aiConfig.githubToken = newConfig.githubToken
  try {
    await datebase.put({
      _id: 'aiConfig',
      _rev: oldConfig._rev,
      ...JSON.parse(JSON.stringify(newConfig)),
    })
  } catch (error) {
    console.error('Error updating database:', error)
  }
}

async function updateDatabase(src = sessions.value) {
  try {
    console.log('updateDatabase', JSON.parse(JSON.stringify(src)))
    const result = await datebase.put({
      _id: 'aiSessions',
      sessions: JSON.parse(JSON.stringify(src)),
      _rev: sessionsRev,
    })
    sessionsRev = result.rev
  } catch (error) {
    console.error('Error updating database:', error)
  }
}

watch(currentSessionId, (val) => {
  // 每次切换对话，重置发送状态
  sendingMessage.value = false
  const currentSession = sessions.value[val]
  console.log('sessions.value[currentSessionId.value]', sessions.value, val, currentSession)
  messages.value = currentSession ? currentSession.messages : []
})

const handleSend = async (content) => {
  sendingMessage.value = true
  // 先判断是不是创建新对话
  if (currentSessionId.value === -1) {
    console.log('create new session')
    const name = content.length > 10 ? `${content.slice(0, 10)}...` : content

    const id = Date.now()
    sessions.value[id] = {
      id,
      name,
      updateTime: id, // 更新时间
      messages: [],
    }
    await nextTick()
    currentSessionId.value = id
  }

  await nextTick()
  console.log('messages', messages.value)
  messages.value.push({
    role: 'user',
    content,
  })

  await updateDatabase()

  const anserTime = Date.now()
  answerMessage.value = {
    role: 'assistant',
    content: '',
    model: 'gpt-4o-mini',
    timestamp: anserTime,
  }
  // 需要更新当前对话的时间
  sessions.value[currentSessionId.value].updateTime = anserTime

  try {
    // const steam = await window.services.queryAnswerStream(
    //   messages.value,
    //   'gpt-4o-mini',
    //   aiConfig.githubToken,
    // )
    const steam = await window.services.queryAnswerStreamByGroq(
      messages.value,
      undefined,
      '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',
    )

    messages.value.push(answerMessage.value)
    for await (const chunk of steam) {
      await new Promise((resolve) => requestAnimationFrame(resolve))
      const content = chunk.choices[0].delta.content || ''
      answerMessage.value.content += content
    }
    sendingMessage.value = false
    answerMessage.value.content += '\n'
    await updateDatabase()
  } catch (error) {
    console.error('Error querying answer stream:', error)
    console.log('error', error.code)
    console.log('error', error.message)
    alert('出现错误: ' + error.message)
  }
}

function handleCreateSession() {
  // 要判断会话数如果超过20条，就不让创建
  if (Object.keys(sessions.value).length >= 20) {
    alert('会话数已达到上限20条，请先删除一些会话')
    return
  }
  currentSessionId.value = -1
}

function handleRemove(src) {
  console.log('handleRemove', src)

  currentSessionId.value = -1

  updateDatabase(src)
}

onMounted(async () => {
  const dbData = await datebase.get('aiSessions')
  console.log('result', dbData)
  if (dbData) {
    sessions.value = dbData.sessions
    sessionsRev = dbData._rev
  }
})

function handleChangeToken(val) {
  updateConfig(val)

  showGuide.value = false
}

function init() {
  const configData = datebase.get('aiConfig')
  console.log('aiConfig', configData)
  if (configData) {
    aiConfig.githubToken = configData.githubToken
    showGuide.value = false
  } else {
    console.log('init', configData)
    showGuide.value = true
  }
}
init()
</script>

<!-- App.vue -->
<template>
  <div class="app-container">
    <!-- <HeaderBar /> -->
    <UserGuide
      v-if="showGuide"
      :config="aiConfig"
      @cancel="showGuide = false"
      @update="handleChangeToken"
    />

    <div v-else class="main-content">
      <SideNav
        v-model:sessions="sessions"
        v-model:currentSessionId="currentSessionId"
        @create-session="handleCreateSession"
        @change-token="showGuide = true"
        @remove="handleRemove"
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
  flex-direction: column;
  height: 100vh;
  width: 100%;
  font-family: Arial, sans-serif;
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
  width: calc(100% - 200px); /* Subtracting SideNav width */
}
</style>
