<!-- MessageInput.vue -->
<script setup>
import { ref, defineEmits, defineProps, watch } from 'vue'
import { reactive } from 'vue'
import ModelSelect from './ModelSelect.vue'

const props = defineProps({
  currentSessionId: {
    type: Number,
    required: true,
  },
  sending: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['send'])

const selectedModel = ref('gpt-4o-mini')

const isComposition = ref(false)

let message = ref('')

const formData = reactive({
  platform: 'github',
  model: 'gpt-4o-mini',
})

watch(
  () => props.currentSessionId,
  () => {
    // 清空message
    message.value = ''
  }
)

const handleSend = e => {
  // 没有消息，不能发送
  if (!message.value.trim() || props.sending) return
  if (e) {
    if (isComposition.value) return
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      console.log('handleSend11', message.value.trim())
      emit('send', message.value.trim(), formData.model)

      // 清空message
      message.value = ''
    }
  } else {
    emit('send', message.value.trim(), formData.model)

    // 清空message
    message.value = ''
  }
}
</script>

<template>
  <div class="msg-input-container">
    <div class="msg-input">
      <textarea
        v-model="message"
        class="msg-input-textarea"
        :placeholder="`向 ${formData.model} 发送消息`"
        @compositionstart="isComposition = true"
        @compositionend="isComposition = false"
        @keydown="handleSend"
      ></textarea>
      <button :disabled="sending || !message.trim()" class="msg-input-button" @click.stop="handleSend(false)">
        发送
      </button>
    </div>
    <div class="msg-tips">
      <ModelSelect v-model:model="formData.model" />
      <div class="msg-tips-right">Enter发送&nbsp;&nbsp;Shift+Enter换行</div>
    </div>
  </div>
</template>

<style scoped>
.msg-input-container {
  position: sticky;
  width: 100%;
  max-width: 740px;
  margin-left: auto;
  margin-right: auto;
  border-radius: 12px 12px 0 0;
  border: 1px solid #ddd;
  border-bottom: none;
  padding: 16px 16px 0 16px;
}
@media (min-width: 1200px) {
  .msg-input-container {
    max-width: 1040px;
  }
}

.msg-input {
  display: flex;
  margin: 0 auto;
}

.msg-input-textarea {
  flex: 1;
  height: 60px;
  border-radius: 4px;
  resize: none;
  border: none;
  outline: none;
}

button {
  margin-left: 10px;
  padding: 0 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: var(--primary-color);
}

button[disabled] {
  background-color: #ddd;
  color: #999;
  cursor: not-allowed;
}

.msg-tips {
  margin-top: 4px;
  display: flex;
  justify-content: space-between;
  color: #999;
}

label {
  display: inline-flex;
  align-items: center;
}
label + label {
  margin-left: 8px;
}

input[type='radio'] {
  accent-color: var(--primary-color);
  margin: 0 4px 0 0;
}

.msg-tips-left {
  display: inline-flex;
  align-items: center;
}

.msg-tips-right {
}
</style>
