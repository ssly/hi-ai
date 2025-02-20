<script setup>
import { ref } from 'vue'

import { useTokenStore } from './stores/token'
const tokenStore = useTokenStore()

import UserGuide from './components/UserGuide.vue'
import MainPanel from './components/MainPanel.vue'

let showTokenPage = ref(true)

showTokenPage.value = !tokenStore.token
</script>

<!-- App.vue -->
<template>
  <div class="app-container">
    <!-- Token 设置页面 -->
    <UserGuide v-if="showTokenPage" @cancel="showTokenPage = false" />
    <!-- 主面板 -->
    <MainPanel
      v-else
      :token="tokenStore.token"
      @change-token="showTokenPage = true"
      @cancel="showTokenPage = true"
    />
  </div>
</template>
<style>
:root {
  --border-color: #ececec;
}
body,
html {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}
</style>
