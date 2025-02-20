<script setup>
import { reactive } from 'vue'
import { useTokenStore } from '../stores/token'
import { handleOpenUrl } from '../utils'

const tokenStore = useTokenStore()

const emit = defineEmits(['cancel'])

const formData = reactive({
  githubToken: '',
})

function handleUpdateConfig() {
  console.log('UserGuide:handleUpdateConfig', formData)
  tokenStore.updateToken(formData.githubToken)
  emit('cancel')
}

function handleCancelConfig() {
  console.log('UserGuide:handleCancelConfig')
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

      <input v-model="formData.githubToken" type="password" placeholder="输入 Github token" />
    </div>

    <div class="button-group">
      <button :disabled="!formData.githubToken" class="submit-btn" @click="handleUpdateConfig">
        保存
      </button>
      <button
        v-if="tokenStore.token || formData.githubToken"
        @click="handleCancelConfig"
        class="cancel-btn"
      >
        取消
      </button>
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

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
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
