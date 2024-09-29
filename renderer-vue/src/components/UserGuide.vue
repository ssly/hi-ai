<script setup>
import { reactive, defineEmits, defineProps, watch } from 'vue'
import { handleOpenUrl } from '../utils'

const props = defineProps({
  config: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update', 'cancel'])

const aiConfig = reactive({
  githubToken: '',
  // mistraToken: '',
  // metaToken: '',
})

watch(
  () => props.config,
  (newVal, oldVal) => {
    console.log('config changed', newVal, oldVal)
    aiConfig.githubToken = newVal.githubToken
  },
  { immediate: true },
)

function handleUpdateConfig() {
  console.log('handleUpdateConfig', aiConfig)
  emit('update', aiConfig)
}

function handleCancelConfig() {
  console.log('handleCancelConfig', aiConfig)
  emit('cancel')
}
</script>

<!--
<template>
  <div class="login-container">
    <h2>设置 GitHub Token</h2>
    <ul>
      <li>
        <a href="javascript:void(0)" @click="handleOpenUrl('https://github.com/marketplace/models')"
          >Github Models 申请地址</a
        >
      </li>
      <li>
        <a href="javascript:void(0)" @click="handleOpenUrl('https://github.com/settings/tokens')"
          >Github Token获取地址</a
        >
        申请一个Tokens(classic)
      </li>
    </ul>
    <h1>Login</h1>
    <input type="text" v-model="aiConfig.githubToken" placeholder="Enter your GitHub token" />
    <button @click="handleUpdateConfig">保存</button>
    <button @click="handleCancelConfig">取消</button>
  </div>
</template> -->

<template>
  <div class="config-page">
    <h1>各 AI 站点配置页</h1>

    <div class="config-section">
      <h2>Github Models 配置</h2>
      <p><strong>PS: 如果不了解 Github，请先了解后再做此配置</strong></p>
      <p>
        1. 详细使用可以参考：
        <a href="javascript:void(0)" @click="handleOpenUrl('https://liuxyz.com/post/3kuq')"
          >《利用 Github Models 免费使用 GPT-4o 和 GPT-4o mini》</a
        >
      </p>
      <p>
        2. Github Models
        <a href="javascript:void(0)" @click="handleOpenUrl('https://github.com/marketplace/models')"
          >申请地址</a
        >
      </p>
      <p>
        3. Github Token
        <a href="javascript:void(0)" @click="handleOpenUrl('https://github.com/settings/tokens')"
          >获取地址</a
        >
        （申请一个classic Tokens，下面权限都可以不勾选）
      </p>

      <input v-model="aiConfig.githubToken" type="password" placeholder="输入 Github token" />
    </div>

    <div class="config-section">
      <h2>Groq 配置</h2>
      <p>
        PS: 此 API 调用需要在 uTools 设置里面配置“网络代理”
      </p>
      <p>
        2. Groq API Key
        <a href="javascript:void(0)" @click="handleOpenUrl('https://console.groq.com/keys')"
          >申请地址</a
        >
      </p>
      <input v-model="aiConfig.MistraToken" type="password" placeholder="输入 Groq API Key" />
    </div>

    <!-- <div class="config-section">
      <h2>Meta Configuration</h2>
      <p>
        Input your Meta token here. You can find or create your Meta token in the
        <a
          href="https://developers.facebook.com/tools/explorer/"
          target="_blank"
          rel="noopener noreferrer"
          >Graph API Explorer</a
        >.
      </p>
      <input v-model="aiConfig.MetaToken" type="password" placeholder="Enter Meta token" />
    </div> -->

    <div class="button-group">
      <button @click="handleUpdateConfig" class="submit-btn">保存</button>
      <button @click="handleCancelConfig" class="cancel-btn">取消</button>
    </div>
  </div>
</template>

<style scoped>
.config-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  text-align: center;
}

.config-section {
  margin-bottom: 30px;
}
a {
  color: var(--primary-color);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

input {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

button {
  display: block;
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: var(--primary-color);
}

button + button {
  margin-left: 4px;
}

.cancel-btn {
  background-color: #f0f0f0;
  color: #333;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}
</style>
