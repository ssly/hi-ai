<!-- ChatWindow.vue -->

<script setup>
import { marked } from 'marked' // 新增此行
import { handleOpenUrl } from '../utils'
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  messages: {
    type: Array,
    required: true,
  },
})

const chatWindow = ref(null)
const showScrollToBottomBtn = ref(false)

const scrollToBottom = () => {
  chatWindow.value.scrollTop = chatWindow.value.scrollHeight
}

const throttle = (func, wait) => {
  let timeout = null
  return () => {
    if (!timeout) {
      timeout = setTimeout(() => {
        func()
        timeout = null
      }, wait)
    }
  }
}

const handleScroll = () => {
  if (props.messages.length === 0) {
    return
  }
  const { scrollTop, scrollHeight, clientHeight } = chatWindow.value
  if (scrollHeight - scrollTop - clientHeight > 80) {
    showScrollToBottomBtn.value = true
  } else {
    showScrollToBottomBtn.value = false
  }
}

const throttledScrollToBottom = throttle(async () => {
  await nextTick()
  const { scrollTop, scrollHeight, clientHeight } = chatWindow.value
  if (scrollHeight - scrollTop - clientHeight < 80) {
    scrollToBottom()
  }
}, 200)

watch(
  () => props.messages[props.messages.length - 1],
  async newMessage => {
    if (newMessage) {
      /**
       * 1. 用户信息直接滚动到底部
       * 2. 机器人的消息要当前消息距离底部小于50px时，才自动滚动到底部
       */
      if (newMessage.role === 'assistant') {
        throttledScrollToBottom()
      } else if (newMessage.role === 'user') {
        await nextTick()
        scrollToBottom()
      }
    }
  },
  { deep: true }
)

function handleMessageClick(e) {
  if (e.target.tagName === 'A') {
    e.preventDefault()
    const link = e.target.href
    handleOpenUrl(link)
  }
}

onMounted(() => {
  // 初始化时执行一次
  handleScroll()
  chatWindow.value && chatWindow.value.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  chatWindow.value && chatWindow.value.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="chat-window" ref="chatWindow">
    <div class="chat-content">
      <div v-if="messages.length === 0" class="empty-state">
        <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p class="title">暂无消息</p>
        <p class="subtitle">可以在输入框中输入你的问题，AI助手会尽力给出回答。</p>
        <p class="subtitle">
          请注意，一个会话窗口里面的内容会做为一个整体一起问AI，如果问的问题和当前上下文无关，建议新创建会话
        </p>
      </div>
      <div v-else v-for="message in messages" :key="message.id">
        <div
          class="message"
          :class="{ user: message.role === 'user', assistant: message.role === 'assistant' }"
        >
          <p v-if="message.role === 'user'">{{ message.content }}</p>
          <p v-else v-html="marked(message.content)" @click="handleMessageClick"></p>
        </div>
      </div>
      <div v-if="showScrollToBottomBtn" class="scroll-to-bottom" @click="scrollToBottom">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 5L12 19M12 19L19 12M12 19L5 12"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-window {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background-color: #fff;
  width: 100%;
}

.chat-content {
  max-width: 800px;
  margin: 0 auto;
}

@media (min-width: 1200px) {
  .chat-content {
    max-width: 1100px;
  }
}

.message {
  margin-bottom: 20px;
  padding: 10px 15px;
  border-radius: 8px;
  max-width: 100%;
}

.message :global(pre) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 10px;
  border-radius: 5px;
  overflow-x: auto;
}

.user {
  background-color: #e1f5fe;
  align-self: flex-end;
  margin-left: auto;
}

.assistant {
  background-color: #f0f0f0;
  align-self: flex-start;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  height: 100%;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

.icon {
  width: 10rem;
  height: 10rem;
  margin-bottom: 1rem;
  color: #9ca3af;
}

.title {
  font-size: 1.25rem;
  font-weight: 500;
  color: #4b5563;
}

.subtitle {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.scroll-to-bottom {
  position: fixed;
  bottom: 114px;
  right: 30px;
  width: 26px;
  z-index: 9;
  height: 26px;
  border-radius: 50%;
  background-color: var(--primary-color);
  opacity: 0.8;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: opacity 0.3s;
}

.scroll-to-bottom svg {
  width: 24px;
  height: 24px;
}
</style>
